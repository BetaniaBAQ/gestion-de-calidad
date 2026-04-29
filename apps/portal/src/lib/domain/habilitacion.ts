import { useQuery, useMutation } from 'convex/react'
import { api } from '@cualia/convex'
import { HABILITACION_CATALOGO } from '#/lib/data-catalogs'
import { useEquipos } from '#/lib/domain/equipos'
import { useSedes } from '#/lib/domain/config'
import type { CheckEstado, HabilitacionItemDef } from '#/lib/types'

export function useHabilitacionCatalogo(): HabilitacionItemDef[] {
  return HABILITACION_CATALOGO
}

type RespuestaDoc = {
  _id: string
  criterioDefId: string
  estado: string
  observacion?: string
  evidencias?: string[]
}

export function useRespuestasPorSede(sedeCodigo: string): RespuestaDoc[] {
  const sedes = useSedes()
  const sede = sedes.find((s) => s.codigo === sedeCodigo)
  const raw = useQuery(
    api.habilitacion.listRespuestasByOrgSede,
    sede ? { sedeId: sede._id as any } : 'skip'
  )
  return (raw ?? []) as RespuestaDoc[]
}

export function useUpsertRespuesta() {
  return useMutation(api.habilitacion.upsertRespuesta)
}

export function useAddEvidencia() {
  return useMutation(api.habilitacion.addEvidencia)
}

export function useRemoveEvidencia() {
  return useMutation(api.habilitacion.removeEvidencia)
}

export function useAutoVerificacionPorSede(): Record<
  string,
  Record<string, boolean>
> {
  const equipos = useEquipos()
  const bySede: Record<string, Record<string, boolean>> = {}
  for (const e of equipos) {
    const current = bySede[e.sede] ?? { dot1: false, dot2: false, rh4: true }
    current.dot1 = true
    current.dot2 = true
    bySede[e.sede] = current
  }
  return bySede
}

export function autoForSede(
  all: Record<string, Record<string, boolean>>,
  sedeId: string
): Record<string, boolean> {
  return all[sedeId] ?? { dot1: false, dot2: false, rh4: true }
}

export function computeChecklistEstado(
  respuestas: RespuestaDoc[],
  auto: Record<string, boolean>
) {
  const byDefId = new Map(respuestas.map((r) => [r.criterioDefId, r]))
  return HABILITACION_CATALOGO.map((def) => {
    const resp = byDefId.get(def.id)
    const rawEstado = resp ? (resp.estado as CheckEstado) : 'pendiente'
    let estado: CheckEstado | 'pendiente' = rawEstado
    if (def.auto && auto[def.id]) estado = 'cumple'
    return {
      def,
      estado,
      evidencias: resp?.evidencias ?? [],
      respuestaId: resp?._id,
    }
  })
}

export function pctChecklistCumplido(
  respuestas: RespuestaDoc[],
  auto: Record<string, boolean>
): number {
  const items = computeChecklistEstado(respuestas, auto)
  const aplicables = items.filter((i) => i.estado !== 'na')
  const cumplen = aplicables.filter((i) => i.estado === 'cumple').length
  if (aplicables.length === 0) return 0
  return Math.round((cumplen / aplicables.length) * 100)
}
