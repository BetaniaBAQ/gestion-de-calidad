import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/medicamentos')({
  component: MedicamentosPage,
})

function MedicamentosPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-foreground">Medicamentos</h1>
      <p className="text-muted-foreground">Módulo en construcción.</p>
    </div>
  )
}
