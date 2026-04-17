import { createFileRoute, redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'

const logoutUser = createServerFn({ method: 'POST' }).handler(async () => {
  const { clearSession } = await import('#/lib/auth.server')
  await clearSession()
  throw redirect({ to: '/auth/login' })
})

export const Route = createFileRoute('/auth/logout')({
  beforeLoad: async () => {
    await logoutUser()
  },
  component: () => null,
})
