import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AccionPAMEC } from '../types'
import { PLAN_MEJORA0 } from '../data'

interface PamecState {
  acciones: AccionPAMEC[]
  addAccion: (a: AccionPAMEC) => void
  updateAccion: (id: string, data: Partial<AccionPAMEC>) => void
  deleteAccion: (id: string) => void
}

export const usePamecStore = create<PamecState>()(
  persist(
    (set) => ({
      acciones: PLAN_MEJORA0,
      addAccion: (a) => set((s) => ({ acciones: [...s.acciones, a] })),
      updateAccion: (id, data) =>
        set((s) => ({
          acciones: s.acciones.map((x) =>
            x.id === id ? { ...x, ...data } : x
          ),
        })),
      deleteAccion: (id) =>
        set((s) => ({ acciones: s.acciones.filter((x) => x.id !== id) })),
    }),
    { name: 'sgc-pamec', skipHydration: true }
  )
)
