import { createFileRoute } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { useState } from 'react'
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
import { useSedes } from '#/lib/domain/config'
import { useAcciones, useAuditorias, usePamecStats } from '#/lib/domain/pamec'
import type { AuditoriaSGC } from '#/lib/domain/pamec'

export const Route = createFileRoute('/pamec')({
  component: PamecPage,
})

const ESTADOS: Array<AuditoriaSGC['estado'] | 'all'> = [
  'all',
  'planeada',
  'en_proceso',
  'cerrada',
]

function estadoLabel(e: AuditoriaSGC['estado']): string {
  switch (e) {
    case 'planeada':
      return 'Programada'
    case 'en_proceso':
      return 'En curso'
    case 'cerrada':
      return 'Finalizada'
  }
}

function PamecPage() {
  const auditorias = useAuditorias()
  const acciones = useAcciones()
  const sedes = useSedes()
  const stats = usePamecStats()

  const [filtroEstado, setFiltroEstado] = useState<string>('all')

  const filtered = auditorias.filter(
    (a) => filtroEstado === 'all' || a.estado === filtroEstado
  )

  return (
    <div className="space-y-6">
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
        <StatCard
          label="AUDITORÍAS"
          value={stats.auditorias}
          hint="programadas y finalizadas"
        />
        <StatCard
          label="HALLAZGOS"
          value={stats.hallazgos}
          hint="total registrados"
        />
        <StatCard
          label="CERRADOS"
          value={stats.cerrados}
          hint="con acciones completadas"
        />
        <StatCard
          label="ACC. VENCIDAS"
          value={stats.accVencidas}
          hint="requieren atención"
          tone="red"
        />
      </div>

      <Tabs defaultValue="auditorias">
        <TabsList>
          <TabsTrigger value="auditorias">Auditorías</TabsTrigger>
          <TabsTrigger value="plan">Plan de mejoramiento</TabsTrigger>
        </TabsList>

        <TabsContent value="auditorias" className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            {ESTADOS.map((e) => {
              const label = e === 'all' ? 'Todos' : estadoLabel(e)
              return (
                <Button
                  key={e as string}
                  size="sm"
                  variant={filtroEstado === e ? 'default' : 'outline'}
                  onClick={() => setFiltroEstado(e as string)}
                >
                  {label}
                </Button>
              )
            })}
            <div className="ml-auto">
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" /> Nueva auditoría
              </Button>
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>CÓDIGO</TableHead>
                    <TableHead>AUDITORÍA</TableHead>
                    <TableHead>TIPO</TableHead>
                    <TableHead>SEDE</TableHead>
                    <TableHead>AUDITOR</TableHead>
                    <TableHead>FECHA</TableHead>
                    <TableHead>HALLAZGOS</TableHead>
                    <TableHead>ESTADO</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((a) => {
                    const sede =
                      a.sede === 'TODAS'
                        ? 'Todas'
                        : (sedes.find((s) => s.codigo === a.sede)?.ciudad ??
                          a.sede)
                    const hallazgos = a.hallazgos.length
                    const accionesCount = a.hallazgos.filter(
                      (h) => !!h.accionCorrectiva
                    ).length
                    return (
                      <TableRow key={a._id}>
                        <TableCell className="font-mono text-xs">
                          {a.id}
                        </TableCell>
                        <TableCell className="font-medium">
                          Auditoría {a.proceso} – {sede}
                        </TableCell>
                        <TableCell>
                          {a.tipo === 'interna'
                            ? 'Interna programada'
                            : a.tipo === 'seguimiento'
                              ? 'Seguimiento'
                              : 'Externa'}
                        </TableCell>
                        <TableCell>{sede}</TableCell>
                        <TableCell>{a.auditor}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(a.fechaInicio).toLocaleDateString('es-CO')}
                        </TableCell>
                        <TableCell>
                          {hallazgos} hall.
                          {accionesCount > 0 ? ` ${accionesCount} acc.` : ''}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {estadoLabel(a.estado)}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="text-center text-muted-foreground py-8"
                      >
                        Sin auditorías con ese filtro
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plan" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>HALLAZGO</TableHead>
                    <TableHead>CAUSA</TableHead>
                    <TableHead>ACCIÓN</TableHead>
                    <TableHead>RESPONSABLE</TableHead>
                    <TableHead>LÍMITE</TableHead>
                    <TableHead>ESTADO</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {acciones.map((a) => (
                    <TableRow key={a._id}>
                      <TableCell className="max-w-xs truncate">
                        {a.hallazgo}
                      </TableCell>
                      <TableCell className="text-muted-foreground max-w-xs truncate">
                        {a.causa}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {a.accion}
                      </TableCell>
                      <TableCell>{a.responsable}</TableCell>
                      <TableCell>
                        {new Date(a.fechaLimite).toLocaleDateString('es-CO')}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {a.estado}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {acciones.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center text-muted-foreground py-8"
                      >
                        Sin acciones registradas
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function StatCard({
  label,
  value,
  hint,
  tone,
}: {
  label: string
  value: number
  hint: string
  tone?: 'red'
}) {
  return (
    <Card className={tone === 'red' ? 'border-red-400/30' : ''}>
      <CardContent className="pt-4">
        <div className="text-[0.65rem] uppercase tracking-wide text-muted-foreground">
          {label}
        </div>
        <div
          className={`text-2xl font-bold ${tone === 'red' ? 'text-red-400' : 'text-foreground'}`}
        >
          {value}
        </div>
        <p className="text-[0.65rem] text-muted-foreground mt-0.5">{hint}</p>
      </CardContent>
    </Card>
  )
}
