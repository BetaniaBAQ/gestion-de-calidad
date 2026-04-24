import { useConvexAuth } from 'convex/react'

// Retorna {} cuando el usuario está autenticado, 'skip' cuando no.
// Usar como args en useQuery para evitar queries sin auth:
//   useQuery(api.sedes.listByOrg, useAuthArgs())
export function useAuthArgs(): Record<string, never> | 'skip' {
  const { isAuthenticated } = useConvexAuth()
  return isAuthenticated ? {} : 'skip'
}
