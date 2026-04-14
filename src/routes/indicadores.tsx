import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/indicadores')({
  component: IndicadoresPage,
})

function IndicadoresPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-foreground">Indicadores</h1>
      <p className="text-muted-foreground">Módulo en construcción.</p>
    </div>
  )
}
