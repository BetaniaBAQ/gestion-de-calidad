import { useQuery, useMutation } from 'convex/react'
import { api } from '@cualia/convex'
import { useOrgId } from '#/lib/org-context'
import type { GenericId } from 'convex/values'

type CapId = GenericId<'capacitaciones_programadas'>

export type CapacitacionSGC = {
  _id: CapId
  orgId: string
  nombre: string
  area: string
  fechaObjetivo: string
  responsable: string
  estado: 'programada' | 'ejecutada' | 'cancelada'
  sedeId?: GenericId<'sedes'>
  observaciones?: string
  evidenciaUrl?: string
}

export function useCapacitaciones(): CapacitacionSGC[] {
  const orgId = useOrgId()
  return (useQuery(api.capacitaciones.listByOrg, orgId ? { orgId } : 'skip') ?? []) as CapacitacionSGC[]
}

export function useCreateCapacitacion() {
  return useMutation(api.capacitaciones.create)
}

export function useUpdateCapacitacion() {
  return useMutation(api.capacitaciones.update)
}

export function useRemoveCapacitacion() {
  return useMutation(api.capacitaciones.remove)
}
