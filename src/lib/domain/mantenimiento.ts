import { useConfigStore } from '#/lib/stores/config.store'
import { MANTENIMIENTOS0 } from '#/lib/data'
import type { Mantenimiento } from '#/lib/types'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface MantenimientosState {
  mantenimientos: Mantenimiento[]
  addMantenimiento: (m: Mantenimiento) => void
  updateMantenimiento: (id: string, data: Partial<Mantenimiento>) => void
  deleteMantenimiento: (id: string) => void
}

export const useMantenimientosStore = create<MantenimientosState>()(
  persist(
    (set) => ({
      mantenimientos: MANTENIMIENTOS0,
      addMantenimiento: (m) =>
        set((s) => ({ mantenimientos: [...s.mantenimientos, m] })),
      updateMantenimiento: (id, data) =>
        set((s) => ({
          mantenimientos: s.mantenimientos.map((x) =>
            x.id === id ? { ...x, ...data } : x
          ),
        })),
      deleteMantenimiento: (id) =>
        set((s) => ({
          mantenimientos: s.mantenimientos.filter((x) => x.id !== id),
        })),
    }),
    { name: 'sgc-mantenimientos', skipHydration: true }
  )
)

export function useMantenimientos(): Mantenimiento[] {
  const all = useMantenimientosStore((s) => s.mantenimientos)
  const sedeActiva = useConfigStore((s) => s.sedeActiva)
  const vistaCompleta = useConfigStore((s) => s.vistaCompleta)
  return vistaCompleta ? all : all.filter((m) => m.sedeId === sedeActiva)
}

export function useMantenimientosTodos(): Mantenimiento[] {
  return useMantenimientosStore((s) => s.mantenimientos)
}

export function useUpsertMantenimiento() {
  const add = useMantenimientosStore((s) => s.addMantenimiento)
  const update = useMantenimientosStore((s) => s.updateMantenimiento)
  return (m: Mantenimiento) => {
    const existing = useMantenimientosStore
      .getState()
      .mantenimientos.find((x) => x.id === m.id)
    if (existing) update(m.id, m)
    else add(m)
  }
}

export function usePctCerradas(): number {
  const all = useMantenimientos()
  if (all.length === 0) return 0
  const cerradas = all.filter((m) => m.estado === 'cerrado').length
  return Math.round((cerradas / all.length) * 100)
}
