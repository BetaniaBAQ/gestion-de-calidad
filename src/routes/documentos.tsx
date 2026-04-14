import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/documentos')({
  component: DocumentosPage,
})

function DocumentosPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-foreground">Documentos</h1>
      <p className="text-muted-foreground">Módulo en construcción.</p>
    </div>
  )
}
