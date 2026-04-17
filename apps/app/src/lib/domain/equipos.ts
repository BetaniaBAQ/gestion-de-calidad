import { useQuery, useMutation } from 'convex/react'
import { api } from '@cualia/convex'
import { useOrgId } from '#/lib/org-context'
import { useConfigStore } from '#/lib/stores/config.store'
import { diasHasta } from '#/lib/utils-sgc'
import type { GenericId } from 'convex/values'

type EquipoId = GenericId<'equipos'>
type SedeId = GenericId<'sedes'>

export type EquipoSGC = {
  _id: EquipoId
  id: string // alias de _id
  sedeId: SedeId
  sede: string // sedeCodigo — usado por filtros
  nombre: string
  marca: string
  modelo: string
  serie: string
  area: string
  fechaCompra: string
  ultimaMant: string
  proxMant: string
  estado: 'operativo' | 'mantenimiento' | 'baja' | 'reparacion'
  invima: string
  vida: number // alias de vidaUtil
  prioridad: 'alta' | 'media' | 'baja'
  docs: [] // placeholder
}

// ─── Hooks internos ─────────────────────────────────────────────────────────

function useEquiposRaw() {
  const orgId = useOrgId()
  return useQuery(api.equipos.listByOrg, orgId ? { orgId } : 'skip') ?? []
}

function projectEquipo(
  doc: ReturnType<typeof useEquiposRaw>[number]
): EquipoSGC {
  return {
    ...doc,
    id: doc._id,
    sede: doc.sedeCodigo,
    ultimaMant: doc.ultimaMant ?? '',
    proxMant: doc.proxMant ?? '',
    invima: doc.invima ?? '',
    vida: doc.vidaUtil ?? 10,
    docs: [],
  }
}

// ─── Hooks públicos ──────────────────────────────────────────────────────────

export function useEquipos(): EquipoSGC[] {
  const all = useEquiposRaw().map(projectEquipo)
  const sedeActiva = useConfigStore((s) => s.sedeActiva)
  const vistaCompleta = useConfigStore((s) => s.vistaCompleta)
  return vistaCompleta ? all : all.filter((e) => e.sede === sedeActiva)
}

export function useEquiposTodos(): EquipoSGC[] {
  return useEquiposRaw().map(projectEquipo)
}

export function useEquipo(id: string | undefined): EquipoSGC | undefined {
  return useEquiposRaw()
    .map(projectEquipo)
    .find((e) => e._id === id)
}

export function useCreateEquipo() {
  return useMutation(api.equipos.create)
}

export function useUpdateEquipo() {
  return useMutation(api.equipos.update)
}

export function useRemoveEquipo() {
  return useMutation(api.equipos.remove)
}

// ─── Lógica de mantenimiento ─────────────────────────────────────────────────

export function equipoMantVigente(e: EquipoSGC): boolean {
  return diasHasta(e.proxMant) >= 0
}

export function equipoAlerta30d(e: EquipoSGC): boolean {
  const d = diasHasta(e.proxMant)
  return d >= 0 && d <= 30
}

export function equipoVencido(e: EquipoSGC): boolean {
  return diasHasta(e.proxMant) < 0
}

export function usePctMantVigente(): number {
  const equipos = useEquipos()
  if (equipos.length === 0) return 0
  const ok = equipos.filter(equipoMantVigente).length
  return Math.round((ok / equipos.length) * 100)
}

export function useEquiposVencidos() {
  return useEquipos().filter(equipoVencido)
}

export function useEquiposProximos() {
  return useEquipos().filter(equipoAlerta30d)
}
