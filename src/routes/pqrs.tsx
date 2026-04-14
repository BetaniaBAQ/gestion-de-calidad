import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/pqrs')({
  component: PqrsPage,
})

function PqrsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-foreground">Pqrs</h1>
      <p className="text-muted-foreground">Módulo en construcción.</p>
    </div>
  )
}
