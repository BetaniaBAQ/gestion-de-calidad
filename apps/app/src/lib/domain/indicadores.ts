import { useIndicadoresStore } from '#/lib/stores/indicadores.store'
import type { Indicador, MedicionIndicador } from '#/lib/types'

export function useIndicadores(): Indicador[] {
  return useIndicadoresStore((s) => s.indicadores)
}

export function useMediciones(): MedicionIndicador[] {
  return useIndicadoresStore((s) => s.mediciones)
}

export function useIndicadorById(
  id: string | undefined
): Indicador | undefined {
  return useIndicadoresStore((s) =>
    id ? s.indicadores.find((i) => i.id === id) : undefined
  )
}

// Agrupa indicadores por módulo (proceso)
export function useIndicadoresPorModulo(): Record<string, Indicador[]> {
  const inds = useIndicadores()
  return inds.reduce<Record<string, Indicador[]>>((acc, i) => {
    const bucket = acc[i.proceso] ?? []
    bucket.push(i)
    acc[i.proceso] = bucket
    return acc
  }, {})
}
