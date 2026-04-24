import { createFileRoute } from '@tanstack/react-router'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { KpiMeta } from '#/components/kpi-meta'
import { Badge } from '@cualia/ui/components/badge'
import { Button } from '@cualia/ui/components/button'
import { Card, CardContent } from '@cualia/ui/components/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@cualia/ui/components/dialog'
import { Input } from '@cualia/ui/components/input'
import { Label } from '@cualia/ui/components/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@cualia/ui/components/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@cualia/ui/components/table'
import { Textarea } from '@cualia/ui/components/textarea'
import { useSedes } from '#/lib/domain/config'
import {
  useMantenimientosTodos,
  usePctCerradas,
  useCreateMantenimiento,
  useUpdateMantenimiento,
  useRemoveMantenimiento,
} from '#/lib/domain/mantenimiento'
import type { MantenimientoSGC } from '#/lib/domain/mantenimiento'

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

type MantEstado = MantenimientoSGC['estado']
type MantTipo = MantenimientoSGC['tipo']
type MantPrioridad = MantenimientoSGC['prioridad']

function tipoLabel(t: MantTipo): string {
  const map: Record<MantTipo, string> = {
    biomedico: 'Biomédico',
    infraestructura: 'Infraestructura',
    ti: 'TI / Sistemas',
    preventivo: 'Preventivo',
    correctivo: 'Correctivo',
    calibracion: 'Calibración',
    otro: 'Otro',
  }
  return map[t]
}

function estadoLabel(e: MantEstado): string {
  const map: Record<MantEstado, string> = {
    abierto: 'Abierto',
    asignado: 'Asignado',
    en_ejecucion: 'En ejecución',
    cerrado: 'Cerrado',
    cancelado: 'Cancelado',
  }
  return map[e]
}

function EstadoBadge({ estado }: { estado: MantEstado }) {
  const cls: Record<MantEstado, string> = {
    abierto: 'bg-red-400/20 text-red-400 border-red-400/40',
    asignado: 'bg-yellow-400/20 text-yellow-400 border-yellow-400/40',
    en_ejecucion: 'bg-blue-400/20 text-blue-400 border-blue-400/40',
    cerrado: 'bg-emerald-400/20 text-emerald-400 border-emerald-400/40',
    cancelado: 'bg-zinc-400/20 text-zinc-400 border-zinc-400/40',
  }
  return (
    <Badge variant="outline" className={cls[estado]}>
      {estadoLabel(estado)}
    </Badge>
  )
}

function PrioridadBadge({ prioridad }: { prioridad: MantPrioridad }) {
  const cls: Record<MantPrioridad, string> = {
    alta: 'bg-red-400/20 text-red-400 border-red-400/40',
    media: 'bg-yellow-400/20 text-yellow-400 border-yellow-400/40',
    baja: 'bg-zinc-400/20 text-zinc-400 border-zinc-400/40',
  }
  return (
    <Badge variant="outline" className={cls[prioridad]}>
      {prioridad.charAt(0).toUpperCase() + prioridad.slice(1)}
    </Badge>
  )
}

// FormData uses sedeCodigo as string (looked up to sedeId on save)
type MantFormData = {
  descripcion: string
  tipo: MantTipo
  sedeCodigo: string
  area: string
  prioridad: MantPrioridad
  solicitante: string
  apertura: string
  estado: MantEstado
}

const EMPTY: MantFormData = {
  descripcion: '',
  tipo: 'biomedico',
  sedeCodigo: 'BAQ',
  area: '',
  prioridad: 'media',
  solicitante: '',
  apertura: new Date().toISOString().slice(0, 10),
  estado: 'abierto',
}

function MantForm({
  initial,
  onSave,
  onCancel,
  sedes,
}: {
  initial: Partial<MantFormData>
  onSave: (m: MantFormData) => void
  onCancel: () => void
  sedes: { _id: string; codigo: string; ciudad: string }[]
}) {
  const [form, setForm] = useState<MantFormData>({ ...EMPTY, ...initial })

  function field<TKey extends keyof MantFormData>(
    k: TKey,
    v: MantFormData[TKey]
  ) {
    setForm((f) => ({ ...f, [k]: v }))
  }

  function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault()
    onSave(form)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 space-y-1">
          <Label>Descripción *</Label>
          <Textarea
            value={form.descripcion}
            onChange={(e) => field('descripcion', e.target.value)}
            required
            rows={3}
          />
        </div>
        <div className="space-y-1">
          <Label>Tipo *</Label>
          <Select
            value={form.tipo}
            onValueChange={(v) => field('tipo', v as MantTipo)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIPOS.map((t) => (
                <SelectItem key={t} value={t}>
                  {tipoLabel(t)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label>Sede *</Label>
          <Select
            value={form.sedeCodigo}
            onValueChange={(v) => field('sedeCodigo', v)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sedes.map((s) => (
                <SelectItem key={s._id} value={s.codigo}>
                  {s.ciudad}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label>Área / Servicio</Label>
          <Input
            value={form.area}
            onChange={(e) => field('area', e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label>Prioridad</Label>
          <Select
            value={form.prioridad}
            onValueChange={(v) => field('prioridad', v as MantPrioridad)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(['alta', 'media', 'baja'] as const).map((p) => (
                <SelectItem key={p} value={p}>
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label>Solicitante</Label>
          <Input
            value={form.solicitante}
            onChange={(e) => field('solicitante', e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label>Fecha apertura</Label>
          <Input
            type="date"
            value={form.apertura}
            onChange={(e) => field('apertura', e.target.value)}
          />
        </div>
        {(initial as Partial<MantenimientoSGC>)._id && (
          <div className="space-y-1">
            <Label>Estado</Label>
            <Select
              value={form.estado}
              onValueChange={(v) => field('estado', v as MantEstado)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ESTADOS.map((e) => (
                  <SelectItem key={e} value={e}>
                    {estadoLabel(e)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">Guardar</Button>
      </div>
    </form>
  )
}

function MantenimientoPage() {
  const all = useMantenimientosTodos()
  const sedes = useSedes()
  const pctCerradas = usePctCerradas()
  const createMantenimiento = useCreateMantenimiento()
  const updateMantenimiento = useUpdateMantenimiento()
  const removeMantenimiento = useRemoveMantenimiento()

  const [sedeFiltro, setSedeFiltro] = useState<string>('all')
  const [tipoFiltro, setTipoFiltro] = useState<string>('all')
  const [estadoFiltro, setEstadoFiltro] = useState<string>('all')
  const [dialog, setDialog] = useState<
    null | { mode: 'add' } | { mode: 'edit'; item: MantenimientoSGC }
  >(null)
  const [deleteTarget, setDeleteTarget] = useState<MantenimientoSGC | null>(
    null
  )

  const filtered = all.filter((m) => {
    if (sedeFiltro !== 'all' && m.sedeCodigo !== sedeFiltro) return false
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

  async function handleSave(data: MantFormData) {
    const sede = sedes.find((s) => s.codigo === data.sedeCodigo)
    if (!sede) return
    const codigo = `MNT-${Date.now()}`
    if (dialog?.mode === 'edit') {
      await updateMantenimiento({
        id: dialog.item._id,
        sedeCodigo: data.sedeCodigo,
        descripcion: data.descripcion,
        tipo: data.tipo,
        area: data.area,
        prioridad: data.prioridad,
        solicitante: data.solicitante,
        apertura: data.apertura,
        estado: data.estado,
      })
    } else {
      await createMantenimiento({
        sedeId: sede._id,
        sedeCodigo: data.sedeCodigo,
        codigo,
        descripcion: data.descripcion,
        tipo: data.tipo,
        area: data.area,
        prioridad: data.prioridad,
        solicitante: data.solicitante,
        apertura: data.apertura,
        estado: data.estado,
      })
    }
    setDialog(null)
  }

  async function handleDelete() {
    if (deleteTarget) await removeMantenimiento({ id: deleteTarget._id })
    setDeleteTarget(null)
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
        <CounterCard label="ABIERTOS" value={counts.abierto} color="red" />
        <CounterCard
          label="EN PROCESO"
          value={counts.enEjecucion}
          color="blue"
        />
        <CounterCard label="CERRADOS" value={counts.cerrado} color="emerald" />
        <CounterCard label="TOTAL" value={counts.total} color="default" />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Select value={sedeFiltro} onValueChange={setSedeFiltro}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Todas las sedes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las sedes</SelectItem>
            {sedes
              .filter((s) => s.activa)
              .map((s) => (
                <SelectItem key={s._id} value={s.codigo}>
                  {s.ciudad}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
        <Select value={tipoFiltro} onValueChange={setTipoFiltro}>
          <SelectTrigger className="w-[160px]">
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
          <SelectTrigger className="w-[160px]">
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
          <Button size="sm" onClick={() => setDialog({ mode: 'add' })}>
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
                <TableHead className="w-20" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((m) => {
                const sede = sedes.find((s) => s.codigo === m.sedeCodigo)
                return (
                  <TableRow key={m._id}>
                    <TableCell className="font-mono text-xs">
                      {m.codigo}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {m.descripcion}
                    </TableCell>
                    <TableCell>{tipoLabel(m.tipo)}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {sede?.ciudad ?? m.sedeCodigo}
                      </div>
                      <div className="text-[0.65rem] text-muted-foreground">
                        {m.area}
                      </div>
                    </TableCell>
                    <TableCell>
                      <PrioridadBadge prioridad={m.prioridad} />
                    </TableCell>
                    <TableCell>{m.solicitante}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {new Date(m.apertura).toLocaleDateString('es-CO')}
                    </TableCell>
                    <TableCell>
                      <EstadoBadge estado={m.estado} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7"
                          onClick={() => setDialog({ mode: 'edit', item: m })}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-red-400 hover:text-red-300"
                          onClick={() => setDeleteTarget(m)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={9}
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

      {/* Dialog agregar / editar */}
      <Dialog
        open={dialog !== null}
        onOpenChange={(open) => {
          if (!open) setDialog(null)
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {dialog?.mode === 'edit'
                ? 'Editar solicitud'
                : 'Nueva solicitud de mantenimiento'}
            </DialogTitle>
          </DialogHeader>
          {dialog !== null && (
            <MantForm
              initial={
                dialog.mode === 'edit'
                  ? { ...dialog.item, sedeCodigo: dialog.item.sedeCodigo }
                  : {}
              }
              onSave={(data) => void handleSave(data)}
              onCancel={() => setDialog(null)}
              sedes={sedes.filter((s) => s.activa)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Confirmar eliminación */}
      <Dialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Eliminar solicitud</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            ¿Confirmas eliminar la solicitud{' '}
            <span className="font-medium text-foreground">
              {deleteTarget?.codigo}
            </span>
            ? Esta acción no se puede deshacer.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={() => void handleDelete()}>
              Eliminar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function CounterCard({
  label,
  value,
  color,
}: {
  label: string
  value: number
  color: 'red' | 'blue' | 'emerald' | 'default'
}) {
  const cls =
    color === 'red'
      ? 'text-red-400'
      : color === 'blue'
        ? 'text-blue-400'
        : color === 'emerald'
          ? 'text-emerald-400'
          : 'text-foreground'
  return (
    <Card>
      <CardContent className="pt-4">
        <div className="text-[0.65rem] uppercase tracking-wide text-muted-foreground">
          {label}
        </div>
        <div className={`text-2xl font-bold ${cls}`}>{value}</div>
      </CardContent>
    </Card>
  )
}
