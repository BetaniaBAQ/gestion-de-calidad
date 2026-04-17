import { useQuery, useMutation } from 'convex/react'
import { api } from '@cualia/convex'
import { useOrgId } from '#/lib/org-context'
import { useConfigStore } from '#/lib/stores/config.store'
import type { GenericId } from 'convex/values'

type PqrsId = GenericId<'pqrs'>
type SedeId = GenericId<'sedes'>

export type PqrsSGC = {
  _id: PqrsId
  id: string
  sedeId: SedeId
  sede: string // sedeCodigo
  tipo: 'peticion' | 'queja' | 'reclamo' | 'sugerencia'
  radicado: string
  fecha: string
  nombreInteresado: string
  contacto: string
  descripcion: string
  respuesta?: string
  fechaRespuesta?: string
  responsable: string
  estado: 'recibido' | 'en_tramite' | 'respondido' | 'cerrado' | 'vencido'
}

// ─── Hooks internos ─────────────────────────────────────────────────────────

function usePqrsRaw() {
  const orgId = useOrgId()
  return useQuery(api.pqrs.listByOrg, orgId ? { orgId } : 'skip') ?? []
}

function projectPqr(doc: ReturnType<typeof usePqrsRaw>[number]): PqrsSGC {
  return { ...doc, id: doc._id, sede: doc.sedeCodigo }
}

// ─── Hooks públicos ──────────────────────────────────────────────────────────

export function usePqrs(): PqrsSGC[] {
  const all = usePqrsRaw().map(projectPqr)
  const sedeActiva = useConfigStore((s) => s.sedeActiva)
  const vistaCompleta = useConfigStore((s) => s.vistaCompleta)
  return vistaCompleta ? all : all.filter((p) => p.sede === sedeActiva)
}

export function usePqrsTodas(): PqrsSGC[] {
  return usePqrsRaw().map(projectPqr)
}

export function useCreatePqrs() {
  return useMutation(api.pqrs.create)
}

export function useUpdatePqrs() {
  return useMutation(api.pqrs.update)
}

export function useRemovePqrs() {
  return useMutation(api.pqrs.remove)
}

// ─── Lógica ──────────────────────────────────────────────────────────────────

function diasEntre(a: string, b: string): number {
  const ms = new Date(b).getTime() - new Date(a).getTime()
  return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)))
}

export function diasTranscurridos(pqr: PqrsSGC): number {
  const end = pqr.fechaRespuesta ?? new Date().toISOString().slice(0, 10)
  return diasEntre(pqr.fecha, end)
}

export function usePqrsStats() {
  const all = usePqrs()
  const total = all.length
  const enTramite = all.filter((p) => p.estado === 'en_tramite').length
  const vencidas = all.filter((p) => p.estado === 'vencido').length
  const cerradas = all.filter(
    (p) => p.estado === 'cerrado' || p.estado === 'respondido'
  )
  const aTermino = cerradas.filter((p) => diasTranscurridos(p) <= 15).length
  const pctTermino =
    cerradas.length > 0 ? Math.round((aTermino / cerradas.length) * 100) : 100
  const dias = cerradas.map(diasTranscurridos)
  const tiempoPromedio =
    dias.length > 0
      ? Math.round(dias.reduce((a, b) => a + b, 0) / dias.length)
      : 0
  return {
    total,
    enTramite,
    vencidas,
    cerradas: cerradas.length,
    pctTermino,
    tiempoPromedio,
  }
}
