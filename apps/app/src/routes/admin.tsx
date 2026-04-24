import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'

const checkAdminFn = createServerFn({ method: 'POST' }).handler(async () => {
  const { getAuth } = await import('@workos/authkit-tanstack-react-start')
  const { env } = await import('#/env')

  const auth = await getAuth()
  if (!auth.user || !auth.organizationId) return false
  return auth.organizationId === env.CUALIA_ADMIN_ORG_ID
})

export const Route = createFileRoute('/admin')({
  beforeLoad: async () => {
    const isAdmin = await checkAdminFn()
    if (!isAdmin) throw redirect({ to: '/dashboard' })
  },
  component: () => <Outlet />,
})
