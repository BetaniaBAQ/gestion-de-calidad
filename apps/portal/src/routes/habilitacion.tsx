import { createFileRoute } from '@tanstack/react-router'
import { CheckCircle2, Circle, Minus } from 'lucide-react'
import { KpiMeta } from '#/components/kpi-meta'
import { Badge } from '@cualia/ui/components/badge'
import { Button } from '@cualia/ui/components/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@cualia/ui/components/card'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@cualia/ui/components/tabs'
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
  useHabilitacionPorSede,
  useInitSede,
  useUpdateItem,
} from '#/lib/domain/habilitacion'
import type { CheckEstado, HabCategoria, ServicioHabilitado } from '#/lib/types'

export const Route = createFileRoute('/habilitacion')({
  component: HabilitacionPage,
})

const CATEGORIAS: Array<{ id: HabCategoria; nombre: string }> = [
  { id: 'rh', nombre: 'Recurso Humano' },
  { id: 'infra', nombre: 'Infraestructura' },
  { id: 'dotacion', nombre: 'Dotación' },
  { id: 'procesos', nombre: 'Procesos' },
  { id: 'reps', nombre: 'Habilitación REPS' },
]

function estadoIcon(estado: CheckEstado | 'pendiente', auto: boolean) {
  if (auto)
    return <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
  if (estado === 'cumple')
    return <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
  if (estado === 'no_cumple')
    return <Minus className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
  if (estado === 'parcial')
    return <Circle className="h-4 w-4 text-yellow-400 shrink-0 mt-0.5" />
  return <Circle className="h-4 w-4 text-muted-foreground/40 shrink-0 mt-0.5" />
}

function nextEstado(current: CheckEstado | 'pendiente'): CheckEstado {
  if (current === 'cumple') return 'no_cumple'
  if (current === 'no_cumple') return 'na'
  if (current === 'na') return 'pendiente' as CheckEstado
  return 'cumple'
}

// Upcoming visits (static calendar for the 4 sedes)
const VISITAS = [
  {
    sede: 'BAQ',
    ciudad: 'Barranquilla',
    tipo: 'Visita de habilitación',
    fecha: '2025-07-15',
    estado: 'programada',
  },
  {
    sede: 'SIN',
    ciudad: 'Sincelejo',
    tipo: 'Visita de seguimiento',
    fecha: '2025-08-20',
    estado: 'programada',
  },
  {
    sede: 'STM',
    ciudad: 'Santa Marta',
    tipo: 'Visita de habilitación',
    fecha: '2025-09-10',
    estado: 'pendiente',
  },
  {
    sede: 'MTR',
    ciudad: 'Montería',
    tipo: 'Visita de verificación',
    fecha: '2025-10-05',
    estado: 'pendiente',
  },
]

function HabilitacionPage() {
  const sedes = useSedes()
  const sedeActiva = useSedeActiva()
  const setSedeActiva = useSetSedeActiva()
  const setVistaCompleta = useSetVistaCompleta()
  const autoAll = useAutoVerificacionPorSede()
  const updateItem = useUpdateItem()
  const initSede = useInitSede()

  const sede = sedes.find((s) => s.codigo === sedeActiva)
  const hab = useHabilitacionPorSede(sedeActiva)
  const auto = autoForSede(autoAll, sedeActiva)
  const items = computeChecklistEstado(hab, auto)
  const pct = pctChecklistCumplido(hab, auto)

  const servicios = (sede?.servicios ?? []) as unknown as ServicioHabilitado[]

  function toggle(
    itemId: string,
    isAuto: boolean,
    currentEstado: CheckEstado | 'pendiente'
  ) {
    if (isAuto) return // auto items are read-only
    if (!hab) {
      // Initialize the sede record first
      initSede(sedeActiva, {
        sedeId: sedeActiva,
        fechaRevision: new Date().toISOString().slice(0, 10),
        responsable: '',
        items: [
          {
            id: itemId,
            criterio: '',
            estandar: '',
            estado: nextEstado(currentEstado),
            observacion: '',
          },
        ],
      })
      return
    }
    const next = nextEstado(currentEstado)
    updateItem(sedeActiva, itemId, { estado: next })
  }

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
                  key={s._id}
                  size="sm"
                  variant={s.codigo === sedeActiva ? 'default' : 'outline'}
                  onClick={() => {
                    setVistaCompleta(false)
                    setSedeActiva(s.codigo)
                  }}
                >
                  {s.ciudad}
                </Button>
              ))}
          </div>

          {sede && (
            <Card>
              <CardContent className="pt-4 space-y-2">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-sm font-semibold text-foreground">
                      {sede.ciudad} — {sede.nombre}
                    </div>
                    {servicios.length > 0 && (
                      <div className="text-[0.65rem] text-muted-foreground mt-0.5">
                        Servicios: {servicios.join(' · ')}
                      </div>
                    )}
                  </div>
                  <Badge
                    variant="outline"
                    className="text-sm font-semibold shrink-0"
                  >
                    {pct}% · {items.filter((i) => i.estado === 'cumple').length}
                    /{items.filter((i) => i.estado !== 'na').length}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-[0.65rem] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-primary" />{' '}
                    Auto-verificado
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-emerald-400" /> Cumple
                    (manual)
                  </span>
                  <span className="flex items-center gap-1">
                    <Minus className="h-3 w-3 text-red-400" /> No cumple
                  </span>
                  <span className="flex items-center gap-1">
                    <Circle className="h-3 w-3 text-muted-foreground/40" />{' '}
                    Pendiente
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {CATEGORIAS.map((cat) => {
            const catItems = items.filter((i) => i.def.categoria === cat.id)
            const cumplen = catItems.filter((i) => i.estado === 'cumple').length
            const total = catItems.filter((i) => i.estado !== 'na').length
            return (
              <Card key={cat.id}>
                <CardHeader className="pb-2 flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-xs uppercase tracking-wide">
                      {cat.nombre}
                    </CardTitle>
                    <div className="text-[0.65rem] text-muted-foreground mt-0.5">
                      {cumplen}/{total} criterios
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-1.5">
                  {catItems.map((i) => {
                    const isAuto = i.def.auto && auto[i.def.id] === true
                    return (
                      <button
                        key={i.def.id}
                        type="button"
                        disabled={isAuto}
                        onClick={() => toggle(i.def.id, isAuto, i.estado)}
                        className="w-full flex items-start gap-3 rounded-md px-3 py-2 bg-card/30 border border-border/60 text-left transition-colors hover:bg-card/60 disabled:cursor-default"
                      >
                        {estadoIcon(i.estado, isAuto)}
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-foreground">
                            {i.def.descripcion}
                          </div>
                          <div className="text-[0.65rem] text-muted-foreground flex items-center gap-2 mt-0.5">
                            {isAuto && (
                              <Badge
                                variant="outline"
                                className="text-[0.6rem] py-0 px-1 bg-primary/10 text-primary border-primary/20"
                              >
                                Auto
                              </Badge>
                            )}
                            <span>{i.def.norma}</span>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </CardContent>
              </Card>
            )
          })}
        </TabsContent>

        <TabsContent value="visitas" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">
                Plan de visitas de habilitación 2025
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {VISITAS.map((v) => (
                <div
                  key={v.sede}
                  className="flex items-center gap-4 rounded-md border border-border/60 bg-card/30 px-4 py-3"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold shrink-0">
                    {v.sede}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground">
                      {v.ciudad}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {v.tipo}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground shrink-0">
                    {new Date(v.fecha).toLocaleDateString('es-CO', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      v.estado === 'programada'
                        ? 'bg-emerald-400/20 text-emerald-400 border-emerald-400/40'
                        : 'bg-yellow-400/20 text-yellow-400 border-yellow-400/40'
                    }
                  >
                    {v.estado}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
