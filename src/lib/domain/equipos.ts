import { useConfigStore } from '#/lib/stores/config.store'
import { useEquiposStore } from '#/lib/stores/equipos.store'
import { diasHasta } from '#/lib/utils-sgc'
import type { Equipo } from '#/lib/types'

export function useEquipos(): Equipo[] {
  const equipos = useEquiposStore((s) => s.equipos)
  const sedeActiva = useConfigStore((s) => s.sedeActiva)
  const vistaCompleta = useConfigStore((s) => s.vistaCompleta)
  return vistaCompleta ? equipos : equipos.filter((e) => e.sede === sedeActiva)
}

export function useEquiposTodos(): Equipo[] {
  return useEquiposStore((s) => s.equipos)
}

export function useEquipo(id: string | undefined): Equipo | undefined {
  return useEquiposStore((s) =>
    id ? s.equipos.find((e) => e.id === id) : undefined
  )
}

export function useUpsertEquipo() {
  const addEquipo = useEquiposStore((s) => s.addEquipo)
  const updateEquipo = useEquiposStore((s) => s.updateEquipo)
  return (e: Equipo) => {
    const existing = useEquiposStore
      .getState()
      .equipos.find((x) => x.id === e.id)
    if (existing) updateEquipo(e.id, e)
    else addEquipo(e)
  }
}

export function equipoMantVigente(e: Equipo): boolean {
  return diasHasta(e.proxMant) >= 0
}

export function equipoAlerta30d(e: Equipo): boolean {
  const d = diasHasta(e.proxMant)
  return d >= 0 && d <= 30
}

export function equipoVencido(e: Equipo): boolean {
  return diasHasta(e.proxMant) < 0
}

export function usePctMantVigente(): number {
  const equipos = useEquipos()
  if (equipos.length === 0) return 0
  const ok = equipos.filter(equipoMantVigente).length
  return Math.round((ok / equipos.length) * 100)
}

export function useEquiposVencidos() {
  return useEquipos().filter(equipoVencido)
}

export function useEquiposProximos() {
  return useEquipos().filter(equipoAlerta30d)
}
