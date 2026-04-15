import { useAuditoriaStore } from '#/lib/stores/auditoria.store'
import { usePamecStore } from '#/lib/stores/pamec.store'
import type { AccionPAMEC, Auditoria, Hallazgo } from '#/lib/types'

export function useAuditorias(): Auditoria[] {
  return useAuditoriaStore((s) => s.auditorias)
}

export function useAuditoria(id: string | undefined): Auditoria | undefined {
  return useAuditoriaStore((s) =>
    id ? s.auditorias.find((a) => a.id === id) : undefined
  )
}

export function useUpsertAuditoria() {
  const add = useAuditoriaStore((s) => s.addAuditoria)
  const update = useAuditoriaStore((s) => s.updateAuditoria)
  return (a: Auditoria) => {
    const existing = useAuditoriaStore
      .getState()
      .auditorias.find((x) => x.id === a.id)
    if (existing) update(a.id, a)
    else add(a)
  }
}

export function useAcciones(): AccionPAMEC[] {
  return usePamecStore((s) => s.acciones)
}

export function useUpsertAccion() {
  const add = usePamecStore((s) => s.addAccion)
  const update = usePamecStore((s) => s.updateAccion)
  return (a: AccionPAMEC) => {
    const existing = usePamecStore
      .getState()
      .acciones.find((x) => x.id === a.id)
    if (existing) update(a.id, a)
    else add(a)
  }
}

export function useHallazgos(): Hallazgo[] {
  const auditorias = useAuditorias()
  return auditorias.flatMap((a) => a.hallazgos)
}

export function usePamecStats() {
  const auditorias = useAuditorias()
  const hallazgos = auditorias.flatMap((a) => a.hallazgos)
  const cerrados = hallazgos.filter((h) => h.estado === 'cerrado').length
  const accVencidas = usePamecStore(
    (s) => s.acciones.filter((a) => a.estado === 'vencido').length
  )
  return {
    auditorias: auditorias.length,
    hallazgos: hallazgos.length,
    cerrados,
    accVencidas,
  }
}
