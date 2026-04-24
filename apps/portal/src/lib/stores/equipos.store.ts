import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Equipo, PlanMant } from '../types'
import { EQS0 } from '../data'

interface EquiposState {
  equipos: Equipo[]
  planes: PlanMant[]
  addEquipo: (e: Equipo) => void
  updateEquipo: (id: string, data: Partial<Equipo>) => void
  deleteEquipo: (id: string) => void
  addPlan: (p: PlanMant) => void
  updatePlan: (id: string, data: Partial<PlanMant>) => void
}

export const useEquiposStore = create<EquiposState>()(
  persist(
    (set) => ({
      equipos: EQS0,
      planes: [],
      addEquipo: (e) => set((s) => ({ equipos: [...s.equipos, e] })),
      updateEquipo: (id, data) =>
        set((s) => ({
          equipos: s.equipos.map((x) => (x.id === id ? { ...x, ...data } : x)),
        })),
      deleteEquipo: (id) =>
        set((s) => ({ equipos: s.equipos.filter((x) => x.id !== id) })),
      addPlan: (p) => set((s) => ({ planes: [...s.planes, p] })),
      updatePlan: (id, data) =>
        set((s) => ({
          planes: s.planes.map((x) => (x.id === id ? { ...x, ...data } : x)),
        })),
    }),
    { name: 'sgc-equipos', skipHydration: true }
  )
)
