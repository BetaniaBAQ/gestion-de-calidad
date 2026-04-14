import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Adherencia } from '../types'
import { ADHERENCIA0 } from '../data'

interface AdherenciaState {
  adherencias: Adherencia[]
  addAdherencia: (a: Adherencia) => void
  updateAdherencia: (id: string, data: Partial<Adherencia>) => void
}

export const useAdherenciaStore = create<AdherenciaState>()(
  persist(
    (set) => ({
      adherencias: ADHERENCIA0,
      addAdherencia: (a) =>
        set((s) => ({ adherencias: [...s.adherencias, a] })),
      updateAdherencia: (id, data) =>
        set((s) => ({
          adherencias: s.adherencias.map((x) =>
            x.id === id ? { ...x, ...data } : x
          ),
        })),
    }),
    { name: 'sgc-adherencia' }
  )
)
