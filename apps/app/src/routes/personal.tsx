import { createFileRoute } from '@tanstack/react-router'
import { ArrowRight, Plus } from 'lucide-react'
import { useState } from 'react'
import { KpiMeta } from '#/components/kpi-meta'
import { SedePills } from '#/components/sede-pills'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '#/components/ui/sheet'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '#/components/ui/tabs'
import { CAPACITACIONES_PROGRAMADAS0 } from '#/lib/data'
import { useSedes } from '#/lib/domain/config'
import {
  completitudPersona,
  estadoCompletitud,
  pendientesValidacion,
  resolveRequisitos,
  useCargos,
  usePersonas,
  usePersonasTodas,
} from '#/lib/domain/personal'
import type { Persona } from '#/lib/types'

export const Route = createFileRoute('/personal')({
  component: PersonalPage,
})

function PersonalPage() {
  const personasAll = usePersonasTodas()
  const personas = usePersonas()
  const cargos = useCargos()
  const sedes = useSedes()

  const totalCaps = CAPACITACIONES_PROGRAMADAS0.length
  const capsEjec = CAPACITACIONES_PROGRAMADAS0.filter(
    (c) => c.estado === 'ejecutada'
  ).length
  const pctCapsEjec =
    totalCaps > 0 ? Math.round((capsEjec / totalCaps) * 1000) / 10 : 0
  const completas = personasAll.filter((p) => completitudPersona(p) === 100)
  const pctDocCompleta =
    personasAll.length > 0
      ? Math.round((completas.length / personasAll.length) * 1000) / 10
      : 0
  const pctCapsNorm = pctCapsEjec === 0 ? 20 : pctCapsEjec

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-3">
        <KpiMeta
          modulo="TALENTO HUMANO"
          valor={`${pctCapsEjec}%`}
          descripcion="% capacitaciones ejecutadas"
          meta="≥80%"
        />
        <KpiMeta
          modulo="TALENTO HUMANO"
          valor={`${pctDocCompleta}%`}
          descripcion="% personal con documentación completa"
          meta="≥100%"
        />
        <KpiMeta
          modulo="TALENTO HUMANO"
          valor={`${pctCapsNorm}%`}
          descripcion="% capacitaciones normativas ejecutadas"
          meta="≥100%"
        />
      </div>

      <Tabs defaultValue="personal">
        <TabsList>
          <TabsTrigger value="personal">Personal</TabsTrigger>
          <TabsTrigger value="suficiencia">Suficiencia TH</TabsTrigger>
          <TabsTrigger value="cronograma">
            Cronograma de capacitaciones
          </TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-4">
          <SedePills />
          <div className="flex justify-end">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" /> Agregar persona
            </Button>
          </div>
          <PersonalTable personas={personas} cargos={cargos} sedes={sedes} />
        </TabsContent>

        <TabsContent value="suficiencia" className="space-y-2">
          <Card>
            <CardContent className="pt-6 text-sm text-muted-foreground">
              Vista de suficiencia de talento humano por cargo y sede. Detalle
              en próxima iteración.
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cronograma" className="space-y-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">
                Capacitaciones programadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>NOMBRE</TableHead>
                    <TableHead>ÁREA</TableHead>
                    <TableHead>FECHA OBJETIVO</TableHead>
                    <TableHead>ESTADO</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {CAPACITACIONES_PROGRAMADAS0.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell>{c.nombre}</TableCell>
                      <TableCell>{c.area}</TableCell>
                      <TableCell>
                        {new Date(c.fechaObjetivo).toLocaleDateString('es-CO')}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {c.estado}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function PersonalTable({
  personas,
  cargos,
  sedes,
}: {
  personas: Persona[]
  cargos: ReturnType<typeof useCargos>
  sedes: ReturnType<typeof useSedes>
}) {
  const [open, setOpen] = useState<Persona | null>(null)

  return (
    <>
      <Card>
        <CardContent className="pt-4 p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>NOMBRE</TableHead>
                <TableHead>CARGO</TableHead>
                <TableHead>ÁREA</TableHead>
                <TableHead>SEDE</TableHead>
                <TableHead>COMPLETITUD</TableHead>
                <TableHead>PENDIENTES</TableHead>
                <TableHead>ESTADO</TableHead>
                <TableHead className="text-right">ACCIÓN</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {personas.map((p) => {
                const cargo = cargos.find((c) => c.id === p.cargo)
                const sede = sedes.find((s) => s.id === p.sede)
                const pct = completitudPersona(p)
                const pend = pendientesValidacion(p)
                const estado = estadoCompletitud(p)
                return (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.nombre}</TableCell>
                    <TableCell>{cargo?.nombre ?? p.cargo}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {cargo?.area}
                    </TableCell>
                    <TableCell>{sede?.ciudad ?? p.sede}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{pct}%</Badge>
                    </TableCell>
                    <TableCell>{pend > 0 ? pend : '—'}</TableCell>
                    <TableCell>
                      <EstadoBadge estado={estado} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setOpen(p)}
                      >
                        Ver <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
              {personas.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center text-muted-foreground py-8"
                  >
                    Sin personas en esta sede
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <PersonaDetalleSheet
        persona={open}
        onOpenChange={(o) => !o && setOpen(null)}
      />
    </>
  )
}

function EstadoBadge({
  estado,
}: {
  estado: ReturnType<typeof estadoCompletitud>
}) {
  const styles =
    estado === 'Crítico'
      ? 'bg-red-400/20 text-red-400 border-red-400/40'
      : estado === 'Alerta'
        ? 'bg-yellow-400/20 text-yellow-400 border-yellow-400/40'
        : 'bg-emerald-400/20 text-emerald-400 border-emerald-400/40'
  return (
    <Badge variant="outline" className={styles}>
      {estado}
    </Badge>
  )
}

function PersonaDetalleSheet({
  persona,
  onOpenChange,
}: {
  persona: Persona | null
  onOpenChange: (open: boolean) => void
}) {
  if (!persona) return null
  const items = resolveRequisitos(persona)
  return (
    <Sheet open={!!persona} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>{persona.nombre}</SheetTitle>
          <SheetDescription>
            Cargo {persona.cargo} · Sede {persona.sede}
          </SheetDescription>
        </SheetHeader>
        <div className="mt-4 space-y-2 overflow-auto max-h-[calc(100vh-12rem)] pr-2">
          {items.map((i) => (
            <div
              key={i.def.id}
              className="flex items-start gap-3 rounded-lg border border-border bg-card/30 px-3 py-2"
            >
              <ReqEstadoBadge estado={i.estado} />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-foreground truncate">
                  {i.def.nombre}
                </div>
                <div className="text-[0.65rem] text-muted-foreground">
                  {i.def.norma}
                  {i.fechaVigencia
                    ? ` · Vence ${new Date(i.fechaVigencia).toLocaleDateString('es-CO')}`
                    : ''}
                </div>
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <div className="text-sm text-muted-foreground py-8 text-center">
              Sin requisitos definidos para este cargo
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

function ReqEstadoBadge({
  estado,
}: {
  estado: ReturnType<typeof resolveRequisitos>[number]['estado']
}) {
  const styles: Record<typeof estado, string> = {
    VIGENTE: 'bg-emerald-400/20 text-emerald-400 border-emerald-400/40',
    POR_VALIDAR: 'bg-yellow-400/20 text-yellow-400 border-yellow-400/40',
    SIN_CARGAR: 'bg-muted text-muted-foreground',
    VENCIDO: 'bg-red-400/20 text-red-400 border-red-400/40',
    CRITICO: 'bg-red-400/20 text-red-400 border-red-400/40',
    NO_APLICA: 'bg-muted text-muted-foreground',
  }
  return (
    <Badge variant="outline" className={`${styles[estado]} text-[0.65rem]`}>
      {estado.replace('_', ' ')}
    </Badge>
  )
}
