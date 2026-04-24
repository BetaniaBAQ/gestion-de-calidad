import { createFileRoute, redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'

const loginFn = createServerFn().handler(async () => {
  const { getAuth, getSignInUrl } =
    await import('@workos/authkit-tanstack-react-start')
  const { user } = await getAuth()
  if (user) return '/dashboard'

  const { resolveOrgSlug, resolveWorkosOrgId } =
    await import('#/lib/auth.server')
  const slug = resolveOrgSlug()
  const orgId = await resolveWorkosOrgId(slug)

  return getSignInUrl(orgId ? { data: { organizationId: orgId } } : undefined)
})

export const Route = createFileRoute('/auth/login')({
  beforeLoad: async () => {
    const url = await loginFn()
    throw redirect({ href: url })
  },
  component: () => null,
})
