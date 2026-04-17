import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// UI state sólo — sedes y usuarios vienen de Convex.
interface ConfigState {
  sedeActiva: string
  vistaCompleta: boolean
  setSedeActiva: (id: string) => void
  setVistaCompleta: (v: boolean) => void
}

export const useConfigStore = create<ConfigState>()(
  persist(
    (set) => ({
      sedeActiva: 'BAQ',
      vistaCompleta: false,
      setSedeActiva: (id) => set({ sedeActiva: id }),
      setVistaCompleta: (v) => set({ vistaCompleta: v }),
    }),
    { name: 'sgc-config', skipHydration: true }
  )
)
