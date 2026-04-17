import { createFileRoute } from '@tanstack/react-router'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { KpiMeta } from '#/components/kpi-meta'
import { SedePills } from '#/components/sede-pills'
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
import { useSedes, useVistaCompleta, useSedeActiva } from '#/lib/domain/config'
import {
  equipoMantVigente,
  useEquipos,
  useCreateEquipo,
  useUpdateEquipo,
  useRemoveEquipo,
} from '#/lib/domain/equipos'
import type { EquipoSGC } from '#/lib/domain/equipos'
import { useOrgId } from '#/lib/org-context'

export const Route = createFileRoute('/equipos')({
  component: EquiposPage,
})

const ESTADO_LABELS: Record<EquipoSGC['estado'], string> = {
  operativo: 'Operativo',
  mantenimiento: 'En mantenimiento',
  baja: 'Dado de baja',
  reparacion: 'En reparación',
}

const PRIORIDAD_LABELS: Record<EquipoSGC['prioridad'], string> = {
  alta: 'Alta',
  media: 'Media',
  baja: 'Baja',
}

const EMPTY: Omit<EquipoSGC, '_id' | 'id' | 'sedeId' | 'docs'> = {
  nombre: '',
  marca: '',
  modelo: '',
  serie: '',
  sede: 'BAQ',
  area: '',
  fechaCompra: '',
  ultimaMant: '',
  proxMant: '',
  estado: 'operativo',
  invima: '',
  vida: 10,
  prioridad: 'alta',
}

function estadoBadge(estado: EquipoSGC['estado']) {
  const map: Record<EquipoSGC['estado'], string> = {
    operativo: 'bg-emerald-400/20 text-emerald-400 border-emerald-400/40',
    mantenimiento: 'bg-yellow-400/20 text-yellow-400 border-yellow-400/40',
    baja: 'bg-zinc-400/20 text-zinc-400 border-zinc-400/40',
    reparacion: 'bg-orange-400/20 text-orange-400 border-orange-400/40',
  }
  return (
    <Badge variant="outline" className={map[estado]}>
      {ESTADO_LABELS[estado]}
    </Badge>
  )
}

function mantBadge(vigente: boolean) {
  return (
    <Badge
      variant="outline"
      className={
        vigente
          ? 'bg-emerald-400/20 text-emerald-400 border-emerald-400/40'
          : 'bg-red-400/20 text-red-400 border-red-400/40'
      }
    >
      {vigente ? 'Vigente' : 'Vencido'}
    </Badge>
  )
}

type EquipoFormData = Omit<EquipoSGC, '_id' | 'id' | 'sedeId' | 'docs'>

function EquipoForm({
  initial,
  onSave,
  onCancel,
  sedes,
}: {
  initial: Partial<EquipoFormData>
  onSave: (data: EquipoFormData) => void
  onCancel: () => void
  sedes: { _id: string; codigo: string; ciudad: string }[]
}) {
  const [form, setForm] = useState({ ...EMPTY, ...initial })

  function field(key: keyof typeof EMPTY, value: string | number) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault()
    onSave(form)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 space-y-1">
          <Label>Nombre del equipo *</Label>
          <Input
            value={form.nombre}
            onChange={(e) => field('nombre', e.target.value)}
            required
          />
        </div>
        <div className="space-y-1">
          <Label>Marca *</Label>
          <Input
            value={form.marca}
            onChange={(e) => field('marca', e.target.value)}
            required
          />
        </div>
        <div className="space-y-1">
          <Label>Modelo</Label>
          <Input
            value={form.modelo}
            onChange={(e) => field('modelo', e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label>Serie *</Label>
          <Input
            value={form.serie}
            onChange={(e) => field('serie', e.target.value)}
            required
          />
        </div>
        <div className="space-y-1">
          <Label>INVIMA / Registro</Label>
          <Input
            value={form.invima}
            onChange={(e) => field('invima', e.target.value)}
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
          <Label>Área / Servicio</Label>
          <Input
            value={form.area}
            onChange={(e) => field('area', e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label>Fecha de compra</Label>
          <Input
            type="date"
            value={form.fechaCompra}
            onChange={(e) => field('fechaCompra', e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label>Vida útil (años)</Label>
          <Input
            type="number"
            min={1}
            max={30}
            value={form.vida}
            onChange={(e) => field('vida', Number(e.target.value))}
          />
        </div>
        <div className="space-y-1">
          <Label>Último mantenimiento</Label>
          <Input
            type="date"
            value={form.ultimaMant}
            onChange={(e) => field('ultimaMant', e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label>Próximo mantenimiento *</Label>
          <Input
            type="date"
            value={form.proxMant}
            onChange={(e) => field('proxMant', e.target.value)}
            required
          />
        </div>
        <div className="space-y-1">
          <Label>Estado</Label>
          <Select
            value={form.estado}
            onValueChange={(v) => field('estado', v as EquipoSGC['estado'])}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(
                ['operativo', 'mantenimiento', 'reparacion', 'baja'] as const
              ).map((e) => (
                <SelectItem key={e} value={e}>
                  {ESTADO_LABELS[e]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label>Prioridad</Label>
          <Select
            value={form.prioridad}
            onValueChange={(v) =>
              field('prioridad', v as EquipoSGC['prioridad'])
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(['alta', 'media', 'baja'] as const).map((p) => (
                <SelectItem key={p} value={p}>
                  {PRIORIDAD_LABELS[p]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
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

function EquiposPage() {
  const orgId = useOrgId()
  const equipos = useEquipos()
  const sedes = useSedes()
  const vistaCompleta = useVistaCompleta()
  const sedeActiva = useSedeActiva()
  const createEquipo = useCreateEquipo()
  const updateEquipo = useUpdateEquipo()
  const removeEquipo = useRemoveEquipo()

  const [dialog, setDialog] = useState<
    null | { mode: 'add' } | { mode: 'edit'; equipo: EquipoSGC }
  >(null)
  const [deleteTarget, setDeleteTarget] = useState<EquipoSGC | null>(null)

  // KPI: % mantenimiento vigente
  const mantOk = equipos.filter(equipoMantVigente).length
  const pctMant =
    equipos.length > 0 ? Math.round((mantOk / equipos.length) * 100) : 0

  // KPI: % calibración vigente (planes de calibración aún no migrados → 0%)
  const pctCalib = 0

  // KPI: % HV técnicas (docs cargados — placeholder hasta migrar docs)
  const pctHv = 0

  async function handleSave(data: EquipoFormData) {
    const sede = sedes.find((s) => s.codigo === data.sede)
    if (!orgId || !sede) return
    if (dialog?.mode === 'edit') {
      await updateEquipo({
        id: dialog.equipo._id,
        sedeCodigo: data.sede,
        sedeId: sede._id,
        nombre: data.nombre,
        marca: data.marca,
        modelo: data.modelo,
        serie: data.serie,
        area: data.area,
        fechaCompra: data.fechaCompra,
        ultimaMant: data.ultimaMant || undefined,
        proxMant: data.proxMant || undefined,
        estado: data.estado,
        invima: data.invima || undefined,
        vidaUtil: data.vida,
        prioridad: data.prioridad,
      })
    } else {
      await createEquipo({
        orgId,
        sedeId: sede._id,
        sedeCodigo: data.sede,
        nombre: data.nombre,
        marca: data.marca,
        modelo: data.modelo,
        serie: data.serie,
        area: data.area,
        fechaCompra: data.fechaCompra,
        ultimaMant: data.ultimaMant || undefined,
        proxMant: data.proxMant || undefined,
        estado: data.estado,
        invima: data.invima || undefined,
        vidaUtil: data.vida,
        prioridad: data.prioridad,
      })
    }
    setDialog(null)
  }

  async function handleDelete() {
    if (deleteTarget) await removeEquipo({ id: deleteTarget._id })
    setDeleteTarget(null)
  }

  const defaultSede = vistaCompleta ? 'BAQ' : sedeActiva

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-3">
        <KpiMeta
          modulo="DOTACIÓN"
          valor={`${pctMant}%`}
          descripcion="% equipos con mantenimiento vigente"
          meta="≥100%"
        />
        <KpiMeta
          modulo="DOTACIÓN"
          valor={`${pctCalib}%`}
          descripcion="% equipos con calibración completada"
          meta="≥100%"
        />
        <KpiMeta
          modulo="DOTACIÓN"
          valor={`${pctHv}%`}
          descripcion="% HV técnicas cargadas"
          meta="≥100%"
        />
      </div>

      <SedePills />

      <div className="flex justify-end">
        <Button size="sm" onClick={() => setDialog({ mode: 'add' })}>
          <Plus className="h-4 w-4 mr-1" /> Agregar equipo
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>EQUIPO</TableHead>
                <TableHead>MARCA / MODELO</TableHead>
                <TableHead>SERIE</TableHead>
                <TableHead>SEDE</TableHead>
                <TableHead>ÁREA</TableHead>
                <TableHead>PRÓX. MANT.</TableHead>
                <TableHead>MANT.</TableHead>
                <TableHead>ESTADO</TableHead>
                <TableHead>DOCS</TableHead>
                <TableHead className="w-20" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {equipos.map((e) => {
                const vigente = equipoMantVigente(e)
                const sede = sedes.find((s) => s.codigo === e.sede)
                return (
                  <TableRow key={e._id}>
                    <TableCell className="font-medium">{e.nombre}</TableCell>
                    <TableCell>
                      {e.marca} {e.modelo}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {e.serie}
                    </TableCell>
                    <TableCell>{sede?.ciudad ?? e.sede}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {e.area || '—'}
                    </TableCell>
                    <TableCell>
                      {e.proxMant
                        ? new Date(e.proxMant).toLocaleDateString('es-CO')
                        : '—'}
                    </TableCell>
                    <TableCell>{mantBadge(vigente)}</TableCell>
                    <TableCell>{estadoBadge(e.estado)}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {'—'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7"
                          onClick={() => setDialog({ mode: 'edit', equipo: e })}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-red-400 hover:text-red-300"
                          onClick={() => setDeleteTarget(e)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
              {equipos.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={10}
                    className="text-center text-muted-foreground py-8"
                  >
                    Sin equipos registrados en esta sede
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
              {dialog?.mode === 'edit' ? 'Editar equipo' : 'Nuevo equipo'}
            </DialogTitle>
          </DialogHeader>
          {dialog !== null && (
            <EquipoForm
              initial={
                dialog.mode === 'edit'
                  ? dialog.equipo
                  : { ...EMPTY, sede: defaultSede }
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
            <DialogTitle>Eliminar equipo</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            ¿Confirmas eliminar{' '}
            <span className="font-medium text-foreground">
              {deleteTarget?.nombre}
            </span>{' '}
            ({deleteTarget?.serie})? Esta acción no se puede deshacer.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Eliminar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
