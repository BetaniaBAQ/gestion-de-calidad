import { useQuery, useMutation } from 'convex/react'
import { api } from '@cualia/convex'
import { useOrgId } from '#/lib/org-context'
import type { GenericId } from 'convex/values'

type IndicadorId = GenericId<'indicadores'>
type MedicionId = GenericId<'mediciones_indicadores'>

export type IndicadorSGC = {
  _id: IndicadorId
  id: string
  nombre: string
  descripcion: string
  formula: string
  meta: number
  unidad: string
  frecuencia: 'mensual' | 'trimestral' | 'semestral' | 'anual'
  proceso: string
  responsable: string
  activo: boolean
  umbralAlerta?: number
  fuente?: string
}

export type MedicionSGC = {
  _id: MedicionId
  id: string
  indicadorId: IndicadorId
  periodo: string
  valor: number
  meta: number
  responsable: string
  fecha: string
  observacion?: string
  sedeId?: GenericId<'sedes'>
}

// ─── Hooks internos ─────────────────────────────────────────────────────────

function useIndicadoresRaw() {
  const orgId = useOrgId()
  return useQuery(api.indicadores.listByOrg, orgId ? { orgId } : 'skip') ?? []
}

function useMedicionesRaw() {
  const orgId = useOrgId()
  return (
    useQuery(api.indicadores.listMedicionesByOrg, orgId ? { orgId } : 'skip') ??
    []
  )
}

function projectIndicador(
  doc: ReturnType<typeof useIndicadoresRaw>[number]
): IndicadorSGC {
  return { ...doc, id: doc._id }
}

function projectMedicion(
  doc: ReturnType<typeof useMedicionesRaw>[number]
): MedicionSGC {
  return { ...doc, id: doc._id }
}

// ─── Hooks públicos ──────────────────────────────────────────────────────────

export function useIndicadores(): IndicadorSGC[] {
  return useIndicadoresRaw().map(projectIndicador)
}

export function useMediciones(): MedicionSGC[] {
  return useMedicionesRaw().map(projectMedicion)
}

export function useIndicadorById(
  id: string | undefined
): IndicadorSGC | undefined {
  return useIndicadoresRaw()
    .map(projectIndicador)
    .find((i) => i._id === id)
}

export function useCreateIndicador() {
  return useMutation(api.indicadores.create)
}

export function useUpdateIndicador() {
  return useMutation(api.indicadores.update)
}

export function useRemoveIndicador() {
  return useMutation(api.indicadores.remove)
}

export function useCreateMedicion() {
  return useMutation(api.indicadores.createMedicion)
}

export function useUpdateMedicion() {
  return useMutation(api.indicadores.updateMedicion)
}

// ─── Utilidades ──────────────────────────────────────────────────────────────

export function useIndicadoresPorModulo(): Record<string, IndicadorSGC[]> {
  const inds = useIndicadores()
  return inds.reduce<Record<string, IndicadorSGC[]>>((acc, i) => {
    const bucket = acc[i.proceso] ?? []
    bucket.push(i)
    acc[i.proceso] = bucket
    return acc
  }, {})
}
