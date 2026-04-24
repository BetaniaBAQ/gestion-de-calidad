import { createFileRoute, redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'

const loginFn = createServerFn().handler(async () => {
  const { getAuth, getSignInUrl } =
    await import('@workos/authkit-tanstack-react-start')
  const { env } = await import('#/lib/env')
  const { user } = await getAuth()
  if (user) return '/orgs'
  return getSignInUrl({ data: { organizationId: env.CUALIA_ADMIN_ORG_ID } })
})

export const Route = createFileRoute('/auth/login')({
  beforeLoad: async () => {
    const url = await loginFn()
    throw redirect({ href: url })
  },
  component: () => null,
})
