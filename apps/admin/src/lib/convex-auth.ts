import { useCallback } from 'react'

import { useAccessToken } from '@workos/authkit-tanstack-react-start/client'

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
