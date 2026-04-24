import type { EquipoSGC } from '#/lib/domain/equipos'
import type { MantenimientoSGC } from '#/lib/domain/mantenimiento'
import type { PersonaSGC } from '#/lib/domain/personal'
import type { PqrsSGC } from '#/lib/domain/pqrs'
import type { IndicadorSGC, MedicionSGC } from '#/lib/domain/indicadores'
import type { AccionSGC, AuditoriaSGC } from '#/lib/domain/pamec'
import type { Gap, GapSeverity } from '#/lib/stores/grillme.store'
import { diasHasta } from '#/lib/utils-sgc'

const SEVERITY_ORDER: GapSeverity[] = ['critica', 'alta', 'media']

function gap(
  id: string,
  category: Gap['category'],
  severity: GapSeverity,
  description: string,
  context?: string
): Gap {
  return { id, category, severity, description, context }
}

// ─── Equipos ─────────────────────────────────────────────────────────────────

export function gapsEquipos(equipos: EquipoSGC[]): Gap[] {
  const out: Gap[] = []
  for (const e of equipos) {
    if (e.estado === 'baja') continue
    const dias = diasHasta(e.proxMant)
    if (dias < 0) {
      out.push(
        gap(
          `eq-venc-${e._id}`,
          'equipos',
          'critica',
          `Mantenimiento vencido ${Math.abs(dias)}d: ${e.nombre}`,
          `Área ${e.area} | ${e.sede}`
        )
      )
    } else if (dias <= 30) {
      out.push(
        gap(
          `eq-prox-${e._id}`,
          'equipos',
          'alta',
          `Mantenimiento próximo en ${dias}d: ${e.nombre}`,
          `Área ${e.area} | ${e.sede}`
        )
      )
    }
    if (e.estado === 'reparacion') {
      out.push(
        gap(
          `eq-rep-${e._id}`,
          'equipos',
          'alta',
          `Equipo en reparación sin fecha de retorno: ${e.nombre}`,
          `Área ${e.area} | ${e.sede}`
        )
      )
    }
  }
  return out
}

// ─── Mantenimiento ───────────────────────────────────────────────────────────

export function gapsMantenimiento(mantenimientos: MantenimientoSGC[]): Gap[] {
  const out: Gap[] = []
  for (const m of mantenimientos) {
    if (m.estado === 'cancelado' || m.estado === 'cerrado') continue
    const diasAbierto = Math.max(0, -diasHasta(m.apertura))
    if (m.prioridad === 'alta' && diasAbierto >= 7) {
      out.push(
        gap(
          `mant-alta-${m._id}`,
          'mantenimiento',
          'critica',
          `Mantenimiento prioritario abierto ${diasAbierto}d sin cerrar: ${m.codigo}`,
          `${m.descripcion} · ${m.area}`
        )
      )
    } else if (m.prioridad === 'media' && diasAbierto >= 30) {
      out.push(
        gap(
          `mant-med-${m._id}`,
          'mantenimiento',
          'alta',
          `Mantenimiento media prioridad abierto ${diasAbierto}d: ${m.codigo}`,
          `${m.descripcion} · ${m.area}`
        )
      )
    }
    if (m.tipo === 'biomedico' && m.estado === 'abierto') {
      out.push(
        gap(
          `mant-bio-${m._id}`,
          'mantenimiento',
          'alta',
          `Mantenimiento biomédico sin asignar: ${m.codigo}`,
          `${m.descripcion}`
        )
      )
    }
  }
  return out
}

// ─── Talento Humano ──────────────────────────────────────────────────────────

export function gapsTH(personas: PersonaSGC[]): Gap[] {
  const out: Gap[] = []
  for (const p of personas) {
    if (p.estado !== 'activo') continue
    const criticos = p.requisitos.filter(
      (r) => r.estado === 'VENCIDO' || r.estado === 'CRITICO'
    )
    const sinCargar = p.requisitos.filter((r) => r.estado === 'SIN_CARGAR')
    if (criticos.length > 0) {
      out.push(
        gap(
          `th-crit-${p._id}`,
          'th',
          'critica',
          `${p.nombre}: ${criticos.length} requisito(s) vencido(s)/crítico(s)`,
          `Cargo: ${p.cargo} | Sede: ${p.sede}`
        )
      )
    } else if (sinCargar.length > 0) {
      out.push(
        gap(
          `th-sin-${p._id}`,
          'th',
          'media',
          `${p.nombre}: ${sinCargar.length} documento(s) sin cargar`,
          `Cargo: ${p.cargo} | Sede: ${p.sede}`
        )
      )
    }
  }
  return out
}

// ─── PQRS ────────────────────────────────────────────────────────────────────

export function gapsPQRS(pqrs: PqrsSGC[]): Gap[] {
  const out: Gap[] = []
  for (const p of pqrs) {
    if (p.estado === 'vencido') {
      out.push(
        gap(
          `pqrs-venc-${p._id}`,
          'pqrs',
          'critica',
          `PQRS vencida sin respuesta: ${p.radicado}`,
          `Tipo: ${p.tipo} · ${p.fecha}`
        )
      )
    } else if (p.estado === 'en_tramite') {
      const dias = Math.max(0, -diasHasta(p.fecha))
      if (dias >= 15) {
        out.push(
          gap(
            `pqrs-tram-${p._id}`,
            'pqrs',
            'alta',
            `PQRS en trámite ${dias}d sin respuesta: ${p.radicado}`,
            `Tipo: ${p.tipo}`
          )
        )
      }
    } else if (p.estado === 'recibido') {
      const dias = Math.max(0, -diasHasta(p.fecha))
      if (dias >= 5) {
        out.push(
          gap(
            `pqrs-rec-${p._id}`,
            'pqrs',
            'media',
            `PQRS recibida hace ${dias}d sin iniciar trámite: ${p.radicado}`,
            `Tipo: ${p.tipo}`
          )
        )
      }
    }
  }
  return out
}

// ─── Indicadores ─────────────────────────────────────────────────────────────

const FREQ_LIMITE_DIAS: Record<string, number> = {
  mensual: 45,
  trimestral: 100,
  semestral: 200,
  anual: 400,
}

export function gapsIndicadores(
  indicadores: IndicadorSGC[],
  mediciones: MedicionSGC[]
): Gap[] {
  const out: Gap[] = []
  for (const ind of indicadores) {
    if (!ind.activo) continue
    const meds = mediciones
      .filter((m) => m.indicadorId === ind._id)
      .sort((a, b) => b.fecha.localeCompare(a.fecha))

    if (meds.length === 0) {
      out.push(
        gap(
          `ind-sin-${ind._id}`,
          'indicadores',
          'alta',
          `Indicador activo sin ninguna medición: ${ind.nombre}`,
          `Proceso: ${ind.proceso}`
        )
      )
      continue
    }

    const ultima = meds[0]
    const diasSin = Math.max(0, -diasHasta(ultima.fecha))
    if (diasSin > (FREQ_LIMITE_DIAS[ind.frecuencia] ?? 45)) {
      out.push(
        gap(
          `ind-atras-${ind._id}`,
          'indicadores',
          'media',
          `Indicador sin medición reciente (${diasSin}d): ${ind.nombre}`,
          `Último periodo: ${ultima.periodo}`
        )
      )
    }

    const pct = ultima.meta > 0 ? (ultima.valor / ultima.meta) * 100 : 100
    if (pct < 70) {
      out.push(
        gap(
          `ind-bajo-${ind._id}`,
          'indicadores',
          'alta',
          `Indicador bajo meta (${Math.round(pct)}% de meta): ${ind.nombre}`,
          `Valor: ${ultima.valor} / Meta: ${ind.meta}`
        )
      )
    }
  }
  return out
}

// ─── PAMEC — Acciones ────────────────────────────────────────────────────────

export function gapsAcciones(acciones: AccionSGC[]): Gap[] {
  const out: Gap[] = []
  for (const a of acciones) {
    if (a.estado === 'cerrado') continue
    if (a.estado === 'vencido') {
      out.push(
        gap(
          `acc-venc-${a._id}`,
          'pamec_acciones',
          'critica',
          `Acción correctiva vencida: "${a.accion.slice(0, 60)}"`,
          `Responsable: ${a.responsable} · Límite: ${a.fechaLimite}`
        )
      )
    } else {
      const diasRest = diasHasta(a.fechaLimite)
      if (diasRest < 0) {
        out.push(
          gap(
            `acc-atras-${a._id}`,
            'pamec_acciones',
            'alta',
            `Acción sin cerrar, vencida ${Math.abs(diasRest)}d: "${a.accion.slice(0, 50)}"`,
            `Responsable: ${a.responsable}`
          )
        )
      } else if (diasRest <= 7) {
        out.push(
          gap(
            `acc-prox-${a._id}`,
            'pamec_acciones',
            'media',
            `Acción vence en ${diasRest}d: "${a.accion.slice(0, 50)}"`,
            `Responsable: ${a.responsable}`
          )
        )
      }
    }
  }
  return out
}

// ─── PAMEC — Hallazgos ───────────────────────────────────────────────────────

export function gapsHallazgos(auditorias: AuditoriaSGC[]): Gap[] {
  const out: Gap[] = []
  for (const aud of auditorias) {
    const vencidos = aud.hallazgos.filter((h) => h.estado === 'vencido')
    const ncAbiertos = aud.hallazgos.filter(
      (h) => h.tipo === 'no_conformidad' && h.estado === 'abierto'
    )
    if (vencidos.length > 0) {
      out.push(
        gap(
          `hall-venc-${aud._id}`,
          'pamec_hallazgos',
          'critica',
          `Auditoría ${aud.proceso}: ${vencidos.length} hallazgo(s) vencido(s)`,
          `Sede: ${aud.sede} · ${aud.fechaInicio}`
        )
      )
    } else if (ncAbiertos.length > 0) {
      out.push(
        gap(
          `hall-nc-${aud._id}`,
          'pamec_hallazgos',
          'alta',
          `Auditoría ${aud.proceso}: ${ncAbiertos.length} no conformidad(es) abiertas`,
          `Sede: ${aud.sede}`
        )
      )
    }
  }
  return out
}

// ─── Construir y priorizar ────────────────────────────────────────────────────

export type BuildGapsParams = {
  equipos: EquipoSGC[]
  mantenimientos: MantenimientoSGC[]
  personas: PersonaSGC[]
  pqrs: PqrsSGC[]
  indicadores: IndicadorSGC[]
  mediciones: MedicionSGC[]
  acciones: AccionSGC[]
  auditorias: AuditoriaSGC[]
}

export function buildGaps(p: BuildGapsParams): Gap[] {
  const all = [
    ...gapsEquipos(p.equipos),
    ...gapsMantenimiento(p.mantenimientos),
    ...gapsTH(p.personas),
    ...gapsPQRS(p.pqrs),
    ...gapsIndicadores(p.indicadores, p.mediciones),
    ...gapsAcciones(p.acciones),
    ...gapsHallazgos(p.auditorias),
  ]
  return all
    .sort(
      (a, b) =>
        SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity)
    )
    .slice(0, 15)
}
