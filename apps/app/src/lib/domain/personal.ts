import { useQuery, useMutation } from 'convex/react'
import { api } from '@cualia/convex'
import { useConfigStore } from '#/lib/stores/config.store'
import { REQUISITOS_POR_CARGO } from '#/lib/data-catalogs'
import type { GenericId } from 'convex/values'
import { useAuthArgs } from '#/lib/convex-helpers'
import type {
  EstadoRequisito,
  RequisitoDef,
  RequisitoEstado,
} from '#/lib/types'

type PersonaId = GenericId<'personal'>
type CargoId = GenericId<'cargos'>
type SedeId = GenericId<'sedes'>

// ─── Tipos proyectados ──────────────────────────────────────────────────────

export type PersonaSGC = {
  _id: PersonaId
  id: string // alias de _id
  nombre: string
  cedula: string
  cargo: string // cargoCodigo — usado por REQUISITOS_POR_CARGO
  cargoId: CargoId
  sede: string // sedeCodigo — usado por filtros de sede
  sedeId: SedeId
  fechaIngreso: string
  estado: 'activo' | 'inactivo' | 'vacaciones' | 'licencia'
  requisitos: RequisitoEstado[]
  docs: [] // placeholder para compatibilidad con Persona legacy
  caps: [] // placeholder para compatibilidad con Persona legacy
}

export type CargoSGC = {
  _id: CargoId
  id: string // alias de codigo — usado por lookups legacy
  codigo: string
  nombre: string
  tipo?: 'asistencial' | 'administrativo' | 'apoyo' | 'directivo'
  area: string
  perfil: string
  docRequeridos: string[]
  capRequeridas: string[]
}

// ─── Hooks internos ─────────────────────────────────────────────────────────

function usePersonalRaw() {
  return useQuery(api.personal.listByOrg, useAuthArgs()) ?? []
}

function useCargosRaw() {
  return useQuery(api.cargos.listByOrg, useAuthArgs()) ?? []
}

function projectPersona(
  doc: ReturnType<typeof usePersonalRaw>[number]
): PersonaSGC {
  return {
    ...doc,
    id: doc._id,
    cargo: doc.cargoCodigo,
    sede: doc.sedeCodigo,
    requisitos: (doc.requisitos ?? []) as RequisitoEstado[],
    docs: [],
    caps: [],
  }
}

function projectCargo(doc: ReturnType<typeof useCargosRaw>[number]): CargoSGC {
  return {
    ...doc,
    id: doc.codigo,
  }
}

// ─── Hooks públicos — Personal ───────────────────────────────────────────────

export function usePersonas(): PersonaSGC[] {
  const all = usePersonalRaw().map(projectPersona)
  const sedeActiva = useConfigStore((s) => s.sedeActiva)
  const vistaCompleta = useConfigStore((s) => s.vistaCompleta)
  return vistaCompleta ? all : all.filter((p) => p.sede === sedeActiva)
}

export function usePersonasTodas(): PersonaSGC[] {
  return usePersonalRaw().map(projectPersona)
}

export function usePersona(id: string | undefined): PersonaSGC | undefined {
  return usePersonalRaw()
    .map(projectPersona)
    .find((p) => p._id === id)
}

export function useCreatePersona() {
  return useMutation(api.personal.create)
}

export function useUpdatePersona() {
  return useMutation(api.personal.update)
}

export function useRemovePersona() {
  return useMutation(api.personal.remove)
}

// ─── Hooks públicos — Cargos ────────────────────────────────────────────────

export function useCargos(): CargoSGC[] {
  return useCargosRaw().map(projectCargo)
}

export function useCargo(id: string | undefined): CargoSGC | undefined {
  if (!id) return undefined
  return useCargosRaw()
    .map(projectCargo)
    .find((c) => c.codigo === id || c._id === id)
}

export function useCreateCargo() {
  return useMutation(api.cargos.create)
}

export function useUpdateCargo() {
  return useMutation(api.cargos.update)
}

export function useRemoveCargo() {
  return useMutation(api.cargos.remove)
}

// ─── Lógica de requisitos ───────────────────────────────────────────────────

export function getRequisitosDefsByCargo(cargoId: string): RequisitoDef[] {
  return REQUISITOS_POR_CARGO[cargoId] ?? []
}

export function resolveRequisitos(persona: PersonaSGC): Array<{
  def: RequisitoDef
  estado: EstadoRequisito
  fechaVigencia: string | null
}> {
  const defs = getRequisitosDefsByCargo(persona.cargo)
  const byId = new Map<string, RequisitoEstado>()
  for (const r of persona.requisitos) byId.set(r.defId, r)
  return defs.map((def) => {
    const r = byId.get(def.id)
    return {
      def,
      estado: r?.estado ?? (def.critico ? 'CRITICO' : 'SIN_CARGAR'),
      fechaVigencia: r?.fechaVigencia ?? null,
    }
  })
}

export function completitudPersona(persona: PersonaSGC): number {
  const items = resolveRequisitos(persona)
  if (items.length === 0) return 0
  const completos = items.filter((i) => i.estado === 'VIGENTE').length
  return Math.round((completos / items.length) * 100)
}

export function estadoCompletitud(
  persona: PersonaSGC
): 'Crítico' | 'Alerta' | 'OK' {
  const pct = completitudPersona(persona)
  if (pct < 80) return 'Crítico'
  if (pct < 100) return 'Alerta'
  return 'OK'
}

export function pendientesValidacion(persona: PersonaSGC): number {
  return resolveRequisitos(persona).filter((i) => i.estado === 'POR_VALIDAR')
    .length
}

// ─── Selectores agregados ───────────────────────────────────────────────────

export function useCountPorValidar(): number {
  return usePersonas().reduce((acc, p) => acc + pendientesValidacion(p), 0)
}

export function useCountPersonalCompleta(): number {
  return usePersonas().filter((p) => completitudPersona(p) === 100).length
}

export function usePersonalCount(): number {
  return usePersonas().length
}

export function usePersonalTodosCount(): number {
  return usePersonasTodas().length
}

export function useAlertasRequisitosPorSede() {
  const personas = usePersonas()
  return personas
    .flatMap((p) => resolveRequisitos(p).map((r) => ({ persona: p, ...r })))
    .filter(
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

// Compatibilidad con código que aún usa useUpsertPersona / useDeletePersona
export function useDeletePersona() {
  return useMutation(api.personal.remove)
}
