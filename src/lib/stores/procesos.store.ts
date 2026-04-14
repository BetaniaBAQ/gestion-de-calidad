import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Proceso } from '../types'
import { PROCESOS0 } from '../data'

interface ProcesosState {
  procesos: Proceso[]
  addProceso: (p: Proceso) => void
  updateProceso: (id: string, data: Partial<Proceso>) => void
  deleteProceso: (id: string) => void
}

export const useProcesosStore = create<ProcesosState>()(
  persist(
    (set) => ({
      procesos: PROCESOS0,
      addProceso: (p) => set((s) => ({ procesos: [...s.procesos, p] })),
      updateProceso: (id, data) =>
        set((s) => ({
          procesos: s.procesos.map((x) =>
            x.id === id ? { ...x, ...data } : x
          ),
        })),
      deleteProceso: (id) =>
        set((s) => ({ procesos: s.procesos.filter((x) => x.id !== id) })),
    }),
    { name: 'sgc-procesos' }
  )
)
