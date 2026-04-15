import { useConfigStore } from '#/lib/stores/config.store'
import { usePqrsStore } from '#/lib/stores/pqrs.store'
import type { PQRS } from '#/lib/types'

export function usePqrs(): PQRS[] {
  const all = usePqrsStore((s) => s.pqrs)
  const sedeActiva = useConfigStore((s) => s.sedeActiva)
  const vistaCompleta = useConfigStore((s) => s.vistaCompleta)
  return vistaCompleta ? all : all.filter((p) => p.sede === sedeActiva)
}

export function usePqrsTodas(): PQRS[] {
  return usePqrsStore((s) => s.pqrs)
}

export function useUpsertPqrs() {
  const add = usePqrsStore((s) => s.addPqrs)
  const update = usePqrsStore((s) => s.updatePqrs)
  return (p: PQRS) => {
    const existing = usePqrsStore.getState().pqrs.find((x) => x.id === p.id)
    if (existing) update(p.id, p)
    else add(p)
  }
}

function diasEntre(a: string, b: string): number {
  const ms = new Date(b).getTime() - new Date(a).getTime()
  return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)))
}

export function diasTranscurridos(pqr: PQRS): number {
  const end = pqr.fechaRespuesta ?? new Date().toISOString().slice(0, 10)
  return diasEntre(pqr.fecha, end)
}

export function usePqrsStats() {
  const all = usePqrs()
  const total = all.length
  const enTramite = all.filter((p) => p.estado === 'en_tramite').length
  const vencidas = all.filter((p) => p.estado === 'vencido').length
  const cerradas = all.filter(
    (p) => p.estado === 'cerrado' || p.estado === 'respondido'
  )
  const aTermino = cerradas.filter((p) => diasTranscurridos(p) <= 15).length
  const pctTermino =
    cerradas.length > 0 ? Math.round((aTermino / cerradas.length) * 100) : 100
  const dias = cerradas.map(diasTranscurridos)
  const tiempoPromedio =
    dias.length > 0
      ? Math.round(dias.reduce((a, b) => a + b, 0) / dias.length)
      : 0
  return {
    total,
    enTramite,
    vencidas,
    cerradas: cerradas.length,
    pctTermino,
    tiempoPromedio,
  }
}
