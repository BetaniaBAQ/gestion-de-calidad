import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/procesos')({
  component: ProcesosPage,
})

function ProcesosPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-foreground">Procesos</h1>
      <p className="text-muted-foreground">Módulo en construcción.</p>
    </div>
  )
}
