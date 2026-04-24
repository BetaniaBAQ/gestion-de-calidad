import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { AUDITORIA_EN_VIVO_ITEMS } from '#/lib/data-catalogs'
import type {
  AuditoriaEnCurso,
  AuditoriaItemVivo,
  AuditoriaRespuestaVivo,
} from '#/lib/types'

interface AuditoriaVivoState {
  enCurso: AuditoriaEnCurso | null
  iniciar: (sedeId: string, auditor: string) => void
  responder: (resp: AuditoriaRespuestaVivo) => void
  setStep: (n: number) => void
  finalizar: () => void
  descartar: () => void
}

export const useAuditoriaVivoStore = create<AuditoriaVivoState>()(
  persist(
    (set, get) => ({
      enCurso: null,
      iniciar: (sedeId, auditor) =>
        set({
          enCurso: {
            sedeId,
            auditor,
            iniciadaEn: new Date().toISOString(),
            currentStep: 0,
            respuestas: [],
          },
        }),
      responder: (resp) => {
        const current = get().enCurso
        if (!current) return
        const resp_filtered = current.respuestas.filter(
          (r) => r.itemId !== resp.itemId
        )
        set({
          enCurso: {
            ...current,
            respuestas: [...resp_filtered, resp],
          },
        })
      },
      setStep: (n) => {
        const current = get().enCurso
        if (!current) return
        set({ enCurso: { ...current, currentStep: n } })
      },
      finalizar: () => set({ enCurso: null }),
      descartar: () => set({ enCurso: null }),
    }),
    { name: 'sgc-auditoria-vivo', skipHydration: true }
  )
)

export function useAuditoriaItems(): AuditoriaItemVivo[] {
  return AUDITORIA_EN_VIVO_ITEMS
}

export function useAuditoriaEnCurso() {
  return useAuditoriaVivoStore((s) => s.enCurso)
}

export function useIniciarAuditoria() {
  return useAuditoriaVivoStore((s) => s.iniciar)
}

export function useResponderAuditoria() {
  return useAuditoriaVivoStore((s) => s.responder)
}

export function useSetStep() {
  return useAuditoriaVivoStore((s) => s.setStep)
}

export function useFinalizarAuditoria() {
  return useAuditoriaVivoStore((s) => s.finalizar)
}

export function useDescartarAuditoria() {
  return useAuditoriaVivoStore((s) => s.descartar)
}
