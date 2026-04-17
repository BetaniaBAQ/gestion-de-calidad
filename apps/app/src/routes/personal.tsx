import { createFileRoute } from '@tanstack/react-router'
import { ArrowRight, Edit2, Paperclip, Plus, Trash2 } from 'lucide-react'
import { useRef, useState } from 'react'
import { KpiMeta } from '#/components/kpi-meta'
import { SedePills } from '#/components/sede-pills'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogFooter,
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
  getRequisitosDefsByCargo,
  pendientesValidacion,
  resolveRequisitos,
  useCargos,
  useCreatePersona,
  usePersonas,
  usePersonasTodas,
  useRemovePersona,
  useUpdatePersona,
} from '#/lib/domain/personal'
import type { CargoSGC, PersonaSGC } from '#/lib/domain/personal'
import type { EstadoRequisito, RequisitoEstado } from '#/lib/types'
import { useOrgId } from '#/lib/org-context'
import { useUploadThing } from '#/lib/uploadthing-client'

export const Route = createFileRoute('/personal')({
  component: PersonalPage,
})

// ─── Page ─────────────────────────────────────────────────────────────────────

function PersonalPage() {
  const personasAll = usePersonasTodas()
  const personas = usePersonas()
  const cargos = useCargos()
  const sedes = useSedes()

  const [sheetPersona, setSheetPersona] = useState<PersonaSGC | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editPersona, setEditPersona] = useState<PersonaSGC | null>(null)

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
          valor={`${personasAll.length}`}
          descripcion="personas registradas"
          meta=""
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
            <Button
              size="sm"
              onClick={() => {
                setEditPersona(null)
                setFormOpen(true)
              }}
            >
              <Plus className="h-4 w-4 mr-1" /> Agregar persona
            </Button>
          </div>
          <PersonalTable
            personas={personas}
            cargos={cargos}
            sedes={sedes}
            onView={setSheetPersona}
          />
        </TabsContent>

        <TabsContent value="suficiencia">
          <SuficienciaTab
            personas={personasAll}
            cargos={cargos}
            sedes={sedes}
          />
        </TabsContent>

        <TabsContent value="cronograma" className="space-y-2">
          <CronogramaTab />
        </TabsContent>
      </Tabs>

      <PersonaDetalleSheet
        persona={sheetPersona}
        cargos={cargos}
        sedes={sedes}
        onOpenChange={(o) => !o && setSheetPersona(null)}
        onEdit={(p) => {
          setSheetPersona(null)
          setEditPersona(p)
          setFormOpen(true)
        }}
      />

      <PersonaFormDialog
        key={editPersona ? editPersona._id : 'new'}
        open={formOpen}
        onOpenChange={(o) => {
          if (!o) {
            setFormOpen(false)
            setEditPersona(null)
          }
        }}
        persona={editPersona}
        cargos={cargos}
        sedes={sedes}
      />
    </div>
  )
}

// ─── Tabla principal ───────────────────────────────────────────────────────────

function PersonalTable({
  personas,
  cargos,
  sedes,
  onView,
}: {
  personas: PersonaSGC[]
  cargos: CargoSGC[]
  sedes: ReturnType<typeof useSedes>
  onView: (p: PersonaSGC) => void
}) {
  return (
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
              const sede = sedes.find((s) => s.codigo === p.sede)
              const pct = completitudPersona(p)
              const pend = pendientesValidacion(p)
              const estado = estadoCompletitud(p)
              return (
                <TableRow key={p._id}>
                  <TableCell className="font-medium">{p.nombre}</TableCell>
                  <TableCell>{cargo?.nombre ?? p.cargo}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {cargo?.area ?? '—'}
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
                    <Button variant="ghost" size="sm" onClick={() => onView(p)}>
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
  )
}

// ─── Detalle sheet ─────────────────────────────────────────────────────────────

function PersonaDetalleSheet({
  persona,
  cargos,
  sedes,
  onOpenChange,
  onEdit,
}: {
  persona: PersonaSGC | null
  cargos: CargoSGC[]
  sedes: ReturnType<typeof useSedes>
  onOpenChange: (o: boolean) => void
  onEdit: (p: PersonaSGC) => void
}) {
  const removePersona = useRemovePersona()
  const updatePersona = useUpdatePersona()
  const [editReqs, setEditReqs] = useState(false)
  const [draft, setDraft] = useState<RequisitoEstado[]>([])
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [saving, setSaving] = useState(false)

  if (!persona) return null

  const cargo = cargos.find((c) => c.id === persona.cargo)
  const sede = sedes.find((s) => s.codigo === persona.sede)
  const resolved = resolveRequisitos(persona)

  function startEditReqs() {
    const defs = getRequisitosDefsByCargo(persona!.cargo)
    const byId = new Map(persona!.requisitos.map((r) => [r.defId, r]))
    setDraft(
      defs.map((def) => ({
        defId: def.id,
        estado: (byId.get(def.id)?.estado ??
          (def.critico ? 'CRITICO' : 'SIN_CARGAR')),
        fechaVigencia: byId.get(def.id)?.fechaVigencia ?? undefined,
        observacion: byId.get(def.id)?.observacion ?? undefined,
      }))
    )
    setEditReqs(true)
  }

  function cancelEditReqs() {
    setEditReqs(false)
    setDraft([])
  }

  async function saveReqs() {
    setSaving(true)
    const cleanDraft = draft.map((r) => ({
      ...r,
      fechaVigencia: r.fechaVigencia ?? undefined,
    }))
    try {
      await updatePersona({ id: persona!._id, requisitos: cleanDraft })
      setEditReqs(false)
      setDraft([])
    } finally {
      setSaving(false)
    }
  }

  function updateDraftItem(defId: string, patch: Partial<RequisitoEstado>) {
    setDraft((prev) =>
      prev.map((r) => (r.defId === defId ? { ...r, ...patch } : r))
    )
  }

  async function handleDelete() {
    await removePersona({ id: persona!._id })
    setConfirmDelete(false)
    onOpenChange(false)
  }

  const defs = getRequisitosDefsByCargo(persona.cargo)

  return (
    <Sheet open={!!persona} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl flex flex-col gap-0 p-0">
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-border">
          <div className="flex items-start justify-between gap-2">
            <div>
              <SheetTitle>{persona.nombre}</SheetTitle>
              <SheetDescription className="mt-0.5">
                {cargo?.nombre ?? persona.cargo} ·{' '}
                {sede?.ciudad ?? persona.sede}
              </SheetDescription>
            </div>
            <div className="flex gap-1 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(persona)}
              >
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive hover:text-destructive"
                onClick={() => setConfirmDelete(true)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {confirmDelete && (
            <div className="mt-3 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm">
              <p className="font-medium text-destructive mb-2">
                ¿Eliminar esta persona?
              </p>
              <div className="flex gap-2">
                <Button size="sm" variant="destructive" onClick={handleDelete}>
                  Confirmar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setConfirmDelete(false)}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </SheetHeader>

        <div className="flex-1 overflow-auto px-6 py-4 space-y-4">
          {/* Info rápida */}
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-muted-foreground">Cédula</span>
              <p className="font-medium">{persona.cedula}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Fecha ingreso</span>
              <p className="font-medium">
                {persona.fechaIngreso
                  ? new Date(persona.fechaIngreso).toLocaleDateString('es-CO')
                  : '—'}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Estado</span>
              <p className="font-medium capitalize">{persona.estado}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Completitud</span>
              <p className="font-medium">{completitudPersona(persona)}%</p>
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold">Requisitos normativos</h4>
              {!editReqs && defs.length > 0 && (
                <Button size="sm" variant="outline" onClick={startEditReqs}>
                  <Edit2 className="h-3 w-3 mr-1" /> Editar
                </Button>
              )}
            </div>

            {!editReqs ? (
              <div className="space-y-2">
                {resolved.map((i) => (
                  <div
                    key={i.def.id}
                    className="flex items-start gap-3 rounded-lg border border-border bg-card/30 px-3 py-2"
                  >
                    <ReqEstadoBadge estado={i.estado} />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium truncate">
                        {i.def.nombre}
                      </div>
                      <div className="text-[0.65rem] text-muted-foreground">
                        {i.def.norma}
                        {i.fechaVigencia
                          ? ` · Vence ${new Date(i.fechaVigencia).toLocaleDateString('es-CO')}`
                          : ''}
                      </div>
                    </div>
                    {/* Show link if doc was uploaded */}
                    {persona.requisitos.find((r) => r.defId === i.def.id)?.archivo && (
                      <a
                        href={persona.requisitos.find((r) => r.defId === i.def.id)!.archivo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[0.65rem] text-primary underline shrink-0"
                      >
                        Doc
                      </a>
                    )}
                  </div>
                ))}
                {resolved.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    Sin requisitos definidos para este cargo
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {draft.map((item) => {
                  const def = defs.find((d) => d.id === item.defId)
                  if (!def) return null
                  return (
                    <ReqItemEdit
                      key={item.defId}
                      item={item}
                      def={def}
                      onChange={(patch) => updateDraftItem(item.defId, patch)}
                    />
                  )
                })}
                <div className="flex gap-2 pt-2">
                  <Button size="sm" onClick={saveReqs} disabled={saving}>
                    {saving ? 'Guardando…' : 'Guardar cambios'}
                  </Button>
                  <Button size="sm" variant="outline" onClick={cancelEditReqs}>
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

// ─── Form dialog (create / edit) ──────────────────────────────────────────────

type FormState = {
  nombre: string
  cedula: string
  cargoId: string
  sedeId: string
  fechaIngreso: string
  estado: 'activo' | 'inactivo' | 'vacaciones' | 'licencia'
}

function PersonaFormDialog({
  open,
  onOpenChange,
  persona,
  cargos,
  sedes,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  persona: PersonaSGC | null
  cargos: CargoSGC[]
  sedes: ReturnType<typeof useSedes>
}) {
  const orgId = useOrgId()
  const createPersona = useCreatePersona()
  const updatePersona = useUpdatePersona()

  const [form, setForm] = useState<FormState>(() =>
    persona
      ? {
          nombre: persona.nombre,
          cedula: persona.cedula,
          cargoId: persona.cargoId as string,
          sedeId: persona.sedeId as string,
          fechaIngreso: persona.fechaIngreso,
          estado: persona.estado,
        }
      : {
          nombre: '',
          cedula: '',
          cargoId: '',
          sedeId: '',
          fechaIngreso: '',
          estado: 'activo',
        }
  )
  const [saving, setSaving] = useState(false)

  const set = (k: keyof FormState) => (v: string) =>
    setForm((f) => ({ ...f, [k]: v }))

  const valid =
    form.nombre.trim() &&
    form.cedula.trim() &&
    form.cargoId &&
    form.sedeId &&
    form.fechaIngreso

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!valid) return
    const cargo = cargos.find((c) => c._id === form.cargoId)
    const sede = sedes.find((s) => s._id === form.sedeId)
    if (!cargo || !sede) return
    setSaving(true)
    try {
      if (persona) {
        await updatePersona({
          id: persona._id,
          nombre: form.nombre,
          cedula: form.cedula,
          cargoId: form.cargoId as any,
          cargoCodigo: cargo.codigo,
          sedeId: form.sedeId as any,
          sedeCodigo: sede.codigo,
          fechaIngreso: form.fechaIngreso,
          estado: form.estado,
        })
      } else {
        await createPersona({
          orgId,
          nombre: form.nombre,
          cedula: form.cedula,
          cargoId: form.cargoId as any,
          cargoCodigo: cargo.codigo,
          sedeId: form.sedeId as any,
          sedeCodigo: sede.codigo,
          fechaIngreso: form.fechaIngreso,
          estado: form.estado,
        })
      }
      onOpenChange(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {persona ? 'Editar persona' : 'Agregar persona'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-1">
              <Label htmlFor="p-nombre">Nombre completo</Label>
              <Input
                id="p-nombre"
                value={form.nombre}
                onChange={(e) => set('nombre')(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="p-cedula">Cédula</Label>
              <Input
                id="p-cedula"
                value={form.cedula}
                onChange={(e) => set('cedula')(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="p-estado">Estado</Label>
              <Select value={form.estado} onValueChange={set('estado')}>
                <SelectTrigger id="p-estado">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="activo">Activo</SelectItem>
                  <SelectItem value="inactivo">Inactivo</SelectItem>
                  <SelectItem value="vacaciones">Vacaciones</SelectItem>
                  <SelectItem value="licencia">Licencia</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-1">
              <Label htmlFor="p-cargo">Cargo</Label>
              <Select value={form.cargoId} onValueChange={set('cargoId')}>
                <SelectTrigger id="p-cargo">
                  <SelectValue placeholder="Seleccionar cargo…" />
                </SelectTrigger>
                <SelectContent>
                  {cargos.map((c) => (
                    <SelectItem key={c._id} value={c._id}>
                      {c.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-1">
              <Label htmlFor="p-sede">Sede</Label>
              <Select value={form.sedeId} onValueChange={set('sedeId')}>
                <SelectTrigger id="p-sede">
                  <SelectValue placeholder="Seleccionar sede…" />
                </SelectTrigger>
                <SelectContent>
                  {sedes
                    .filter((s) => s.activa)
                    .map((s) => (
                      <SelectItem key={s._id} value={s._id}>
                        {s.nombre}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-1">
              <Label htmlFor="p-fecha">Fecha de ingreso</Label>
              <Input
                id="p-fecha"
                type="date"
                value={form.fechaIngreso}
                onChange={(e) => set('fechaIngreso')(e.target.value)}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={saving || !valid}>
              {saving ? 'Guardando…' : persona ? 'Guardar cambios' : 'Agregar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─── Suficiencia tab ───────────────────────────────────────────────────────────

function SuficienciaTab({
  personas,
  cargos,
  sedes,
}: {
  personas: PersonaSGC[]
  cargos: CargoSGC[]
  sedes: ReturnType<typeof useSedes>
}) {
  type Row = {
    cargo: CargoSGC
    sede: ReturnType<typeof useSedes>[number]
    activos: number
    ausentes: number
    total: number
  }

  const rows: Row[] = []
  for (const cargo of cargos) {
    for (const sede of sedes.filter((s) => s.activa)) {
      const group = personas.filter(
        (p) => p.cargo === cargo.id && p.sede === sede.codigo
      )
      if (group.length === 0) continue
      const activos = group.filter((p) => p.estado === 'activo').length
      const ausentes = group.filter(
        (p) => p.estado === 'vacaciones' || p.estado === 'licencia'
      ).length
      rows.push({ cargo, sede, activos, ausentes, total: group.length })
    }
  }

  if (rows.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-sm text-muted-foreground text-center py-10">
          Sin personal registrado para mostrar suficiencia.
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">
          Dotación actual por cargo y sede
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>CARGO</TableHead>
              <TableHead>TIPO</TableHead>
              <TableHead>SEDE</TableHead>
              <TableHead className="text-center">ACTIVOS</TableHead>
              <TableHead className="text-center">VAC / LIC</TableHead>
              <TableHead className="text-center">TOTAL</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={`${r.cargo._id}-${r.sede._id}`}>
                <TableCell className="font-medium">{r.cargo.nombre}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className="capitalize text-[0.65rem]"
                  >
                    {r.cargo.tipo ?? '—'}
                  </Badge>
                </TableCell>
                <TableCell>{r.sede.ciudad}</TableCell>
                <TableCell className="text-center">
                  <span
                    className={
                      r.activos === 0 ? 'text-red-400 font-semibold' : ''
                    }
                  >
                    {r.activos}
                  </span>
                </TableCell>
                <TableCell className="text-center text-muted-foreground">
                  {r.ausentes}
                </TableCell>
                <TableCell className="text-center font-medium">
                  {r.total}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

// ─── Cronograma tab ────────────────────────────────────────────────────────────

function CronogramaTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Capacitaciones programadas</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
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
  )
}

// ─── Req item edit (own component — needs useUploadThing hook) ────────────────

import type { RequisitoDef } from '#/lib/types'

function ReqItemEdit({
  item,
  def,
  onChange,
}: {
  item: RequisitoEstado
  def: RequisitoDef
  onChange: (patch: Partial<RequisitoEstado>) => void
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const { startUpload, isUploading } = useUploadThing('requisitoPersonal')

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    const res = await startUpload(files)
    if (res?.[0]?.url) {
      onChange({
        archivo: res[0].url,
        estado: item.estado === 'VIGENTE' ? 'VIGENTE' : 'POR_VALIDAR',
      })
    }
    // reset input so the same file can be re-selected
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <div className="rounded-lg border border-border bg-card/30 px-3 py-2 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="text-sm font-medium">{def.nombre}</div>
          <div className="text-[0.65rem] text-muted-foreground">{def.norma}</div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {item.archivo && (
            <a
              href={item.archivo}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[0.65rem] text-primary underline"
            >
              Ver doc
            </a>
          )}
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,image/*"
            className="hidden"
            onChange={handleFile}
          />
          <Button
            type="button"
            size="icon"
            variant={item.archivo ? 'default' : 'outline'}
            className="h-7 w-7"
            disabled={isUploading}
            onClick={() => fileRef.current?.click()}
            title="Adjuntar documento"
          >
            {isUploading ? (
              <span className="text-[0.55rem] animate-pulse">…</span>
            ) : (
              <Paperclip className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Select
          value={item.estado}
          onValueChange={(v) => onChange({ estado: v as EstadoRequisito })}
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="VIGENTE">Vigente</SelectItem>
            <SelectItem value="POR_VALIDAR">Por validar</SelectItem>
            <SelectItem value="SIN_CARGAR">Sin cargar</SelectItem>
            <SelectItem value="VENCIDO">Vencido</SelectItem>
            <SelectItem value="CRITICO">Crítico</SelectItem>
            <SelectItem value="NO_APLICA">No aplica</SelectItem>
          </SelectContent>
        </Select>
        <Input
          type="date"
          className="h-8 text-xs"
          value={item.fechaVigencia ?? ''}
          onChange={(e) =>
            onChange({ fechaVigencia: e.target.value || undefined })
          }
        />
      </div>
    </div>
  )
}

// ─── Badges ───────────────────────────────────────────────────────────────────

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

function ReqEstadoBadge({ estado }: { estado: EstadoRequisito }) {
  const styles: Record<EstadoRequisito, string> = {
    VIGENTE: 'bg-emerald-400/20 text-emerald-400 border-emerald-400/40',
    POR_VALIDAR: 'bg-yellow-400/20 text-yellow-400 border-yellow-400/40',
    SIN_CARGAR: 'bg-muted text-muted-foreground',
    VENCIDO: 'bg-red-400/20 text-red-400 border-red-400/40',
    CRITICO: 'bg-red-400/20 text-red-400 border-red-400/40',
    NO_APLICA: 'bg-muted text-muted-foreground',
  }
  return (
    <Badge
      variant="outline"
      className={`${styles[estado]} text-[0.65rem] shrink-0`}
    >
      {estado.replace('_', ' ')}
    </Badge>
  )
}
