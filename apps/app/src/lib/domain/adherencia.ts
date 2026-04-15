import { GPCS0 } from '#/lib/data'
import { useAdherenciaStore } from '#/lib/stores/adherencia.store'
import type { Adherencia, GPC } from '#/lib/types'

export function useAdherencias(): Adherencia[] {
  return useAdherenciaStore((s) => s.adherencias)
}

export function useUpsertAdherencia() {
  const add = useAdherenciaStore((s) => s.addAdherencia)
  const update = useAdherenciaStore((s) => s.updateAdherencia)
  return (a: Adherencia) => {
    const existing = useAdherenciaStore
      .getState()
      .adherencias.find((x) => x.id === a.id)
    if (existing) update(a.id, a)
    else add(a)
  }
}

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
