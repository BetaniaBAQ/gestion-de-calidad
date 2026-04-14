// ─── SGC Utility functions (migrated from prototype) ─────────────────────────
import type {
  Semaforo,
  Score,
  Persona,
  Cargo,
  Equipo,
  Documento,
  Sede,
} from './types'

// Days until a future date (negative = already past)
export function diasHasta(fecha: string): number {
  return Math.ceil(
    (new Date(fecha).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  )
}

// Semáforo based on days remaining
export function semF(dias: number): Semaforo {
  if (dias < 0) return 'rojo'
  if (dias <= 30) return 'amarillo'
  return 'verde'
}

// Semáforo for a document based on expiry date
export function semDoc(doc: { fechaVenc: string | null }): Semaforo {
  if (!doc.fechaVenc) return 'gris'
  return semF(diasHasta(doc.fechaVenc))
}

// CSS color class for a semáforo value
export function semColor(s: Semaforo): string {
  switch (s) {
    case 'verde':
      return 'text-emerald-400'
    case 'amarillo':
      return 'text-yellow-400'
    case 'rojo':
      return 'text-red-400'
    case 'gris':
    default:
      return 'text-muted-foreground'
  }
}

// Tailwind background color class for semáforo
export function semBgColor(s: Semaforo): string {
  switch (s) {
    case 'verde':
      return 'bg-emerald-400/15 text-emerald-400'
    case 'amarillo':
      return 'bg-yellow-400/15 text-yellow-400'
    case 'rojo':
      return 'bg-red-400/15 text-red-400'
    case 'gris':
    default:
      return 'bg-muted text-muted-foreground'
  }
}

// Score a person based on their documents and capacitaciones
export function scorePersona(p: Persona, cargos: Cargo[]): Score {
  const cargo = cargos.find((c) => c.id === p.cargo)
  if (!cargo) return { valor: 0, semaforo: 'gris', label: 'Sin cargo' }

  const docsReq = cargo.docRequeridos
  const capsReq = cargo.capRequeridas

  if (docsReq.length === 0 && capsReq.length === 0) {
    return { valor: 100, semaforo: 'verde', label: '100%' }
  }

  let cumple = 0
  const total = docsReq.length + capsReq.length

  for (const tipo of docsReq) {
    const doc = p.docs.find((d) => d.tipo === tipo)
    if (doc) {
      const sem = semDoc(doc)
      if (sem !== 'rojo') cumple++
    }
  }

  for (const tema of capsReq) {
    const cap = p.caps.find((c) => c.tema === tema)
    if (cap) cumple++
  }

  const valor = total > 0 ? Math.round((cumple / total) * 100) : 100
  return {
    valor,
    semaforo: valor >= 80 ? 'verde' : valor >= 60 ? 'amarillo' : 'rojo',
    label: `${valor}%`,
  }
}

// Score a sede based on personas
export function scoreSede(
  personas: Persona[],
  cargos: Cargo[],
  sedeId: string
): Score {
  const pers = personas.filter(
    (p) => p.sede === sedeId && p.estado === 'activo'
  )
  if (pers.length === 0)
    return { valor: 0, semaforo: 'gris', label: 'Sin personal' }

  const scores = pers.map((p) => scorePersona(p, cargos).valor)
  const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
  return {
    valor: avg,
    semaforo: avg >= 80 ? 'verde' : avg >= 60 ? 'amarillo' : 'rojo',
    label: `${avg}%`,
  }
}

// Score global across all active sedes (average of sede scores)
export function scoreGlobal(
  personas: Persona[],
  cargos: Cargo[],
  sedes: Sede[]
): Score {
  const activas = sedes.filter((s) => s.activa)
  if (activas.length === 0)
    return { valor: 0, semaforo: 'gris', label: 'Sin sedes' }

  const values = activas
    .map((s) => scoreSede(personas, cargos, s.id))
    .filter((s) => s.semaforo !== 'gris')
    .map((s) => s.valor)

  if (values.length === 0)
    return { valor: 0, semaforo: 'gris', label: 'Sin personal' }

  const avg = Math.round(values.reduce((a, b) => a + b, 0) / values.length)
  return {
    valor: avg,
    semaforo: avg >= 80 ? 'verde' : avg >= 60 ? 'amarillo' : 'rojo',
    label: `${avg}%`,
  }
}

// Score habilitación from checklist items
export function calcAutoHab(items: { estado: string }[]): Score {
  if (items.length === 0)
    return { valor: 0, semaforo: 'gris', label: 'Sin items' }
  const aplicables = items.filter((i) => i.estado !== 'na')
  const cumple = aplicables.filter((i) => i.estado === 'cumple').length
  const valor =
    aplicables.length > 0 ? Math.round((cumple / aplicables.length) * 100) : 0
  return {
    valor,
    semaforo: valor >= 80 ? 'verde' : valor >= 60 ? 'amarillo' : 'rojo',
    label: `${valor}%`,
  }
}

// Score for indicators (valor vs meta)
export function indicadorScore(valor: number, meta: number): Score {
  if (meta === 0) return { valor: 0, semaforo: 'gris', label: 'Sin meta' }
  const pct = Math.round((valor / meta) * 100)
  return {
    valor: pct,
    semaforo: pct >= 90 ? 'verde' : pct >= 70 ? 'amarillo' : 'rojo',
    label: `${pct}%`,
  }
}

// Generic find by id
export function findById<T extends { id: string }>(
  arr: T[],
  id: string
): T | undefined {
  return arr.find((item) => item.id === id)
}

// Check if a user can perform an action in a module
export function canDo(
  rol: string,
  modulo: string,
  accion: 'ver' | 'crear' | 'editar' | 'eliminar'
): boolean {
  if (rol === 'admin') return true
  if (rol === 'view') return accion === 'ver'

  type PermsMap = Partial<Record<string, Partial<Record<string, string[]>>>>
  const permisos: PermsMap = {
    calidad: {
      '*': ['ver', 'crear', 'editar'],
      configuracion: ['ver'],
    },
    director: {
      '*': ['ver'],
      reportes: ['ver', 'crear'],
    },
    coordinador: {
      personal: ['ver', 'crear', 'editar'],
      equipos: ['ver', 'crear', 'editar'],
      habilitacion: ['ver', 'crear', 'editar'],
    },
    aux_adm: {
      personal: ['ver', 'editar'],
      documentos: ['ver'],
    },
  }

  const rolPerms = permisos[rol]
  if (!rolPerms) return false

  const moduloPerms = rolPerms[modulo] ?? rolPerms['*'] ?? []
  return moduloPerms.includes(accion)
}

// Format a date string to locale (Colombian)
export function fmtFecha(fecha: string): string {
  if (!fecha) return '—'
  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(fecha))
}

// Score for equipo maintenance status
export function scoreEquipo(eq: Equipo): Score {
  const dias = diasHasta(eq.proxMant)
  if (eq.estado === 'baja') return { valor: 0, semaforo: 'gris', label: 'Baja' }
  if (eq.estado === 'reparacion')
    return { valor: 30, semaforo: 'rojo', label: 'En reparación' }
  const sem = semF(dias)
  return {
    valor: sem === 'verde' ? 100 : sem === 'amarillo' ? 60 : 20,
    semaforo: sem,
    label: dias < 0 ? `Vencido ${Math.abs(dias)}d` : `${dias}d`,
  }
}

// Score for a document
export function scoreDocumento(doc: Documento): Score {
  if (doc.estado === 'obsoleto')
    return { valor: 0, semaforo: 'gris', label: 'Obsoleto' }
  if (doc.estado === 'en_revision')
    return { valor: 50, semaforo: 'amarillo', label: 'En revisión' }
  if (doc.estado === 'borrador')
    return { valor: 20, semaforo: 'amarillo', label: 'Borrador' }
  const dias = diasHasta(doc.fechaVigencia)
  const sem = semF(dias)
  return {
    valor: sem === 'verde' ? 100 : sem === 'amarillo' ? 60 : 20,
    semaforo: sem,
    label: dias < 0 ? `Vencido ${Math.abs(dias)}d` : `${dias}d`,
  }
}
