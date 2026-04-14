import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/mantenimiento')({
  component: MantenimientoPage,
})

function MantenimientoPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-foreground">Mantenimiento</h1>
      <p className="text-muted-foreground">Módulo en construcción.</p>
    </div>
  )
}
