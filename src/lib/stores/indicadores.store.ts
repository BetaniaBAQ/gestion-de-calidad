import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Indicador, MedicionIndicador } from '../types'
import { INDIC_DEF, MEDICIONES0 } from '../data'

interface IndicadoresState {
  indicadores: Indicador[]
  mediciones: MedicionIndicador[]
  addIndicador: (i: Indicador) => void
  updateIndicador: (id: string, data: Partial<Indicador>) => void
  addMedicion: (m: MedicionIndicador) => void
  updateMedicion: (
    indicadorId: string,
    periodo: string,
    data: Partial<MedicionIndicador>
  ) => void
}

export const useIndicadoresStore = create<IndicadoresState>()(
  persist(
    (set) => ({
      indicadores: INDIC_DEF,
      mediciones: MEDICIONES0,
      addIndicador: (i) => set((s) => ({ indicadores: [...s.indicadores, i] })),
      updateIndicador: (id, data) =>
        set((s) => ({
          indicadores: s.indicadores.map((x) =>
            x.id === id ? { ...x, ...data } : x
          ),
        })),
      addMedicion: (m) => set((s) => ({ mediciones: [...s.mediciones, m] })),
      updateMedicion: (indicadorId, periodo, data) =>
        set((s) => ({
          mediciones: s.mediciones.map((x) =>
            x.indicadorId === indicadorId && x.periodo === periodo
              ? { ...x, ...data }
              : x
          ),
        })),
    }),
    { name: 'sgc-indicadores' }
  )
)
