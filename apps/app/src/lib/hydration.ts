import { useEffect, useSyncExternalStore } from 'react'
import { useConfigStore } from '#/lib/stores/config.store'
import { useHabStore } from '#/lib/stores/habilitacion.store'
import { useAuditoriaVivoStore } from '#/lib/domain/auditoriaEnVivo'

type PersistedStore = {
  persist: {
    rehydrate: () => Promise<void> | void
    hasHydrated: () => boolean
    onFinishHydration: (cb: () => void) => () => void
  }
}

const STORES: PersistedStore[] = [
  useConfigStore as unknown as PersistedStore,
  useHabStore as unknown as PersistedStore,
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
