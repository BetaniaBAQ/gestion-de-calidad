import { useQuery } from 'convex/react'
import { api } from '@cualia/convex'
import { useConfigStore } from '#/lib/stores/config.store'
import { scoreGlobal } from '#/lib/utils-sgc'
import { usePersonasTodas, useCargos } from '#/lib/domain/personal'
import { useAuthArgs } from '#/lib/convex-helpers'

export function useSedes() {
  return useQuery(api.sedes.listByOrg, useAuthArgs()) ?? []
}

export function useSedesActivas() {
  return useSedes().filter((s) => s.activa)
}

export function useSedeActiva() {
  return useConfigStore((s) => s.sedeActiva)
}

export function useSedeActivaNombre() {
  const sedes = useSedes()
  const sedeActiva = useConfigStore((s) => s.sedeActiva)
  const sede = sedes.find((s) => s.codigo === sedeActiva)
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

// Stub: el usuario activo viene de la sesión WorkOS (Route.useRouteContext().session)
// Se mantiene para compatibilidad con rutas que todavía lo usen
export function useUsuarioActual() {
  return null
}

export function useScoreGlobal() {
  const personas = usePersonasTodas()
  const cargos = useCargos()
  const sedes = useSedes()
  const sedesLegacy = sedes.map((s) => ({
    id: s.codigo,
    nombre: s.nombre,
    ciudad: s.ciudad,
    departamento: s.departamento,
    direccion: s.direccion,
    activa: s.activa,
  }))
  return scoreGlobal(personas, cargos, sedesLegacy)
}
