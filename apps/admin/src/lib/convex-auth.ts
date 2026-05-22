import { useCallback, useRef } from 'react'

import { useAccessToken } from '@workos/authkit-tanstack-react-start/client'

export function useAuthFromWorkOS() {
  const { accessToken, loading, getAccessToken } = useAccessToken()

  const tokenRef = useRef(accessToken)
  tokenRef.current = accessToken

  const fetchAccessToken = useCallback(
    async ({ forceRefreshToken }: { forceRefreshToken: boolean }) => {
      if (forceRefreshToken) {
        return (await getAccessToken()) ?? null
      }
      return tokenRef.current ?? null
    },
    [getAccessToken]
  )

  return {
    isLoading: loading,
    isAuthenticated: !!accessToken,
    fetchAccessToken,
  }
}
