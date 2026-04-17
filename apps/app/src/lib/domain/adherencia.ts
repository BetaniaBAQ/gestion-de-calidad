import { useQuery, useMutation } from 'convex/react'
import { api } from '@cualia/convex'
import { useOrgId } from '#/lib/org-context'
import { useConfigStore } from '#/lib/stores/config.store'
import { GPCS0 } from '#/lib/data'
import type { GPC } from '#/lib/types'
import type { GenericId } from 'convex/values'

type AdherenciaId = GenericId<'adherencia'>

export type AdherenciaSGC = {
  _id: AdherenciaId
  id: string
  sedeId: GenericId<'sedes'>
  sede: string // sedeCodigo
  protocolo: string
  periodo: string
  totalAplicaciones: number
  conformes: number
  noConformes: number
  observaciones: string
  responsable: string
  fecha: string
}

// ─── Hooks internos ─────────────────────────────────────────────────────────

function useAdherenciasRaw() {
  const orgId = useOrgId()
  return useQuery(api.adherencia.listByOrg, orgId ? { orgId } : 'skip') ?? []
}

function projectAdherencia(
  doc: ReturnType<typeof useAdherenciasRaw>[number]
): AdherenciaSGC {
  return {
    ...doc,
    id: doc._id,
    sede: doc.sedeCodigo,
    observaciones: doc.observaciones ?? '',
  }
}

// ─── Hooks públicos ──────────────────────────────────────────────────────────

export function useAdherencias(): AdherenciaSGC[] {
  const all = useAdherenciasRaw().map(projectAdherencia)
  const sedeActiva = useConfigStore((s) => s.sedeActiva)
  const vistaCompleta = useConfigStore((s) => s.vistaCompleta)
  return vistaCompleta ? all : all.filter((a) => a.sede === sedeActiva)
}

export function useCreateAdherencia() {
  return useMutation(api.adherencia.create)
}

export function useUpdateAdherencia() {
  return useMutation(api.adherencia.update)
}

export function useRemoveAdherencia() {
  return useMutation(api.adherencia.remove)
}

// ─── GPCs estáticos (catálogo — se migrarán a Convex en Fase 1) ─────────────

export function useGpcs(): GPC[] {
  return GPCS0
}

export function useAdherenciaPromedio(): number {
  const gpcs = useGpcs()
  if (gpcs.length === 0) return 0
  const avg =
    gpcs.reduce((acc, g) => acc + g.adherenciaPromedio, 0) / gpcs.length
  return Math.round(avg * 10) / 10
}
