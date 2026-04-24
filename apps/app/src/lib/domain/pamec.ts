import { useQuery, useMutation } from 'convex/react'
import { api } from '@cualia/convex'
import type { GenericId } from 'convex/values'
import { useAuthArgs } from '#/lib/convex-helpers'

type AuditoriaId = GenericId<'pamec_auditorias'>
type AccionId = GenericId<'pamec_acciones'>

export type HallazgoSGC = {
  id: string
  tipo: 'no_conformidad' | 'observacion' | 'oportunidad_mejora'
  descripcion: string
  criterio?: string
  accionCorrectiva?: string
  responsable?: string
  fechaLimite?: string
  estado: 'abierto' | 'cerrado' | 'vencido'
}

export type AuditoriaSGC = {
  _id: AuditoriaId
  id: string
  sedeId: GenericId<'sedes'>
  sede: string // sedeCodigo
  tipo: 'interna' | 'externa' | 'seguimiento'
  proceso: string
  auditor: string
  fechaInicio: string
  fechaFin: string
  estado: 'planeada' | 'en_proceso' | 'cerrada'
  observaciones: string
  hallazgos: HallazgoSGC[]
}

export type AccionSGC = {
  _id: AccionId
  id: string
  sedeCodigo: string
  hallazgo: string
  causa: string
  accion: string
  responsable: string
  fechaLimite: string
  fechaCierre?: string
  estado: 'pendiente' | 'en_proceso' | 'cerrado' | 'vencido'
  fase: 'planear' | 'hacer' | 'verificar' | 'actuar'
  resultado?: string
}

// ─── Hooks internos ─────────────────────────────────────────────────────────

function useAuditoriasRaw() {
  return useQuery(api.pamec.listAuditoriasByOrg, useAuthArgs()) ?? []
}

function useAccionesRaw() {
  return useQuery(api.pamec.listAccionesByOrg, useAuthArgs()) ?? []
}

function projectAuditoria(
  doc: ReturnType<typeof useAuditoriasRaw>[number]
): AuditoriaSGC {
  return {
    ...doc,
    id: doc._id,
    sede: doc.sedeCodigo,
    fechaFin: doc.fechaFin ?? '',
    observaciones: doc.observaciones ?? '',
    hallazgos: (doc.hallazgos ?? []) as HallazgoSGC[],
  }
}

function projectAccion(
  doc: ReturnType<typeof useAccionesRaw>[number]
): AccionSGC {
  return { ...doc, id: doc._id }
}

// ─── Hooks públicos ──────────────────────────────────────────────────────────

export function useAuditorias(): AuditoriaSGC[] {
  return useAuditoriasRaw().map(projectAuditoria)
}

export function useAuditoria(id: string | undefined): AuditoriaSGC | undefined {
  return useAuditoriasRaw()
    .map(projectAuditoria)
    .find((a) => a._id === id)
}

export function useAcciones(): AccionSGC[] {
  return useAccionesRaw().map(projectAccion)
}

export function useCreateAuditoria() {
  return useMutation(api.pamec.createAuditoria)
}

export function useUpdateAuditoria() {
  return useMutation(api.pamec.updateAuditoria)
}

export function useRemoveAuditoria() {
  return useMutation(api.pamec.removeAuditoria)
}

export function useCreateAccion() {
  return useMutation(api.pamec.createAccion)
}

export function useUpdateAccion() {
  return useMutation(api.pamec.updateAccion)
}

export function useRemoveAccion() {
  return useMutation(api.pamec.removeAccion)
}

// ─── Stats ───────────────────────────────────────────────────────────────────

export function usePamecStats() {
  const auditorias = useAuditorias()
  const acciones = useAcciones()
  const hallazgos = auditorias.flatMap((a) => a.hallazgos)
  const cerrados = hallazgos.filter((h) => h.estado === 'cerrado').length
  const accVencidas = acciones.filter((a) => a.estado === 'vencido').length
  return {
    auditorias: auditorias.length,
    hallazgos: hallazgos.length,
    cerrados,
    accVencidas,
  }
}
