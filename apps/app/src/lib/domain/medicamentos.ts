import { ALERTAS_SANITARIAS0 } from '#/lib/data'
import type { AlertaSanitaria } from '#/lib/types'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AlertasState {
  alertas: AlertaSanitaria[]
  addAlerta: (a: AlertaSanitaria) => void
  updateAlerta: (id: string, data: Partial<AlertaSanitaria>) => void
  deleteAlerta: (id: string) => void
}

export const useAlertasSanitariasStore = create<AlertasState>()(
  persist(
    (set) => ({
      alertas: ALERTAS_SANITARIAS0,
      addAlerta: (a) => set((s) => ({ alertas: [...s.alertas, a] })),
      updateAlerta: (id, data) =>
        set((s) => ({
          alertas: s.alertas.map((x) => (x.id === id ? { ...x, ...data } : x)),
        })),
      deleteAlerta: (id) =>
        set((s) => ({ alertas: s.alertas.filter((x) => x.id !== id) })),
    }),
    { name: 'sgc-alertas-sanitarias', skipHydration: true }
  )
)

export function useAlertasSanitarias(): AlertaSanitaria[] {
  return useAlertasSanitariasStore((s) => s.alertas)
}

export function useUpsertAlerta() {
  const add = useAlertasSanitariasStore((s) => s.addAlerta)
  const update = useAlertasSanitariasStore((s) => s.updateAlerta)
  return (a: AlertaSanitaria) => {
    const existing = useAlertasSanitariasStore
      .getState()
      .alertas.find((x) => x.id === a.id)
    if (existing) update(a.id, a)
    else add(a)
  }
}

export function usePctConAccion(): number {
  const all = useAlertasSanitarias()
  if (all.length === 0) return 0
  const conAccion = all.filter((a) => !!a.accion).length
  return Math.round((conAccion / all.length) * 100)
}
