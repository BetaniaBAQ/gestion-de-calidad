import { createFileRoute } from '@tanstack/react-router'
import { ExternalLink, Pencil, Plus, Trash2 } from 'lucide-react'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '#/components/ui/tabs'
import { Textarea } from '#/components/ui/textarea'
import { useSedeActiva, useSedes, useVistaCompleta } from '#/lib/domain/config'
import {
  useAlertasSanitarias,
  useAlertasSanitariasStore,
  usePctConAccion,
} from '#/lib/domain/medicamentos'
import { useMedicamentosStore } from '#/lib/stores/medicamentos.store'
import { diasHasta } from '#/lib/utils-sgc'
import type { AlertaSanitaria, Medicamento } from '#/lib/types'

export const Route = createFileRoute('/medicamentos')({
  component: MedicamentosPage,
})

// ── Medicamento helpers ───────────────────────────────────────────────────────

function MedEstadoBadge({ med }: { med: Medicamento }) {
  const diasVenc = diasHasta(med.fechaVenc)
  const stockBajo = med.stock < med.stockMinimo

  if (med.estado === 'vencido' || diasVenc < 0) {
    return (
      <Badge
        variant="outline"
        className="bg-red-400/20 text-red-400 border-red-400/40"
      >
        Vencido
      </Badge>
    )
  }
  if (med.estado === 'agotado' || med.stock === 0) {
    return (
      <Badge
        variant="outline"
        className="bg-red-400/20 text-red-400 border-red-400/40"
      >
        Agotado
      </Badge>
    )
  }
  if (med.estado === 'suspendido') {
    return (
      <Badge
        variant="outline"
        className="bg-zinc-400/20 text-zinc-400 border-zinc-400/40"
      >
        Suspendido
      </Badge>
    )
  }
  if (stockBajo || diasVenc <= 30) {
    return (
      <Badge
        variant="outline"
        className="bg-yellow-400/20 text-yellow-400 border-yellow-400/40"
      >
        Alerta
      </Badge>
    )
  }
  return (
    <Badge
      variant="outline"
      className="bg-emerald-400/20 text-emerald-400 border-emerald-400/40"
    >
      OK
    </Badge>
  )
}

const MED_EMPTY: Omit<Medicamento, 'id'> = {
  nombre: '',
  principioActivo: '',
  concentracion: '',
  forma: '',
  laboratorio: '',
  registro: '',
  lote: '',
  fechaVenc: '',
  stock: 0,
  stockMinimo: 1,
  sede: 'BAQ',
  condicionAlm: '',
  estado: 'activo',
}

function MedForm({
  initial,
  onSave,
  onCancel,
  sedes,
}: {
  initial: Partial<Medicamento>
  onSave: (m: Medicamento) => void
  onCancel: () => void
  sedes: { id: string; ciudad: string }[]
}) {
  const [form, setForm] = useState({ ...MED_EMPTY, ...initial })

  function field<TKey extends keyof typeof MED_EMPTY>(
    k: TKey,
    v: (typeof MED_EMPTY)[TKey]
  ) {
    setForm((f) => ({ ...f, [k]: v }))
  }

  function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault()
    const id = initial.id ?? `MED-${Date.now()}`
    onSave({ ...form, id } as Medicamento)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 space-y-1">
          <Label>Nombre / Denominación *</Label>
          <Input
            value={form.nombre}
            onChange={(e) => field('nombre', e.target.value)}
            required
          />
        </div>
        <div className="space-y-1">
          <Label>Principio activo</Label>
          <Input
            value={form.principioActivo}
            onChange={(e) => field('principioActivo', e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label>Concentración</Label>
          <Input
            value={form.concentracion}
            onChange={(e) => field('concentracion', e.target.value)}
            placeholder="500mg"
          />
        </div>
        <div className="space-y-1">
          <Label>Forma farmacéutica</Label>
          <Input
            value={form.forma}
            onChange={(e) => field('forma', e.target.value)}
            placeholder="Tableta, Ampolla..."
          />
        </div>
        <div className="space-y-1">
          <Label>Laboratorio</Label>
          <Input
            value={form.laboratorio}
            onChange={(e) => field('laboratorio', e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label>Registro INVIMA</Label>
          <Input
            value={form.registro}
            onChange={(e) => field('registro', e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label>Lote</Label>
          <Input
            value={form.lote}
            onChange={(e) => field('lote', e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label>Fecha vencimiento *</Label>
          <Input
            type="date"
            value={form.fechaVenc}
            onChange={(e) => field('fechaVenc', e.target.value)}
            required
          />
        </div>
        <div className="space-y-1">
          <Label>Stock actual</Label>
          <Input
            type="number"
            min={0}
            value={form.stock}
            onChange={(e) => field('stock', Number(e.target.value))}
          />
        </div>
        <div className="space-y-1">
          <Label>Stock mínimo</Label>
          <Input
            type="number"
            min={0}
            value={form.stockMinimo}
            onChange={(e) => field('stockMinimo', Number(e.target.value))}
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
                <SelectItem key={s.id} value={s.id}>
                  {s.ciudad}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label>Estado</Label>
          <Select
            value={form.estado}
            onValueChange={(v) => field('estado', v as Medicamento['estado'])}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(['activo', 'agotado', 'vencido', 'suspendido'] as const).map(
                (e) => (
                  <SelectItem key={e} value={e}>
                    {e.charAt(0).toUpperCase() + e.slice(1)}
                  </SelectItem>
                )
              )}
            </SelectContent>
          </Select>
        </div>
        <div className="col-span-2 space-y-1">
          <Label>Condición de almacenamiento</Label>
          <Input
            value={form.condicionAlm}
            onChange={(e) => field('condicionAlm', e.target.value)}
            placeholder="Refrigeración 2-8°C, temperatura ambiente..."
          />
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

// ── Alerta Sanitaria helpers ──────────────────────────────────────────────────

const TIPO_ALERTA_LABELS: Record<AlertaSanitaria['tipo'], string> = {
  alerta_invima: 'Alerta INVIMA',
  ram: 'RAM',
  evento_ad: 'Evento adverso',
  retiro: 'Retiro de mercado',
}

function TipoAlertaBadge({ tipo }: { tipo: AlertaSanitaria['tipo'] }) {
  const cls: Record<AlertaSanitaria['tipo'], string> = {
    alerta_invima: 'bg-red-400/20 text-red-400 border-red-400/40',
    ram: 'bg-orange-400/20 text-orange-400 border-orange-400/40',
    evento_ad: 'bg-yellow-400/20 text-yellow-400 border-yellow-400/40',
    retiro: 'bg-purple-400/20 text-purple-400 border-purple-400/40',
  }
  return (
    <Badge variant="outline" className={cls[tipo]}>
      {TIPO_ALERTA_LABELS[tipo]}
    </Badge>
  )
}

const ALERTA_EMPTY: Omit<AlertaSanitaria, 'id'> = {
  fecha: new Date().toISOString().slice(0, 10),
  tipo: 'alerta_invima',
  fuente: 'INVIMA',
  descripcion: '',
  accion: '',
  spLink: '',
}

function AlertaForm({
  initial,
  onSave,
  onCancel,
}: {
  initial: Partial<AlertaSanitaria>
  onSave: (a: AlertaSanitaria) => void
  onCancel: () => void
}) {
  const [form, setForm] = useState({ ...ALERTA_EMPTY, ...initial })

  function field<TKey extends keyof typeof ALERTA_EMPTY>(
    k: TKey,
    v: (typeof ALERTA_EMPTY)[TKey]
  ) {
    setForm((f) => ({ ...f, [k]: v }))
  }

  function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault()
    const id = initial.id ?? `ALT-${Date.now()}`
    onSave({ ...form, id } as AlertaSanitaria)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label>Fecha *</Label>
          <Input
            type="date"
            value={form.fecha}
            onChange={(e) => field('fecha', e.target.value)}
            required
          />
        </div>
        <div className="space-y-1">
          <Label>Tipo *</Label>
          <Select
            value={form.tipo}
            onValueChange={(v) => field('tipo', v as AlertaSanitaria['tipo'])}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(
                ['alerta_invima', 'ram', 'evento_ad', 'retiro'] as const
              ).map((t) => (
                <SelectItem key={t} value={t}>
                  {TIPO_ALERTA_LABELS[t]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="col-span-2 space-y-1">
          <Label>Fuente</Label>
          <Input
            value={form.fuente}
            onChange={(e) => field('fuente', e.target.value)}
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
        <div className="col-span-2 space-y-1">
          <Label>Acción tomada</Label>
          <Textarea
            value={form.accion ?? ''}
            onChange={(e) => field('accion', e.target.value)}
            rows={2}
          />
        </div>
        <div className="col-span-2 space-y-1">
          <Label>Enlace SP / evidencia</Label>
          <Input
            value={form.spLink ?? ''}
            onChange={(e) => field('spLink', e.target.value)}
            placeholder="https://..."
          />
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

// ── Page ──────────────────────────────────────────────────────────────────────

function MedicamentosPage() {
  const alertas = useAlertasSanitarias()
  const pctAccion = usePctConAccion()
  const addAlerta = useAlertasSanitariasStore((s) => s.addAlerta)
  const updateAlerta = useAlertasSanitariasStore((s) => s.updateAlerta)
  const deleteAlerta = useAlertasSanitariasStore((s) => s.deleteAlerta)

  const medicamentos = useMedicamentosStore((s) => s.medicamentos)
  const addMedicamento = useMedicamentosStore((s) => s.addMedicamento)
  const updateMedicamento = useMedicamentosStore((s) => s.updateMedicamento)
  const deleteMedicamento = useMedicamentosStore((s) => s.deleteMedicamento)

  const sedes = useSedes()
  const sedeActiva = useSedeActiva()
  const vistaCompleta = useVistaCompleta()

  const medsFiltered = vistaCompleta
    ? medicamentos
    : medicamentos.filter((m) => m.sede === sedeActiva)

  const medsOk = medsFiltered.filter(
    (m) => m.estado === 'activo' && diasHasta(m.fechaVenc) > 0
  ).length
  const pctMedsOk =
    medsFiltered.length > 0
      ? Math.round((medsOk / medsFiltered.length) * 100)
      : 0

  const stockBajos = medsFiltered.filter(
    (m) => m.stock < m.stockMinimo && m.estado === 'activo'
  ).length

  const [medDialog, setMedDialog] = useState<
    null | { mode: 'add' } | { mode: 'edit'; med: Medicamento }
  >(null)
  const [medDeleteTarget, setMedDeleteTarget] = useState<Medicamento | null>(
    null
  )
  const [alertaDialog, setAlertaDialog] = useState<
    null | { mode: 'add' } | { mode: 'edit'; alerta: AlertaSanitaria }
  >(null)
  const [alertaDeleteTarget, setAlertaDeleteTarget] =
    useState<AlertaSanitaria | null>(null)

  function handleMedSave(m: Medicamento) {
    if (medDialog?.mode === 'edit') updateMedicamento(m.id, m)
    else addMedicamento(m)
    setMedDialog(null)
  }

  function handleAlertaSave(a: AlertaSanitaria) {
    if (alertaDialog?.mode === 'edit') updateAlerta(a.id, a)
    else addAlerta(a)
    setAlertaDialog(null)
  }

  const alertasSinAccion = alertas.filter((a) => !a.accion).length

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-3">
        <KpiMeta
          modulo="MEDICAMENTOS Y DM"
          valor={`${pctMedsOk}%`}
          descripcion="% medicamentos vigentes y en stock"
          meta="≥100%"
        />
        <KpiMeta
          modulo="MEDICAMENTOS Y DM"
          valor={String(stockBajos)}
          descripcion="medicamentos con stock bajo el mínimo"
          meta="0"
        />
        <KpiMeta
          modulo="MEDICAMENTOS Y DM"
          valor={alertas.length === 0 ? '—' : `${pctAccion}%`}
          descripcion="% alertas sanitarias con acción"
          meta="≥100%"
        />
      </div>

      <Tabs defaultValue="inventario">
        <TabsList>
          <TabsTrigger value="inventario">Inventario</TabsTrigger>
          <TabsTrigger value="alertas">
            Alertas sanitarias
            {alertasSinAccion > 0 && (
              <Badge
                variant="outline"
                className="ml-2 text-[0.6rem] py-0 px-1 bg-red-400/20 text-red-400 border-red-400/40"
              >
                {alertasSinAccion}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="vigiflow">Vigiflow</TabsTrigger>
          <TabsTrigger value="temp">Temperatura</TabsTrigger>
        </TabsList>

        {/* ── Inventario ── */}
        <TabsContent value="inventario" className="space-y-4">
          <SedePills />
          <div className="flex justify-end">
            <Button size="sm" onClick={() => setMedDialog({ mode: 'add' })}>
              <Plus className="h-4 w-4 mr-1" /> Agregar medicamento
            </Button>
          </div>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>MEDICAMENTO</TableHead>
                    <TableHead>PRINCIPIO ACTIVO</TableHead>
                    <TableHead>LOTE</TableHead>
                    <TableHead>VENCIMIENTO</TableHead>
                    <TableHead>STOCK</TableHead>
                    <TableHead>SEDE</TableHead>
                    <TableHead>ESTADO</TableHead>
                    <TableHead className="w-20" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {medsFiltered.map((m) => {
                    const sede = sedes.find((s) => s.id === m.sede)
                    const dias = diasHasta(m.fechaVenc)
                    return (
                      <TableRow key={m.id}>
                        <TableCell>
                          <div className="font-medium text-sm">{m.nombre}</div>
                          <div className="text-xs text-muted-foreground">
                            {m.concentracion} · {m.forma}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-xs">
                          {m.principioActivo || '—'}
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {m.lote || '—'}
                        </TableCell>
                        <TableCell>
                          <span
                            className={
                              dias < 0
                                ? 'text-red-400 font-medium text-xs'
                                : dias <= 30
                                  ? 'text-yellow-400 font-medium text-xs'
                                  : 'text-muted-foreground text-xs'
                            }
                          >
                            {new Date(m.fechaVenc).toLocaleDateString('es-CO')}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span
                            className={
                              m.stock < m.stockMinimo
                                ? 'text-yellow-400 font-medium text-sm'
                                : 'text-sm'
                            }
                          >
                            {m.stock}
                          </span>
                          <span className="text-muted-foreground text-xs ml-1">
                            / {m.stockMinimo} mín.
                          </span>
                        </TableCell>
                        <TableCell className="text-sm">
                          {sede?.ciudad ?? m.sede}
                        </TableCell>
                        <TableCell>
                          <MedEstadoBadge med={m} />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7"
                              onClick={() =>
                                setMedDialog({ mode: 'edit', med: m })
                              }
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 text-red-400 hover:text-red-300"
                              onClick={() => setMedDeleteTarget(m)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                  {medsFiltered.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="text-center text-muted-foreground py-8"
                      >
                        Sin medicamentos registrados en esta sede
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Alertas sanitarias ── */}
        <TabsContent value="alertas" className="space-y-4">
          <p className="text-xs text-muted-foreground">
            Registro de alertas sanitarias del INVIMA, RAM y eventos
            relacionados con medicamentos y dispositivos médicos.
          </p>
          <div className="flex justify-end">
            <Button
              size="sm"
              onClick={() => setAlertaDialog({ mode: 'add' })}
            >
              <Plus className="h-4 w-4 mr-1" /> Nueva alerta
            </Button>
          </div>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>FECHA</TableHead>
                    <TableHead>TIPO</TableHead>
                    <TableHead>FUENTE</TableHead>
                    <TableHead>DESCRIPCIÓN</TableHead>
                    <TableHead>ACCIÓN</TableHead>
                    <TableHead>SP</TableHead>
                    <TableHead className="w-20" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {alertas.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(a.fecha).toLocaleDateString('es-CO')}
                      </TableCell>
                      <TableCell>
                        <TipoAlertaBadge tipo={a.tipo} />
                      </TableCell>
                      <TableCell className="text-sm">{a.fuente}</TableCell>
                      <TableCell className="max-w-xs truncate text-sm">
                        {a.descripcion}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-xs truncate">
                        {a.accion ? (
                          a.accion
                        ) : (
                          <span className="text-yellow-400">Sin acción</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {a.spLink ? (
                          <a
                            href={a.spLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-primary hover:underline text-xs"
                          >
                            <ExternalLink className="h-3 w-3" />
                            Ver
                          </a>
                        ) : (
                          <span className="text-muted-foreground text-xs">
                            —
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            onClick={() =>
                              setAlertaDialog({ mode: 'edit', alerta: a })
                            }
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-red-400 hover:text-red-300"
                            onClick={() => setAlertaDeleteTarget(a)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {alertas.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center text-muted-foreground py-8"
                      >
                        Sin alertas registradas. Consulte regularmente el portal
                        INVIMA.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vigiflow">
          <Card>
            <CardContent className="pt-6 text-sm text-muted-foreground">
              Reportes Vigiflow al INVIMA. Módulo en desarrollo.
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="temp">
          <Card>
            <CardContent className="pt-6 text-sm text-muted-foreground">
              Control de temperatura de refrigeradores y áreas de
              almacenamiento. Módulo en desarrollo.
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs medicamento */}
      <Dialog
        open={medDialog !== null}
        onOpenChange={(open) => {
          if (!open) setMedDialog(null)
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {medDialog?.mode === 'edit'
                ? 'Editar medicamento'
                : 'Nuevo medicamento / DM'}
            </DialogTitle>
          </DialogHeader>
          {medDialog !== null && (
            <MedForm
              initial={medDialog.mode === 'edit' ? medDialog.med : {}}
              onSave={handleMedSave}
              onCancel={() => setMedDialog(null)}
              sedes={sedes.filter((s) => s.activa)}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={medDeleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setMedDeleteTarget(null)
        }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Eliminar medicamento</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            ¿Confirmas eliminar{' '}
            <span className="font-medium text-foreground">
              {medDeleteTarget?.nombre}
            </span>
            ? Esta acción no se puede deshacer.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setMedDeleteTarget(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (medDeleteTarget) deleteMedicamento(medDeleteTarget.id)
                setMedDeleteTarget(null)
              }}
            >
              Eliminar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialogs alerta */}
      <Dialog
        open={alertaDialog !== null}
        onOpenChange={(open) => {
          if (!open) setAlertaDialog(null)
        }}
      >
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {alertaDialog?.mode === 'edit'
                ? 'Editar alerta'
                : 'Nueva alerta sanitaria'}
            </DialogTitle>
          </DialogHeader>
          {alertaDialog !== null && (
            <AlertaForm
              initial={
                alertaDialog.mode === 'edit' ? alertaDialog.alerta : {}
              }
              onSave={handleAlertaSave}
              onCancel={() => setAlertaDialog(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={alertaDeleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setAlertaDeleteTarget(null)
        }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Eliminar alerta</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            ¿Confirmas eliminar esta alerta sanitaria? Esta acción no se puede
            deshacer.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setAlertaDeleteTarget(null)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (alertaDeleteTarget) deleteAlerta(alertaDeleteTarget.id)
                setAlertaDeleteTarget(null)
              }}
            >
              Eliminar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
