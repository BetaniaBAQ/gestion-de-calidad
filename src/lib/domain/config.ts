import { useConfigStore } from '#/lib/stores/config.store'
import { usePersonalStore } from '#/lib/stores/personal.store'
import { scoreGlobal } from '#/lib/utils-sgc'

export function useSedes() {
  return useConfigStore((s) => s.sedes)
}

export function useSedesActivas() {
  return useConfigStore((s) => s.sedes.filter((x) => x.activa))
}

export function useSedeActiva() {
  return useConfigStore((s) => s.sedeActiva)
}

export function useSedeActivaNombre() {
  const sedeActiva = useConfigStore((s) => s.sedeActiva)
  const sede = useConfigStore((s) => s.sedes.find((x) => x.id === sedeActiva))
  return sede?.nombre ?? sedeActiva
}

export function useSetSedeActiva() {
  return useConfigStore((s) => s.setSedeActiva)
}

export function useVistaCompleta() {
  return useConfigStore((s) => s.vistaCompleta)
}

export function useSetVistaCompleta() {
  return useConfigStore((s) => s.setVistaCompleta)
}

export function useUsuarioActual() {
  return useConfigStore((s) => s.usuarioActual)
}

export function useLogout() {
  return useConfigStore((s) => s.logout)
}

export function useScoreGlobal() {
  const personas = usePersonalStore((s) => s.personas)
  const cargos = usePersonalStore((s) => s.cargos)
  const sedes = useConfigStore((s) => s.sedes)
  return scoreGlobal(personas, cargos, sedes)
}
