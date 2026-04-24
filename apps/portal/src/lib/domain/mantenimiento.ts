import { useQuery, useMutation } from 'convex/react'
import { api } from '@cualia/convex'
import { useConfigStore } from '#/lib/stores/config.store'
import type { GenericId } from 'convex/values'
import { useAuthArgs } from '#/lib/convex-helpers'

type MantenimientoId = GenericId<'mantenimientos'>
type SedeId = GenericId<'sedes'>

export type MantenimientoSGC = {
  _id: MantenimientoId
  id: string // alias de _id
  sedeId: SedeId
  sedeCodigo: string // usado por filtros ('BAQ', 'SIN', ...)
  codigo: string
  descripcion: string
  tipo:
    | 'biomedico'
    | 'infraestructura'
    | 'ti'
    | 'preventivo'
    | 'correctivo'
    | 'calibracion'
    | 'otro'
  area: string
  prioridad: 'alta' | 'media' | 'baja'
  solicitante: string
  apertura: string
  estado: 'abierto' | 'asignado' | 'en_ejecucion' | 'cerrado' | 'cancelado'
  tecnico?: string
  empresa?: string
  costo?: number
  fechaCierre?: string
  observaciones?: string
  proxFecha?: string
  equipoId?: GenericId<'equipos'>
}

// ─── Queries ─────────────────────────────────────────────────────────────────

function useMantenimientosRaw() {
  return useQuery(api.mantenimientos.listByOrg, useAuthArgs()) ?? []
}

function project(
  doc: ReturnType<typeof useMantenimientosRaw>[number]
): MantenimientoSGC {
  return {
    ...doc,
    id: doc._id,
  }
}

export function useMantenimientos(): MantenimientoSGC[] {
  const all = useMantenimientosRaw().map(project)
  const sedeActiva = useConfigStore((s) => s.sedeActiva)
  const vistaCompleta = useConfigStore((s) => s.vistaCompleta)
  return vistaCompleta ? all : all.filter((m) => m.sedeCodigo === sedeActiva)
}

export function useMantenimientosTodos(): MantenimientoSGC[] {
  return useMantenimientosRaw().map(project)
}

// ─── Mutations ───────────────────────────────────────────────────────────────

export function useCreateMantenimiento() {
  return useMutation(api.mantenimientos.create)
}

export function useUpdateMantenimiento() {
  return useMutation(api.mantenimientos.update)
}

export function useRemoveMantenimiento() {
  return useMutation(api.mantenimientos.remove)
}

// ─── Indicadores ─────────────────────────────────────────────────────────────

export function usePctCerradas(): number {
  const all = useMantenimientos()
  if (all.length === 0) return 0
  const cerradas = all.filter((m) => m.estado === 'cerrado').length
  return Math.round((cerradas / all.length) * 100)
}
