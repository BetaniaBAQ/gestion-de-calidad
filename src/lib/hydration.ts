import { useEffect, useSyncExternalStore } from 'react'
import { useAdherenciaStore } from '#/lib/stores/adherencia.store'
import { useAuditoriaStore } from '#/lib/stores/auditoria.store'
import { useConfigStore } from '#/lib/stores/config.store'
import { useDocumentosStore } from '#/lib/stores/documentos.store'
import { useEquiposStore } from '#/lib/stores/equipos.store'
import { useHabStore } from '#/lib/stores/habilitacion.store'
import { useIndicadoresStore } from '#/lib/stores/indicadores.store'
import { useMedicamentosStore } from '#/lib/stores/medicamentos.store'
import { usePamecStore } from '#/lib/stores/pamec.store'
import { usePersonalStore } from '#/lib/stores/personal.store'
import { usePqrsStore } from '#/lib/stores/pqrs.store'
import { useProcesosStore } from '#/lib/stores/procesos.store'
import { useMantenimientosStore } from '#/lib/domain/mantenimiento'
import { useAlertasSanitariasStore } from '#/lib/domain/medicamentos'
import { useAuditoriaVivoStore } from '#/lib/domain/auditoriaEnVivo'

type PersistedStore = {
  persist: {
    rehydrate: () => Promise<void> | void
    hasHydrated: () => boolean
    onFinishHydration: (cb: () => void) => () => void
  }
}

const STORES: PersistedStore[] = [
  useAdherenciaStore as unknown as PersistedStore,
  useAuditoriaStore as unknown as PersistedStore,
  useConfigStore as unknown as PersistedStore,
  useDocumentosStore as unknown as PersistedStore,
  useEquiposStore as unknown as PersistedStore,
  useHabStore as unknown as PersistedStore,
  useIndicadoresStore as unknown as PersistedStore,
  useMedicamentosStore as unknown as PersistedStore,
  usePamecStore as unknown as PersistedStore,
  usePersonalStore as unknown as PersistedStore,
  usePqrsStore as unknown as PersistedStore,
  useProcesosStore as unknown as PersistedStore,
  useMantenimientosStore as unknown as PersistedStore,
  useAlertasSanitariasStore as unknown as PersistedStore,
  useAuditoriaVivoStore as unknown as PersistedStore,
]

const subscribe = (cb: () => void) => {
  const unsubs = STORES.map((s) => s.persist.onFinishHydration(cb))
  return () => unsubs.forEach((u) => u())
}

const getSnapshot = () => STORES.every((s) => s.persist.hasHydrated())
const getServerSnapshot = () => false

export function useHydrated(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

export function StoreHydrator() {
  useEffect(() => {
    STORES.forEach((s) => {
      if (!s.persist.hasHydrated()) {
        void s.persist.rehydrate()
      }
    })
  }, [])
  return null
}
