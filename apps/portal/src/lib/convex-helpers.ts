import { useEffect, useRef } from 'react'
import { useConvexAuth, useMutation } from 'convex/react'
import { api } from '@cualia/convex'

export function useAuthArgs(): Record<string, never> | 'skip' {
  const { isAuthenticated } = useConvexAuth()
  return isAuthenticated ? {} : 'skip'
}

export function useEnsureUsuario() {
  const { isAuthenticated } = useConvexAuth()
  const ensureUsuario = useMutation(api.usuarios.ensureUsuario)
  const called = useRef(false)

  useEffect(() => {
    if (isAuthenticated && !called.current) {
      called.current = true
      ensureUsuario().catch(() => {})
    }
  }, [isAuthenticated, ensureUsuario])
}
