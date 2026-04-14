import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Medicamento } from '../types'
import { MEDS0 } from '../data'

interface MedicamentosState {
  medicamentos: Medicamento[]
  addMedicamento: (m: Medicamento) => void
  updateMedicamento: (id: string, data: Partial<Medicamento>) => void
  deleteMedicamento: (id: string) => void
}

export const useMedicamentosStore = create<MedicamentosState>()(
  persist(
    (set) => ({
      medicamentos: MEDS0,
      addMedicamento: (m) =>
        set((s) => ({ medicamentos: [...s.medicamentos, m] })),
      updateMedicamento: (id, data) =>
        set((s) => ({
          medicamentos: s.medicamentos.map((x) =>
            x.id === id ? { ...x, ...data } : x
          ),
        })),
      deleteMedicamento: (id) =>
        set((s) => ({
          medicamentos: s.medicamentos.filter((x) => x.id !== id),
        })),
    }),
    { name: 'sgc-medicamentos' }
  )
)
