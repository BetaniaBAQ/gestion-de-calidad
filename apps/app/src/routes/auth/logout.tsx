import { createFileRoute } from '@tanstack/react-router'

import { signOut } from '@workos/authkit-tanstack-react-start'

export const Route = createFileRoute('/auth/logout')({
  loader: async () => {
    await signOut({ data: { returnTo: '/auth/login' } })
  },
  component: () => null,
})
