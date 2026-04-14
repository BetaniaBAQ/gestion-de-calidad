import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Persona, Cargo } from '../types'
import { PERS0, CARGOS0 } from '../data'

interface PersonalState {
  personas: Persona[]
  cargos: Cargo[]
  addPersona: (p: Persona) => void
  updatePersona: (id: string, data: Partial<Persona>) => void
  deletePersona: (id: string) => void
  addCargo: (c: Cargo) => void
  updateCargo: (id: string, data: Partial<Cargo>) => void
}

export const usePersonalStore = create<PersonalState>()(
  persist(
    (set) => ({
      personas: PERS0,
      cargos: CARGOS0,
      addPersona: (p) => set((s) => ({ personas: [...s.personas, p] })),
      updatePersona: (id, data) =>
        set((s) => ({
          personas: s.personas.map((x) =>
            x.id === id ? { ...x, ...data } : x
          ),
        })),
      deletePersona: (id) =>
        set((s) => ({ personas: s.personas.filter((x) => x.id !== id) })),
      addCargo: (c) => set((s) => ({ cargos: [...s.cargos, c] })),
      updateCargo: (id, data) =>
        set((s) => ({
          cargos: s.cargos.map((x) => (x.id === id ? { ...x, ...data } : x)),
        })),
    }),
    { name: 'sgc-personal' }
  )
)
