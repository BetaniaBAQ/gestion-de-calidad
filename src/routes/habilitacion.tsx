import { createFileRoute } from '@tanstack/react-router'
import { CheckCircle2 } from 'lucide-react'
import { KpiMeta } from '#/components/kpi-meta'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '#/components/ui/tabs'
import {
  useSedeActiva,
  useSedes,
  useSetSedeActiva,
  useSetVistaCompleta,
} from '#/lib/domain/config'
import {
  autoForSede,
  computeChecklistEstado,
  pctChecklistCumplido,
  useAutoVerificacionPorSede,
  useHabilitacionesAll,
} from '#/lib/domain/habilitacion'
import type { HabCategoria, ServicioHabilitado } from '#/lib/types'

export const Route = createFileRoute('/habilitacion')({
  component: HabilitacionPage,
})

const CATEGORIAS: Array<{ id: HabCategoria; nombre: string }> = [
  { id: 'rh', nombre: 'RECURSO HUMANO' },
  { id: 'infra', nombre: 'INFRAESTRUCTURA' },
  { id: 'dotacion', nombre: 'DOTACIÓN' },
  { id: 'procesos', nombre: 'PROCESOS' },
  { id: 'reps', nombre: 'HABILITACIÓN REPS' },
]

function HabilitacionPage() {
  const sedes = useSedes()
  const sedeActiva = useSedeActiva()
  const setSedeActiva = useSetSedeActiva()
  const setVistaCompleta = useSetVistaCompleta()
  const habs = useHabilitacionesAll()
  const autoAll = useAutoVerificacionPorSede()

  const sede = sedes.find((s) => s.id === sedeActiva)
  const hab = habs[sedeActiva]
  const auto = autoForSede(autoAll, sedeActiva)
  const items = computeChecklistEstado(hab, auto)
  const pct = pctChecklistCumplido(hab, auto)

  const servicios: ServicioHabilitado[] = sede?.servicios ?? []

  return (
    <div className="space-y-6">
      <Tabs defaultValue="checklist">
        <TabsList>
          <TabsTrigger value="checklist">Checklist habilitación</TabsTrigger>
          <TabsTrigger value="visitas">Plan de visitas</TabsTrigger>
        </TabsList>

        <TabsContent value="checklist" className="space-y-4">
          <KpiMeta
            modulo="HABILITACIÓN"
            valor={`${pct}%`}
            descripcion="% checklist habilitación cumplido"
            meta="≥100%"
          />

          <div className="flex flex-wrap items-center gap-2">
            {sedes
              .filter((s) => s.activa)
              .map((s) => (
                <Button
                  key={s.id}
                  size="sm"
                  variant={s.id === sedeActiva ? 'default' : 'outline'}
                  onClick={() => {
                    setVistaCompleta(false)
                    setSedeActiva(s.id)
                  }}
                >
                  {s.ciudad}
                </Button>
              ))}
          </div>

          {sede && (
            <Card>
              <CardContent className="pt-4 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-sm font-semibold text-foreground">
                      {sede.ciudad}
                    </div>
                    <div className="text-[0.65rem] text-muted-foreground">
                      Servicios: {servicios.join(' · ')}
                    </div>
                  </div>
                  <Badge variant="outline" className="text-sm font-semibold">
                    {pct}% · {items.filter((i) => i.estado === 'cumple').length}
                    /34
                  </Badge>
                </div>
                <div className="text-[0.65rem] text-muted-foreground">
                  Auto-verificado desde el sistema · Marcado manualmente por
                  Coordinador/Director · Pendiente
                </div>
              </CardContent>
            </Card>
          )}

          {CATEGORIAS.map((cat) => {
            const catItems = items.filter((i) => i.def.categoria === cat.id)
            const cumplen = catItems.filter((i) => i.estado === 'cumple').length
            return (
              <Card key={cat.id}>
                <CardHeader className="pb-2 flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-xs uppercase tracking-wide">
                      {cat.nombre}
                    </CardTitle>
                    <div className="text-[0.65rem] text-muted-foreground mt-0.5">
                      {cumplen}/{catItems.length}
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    Marcar manuales
                  </Button>
                </CardHeader>
                <CardContent className="space-y-1.5">
                  {catItems.map((i) => (
                    <div
                      key={i.def.id}
                      className="flex items-start gap-3 rounded-md px-3 py-2 bg-card/30 border border-border/60"
                    >
                      <div className="mt-0.5">
                        {i.estado === 'cumple' ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        ) : (
                          <div className="h-4 w-4 rounded-full border border-muted-foreground/40" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-foreground">
                          {i.def.descripcion}
                        </div>
                        <div className="text-[0.65rem] text-muted-foreground flex items-center gap-2 mt-0.5">
                          {i.def.auto && (
                            <Badge
                              variant="outline"
                              className="text-[0.6rem] py-0 px-1 bg-muted"
                            >
                              Auto
                            </Badge>
                          )}
                          {i.def.norma}
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )
          })}
        </TabsContent>

        <TabsContent value="visitas">
          <Card>
            <CardContent className="pt-6 text-sm text-muted-foreground">
              Plan de visitas de habilitación. Detalle en próxima iteración.
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
