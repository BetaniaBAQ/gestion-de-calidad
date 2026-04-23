import { createFileRoute } from '@tanstack/react-router'
import { ArrowRight, Edit2, FileText, Link2, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { KpiMeta } from '#/components/kpi-meta'
import { SedePills } from '#/components/sede-pills'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '#/components/ui/tabs'
import { Textarea } from '#/components/ui/textarea'
import { useSedes } from '#/lib/domain/config'
import {
  useCapacitaciones,
  useCreateCapacitacion,
  useRemoveCapacitacion,
  useUpdateCapacitacion,
} from '#/lib/domain/capacitaciones'
import type { CapacitacionSGC } from '#/lib/domain/capacitaciones'
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
import { useOrgId } from '#/lib/org-context'
import { useMutation } from 'convex/react'
import { api } from '@cualia/convex'
import type {
  EstadoRequisito,
  RequisitoDef,
  RequisitoEstado,
} from '#/lib/types'

export const Route = createFileRoute('/personal')({
  component: PersonalPage,
})

// ─── Page ─────────────────────────────────────────────────────────────────────

function PersonalPage() {
  const personasAll = usePersonasTodas()
  const personas = usePersonas()
  const cargos = useCargos()
  const sedes = useSedes()
  const caps = useCapacitaciones()

  const [detallePersona, setDetallePersona] = useState<PersonaSGC | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editPersona, setEditPersona] = useState<PersonaSGC | null>(null)

  const capsEjec = caps.filter((c) => c.estado === 'ejecutada').length
  const pctCapsEjec =
    caps.length > 0 ? Math.round((capsEjec / caps.length) * 1000) / 10 : 0
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
            onView={setDetallePersona}
          />
        </TabsContent>

        <TabsContent value="suficiencia">
          <SuficienciaTab
            personas={personasAll}
            cargos={cargos}
            sedes={sedes}
          />
        </TabsContent>

        <TabsContent value="cronograma">
          <CronogramaTab caps={caps} />
        </TabsContent>
      </Tabs>

      {detallePersona && (
        <PersonaDetalleDialog
          persona={detallePersona}
          cargos={cargos}
          sedes={sedes}
          onClose={() => setDetallePersona(null)}
          onEdit={(p) => {
            setDetallePersona(null)
            setEditPersona(p)
            setFormOpen(true)
          }}
        />
      )}

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

// ─── Detalle dialog (2 columnas) ──────────────────────────────────────────────

function PersonaDetalleDialog({
  persona,
  cargos,
  sedes,
  onClose,
  onEdit,
}: {
  persona: PersonaSGC
  cargos: CargoSGC[]
  sedes: ReturnType<typeof useSedes>
  onClose: () => void
  onEdit: (p: PersonaSGC) => void
}) {
  const removePersona = useRemovePersona()
  const updatePersona = useUpdatePersona()
  const [editReqs, setEditReqs] = useState(false)
  const [draft, setDraft] = useState<RequisitoEstado[]>([])
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [saving, setSaving] = useState(false)

  const cargo = cargos.find((c) => c.id === persona.cargo)
  const sede = sedes.find((s) => s.codigo === persona.sede)
  const resolved = resolveRequisitos(persona)
  const defs = getRequisitosDefsByCargo(persona.cargo)

  function startEditReqs() {
    const byId = new Map(persona.requisitos.map((r) => [r.defId, r]))
    setDraft(
      defs.map((def) => ({
        defId: def.id,
        estado:
          byId.get(def.id)?.estado ?? (def.critico ? 'CRITICO' : 'SIN_CARGAR'),
        fechaVigencia: byId.get(def.id)?.fechaVigencia ?? undefined,
        observacion: byId.get(def.id)?.observacion ?? undefined,
        fileUrl: byId.get(def.id)?.fileUrl ?? undefined,
      }))
    )
    setEditReqs(true)
  }

  function updateDraftItem(defId: string, patch: Partial<RequisitoEstado>) {
    setDraft((prev) =>
      prev.map((r) => (r.defId === defId ? { ...r, ...patch } : r))
    )
  }

  function cleanDraft(d: RequisitoEstado[]) {
    return d.map((r) => ({ ...r, fechaVigencia: r.fechaVigencia ?? undefined }))
  }

  async function saveReqs() {
    setSaving(true)
    try {
      await updatePersona({ id: persona._id, requisitos: cleanDraft(draft) })
      setEditReqs(false)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    await removePersona({ id: persona._id })
    onClose()
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-5xl w-full p-0 gap-0 flex flex-col overflow-hidden max-h-[90vh]">
        <DialogHeader className="px-6 pt-5 pb-4 border-b border-border shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <DialogTitle className="text-lg">{persona.nombre}</DialogTitle>
              <DialogDescription className="mt-0.5">
                {cargo?.nombre ?? persona.cargo} ·{' '}
                {sede?.ciudad ?? persona.sede}
              </DialogDescription>
            </div>
            <div className="flex gap-1 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(persona)}
              >
                <Edit2 className="h-3.5 w-3.5 mr-1" /> Editar
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-destructive hover:text-destructive border-destructive/30"
                onClick={() => setConfirmDelete(true)}
              >
                <Trash2 className="h-3.5 w-3.5 mr-1" /> Eliminar
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
        </DialogHeader>

        <div className="grid grid-cols-[220px_1fr] flex-1 min-h-0 overflow-hidden">
          {/* columna izquierda: datos */}
          <div className="border-r border-border overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border">
            <div className="px-5 py-5 space-y-3 text-sm">
              <InfoRow label="Cédula" value={persona.cedula} />
              <InfoRow
                label="Fecha ingreso"
                value={
                  persona.fechaIngreso
                    ? new Date(persona.fechaIngreso).toLocaleDateString('es-CO')
                    : '—'
                }
              />
              <InfoRow
                label="Estado"
                value={<span className="capitalize">{persona.estado}</span>}
              />
              <InfoRow
                label="Completitud"
                value={`${completitudPersona(persona)}%`}
              />
              {cargo?.area && <InfoRow label="Área" value={cargo.area} />}
            </div>
          </div>

          {/* columna derecha: requisitos */}
          <div className="flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <h4 className="text-sm font-semibold">Requisitos normativos</h4>
              {!editReqs && defs.length > 0 && (
                <Button size="sm" variant="outline" onClick={startEditReqs}>
                  <Edit2 className="h-3 w-3 mr-1" /> Editar
                </Button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border">
              <div className="px-5 pb-5 space-y-2">
                {!editReqs ? (
                  <>
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
                        {(() => {
                          const url = persona.requisitos.find(
                            (r) => r.defId === i.def.id
                          )?.fileUrl
                          return url ? (
                            <a
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[0.65rem] font-medium text-primary hover:bg-primary/20 transition-colors"
                            >
                              <FileText className="h-2.5 w-2.5" /> Ver doc
                            </a>
                          ) : null
                        })()}
                      </div>
                    ))}
                    {resolved.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-10">
                        Sin requisitos definidos para este cargo
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    {draft.map((item) => {
                      const def = defs.find((d) => d.id === item.defId)
                      if (!def) return null
                      return (
                        <ReqItemEdit
                          key={item.defId}
                          item={item}
                          def={def}
                          onChange={(patch) =>
                            updateDraftItem(item.defId, patch)
                          }
                        />
                      )
                    })}
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" onClick={saveReqs} disabled={saving}>
                        {saving ? 'Guardando…' : 'Guardar cambios'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditReqs(false)}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <span className="text-muted-foreground text-xs">{label}</span>
      <p className="font-medium text-sm mt-0.5">{value}</p>
    </div>
  )
}

// ─── Req item edit ─────────────────────────────────────────────────────────────

function ReqItemEdit({
  item,
  def,
  onChange,
}: {
  item: RequisitoEstado
  def: RequisitoDef
  onChange: (patch: Partial<RequisitoEstado>) => void
}) {
  const [showUrl, setShowUrl] = useState(false)
  const [urlInput, setUrlInput] = useState(item.fileUrl ?? '')

  function commitUrl() {
    const url = urlInput.trim()
    const patch: Partial<RequisitoEstado> = {
      fileUrl: url || undefined,
      estado: url && item.estado === 'SIN_CARGAR' ? 'POR_VALIDAR' : item.estado,
    }
    onChange(patch)
    setShowUrl(false)
  }

  return (
    <div className="rounded-lg border border-border bg-card/30 px-3 py-2 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="text-sm font-medium">{def.nombre}</div>
          <div className="text-[0.65rem] text-muted-foreground">
            {def.norma}
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {item.fileUrl && !showUrl && (
            <a
              href={item.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[0.65rem] font-medium text-primary hover:bg-primary/20 transition-colors"
            >
              <FileText className="h-2.5 w-2.5" /> Ver doc
            </a>
          )}
          <Button
            type="button"
            size="icon"
            variant={item.fileUrl ? 'default' : 'outline'}
            className="h-7 w-7"
            onClick={() => {
              setUrlInput(item.fileUrl ?? '')
              setShowUrl((v) => !v)
            }}
            title="Enlace al documento"
          >
            <Link2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
      {showUrl && (
        <div className="flex gap-1">
          <Input
            autoFocus
            placeholder="https://... (SharePoint, Drive, etc.)"
            className="h-7 text-xs flex-1"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                commitUrl()
              }
            }}
          />
          <Button
            type="button"
            size="sm"
            className="h-7 text-xs px-2"
            onClick={commitUrl}
          >
            OK
          </Button>
        </div>
      )}
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

// ─── Form dialog persona (create / edit) ──────────────────────────────────────

type PersonaForm = {
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

  const [form, setForm] = useState<PersonaForm>(() =>
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

  const set = (k: keyof PersonaForm) => (v: string) =>
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
    key: string
    cargo: CargoSGC
    sede: (typeof sedes)[number]
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
      rows.push({
        key: `${cargo._id}-${sede._id}`,
        cargo,
        sede,
        activos: group.filter((p) => p.estado === 'activo').length,
        ausentes: group.filter(
          (p) => p.estado === 'vacaciones' || p.estado === 'licencia'
        ).length,
        total: group.length,
      })
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
              <TableRow key={r.key}>
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

// ─── Cronograma tab (CRUD completo) ───────────────────────────────────────────

function CronogramaTab({ caps }: { caps: CapacitacionSGC[] }) {
  const orgId = useOrgId()
  const [formOpen, setFormOpen] = useState(false)
  const [editCap, setEditCap] = useState<CapacitacionSGC | null>(null)
  const [seeding, setSeeding] = useState(false)
  const remove = useRemoveCapacitacion()
  const seed = useMutation(api.seed.seedBetania)

  const ejec = caps.filter((c) => c.estado === 'ejecutada').length
  const pct = caps.length > 0 ? Math.round((ejec / caps.length) * 1000) / 10 : 0

  async function handleSeed() {
    if (!orgId) return
    setSeeding(true)
    try {
      await seed({ orgId })
    } finally {
      setSeeding(false)
    }
  }

  return (
    <div className="space-y-4">
      {caps.length === 0 && (
        <div className="rounded-lg border border-dashed border-border p-6 text-center space-y-3">
          <p className="text-sm text-muted-foreground">
            Sin capacitaciones programadas. Carga las normativas requeridas para
            una IPS oncológica.
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={handleSeed}
            disabled={seeding}
          >
            {seeding ? 'Cargando…' : 'Cargar capacitaciones normativas'}
          </Button>
        </div>
      )}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {caps.length > 0 ? `${ejec}/${caps.length} ejecutadas (${pct}%)` : ''}
        </div>
        <div className="flex gap-2">
          {caps.length > 0 && (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleSeed}
              disabled={seeding}
              className="text-muted-foreground"
            >
              {seeding ? 'Cargando…' : 'Cargar normativas'}
            </Button>
          )}
          <Button
            size="sm"
            onClick={() => {
              setEditCap(null)
              setFormOpen(true)
            }}
          >
            <Plus className="h-4 w-4 mr-1" /> Nueva capacitación
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>NOMBRE</TableHead>
                <TableHead>ÁREA</TableHead>
                <TableHead>RESPONSABLE</TableHead>
                <TableHead>FECHA OBJETIVO</TableHead>
                <TableHead>ESTADO</TableHead>
                <TableHead>EVIDENCIA</TableHead>
                <TableHead className="text-right">ACCIÓN</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {caps.map((c) => (
                <TableRow key={c._id}>
                  <TableCell className="font-medium">{c.nombre}</TableCell>
                  <TableCell>{c.area}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {c.responsable}
                  </TableCell>
                  <TableCell>
                    {new Date(c.fechaObjetivo).toLocaleDateString('es-CO')}
                  </TableCell>
                  <TableCell>
                    <CapEstadoBadge estado={c.estado} />
                  </TableCell>
                  <TableCell>
                    {c.evidenciaUrl ? (
                      <a
                        href={c.evidenciaUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-full bg-emerald-400/10 px-2 py-0.5 text-[0.65rem] font-medium text-emerald-500 hover:bg-emerald-400/20 transition-colors"
                      >
                        <FileText className="h-2.5 w-2.5" /> Ver
                      </a>
                    ) : c.estado === 'ejecutada' ? (
                      <span className="text-[0.65rem] text-yellow-500">
                        Pendiente
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => {
                          setEditCap(c)
                          setFormOpen(true)
                        }}
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => remove({ id: c._id })}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <CapacitacionFormDialog
        key={editCap ? editCap._id : 'new-cap'}
        open={formOpen}
        onOpenChange={(o) => {
          if (!o) {
            setFormOpen(false)
            setEditCap(null)
          }
        }}
        cap={editCap}
      />
    </div>
  )
}

type CapForm = {
  nombre: string
  area: string
  fechaObjetivo: string
  responsable: string
  estado: 'programada' | 'ejecutada' | 'cancelada'
  observaciones: string
  evidenciaUrl: string
}

function CapacitacionFormDialog({
  open,
  onOpenChange,
  cap,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  cap: CapacitacionSGC | null
}) {
  const orgId = useOrgId()
  const create = useCreateCapacitacion()
  const update = useUpdateCapacitacion()

  const [form, setForm] = useState<CapForm>(() =>
    cap
      ? {
          nombre: cap.nombre,
          area: cap.area,
          fechaObjetivo: cap.fechaObjetivo,
          responsable: cap.responsable,
          estado: cap.estado,
          observaciones: cap.observaciones ?? '',
          evidenciaUrl: cap.evidenciaUrl ?? '',
        }
      : {
          nombre: '',
          area: '',
          fechaObjetivo: '',
          responsable: '',
          estado: 'programada',
          observaciones: '',
          evidenciaUrl: '',
        }
  )
  const [saving, setSaving] = useState(false)
  const set = (k: keyof CapForm) => (v: string) =>
    setForm((f) => ({ ...f, [k]: v }))
  const valid =
    form.nombre.trim() &&
    form.area.trim() &&
    form.fechaObjetivo &&
    form.responsable.trim()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!valid) return
    setSaving(true)
    try {
      if (cap) {
        await update({
          id: cap._id,
          nombre: form.nombre,
          area: form.area,
          fechaObjetivo: form.fechaObjetivo,
          responsable: form.responsable,
          estado: form.estado,
          observaciones: form.observaciones || undefined,
          evidenciaUrl: form.evidenciaUrl || undefined,
        })
      } else {
        await create({
          orgId,
          nombre: form.nombre,
          area: form.area,
          fechaObjetivo: form.fechaObjetivo,
          responsable: form.responsable,
          estado: form.estado,
          observaciones: form.observaciones || undefined,
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
            {cap ? 'Editar capacitación' : 'Nueva capacitación'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3 pt-1">
          <div className="space-y-1">
            <Label htmlFor="c-nombre">Nombre</Label>
            <Input
              id="c-nombre"
              value={form.nombre}
              onChange={(e) => set('nombre')(e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="c-area">Área</Label>
              <Input
                id="c-area"
                value={form.area}
                onChange={(e) => set('area')(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="c-estado">Estado</Label>
              <Select value={form.estado} onValueChange={set('estado')}>
                <SelectTrigger id="c-estado">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="programada">Programada</SelectItem>
                  <SelectItem value="ejecutada">Ejecutada</SelectItem>
                  <SelectItem value="cancelada">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="c-fecha">Fecha objetivo</Label>
              <Input
                id="c-fecha"
                type="date"
                value={form.fechaObjetivo}
                onChange={(e) => set('fechaObjetivo')(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="c-resp">Responsable</Label>
              <Input
                id="c-resp"
                value={form.responsable}
                onChange={(e) => set('responsable')(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="c-obs">Observaciones</Label>
            <Textarea
              id="c-obs"
              value={form.observaciones}
              onChange={(e) => set('observaciones')(e.target.value)}
              rows={2}
              className="resize-none"
            />
          </div>
          {form.estado === 'ejecutada' && (
            <div className="space-y-1">
              <Label
                htmlFor="c-evidencia"
                className="flex items-center gap-1.5"
              >
                <FileText className="h-3.5 w-3.5 text-emerald-500" />
                Evidencia de cumplimiento
                <span className="text-[0.65rem] text-muted-foreground font-normal">
                  (lista asistencia, certificado…)
                </span>
              </Label>
              <Input
                id="c-evidencia"
                placeholder="https://... SharePoint, Drive, etc."
                value={form.evidenciaUrl}
                onChange={(e) => set('evidenciaUrl')(e.target.value)}
              />
            </div>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={saving || !valid}>
              {saving ? 'Guardando…' : cap ? 'Guardar cambios' : 'Agregar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
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

function CapEstadoBadge({ estado }: { estado: CapacitacionSGC['estado'] }) {
  const styles: Record<CapacitacionSGC['estado'], string> = {
    programada: 'bg-yellow-400/20 text-yellow-400 border-yellow-400/40',
    ejecutada: 'bg-emerald-400/20 text-emerald-400 border-emerald-400/40',
    cancelada: 'bg-muted text-muted-foreground',
  }
  return (
    <Badge variant="outline" className={`${styles[estado]} capitalize`}>
      {estado}
    </Badge>
  )
}
