import { useQuery, useMutation } from 'convex/react'
import { api } from '@cualia/convex'
import { useConfigStore } from '#/lib/stores/config.store'
import type { GenericId } from 'convex/values'
import { useAuthArgs } from '#/lib/convex-helpers'

type MedicamentoId = GenericId<'medicamentos'>
type SedeId = GenericId<'sedes'>
type AlertaId = GenericId<'alertas_sanitarias'>

export type MedicamentoSGC = {
  _id: MedicamentoId
  id: string // alias de _id
  sedeId: SedeId
  sede: string // sedeCodigo — usado por filtros
  nombre: string
  principioActivo: string
  concentracion: string
  forma: string
  laboratorio: string
  registro: string
  lote: string
  fechaVenc: string
  stock: number
  stockMinimo: number
  condicionAlm: string
  estado: 'activo' | 'agotado' | 'vencido' | 'suspendido'
}

export type AlertaSanitariaSGC = {
  _id: AlertaId
  id: string // alias de _id
  fecha: string
  tipo: 'alerta_invima' | 'ram' | 'evento_ad' | 'retiro'
  fuente: string
  descripcion: string
  accion?: string
  spLink?: string
}

// ─── Medicamentos — Convex ───────────────────────────────────────────────────

function useMedicamentosRaw() {
  return useQuery(api.medicamentos.listByOrg, useAuthArgs()) ?? []
}

function projectMedicamento(
  doc: ReturnType<typeof useMedicamentosRaw>[number]
): MedicamentoSGC {
  return {
    ...doc,
    id: doc._id,
    sede: doc.sedeCodigo,
  }
}

export function useMedicamentos(): MedicamentoSGC[] {
  const all = useMedicamentosRaw().map(projectMedicamento)
  const sedeActiva = useConfigStore((s) => s.sedeActiva)
  const vistaCompleta = useConfigStore((s) => s.vistaCompleta)
  return vistaCompleta ? all : all.filter((m) => m.sede === sedeActiva)
}

export function useMedicamentosTodos(): MedicamentoSGC[] {
  return useMedicamentosRaw().map(projectMedicamento)
}

export function useCreateMedicamento() {
  return useMutation(api.medicamentos.create)
}

export function useUpdateMedicamento() {
  return useMutation(api.medicamentos.update)
}

export function useRemoveMedicamento() {
  return useMutation(api.medicamentos.remove)
}

// ─── Alertas sanitarias — Convex ─────────────────────────────────────────────

function useAlertasRaw() {
  return useQuery(api.alertas_sanitarias.listByOrg, useAuthArgs()) ?? []
}

function projectAlerta(
  doc: ReturnType<typeof useAlertasRaw>[number]
): AlertaSanitariaSGC {
  return {
    ...doc,
    id: doc._id,
  }
}

export function useAlertasSanitarias(): AlertaSanitariaSGC[] {
  return useAlertasRaw().map(projectAlerta)
}

export function useCreateAlerta() {
  return useMutation(api.alertas_sanitarias.create)
}

export function useUpdateAlerta() {
  return useMutation(api.alertas_sanitarias.update)
}

export function useRemoveAlerta() {
  return useMutation(api.alertas_sanitarias.remove)
}

export function usePctConAccion(): number {
  const all = useAlertasSanitarias()
  if (all.length === 0) return 0
  const conAccion = all.filter((a) => !!a.accion).length
  return Math.round((conAccion / all.length) * 100)
}
