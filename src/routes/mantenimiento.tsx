import { createFileRoute } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { KpiMeta } from '#/components/kpi-meta'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { Card, CardContent } from '#/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'
import { useSedes } from '#/lib/domain/config'
import {
  useMantenimientosTodos,
  usePctCerradas,
} from '#/lib/domain/mantenimiento'
import type { Mantenimiento } from '#/lib/types'

export const Route = createFileRoute('/mantenimiento')({
  component: MantenimientoPage,
})

const TIPOS = ['biomedico', 'infraestructura', 'ti', 'otro'] as const
const ESTADOS = [
  'abierto',
  'asignado',
  'en_ejecucion',
  'cerrado',
  'cancelado',
] as const

function estadoLabel(e: Mantenimiento['estado']): string {
  switch (e) {
    case 'abierto':
      return 'Abierto'
    case 'asignado':
      return 'Asignado'
    case 'en_ejecucion':
      return 'En ejecución'
    case 'cerrado':
      return 'Cerrado'
    case 'cancelado':
      return 'Cancelado'
  }
}

function tipoLabel(t: Mantenimiento['tipo']): string {
  switch (t) {
    case 'biomedico':
      return 'Biomédico'
    case 'infraestructura':
      return 'Infraestructura'
    case 'ti':
      return 'TI / Sistemas'
    case 'otro':
      return 'Otro'
  }
}

function MantenimientoPage() {
  const all = useMantenimientosTodos()
  const sedes = useSedes()
  const pctCerradas = usePctCerradas()

  const [sedeFiltro, setSedeFiltro] = useState<string>('all')
  const [tipoFiltro, setTipoFiltro] = useState<string>('all')
  const [estadoFiltro, setEstadoFiltro] = useState<string>('all')

  const filtered = all.filter((m) => {
    if (sedeFiltro !== 'all' && m.sedeId !== sedeFiltro) return false
    if (tipoFiltro !== 'all' && m.tipo !== tipoFiltro) return false
    if (estadoFiltro !== 'all' && m.estado !== estadoFiltro) return false
    return true
  })

  const counts = {
    abierto: all.filter((m) => m.estado === 'abierto').length,
    enEjecucion: all.filter((m) => m.estado === 'en_ejecucion').length,
    cerrado: all.filter((m) => m.estado === 'cerrado').length,
    total: all.length,
  }

  return (
    <div className="space-y-6">
      <KpiMeta
        modulo="MANTENIMIENTO"
        valor={`${pctCerradas}%`}
        descripcion="% solicitudes mantenimiento cerradas"
        meta="≥80%"
      />

      <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
        <CounterCard label="ABIERTOS" value={counts.abierto} />
        <CounterCard label="EN PROCESO" value={counts.enEjecucion} />
        <CounterCard label="CERRADOS" value={counts.cerrado} />
        <CounterCard label="TOTAL" value={counts.total} />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Select value={sedeFiltro} onValueChange={setSedeFiltro}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Todas las sedes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las sedes</SelectItem>
            {sedes
              .filter((s) => s.activa)
              .map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.ciudad}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
        <Select value={tipoFiltro} onValueChange={setTipoFiltro}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Todos los tipos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {TIPOS.map((t) => (
              <SelectItem key={t} value={t}>
                {tipoLabel(t)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={estadoFiltro} onValueChange={setEstadoFiltro}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Todos los estados" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {ESTADOS.map((e) => (
              <SelectItem key={e} value={e}>
                {estadoLabel(e)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="ml-auto">
          <Button size="sm">
            <Plus className="h-4 w-4 mr-1" /> Nueva solicitud
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>CÓDIGO</TableHead>
                <TableHead>DESCRIPCIÓN</TableHead>
                <TableHead>TIPO</TableHead>
                <TableHead>SEDE / ÁREA</TableHead>
                <TableHead>PRIORIDAD</TableHead>
                <TableHead>SOLICITANTE</TableHead>
                <TableHead>APERTURA</TableHead>
                <TableHead>ESTADO</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((m) => {
                const sede = sedes.find((s) => s.id === m.sedeId)
                return (
                  <TableRow key={m.id}>
                    <TableCell className="font-mono text-xs">
                      {m.codigo}
                    </TableCell>
                    <TableCell className="max-w-md truncate">
                      {m.descripcion}
                    </TableCell>
                    <TableCell>{tipoLabel(m.tipo)}</TableCell>
                    <TableCell>
                      <div className="text-sm">{sede?.ciudad ?? m.sedeId}</div>
                      <div className="text-[0.65rem] text-muted-foreground">
                        {m.area}
                      </div>
                    </TableCell>
                    <TableCell className="capitalize">{m.prioridad}</TableCell>
                    <TableCell>{m.solicitante}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(m.apertura).toLocaleDateString('es-CO')}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{estadoLabel(m.estado)}</Badge>
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
                    Sin solicitudes con los filtros aplicados
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

function CounterCard({ label, value }: { label: string; value: number }) {
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
