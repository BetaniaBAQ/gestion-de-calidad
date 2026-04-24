import { createFileRoute } from '@tanstack/react-router'
import { Pencil, Plus } from 'lucide-react'
import { useState } from 'react'
import { KpiMeta } from '#/components/kpi-meta'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { Card, CardContent } from '#/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '#/components/ui/tabs'
import { Textarea } from '#/components/ui/textarea'
import { useAdherenciaPromedio, useGpcs } from '#/lib/domain/adherencia'
import { useSedes } from '#/lib/domain/config'
import {
  diasTranscurridos,
  usePqrsStats,
  usePqrsTodas,
  useCreatePqrs,
  useUpdatePqrs,
} from '#/lib/domain/pqrs'
import type { PqrsSGC } from '#/lib/domain/pqrs'

export const Route = createFileRoute('/procesos')({
  component: ProcesosPage,
})

const TIPO_LABELS: Record<PqrsSGC['tipo'], string> = {
  peticion: 'Petición',
  queja: 'Queja',
  reclamo: 'Reclamo',
  sugerencia: 'Sugerencia',
}

const ESTADO_LABELS: Record<PqrsSGC['estado'], string> = {
  recibido: 'Recibido',
  en_tramite: 'En trámite',
  respondido: 'Respondido',
  cerrado: 'Cerrado',
  vencido: 'Vencido',
}

function EstadoBadge({ estado }: { estado: PqrsSGC['estado'] }) {
  const cls: Record<PqrsSGC['estado'], string> = {
    recibido: 'bg-blue-400/20 text-blue-400 border-blue-400/40',
    en_tramite: 'bg-yellow-400/20 text-yellow-400 border-yellow-400/40',
    respondido: 'bg-emerald-400/20 text-emerald-400 border-emerald-400/40',
    cerrado: 'bg-zinc-400/20 text-zinc-400 border-zinc-400/40',
    vencido: 'bg-red-400/20 text-red-400 border-red-400/40',
  }
  return (
    <Badge variant="outline" className={cls[estado]}>
      {ESTADO_LABELS[estado]}
    </Badge>
  )
}

type PqrsFormData = Omit<PqrsSGC, '_id' | 'id' | 'sedeId'>

const EMPTY: PqrsFormData = {
  tipo: 'peticion',
  radicado: '',
  fecha: new Date().toISOString().slice(0, 10),
  sede: 'BAQ',
  nombreInteresado: '',
  contacto: '',
  descripcion: '',
  responsable: '',
  estado: 'recibido',
}

function PqrsForm({
  initial,
  onSave,
  onCancel,
  sedes,
}: {
  initial: Partial<PqrsFormData>
  onSave: (p: PqrsFormData) => void
  onCancel: () => void
  sedes: { _id: string; codigo: string; ciudad: string }[]
}) {
  const [form, setForm] = useState({ ...EMPTY, ...initial })

  function field<TKey extends keyof PqrsFormData>(
    k: TKey,
    v: PqrsFormData[TKey]
  ) {
    setForm((f) => ({ ...f, [k]: v }))
  }

  const isEdit = !!initial.radicado

  function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault()
    const radicado =
      form.radicado ||
      `PQR-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`
    onSave({ ...form, radicado })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label>Tipo *</Label>
          <Select
            value={form.tipo}
            onValueChange={(v) => field('tipo', v as PqrsSGC['tipo'])}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(['peticion', 'queja', 'reclamo', 'sugerencia'] as const).map(
                (t) => (
                  <SelectItem key={t} value={t}>
                    {TIPO_LABELS[t]}
                  </SelectItem>
                )
              )}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label>Fecha recepción *</Label>
          <Input
            type="date"
            value={form.fecha}
            onChange={(e) => field('fecha', e.target.value)}
            required
          />
        </div>
        <div className="space-y-1">
          <Label>Sede *</Label>
          <Select value={form.sede} onValueChange={(v) => field('sede', v)}>
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
          <Label>Responsable</Label>
          <Input
            value={form.responsable}
            onChange={(e) => field('responsable', e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label>Nombre del interesado</Label>
          <Input
            value={form.nombreInteresado}
            onChange={(e) => field('nombreInteresado', e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label>Contacto (tel / email)</Label>
          <Input
            value={form.contacto}
            onChange={(e) => field('contacto', e.target.value)}
          />
        </div>
        <div className="col-span-2 space-y-1">
          <Label>Descripción *</Label>
          <Textarea
            value={form.descripcion}
            onChange={(e) => field('descripcion', e.target.value)}
            required
            rows={3}
          />
        </div>
        {isEdit && (
          <>
            <div className="space-y-1">
              <Label>Estado</Label>
              <Select
                value={form.estado}
                onValueChange={(v) => field('estado', v as PqrsSGC['estado'])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(
                    [
                      'recibido',
                      'en_tramite',
                      'respondido',
                      'cerrado',
                      'vencido',
                    ] as const
                  ).map((e) => (
                    <SelectItem key={e} value={e}>
                      {ESTADO_LABELS[e]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Fecha de respuesta</Label>
              <Input
                type="date"
                value={form.fechaRespuesta ?? ''}
                onChange={(e) =>
                  setForm((f) => ({ ...f, fechaRespuesta: e.target.value }))
                }
              />
            </div>
            <div className="col-span-2 space-y-1">
              <Label>Respuesta / Cierre</Label>
              <Textarea
                value={form.respuesta ?? ''}
                onChange={(e) =>
                  setForm((f) => ({ ...f, respuesta: e.target.value }))
                }
                rows={3}
              />
            </div>
          </>
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

function ProcesosPage() {
  const stats = usePqrsStats()
  const adh = useAdherenciaPromedio()
  const pqrs = usePqrsTodas()
  const gpcs = useGpcs()
  const sedes = useSedes()
  const createPqrs = useCreatePqrs()
  const updatePqrs = useUpdatePqrs()

  const [dialog, setDialog] = useState<
    null | { mode: 'add' } | { mode: 'edit'; pqr: PqrsSGC }
  >(null)

  async function handleSave(data: PqrsFormData) {
    const sede = sedes.find((s) => s.codigo === data.sede)
    if (!sede) return
    if (dialog?.mode === 'edit') {
      await updatePqrs({
        id: dialog.pqr._id,
        sedeCodigo: data.sede,
        sedeId: sede._id,
        tipo: data.tipo,
        radicado: data.radicado,
        fecha: data.fecha,
        nombreInteresado: data.nombreInteresado,
        contacto: data.contacto,
        descripcion: data.descripcion,
        responsable: data.responsable,
        estado: data.estado,
        respuesta: data.respuesta,
        fechaRespuesta: data.fechaRespuesta,
      })
    } else {
      await createPqrs({
        sedeId: sede._id,
        sedeCodigo: data.sede,
        tipo: data.tipo,
        radicado: data.radicado,
        fecha: data.fecha,
        nombreInteresado: data.nombreInteresado,
        contacto: data.contacto,
        descripcion: data.descripcion,
        responsable: data.responsable,
        estado: data.estado,
        respuesta: data.respuesta,
        fechaRespuesta: data.fechaRespuesta,
      })
    }
    setDialog(null)
  }

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
            <CounterCard label="VENCIDAS" value={stats.vencidas} color="red" />
            <CounterCard
              label="TIEMPO PROM."
              value={`${stats.tiempoPromedio}d`}
            />
          </div>

          <div className="flex justify-end">
            <Button size="sm" onClick={() => setDialog({ mode: 'add' })}>
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
                    <TableHead className="w-12" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pqrs.map((p) => {
                    const sede = sedes.find((s) => s.codigo === p.sede)
                    return (
                      <TableRow key={p._id}>
                        <TableCell className="font-mono text-xs">
                          {p.radicado}
                        </TableCell>
                        <TableCell className="text-sm">
                          {TIPO_LABELS[p.tipo]}
                        </TableCell>
                        <TableCell className="max-w-xs truncate text-sm">
                          {p.descripcion}
                        </TableCell>
                        <TableCell className="text-sm">
                          {sede?.ciudad ?? p.sede}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(p.fecha).toLocaleDateString('es-CO')}
                        </TableCell>
                        <TableCell className="text-sm">
                          {diasTranscurridos(p)}d
                        </TableCell>
                        <TableCell className="text-sm">
                          {p.responsable}
                        </TableCell>
                        <TableCell>
                          <EstadoBadge estado={p.estado} />
                        </TableCell>
                        <TableCell>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            onClick={() => setDialog({ mode: 'edit', pqr: p })}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                  {pqrs.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={9}
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
                    <TableHead>GPC / PROTOCOLO</TableHead>
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
                        <TableCell>
                          <span
                            className={
                              ok ? 'text-emerald-400' : 'text-yellow-400'
                            }
                          >
                            {g.adherenciaPromedio}%
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
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
                  {gpcs.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center text-muted-foreground py-8"
                      >
                        Sin GPC registradas
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog
        open={dialog !== null}
        onOpenChange={(open) => {
          if (!open) setDialog(null)
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {dialog?.mode === 'edit' ? 'Gestionar PQRS' : 'Nueva PQRS'}
            </DialogTitle>
          </DialogHeader>
          {dialog !== null && (
            <PqrsForm
              initial={dialog.mode === 'edit' ? dialog.pqr : {}}
              onSave={(data) => void handleSave(data)}
              onCancel={() => setDialog(null)}
              sedes={sedes.filter((s) => s.activa)}
            />
          )}
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
  value: number | string
  color?: 'red'
}) {
  return (
    <Card>
      <CardContent className="pt-4">
        <div className="text-[0.65rem] uppercase tracking-wide text-muted-foreground">
          {label}
        </div>
        <div
          className={`text-2xl font-bold ${color === 'red' ? 'text-red-400' : 'text-foreground'}`}
        >
          {value}
        </div>
      </CardContent>
    </Card>
  )
}
