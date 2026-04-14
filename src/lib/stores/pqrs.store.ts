import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { PQRS } from '../types'
import { PQRS0 } from '../data'

interface PqrsState {
  pqrs: PQRS[]
  addPqrs: (p: PQRS) => void
  updatePqrs: (id: string, data: Partial<PQRS>) => void
}

export const usePqrsStore = create<PqrsState>()(
  persist(
    (set) => ({
      pqrs: PQRS0,
      addPqrs: (p) => set((s) => ({ pqrs: [...s.pqrs, p] })),
      updatePqrs: (id, data) =>
        set((s) => ({
          pqrs: s.pqrs.map((x) => (x.id === id ? { ...x, ...data } : x)),
        })),
    }),
    { name: 'sgc-pqrs' }
  )
)
