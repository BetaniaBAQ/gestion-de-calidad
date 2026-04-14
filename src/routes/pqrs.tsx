import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/pqrs')({
  beforeLoad: () => {
    throw redirect({ to: '/procesos' })
  },
  component: () => null,
})
