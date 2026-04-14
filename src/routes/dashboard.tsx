import { createFileRoute } from '@tanstack/react-router'
import { AlertTriangle, CheckCircle2, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { Badge } from '#/components/ui/badge'
import { usePersonalStore } from '#/lib/stores/personal.store'
import { useEquiposStore } from '#/lib/stores/equipos.store'
import { useDocumentosStore } from '#/lib/stores/documentos.store'
import { usePamecStore } from '#/lib/stores/pamec.store'
import { useConfigStore } from '#/lib/stores/config.store'
import { scoreSede, semBgColor, diasHasta } from '#/lib/utils-sgc'

export const Route = createFileRoute('/dashboard')({
  component: Dashboard,
})

function Dashboard() {
  const { personas, cargos } = usePersonalStore()
  const { equipos } = useEquiposStore()
  const { documentos } = useDocumentosStore()
  const { acciones } = usePamecStore()
  const { sedes, sedeActiva } = useConfigStore()

  const sedesActivas = sedes.filter((s) => s.activa)

  // Alertas globales
  const equiposVencidos = equipos.filter((e) => diasHasta(e.proxMant) < 0)
  const equiposProximos = equipos.filter((e) => {
    const d = diasHasta(e.proxMant)
    return d >= 0 && d <= 30
  })
  const docsVencidos = documentos.filter((d) => {
    if (!d.fechaVigencia) return false
    return diasHasta(d.fechaVigencia) < 0
  })
  const accionesPendientes = acciones.filter(
    (a) => a.estado === 'pendiente' || a.estado === 'en_proceso'
  )

  const sedeScore = scoreSede(personas, cargos, sedeActiva)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          Dashboard SGC
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Resumen del Sistema de Gestión de Calidad · Instituto Oncohematológico
          Betania
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Cumplimiento Personal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {sedeScore.label}
            </div>
            <div
              className={`text-xs mt-1 ${semBgColor(sedeScore.semaforo)} inline-flex items-center rounded-full px-2 py-0.5`}
            >
              {sedeScore.semaforo}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Equipos con alertas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {equiposVencidos.length + equiposProximos.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {equiposVencidos.length} vencidos · {equiposProximos.length}{' '}
              próximos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Documentos vencidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {docsVencidos.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              de {documentos.length} documentos totales
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Acciones PAMEC
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {accionesPendientes.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              pendientes / en proceso
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Scores por sede */}
      <div>
        <h2 className="text-base font-semibold text-foreground mb-3">
          Cumplimiento por Sede
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {sedesActivas.map((sede) => {
            const score = scoreSede(personas, cargos, sede.id)
            return (
              <Card
                key={sede.id}
                className={sede.id === sedeActiva ? 'ring-1 ring-primary' : ''}
              >
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">
                      {sede.ciudad}
                    </span>
                    <Badge className={semBgColor(score.semaforo)}>
                      {score.label}
                    </Badge>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-primary transition-all"
                      style={{ width: `${score.valor}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {
                      personas.filter(
                        (p) => p.sede === sede.id && p.estado === 'activo'
                      ).length
                    }{' '}
                    personas activas
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Alertas recientes */}
      {(equiposVencidos.length > 0 ||
        equiposProximos.length > 0 ||
        docsVencidos.length > 0) && (
        <div>
          <h2 className="text-base font-semibold text-foreground mb-3">
            Alertas Activas
          </h2>
          <div className="space-y-2">
            {equiposVencidos.map((eq) => (
              <div
                key={eq.id}
                className="flex items-center gap-3 rounded-lg border border-red-400/20 bg-red-400/5 px-4 py-3"
              >
                <AlertTriangle className="h-4 w-4 text-red-400 shrink-0" />
                <span className="text-sm text-foreground">
                  <span className="font-medium">{eq.nombre}</span>{' '}
                  <span className="text-muted-foreground">({eq.sede})</span> —
                  Mantenimiento vencido
                </span>
              </div>
            ))}
            {equiposProximos.map((eq) => (
              <div
                key={eq.id}
                className="flex items-center gap-3 rounded-lg border border-yellow-400/20 bg-yellow-400/5 px-4 py-3"
              >
                <Clock className="h-4 w-4 text-yellow-400 shrink-0" />
                <span className="text-sm text-foreground">
                  <span className="font-medium">{eq.nombre}</span>{' '}
                  <span className="text-muted-foreground">({eq.sede})</span> —
                  Mantenimiento en {diasHasta(eq.proxMant)} días
                </span>
              </div>
            ))}
            {docsVencidos.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center gap-3 rounded-lg border border-red-400/20 bg-red-400/5 px-4 py-3"
              >
                <AlertTriangle className="h-4 w-4 text-red-400 shrink-0" />
                <span className="text-sm text-foreground">
                  <span className="font-medium">{doc.nombre}</span> (
                  {doc.codigo}) — Vigencia vencida
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {equiposVencidos.length === 0 &&
        equiposProximos.length === 0 &&
        docsVencidos.length === 0 && (
          <div className="flex items-center gap-3 rounded-lg border border-emerald-400/20 bg-emerald-400/5 px-4 py-3">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span className="text-sm text-foreground">
              Sin alertas críticas en este momento
            </span>
          </div>
        )}
    </div>
  )
}
