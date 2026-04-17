import { createFileRoute, redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'

// Genera la URL de WorkOS AuthKit y redirige al browser
const getLoginUrl = createServerFn().handler(async () => {
  const { workos } = await import('#/lib/auth.server')
  const { env } = await import('#/env')
  return workos.userManagement.getAuthorizationUrl({
    clientId: env.WORKOS_CLIENT_ID,
    redirectUri: env.WORKOS_REDIRECT_URI,
    provider: 'authkit',
  })
})

export const Route = createFileRoute('/auth/login')({
  beforeLoad: async () => {
    const url = await getLoginUrl()
    throw redirect({ href: url })
  },
  component: () => null,
})
