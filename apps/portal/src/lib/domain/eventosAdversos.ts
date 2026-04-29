import { useQuery, useMutation } from 'convex/react'
import { api } from '@cualia/convex'
import { useAuthArgs } from '#/lib/convex-helpers'

export type EventoAdverso = {
  _id: string
  sedeId: string
  sedeCodigo: string
  tipo:
    | 'incidente'
    | 'evento_adverso_prevenible'
    | 'evento_adverso_no_prevenible'
    | 'evento_centinela'
  fecha: string
  hora?: string
  servicio: string
  descripcion: string
  reportanteNombre?: string
  reportanteCargo?: string
  anonimo: boolean
  estado:
    | 'reportado'
    | 'clasificado'
    | 'en_investigacion'
    | 'acciones_definidas'
    | 'en_seguimiento'
    | 'cerrado'
  londonProtocol?: {
    lineaTiempo?: string
    problemasAtencion?: string
    factoresContributivos?: string
    causasRaiz?: string
    recomendaciones?: string
    planAccion?: string
    completado: boolean
  }
  gestionadoPor?: string
}

export function useEventosAdversos(): EventoAdverso[] {
  return (useQuery(api.eventos_adversos.listByOrg, useAuthArgs()) ??
    []) as EventoAdverso[]
}

export function useCreateEvento() {
  return useMutation(api.eventos_adversos.create)
}

export function useUpdateEvento() {
  return useMutation(api.eventos_adversos.update)
}

export function useAvanzarEstado() {
  return useMutation(api.eventos_adversos.avanzarEstado)
}

export function useUpdateLondonProtocol() {
  return useMutation(api.eventos_adversos.updateLondonProtocol)
}

export function useRemoveEvento() {
  return useMutation(api.eventos_adversos.remove)
}

export const TIPO_LABELS: Record<EventoAdverso['tipo'], string> = {
  incidente: 'Incidente',
  evento_adverso_prevenible: 'EA Prevenible',
  evento_adverso_no_prevenible: 'EA No Prevenible',
  evento_centinela: 'Evento Centinela',
}

export const ESTADO_LABELS: Record<EventoAdverso['estado'], string> = {
  reportado: 'Reportado',
  clasificado: 'Clasificado',
  en_investigacion: 'En investigación',
  acciones_definidas: 'Acciones definidas',
  en_seguimiento: 'En seguimiento',
  cerrado: 'Cerrado',
}

export function useEventosStats() {
  const eventos = useEventosAdversos()
  const abiertos = eventos.filter((e) => e.estado !== 'cerrado').length
  const centinela = eventos.filter((e) => e.tipo === 'evento_centinela').length
  const sinLondon = eventos.filter(
    (e) =>
      (e.tipo === 'evento_centinela' ||
        e.tipo === 'evento_adverso_prevenible') &&
      !e.londonProtocol?.completado
  ).length
  return { total: eventos.length, abiertos, centinela, sinLondon }
}
