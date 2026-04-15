import { REQUISITOS_POR_CARGO } from '#/lib/data-catalogs'
import { useConfigStore } from '#/lib/stores/config.store'
import { usePersonalStore } from '#/lib/stores/personal.store'
import type {
  Cargo,
  EstadoRequisito,
  Persona,
  RequisitoDef,
  RequisitoEstado,
} from '#/lib/types'

export function usePersonas(): Persona[] {
  const personas = usePersonalStore((s) => s.personas)
  const sedeActiva = useConfigStore((s) => s.sedeActiva)
  const vistaCompleta = useConfigStore((s) => s.vistaCompleta)
  return vistaCompleta
    ? personas
    : personas.filter((p) => p.sede === sedeActiva)
}

export function usePersonasTodas(): Persona[] {
  return usePersonalStore((s) => s.personas)
}

export function usePersona(id: string | undefined): Persona | undefined {
  return usePersonalStore((s) =>
    id ? s.personas.find((p) => p.id === id) : undefined
  )
}

export function useCargos(): Cargo[] {
  return usePersonalStore((s) => s.cargos)
}

export function useCargo(id: string | undefined): Cargo | undefined {
  return usePersonalStore((s) =>
    id ? s.cargos.find((c) => c.id === id) : undefined
  )
}

export function useUpsertPersona() {
  const addPersona = usePersonalStore((s) => s.addPersona)
  const updatePersona = usePersonalStore((s) => s.updatePersona)
  return (p: Persona) => {
    const existing = usePersonalStore
      .getState()
      .personas.find((x) => x.id === p.id)
    if (existing) updatePersona(p.id, p)
    else addPersona(p)
  }
}

export function useDeletePersona() {
  return usePersonalStore((s) => s.deletePersona)
}

// ─── Derivados de requisitos ────────────────────────────────────────────────

export function getRequisitosDefsByCargo(cargoId: string): RequisitoDef[] {
  return REQUISITOS_POR_CARGO[cargoId] ?? []
}

export function resolveRequisitos(persona: Persona): Array<{
  def: RequisitoDef
  estado: EstadoRequisito
  fechaVigencia: string | null
}> {
  const defs = getRequisitosDefsByCargo(persona.cargo)
  const byId = new Map<string, RequisitoEstado>()
  for (const r of persona.requisitos ?? []) byId.set(r.defId, r)
  return defs.map((def) => {
    const r = byId.get(def.id)
    return {
      def,
      estado: r?.estado ?? (def.critico ? 'CRITICO' : 'SIN_CARGAR'),
      fechaVigencia: r?.fechaVigencia ?? null,
    }
  })
}

export function completitudPersona(persona: Persona): number {
  const items = resolveRequisitos(persona)
  if (items.length === 0) return 0
  const completos = items.filter((i) => i.estado === 'VIGENTE').length
  return Math.round((completos / items.length) * 100)
}

export function estadoCompletitud(
  persona: Persona
): 'Crítico' | 'Alerta' | 'OK' {
  const pct = completitudPersona(persona)
  if (pct < 80) return 'Crítico'
  if (pct < 100) return 'Alerta'
  return 'OK'
}

export function pendientesValidacion(persona: Persona): number {
  return resolveRequisitos(persona).filter((i) => i.estado === 'POR_VALIDAR')
    .length
}

// ─── Selectores agregados ───────────────────────────────────────────────────

export function useCountPorValidar(): number {
  const personas = usePersonalStore((s) => s.personas)
  return personas.reduce((acc, p) => acc + pendientesValidacion(p), 0)
}

export function useCountPersonalCompleta(): number {
  const personas = usePersonalStore((s) => s.personas)
  return personas.filter((p) => completitudPersona(p) === 100).length
}

export function usePersonalCount(): number {
  return usePersonas().length
}

export function usePersonalTodosCount(): number {
  return usePersonalStore((s) => s.personas.length)
}

export function useAlertasRequisitosPorSede() {
  const personas = usePersonas()
  const items = personas.flatMap((p) =>
    resolveRequisitos(p).map((r) => ({ persona: p, ...r }))
  )
  return items.filter(
    (i) =>
      i.estado === 'VENCIDO' ||
      i.estado === 'CRITICO' ||
      i.estado === 'SIN_CARGAR' ||
      i.estado === 'POR_VALIDAR'
  )
}

export function usePendientesValidacion() {
  const personas = usePersonas()
  return personas.flatMap((p) =>
    resolveRequisitos(p)
      .filter((r) => r.estado === 'POR_VALIDAR')
      .map((r) => ({ persona: p, ...r }))
  )
}
