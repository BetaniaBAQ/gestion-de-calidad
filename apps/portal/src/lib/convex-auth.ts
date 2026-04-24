import { useCallback } from 'react'

import { useAccessToken } from '@workos/authkit-tanstack-react-start/client'
import { ConvexProviderWithAuth } from 'convex/react'

export { ConvexProviderWithAuth }

// Bridges WorkOS access tokens into Convex's ConvexProviderWithAuth.
// Same pattern as davi/proho.
export function useAuthFromWorkOS() {
  const { accessToken, loading, getAccessToken } = useAccessToken()

  const fetchAccessToken = useCallback(
    async ({ forceRefreshToken }: { forceRefreshToken: boolean }) => {
      if (forceRefreshToken) {
        return (await getAccessToken()) ?? null
      }
      return accessToken ?? null
    },
    [accessToken, getAccessToken]
  )

  return {
    isLoading: loading,
    isAuthenticated: !!accessToken,
    fetchAccessToken,
  }
}
