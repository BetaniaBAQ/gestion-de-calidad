import { HABILITACION_CATALOGO } from '#/lib/data-catalogs'
import { useHabStore } from '#/lib/stores/habilitacion.store'
import { useEquiposStore } from '#/lib/stores/equipos.store'
import type {
  CheckEstado,
  Habilitacion,
  HabilitacionItemDef,
} from '#/lib/types'

export function useHabilitacionCatalogo(): HabilitacionItemDef[] {
  return HABILITACION_CATALOGO
}

export function useHabilitacionPorSede(
  sedeId: string
): Habilitacion | undefined {
  return useHabStore((s) => s.habilitaciones[sedeId])
}

export function useHabilitacionesAll(): Record<string, Habilitacion> {
  return useHabStore((s) => s.habilitaciones)
}

export function useUpdateItem() {
  return useHabStore((s) => s.updateItem)
}

export function useInitSede() {
  return useHabStore((s) => s.initSede)
}

// Auto-verificación desde datos del sistema (por sede)
export function useAutoVerificacionPorSede(): Record<
  string,
  Record<string, boolean>
> {
  const equipos = useEquiposStore((s) => s.equipos)
  const bySede: Record<string, Record<string, boolean>> = {}
  for (const e of equipos) {
    const current = bySede[e.sede] ?? {
      dot1: false,
      dot2: false,
      rh4: true,
    }
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
  hab: Habilitacion | undefined,
  auto: Record<string, boolean>
) {
  return HABILITACION_CATALOGO.map((def) => {
    const manual = hab?.items.find((i) => i.id === def.id)
    let estado: CheckEstado | 'pendiente' = manual?.estado ?? 'pendiente'
    if (def.auto && auto[def.id]) estado = 'cumple'
    return { def, estado }
  })
}

export function pctChecklistCumplido(
  hab: Habilitacion | undefined,
  auto: Record<string, boolean>
): number {
  const items = computeChecklistEstado(hab, auto)
  const aplicables = items.filter((i) => i.estado !== 'na')
  const cumplen = aplicables.filter((i) => i.estado === 'cumple').length
  if (aplicables.length === 0) return 0
  return Math.round((cumplen / aplicables.length) * 100)
}
