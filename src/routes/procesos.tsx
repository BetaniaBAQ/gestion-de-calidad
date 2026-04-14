import { createFileRoute } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { KpiMeta } from '#/components/kpi-meta'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { Card, CardContent } from '#/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '#/components/ui/tabs'
import { useAdherenciaPromedio, useGpcs } from '#/lib/domain/adherencia'
import { useSedes } from '#/lib/domain/config'
import {
  diasTranscurridos,
  usePqrsStats,
  usePqrsTodas,
} from '#/lib/domain/pqrs'

export const Route = createFileRoute('/procesos')({
  component: ProcesosPage,
})

function ProcesosPage() {
  const stats = usePqrsStats()
  const adh = useAdherenciaPromedio()
  const pqrs = usePqrsTodas()
  const gpcs = useGpcs()
  const sedes = useSedes()

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-3">
        <KpiMeta
          modulo="SATISFACCIÓN"
          valor={`${stats.pctTermino}%`}
          descripcion="% PQRS respondidas en término"
          meta="≥95%"
        />
        <KpiMeta
          modulo="SATISFACCIÓN"
          valor={`${stats.tiempoPromedio}días`}
          descripcion="Tiempo promedio respuesta PQRS (días)"
          meta="≤15días"
        />
        <KpiMeta
          modulo="PERTINENCIA"
          valor={`${adh}%`}
          descripcion="% adherencia a GPC (promedio)"
          meta="≥95%"
        />
      </div>

      <Tabs defaultValue="pqrs">
        <TabsList>
          <TabsTrigger value="pqrs">PQRS</TabsTrigger>
          <TabsTrigger value="gpc">Adherencia a GPC</TabsTrigger>
        </TabsList>

        <TabsContent value="pqrs" className="space-y-4">
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
            <CounterCard label="TOTAL PQRS" value={stats.total} />
            <CounterCard label="EN TRÁMITE" value={stats.enTramite} />
            <CounterCard label="VENCIDAS" value={stats.vencidas} />
            <CounterCard
              label="TIEMPO PROMEDIO"
              value={`${stats.tiempoPromedio}d`}
            />
          </div>

          <div className="flex justify-end">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" /> Nueva PQRS
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>RADICADO</TableHead>
                    <TableHead>TIPO</TableHead>
                    <TableHead>DESCRIPCIÓN</TableHead>
                    <TableHead>SEDE</TableHead>
                    <TableHead>RECIBIDA</TableHead>
                    <TableHead>DÍAS</TableHead>
                    <TableHead>RESPONSABLE</TableHead>
                    <TableHead>ESTADO</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pqrs.map((p) => {
                    const sede = sedes.find((s) => s.id === p.sede)
                    const estadoLabel =
                      p.estado === 'en_tramite'
                        ? 'En trámite'
                        : p.estado === 'cerrado' || p.estado === 'respondido'
                          ? 'Cerrada'
                          : p.estado === 'vencido'
                            ? 'Vencida'
                            : p.estado
                    const tone =
                      p.estado === 'vencido'
                        ? 'bg-red-400/20 text-red-400 border-red-400/40'
                        : p.estado === 'en_tramite'
                          ? 'bg-yellow-400/20 text-yellow-400 border-yellow-400/40'
                          : 'bg-emerald-400/20 text-emerald-400 border-emerald-400/40'
                    return (
                      <TableRow key={p.id}>
                        <TableCell className="font-mono text-xs">
                          {p.radicado}
                        </TableCell>
                        <TableCell className="capitalize">{p.tipo}</TableCell>
                        <TableCell className="max-w-md truncate">
                          {p.descripcion}
                        </TableCell>
                        <TableCell>{sede?.ciudad ?? p.sede}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(p.fecha).toLocaleDateString('es-CO')}
                        </TableCell>
                        <TableCell>{diasTranscurridos(p)}d</TableCell>
                        <TableCell>{p.responsable}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={tone}>
                            {estadoLabel}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                  {pqrs.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="text-center text-muted-foreground py-8"
                      >
                        Sin PQRS registradas
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gpc" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>GPC</TableHead>
                    <TableHead>ADHERENCIA</TableHead>
                    <TableHead>ÚLTIMA MEDICIÓN</TableHead>
                    <TableHead>ESTADO</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {gpcs.map((g) => {
                    const ok = g.adherenciaPromedio >= 90
                    return (
                      <TableRow key={g.id}>
                        <TableCell className="font-medium">
                          {g.nombre}
                        </TableCell>
                        <TableCell>{g.adherenciaPromedio}%</TableCell>
                        <TableCell className="text-muted-foreground">
                          {g.ultimaMedicion
                            ? new Date(g.ultimaMedicion).toLocaleDateString(
                                'es-CO'
                              )
                            : '—'}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              ok
                                ? 'bg-emerald-400/20 text-emerald-400 border-emerald-400/40'
                                : 'bg-yellow-400/20 text-yellow-400 border-yellow-400/40'
                            }
                          >
                            {ok ? 'Meta' : 'Por debajo'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function CounterCard({
  label,
  value,
}: {
  label: string
  value: number | string
}) {
  return (
    <Card>
      <CardContent className="pt-4">
        <div className="text-[0.65rem] uppercase tracking-wide text-muted-foreground">
          {label}
        </div>
        <div className="text-2xl font-bold text-foreground">{value}</div>
      </CardContent>
    </Card>
  )
}
