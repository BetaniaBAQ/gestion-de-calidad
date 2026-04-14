import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Auditoria, Hallazgo } from '../types'
import { AUDITORIAS0 } from '../data'

interface AuditoriaState {
  auditorias: Auditoria[]
  addAuditoria: (a: Auditoria) => void
  updateAuditoria: (id: string, data: Partial<Auditoria>) => void
  addHallazgo: (auditoriaId: string, h: Hallazgo) => void
  updateHallazgo: (
    auditoriaId: string,
    hallazgoId: string,
    data: Partial<Hallazgo>
  ) => void
}

export const useAuditoriaStore = create<AuditoriaState>()(
  persist(
    (set) => ({
      auditorias: AUDITORIAS0,
      addAuditoria: (a) => set((s) => ({ auditorias: [...s.auditorias, a] })),
      updateAuditoria: (id, data) =>
        set((s) => ({
          auditorias: s.auditorias.map((x) =>
            x.id === id ? { ...x, ...data } : x
          ),
        })),
      addHallazgo: (auditoriaId, h) =>
        set((s) => ({
          auditorias: s.auditorias.map((a) =>
            a.id === auditoriaId ? { ...a, hallazgos: [...a.hallazgos, h] } : a
          ),
        })),
      updateHallazgo: (auditoriaId, hallazgoId, data) =>
        set((s) => ({
          auditorias: s.auditorias.map((a) =>
            a.id === auditoriaId
              ? {
                  ...a,
                  hallazgos: a.hallazgos.map((h) =>
                    h.id === hallazgoId ? { ...h, ...data } : h
                  ),
                }
              : a
          ),
        })),
    }),
    { name: 'sgc-auditoria' }
  )
)
