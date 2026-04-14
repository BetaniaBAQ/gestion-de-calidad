import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Habilitacion, CheckItem } from '../types'
import { HAB0 } from '../data'

interface HabilitacionState {
  habilitaciones: Partial<Record<string, Habilitacion>>
  updateItem: (sedeId: string, itemId: string, data: Partial<CheckItem>) => void
  setRevision: (sedeId: string, fecha: string, responsable: string) => void
  initSede: (sedeId: string, hab: Habilitacion) => void
}

export const useHabStore = create<HabilitacionState>()(
  persist(
    (set) => ({
      habilitaciones: HAB0 as Partial<Record<string, Habilitacion>>,
      updateItem: (sedeId, itemId, data) =>
        set((s) => ({
          habilitaciones: {
            ...s.habilitaciones,
            [sedeId]: {
              ...s.habilitaciones[sedeId],
              items:
                s.habilitaciones[sedeId]?.items.map((i) =>
                  i.id === itemId ? { ...i, ...data } : i
                ) ?? [],
            },
          },
        })),
      setRevision: (sedeId, fecha, responsable) =>
        set((s) => ({
          habilitaciones: {
            ...s.habilitaciones,
            [sedeId]: {
              ...s.habilitaciones[sedeId],
              fechaRevision: fecha,
              responsable,
            },
          },
        })),
      initSede: (sedeId, hab) =>
        set((s) => ({
          habilitaciones: { ...s.habilitaciones, [sedeId]: hab },
        })),
    }),
    { name: 'sgc-habilitacion', skipHydration: true }
  )
)
