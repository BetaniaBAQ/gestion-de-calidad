import { createFileRoute } from '@tanstack/react-router'
import { Pencil, Plus } from 'lucide-react'
import { useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '@cualia/convex'
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
import { HABILITACION_CATALOGO } from '#/lib/data-catalogs'
import { useSedes } from '#/lib/domain/config'
import {
  useCargos,
  useCreateCargo,
  useUpdateCargo,
} from '#/lib/domain/personal'
import type { CargoSGC } from '#/lib/domain/personal'
import { useOrgId } from '#/lib/org-context'
import type { Cargo, Rol } from '#/lib/types'
import type { GenericId } from 'convex/values'

type Id<T extends string> = GenericId<T>

export const Route = createFileRoute('/config')({
  component: ConfigPage,
})

const ROL_LABELS: Record<Rol, string> = {
  admin: 'Administrador',
  calidad: 'Coordinador Calidad',
  director: 'Director Médico',
  coordinador: 'Coordinador',
  farmaceutico: 'Químico Farmacéutico',
  view: 'Solo lectura',
}

// ── Sede Form ──────────────────────────────────────────────────────────────────

type SedeFormData = {
  codigo: string
  nombre: string
  ciudad: string
  departamento: string
  direccion: string
  activa: boolean
  servicios: string[]
}

const SEDE_EMPTY: SedeFormData = {
  codigo: '',
  nombre: '',
  ciudad: '',
  departamento: '',
  direccion: '',
  activa: true,
  servicios: [],
}

function SedeForm({
  initial,
  isEdit,
  onSave,
  onCancel,
}: {
  initial: Partial<SedeFormData>
  isEdit: boolean
  onSave: (data: SedeFormData) => void
  onCancel: () => void
}) {
  const [form, setForm] = useState<SedeFormData>({
    ...SEDE_EMPTY,
    ...initial,
  })
  const [serviciosStr, setServiciosStr] = useState(
    (initial.servicios ?? []).join('\n')
  )

  function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault()
    const codigo =
      form.codigo || form.ciudad.toUpperCase().slice(0, 3).replace(/\s/g, '')
    const servicios = serviciosStr
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean)
    onSave({ ...form, codigo, servicios })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {!isEdit && (
          <div className="space-y-1">
            <Label>Código *</Label>
            <Input
              value={form.codigo}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  codigo: e.target.value.toUpperCase().slice(0, 4),
                }))
              }
              placeholder="BAQ"
              required
            />
          </div>
        )}
        <div className={isEdit ? 'col-span-2' : ''}>
          <div className="space-y-1">
            <Label>Nombre / Razón social *</Label>
            <Input
              value={form.nombre}
              onChange={(e) =>
                setForm((f) => ({ ...f, nombre: e.target.value }))
              }
              required
              placeholder="Betania Barranquilla"
            />
          </div>
        </div>
        <div className="space-y-1">
          <Label>Ciudad *</Label>
          <Input
            value={form.ciudad}
            onChange={(e) => setForm((f) => ({ ...f, ciudad: e.target.value }))}
            required
          />
        </div>
        <div className="space-y-1">
          <Label>Departamento</Label>
          <Input
            value={form.departamento}
            onChange={(e) =>
              setForm((f) => ({ ...f, departamento: e.target.value }))
            }
          />
        </div>
        <div className="col-span-2 space-y-1">
          <Label>Dirección</Label>
          <Input
            value={form.direccion}
            onChange={(e) =>
              setForm((f) => ({ ...f, direccion: e.target.value }))
            }
          />
        </div>
        <div className="space-y-1">
          <Label>Estado</Label>
          <Select
            value={form.activa ? 'activa' : 'inactiva'}
            onValueChange={(v) =>
              setForm((f) => ({ ...f, activa: v === 'activa' }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="activa">Activa</SelectItem>
              <SelectItem value="inactiva">Inactiva</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="col-span-2 space-y-1">
          <Label>Servicios habilitados REPS</Label>
          <p className="text-[0.65rem] text-muted-foreground">Uno por línea</p>
          <Textarea
            value={serviciosStr}
            onChange={(e) => setServiciosStr(e.target.value)}
            rows={6}
            placeholder={
              'Hematología\nOncología Clínica\nServicio Farmacéutico'
            }
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

// ── Cargo Form ──────────────────────────────────────────────────────────────────

const CARGO_EMPTY: Omit<Cargo, 'id'> = {
  nombre: '',
  tipo: 'asistencial',
  area: '',
  perfil: '',
  docRequeridos: [],
  capRequeridas: [],
}

function CargoForm({
  initial,
  onSave,
  onCancel,
}: {
  initial: Partial<Cargo>
  onSave: (c: Cargo) => void
  onCancel: () => void
}) {
  const [form, setForm] = useState({ ...CARGO_EMPTY, ...initial })
  const [docStr, setDocStr] = useState((initial.docRequeridos ?? []).join('\n'))
  const [capStr, setCapStr] = useState((initial.capRequeridas ?? []).join('\n'))

  function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault()
    const id = initial.id ?? `CARGO-${Date.now()}`
    onSave({
      ...form,
      id,
      docRequeridos: docStr
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      capRequeridas: capStr
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label>Nombre del cargo *</Label>
          <Input
            value={form.nombre}
            onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
            required
          />
        </div>
        <div className="space-y-1">
          <Label>Tipo</Label>
          <Select
            value={form.tipo}
            onValueChange={(v) =>
              setForm((f) => ({ ...f, tipo: v as Cargo['tipo'] }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asistencial">Asistencial</SelectItem>
              <SelectItem value="administrativo">Administrativo</SelectItem>
              <SelectItem value="apoyo">Apoyo</SelectItem>
              <SelectItem value="directivo">Directivo</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label>Área</Label>
          <Input
            value={form.area}
            onChange={(e) => setForm((f) => ({ ...f, area: e.target.value }))}
          />
        </div>
        <div className="col-span-2 space-y-1">
          <Label>Perfil / Descripción</Label>
          <Textarea
            value={form.perfil}
            onChange={(e) => setForm((f) => ({ ...f, perfil: e.target.value }))}
            rows={2}
          />
        </div>
        <div className="space-y-1">
          <Label>Documentos requeridos</Label>
          <p className="text-[0.65rem] text-muted-foreground">Uno por línea</p>
          <Textarea
            value={docStr}
            onChange={(e) => setDocStr(e.target.value)}
            rows={4}
            placeholder={
              'Hoja de vida\nTítulo profesional\nTarjeta profesional'
            }
          />
        </div>
        <div className="space-y-1">
          <Label>Capacitaciones requeridas</Label>
          <p className="text-[0.65rem] text-muted-foreground">Una por línea</p>
          <Textarea
            value={capStr}
            onChange={(e) => setCapStr(e.target.value)}
            rows={4}
            placeholder={'Inducción SGC\nRCP\nManejo de residuos'}
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

// ── Tabs ──────────────────────────────────────────────────────────────────────

function SedesTab() {
  const orgId = useOrgId()
  const sedes = useSedes()
  const createSede = useMutation(api.sedes.create)
  const updateSede = useMutation(api.sedes.update)

  type DialogState =
    | null
    | { mode: 'add' }
    | { mode: 'edit'; sedeId: Id<'sedes'>; data: SedeFormData }

  const [dialog, setDialog] = useState<DialogState>(null)

  async function handleSave(data: SedeFormData) {
    if (dialog?.mode === 'edit') {
      await updateSede({
        id: dialog.sedeId,
        nombre: data.nombre,
        ciudad: data.ciudad,
        departamento: data.departamento || undefined,
        direccion: data.direccion,
        activa: data.activa,
        servicios: data.servicios,
      })
    } else {
      await createSede({
        orgId,
        codigo: data.codigo,
        nombre: data.nombre,
        ciudad: data.ciudad,
        departamento: data.departamento || undefined,
        direccion: data.direccion,
        servicios: data.servicios,
      })
    }
    setDialog(null)
  }

  return (
    <>
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setDialog({ mode: 'add' })}>
          <Plus className="h-4 w-4 mr-1" /> Nueva sede
        </Button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {sedes.map((sede) => (
          <Card key={sede._id}>
            <CardContent className="pt-4 space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-foreground">
                    {sede.nombre || sede.ciudad}
                  </div>
                  <div className="text-[0.65rem] text-muted-foreground">
                    [{sede.codigo}] {sede.ciudad}
                    {sede.departamento ? `, ${sede.departamento}` : ''}
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={
                    sede.activa
                      ? 'bg-emerald-400/20 text-emerald-400 border-emerald-400/40'
                      : 'bg-zinc-400/20 text-zinc-400 border-zinc-400/40'
                  }
                >
                  {sede.activa ? 'Activa' : 'Inactiva'}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-1">
                {sede.servicios.map((s) => (
                  <Badge key={s} variant="secondary" className="text-[0.6rem]">
                    {s}
                  </Badge>
                ))}
              </div>
              {sede.direccion && (
                <div className="text-[0.65rem] text-muted-foreground">
                  {sede.direccion}
                </div>
              )}
              <div className="flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setDialog({
                      mode: 'edit',
                      sedeId: sede._id,
                      data: {
                        codigo: sede.codigo,
                        nombre: sede.nombre,
                        ciudad: sede.ciudad,
                        departamento: sede.departamento ?? '',
                        direccion: sede.direccion,
                        activa: sede.activa,
                        servicios: sede.servicios,
                      },
                    })
                  }
                >
                  <Pencil className="h-3.5 w-3.5 mr-1" /> Editar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog
        open={dialog !== null}
        onOpenChange={(open) => {
          if (!open) setDialog(null)
        }}
      >
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {dialog?.mode === 'edit' ? 'Editar sede' : 'Nueva sede'}
            </DialogTitle>
          </DialogHeader>
          {dialog !== null && (
            <SedeForm
              initial={dialog.mode === 'edit' ? dialog.data : {}}
              isEdit={dialog.mode === 'edit'}
              onSave={handleSave}
              onCancel={() => setDialog(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

function CargosTab() {
  const orgId = useOrgId()
  const cargos = useCargos()
  const createCargo = useCreateCargo()
  const updateCargoMutation = useUpdateCargo()
  const [dialog, setDialog] = useState<
    null | { mode: 'add' } | { mode: 'edit'; cargo: CargoSGC }
  >(null)

  async function handleSave(c: Cargo) {
    if (!orgId) return
    if (dialog?.mode === 'edit') {
      await updateCargoMutation({
        id: dialog.cargo._id,
        nombre: c.nombre,
        area: c.area,
        perfil: c.perfil,
        docRequeridos: c.docRequeridos,
        capRequeridas: c.capRequeridas,
      })
    } else {
      await createCargo({
        orgId,
        codigo: c.nombre.toUpperCase().replace(/\s+/g, '_').slice(0, 20),
        nombre: c.nombre,
        tipo: c.tipo,
        area: c.area,
        perfil: c.perfil,
        docRequeridos: c.docRequeridos,
        capRequeridas: c.capRequeridas,
      })
    }
    setDialog(null)
  }

  return (
    <>
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setDialog({ mode: 'add' })}>
          <Plus className="h-4 w-4 mr-1" /> Nuevo cargo
        </Button>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>CARGO</TableHead>
                <TableHead>ÁREA</TableHead>
                <TableHead>DOCS REQ.</TableHead>
                <TableHead>CAPS REQ.</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {cargos.map((c) => (
                <TableRow key={c._id}>
                  <TableCell className="font-medium">{c.nombre}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {c.area}
                  </TableCell>
                  <TableCell>{c.docRequeridos.length}</TableCell>
                  <TableCell>{c.capRequeridas.length}</TableCell>
                  <TableCell>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={() => setDialog({ mode: 'edit', cargo: c })}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog
        open={dialog !== null}
        onOpenChange={(open) => {
          if (!open) setDialog(null)
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {dialog?.mode === 'edit' ? 'Editar cargo' : 'Nuevo cargo'}
            </DialogTitle>
          </DialogHeader>
          {dialog !== null && (
            <CargoForm
              initial={dialog.mode === 'edit' ? dialog.cargo : {}}
              onSave={(c) => void handleSave(c)}
              onCancel={() => setDialog(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

function UsuariosTab() {
  const orgId = useOrgId()
  const sedes = useSedes()
  const usuarios =
    useQuery(api.usuarios.listByOrg, orgId ? { orgId } : 'skip') ?? []
  const updateUsuario = useMutation(api.usuarios.update)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingRol, setEditingRol] = useState<Rol>('view')

  function startEdit(id: string, rol: Rol) {
    setEditingId(id)
    setEditingRol(rol)
  }

  async function saveRol(id: Id<'usuarios'>) {
    await updateUsuario({ id, rol: editingRol })
    setEditingId(null)
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>NOMBRE</TableHead>
              <TableHead>EMAIL</TableHead>
              <TableHead>ROL</TableHead>
              <TableHead>SEDE</TableHead>
              <TableHead className="w-24" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {usuarios.map((u) => {
              const sede = sedes.find((s) => s._id === u.sedeId)
              return (
                <TableRow key={u._id}>
                  <TableCell className="font-medium">{u.nombre}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {u.email}
                  </TableCell>
                  <TableCell>
                    {editingId === u._id ? (
                      <Select
                        value={editingRol}
                        onValueChange={(v) => setEditingRol(v as Rol)}
                      >
                        <SelectTrigger className="h-7 text-xs w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {(
                            [
                              'admin',
                              'calidad',
                              'director',
                              'coordinador',
                              'farmaceutico',
                              'view',
                            ] as const
                          ).map((r) => (
                            <SelectItem key={r} value={r}>
                              {ROL_LABELS[r]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge variant="secondary" className="text-xs">
                        {ROL_LABELS[u.rol as Rol]}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {sede?.ciudad ?? '—'}
                  </TableCell>
                  <TableCell>
                    {editingId === u._id ? (
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          className="h-7 text-xs px-2"
                          onClick={() => saveRol(u._id)}
                        >
                          Guardar
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs px-2"
                          onClick={() => setEditingId(null)}
                        >
                          ✕
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => startEdit(u._id, u.rol as Rol)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
            {usuarios.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center text-muted-foreground text-sm py-8"
                >
                  Sin usuarios registrados. Los usuarios se crean al iniciar
                  sesión.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

function ItemsHabilitacionTab() {
  const categorias: Record<string, string> = {
    rh: 'Recurso Humano',
    infra: 'Infraestructura',
    dotacion: 'Dotación',
    procesos: 'Procesos',
    reps: 'Habilitación REPS',
  }
  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        Catálogo normativo (solo lectura). Actualizaciones por norma se reflejan
        desde el código fuente.
      </p>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>CATEGORÍA</TableHead>
                <TableHead>DESCRIPCIÓN</TableHead>
                <TableHead>NORMA</TableHead>
                <TableHead>AUTO</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {HABILITACION_CATALOGO.map((i) => (
                <TableRow key={i.id}>
                  <TableCell className="text-xs uppercase text-muted-foreground">
                    {categorias[i.categoria] ?? i.categoria}
                  </TableCell>
                  <TableCell className="text-sm">{i.descripcion}</TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {i.norma}
                  </TableCell>
                  <TableCell>
                    {i.auto ? (
                      <Badge
                        variant="outline"
                        className="bg-primary/10 text-primary border-primary/20 text-xs"
                      >
                        Auto
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-xs">
                        Manual
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

function ConfigPage() {
  return (
    <Tabs defaultValue="sedes" className="space-y-4">
      <TabsList>
        <TabsTrigger value="sedes">Sedes</TabsTrigger>
        <TabsTrigger value="cargos">Cargos</TabsTrigger>
        <TabsTrigger value="usuarios">Usuarios</TabsTrigger>
        <TabsTrigger value="items-hab">Ítem Habilitación</TabsTrigger>
      </TabsList>

      <TabsContent value="sedes" className="space-y-4">
        <SedesTab />
      </TabsContent>
      <TabsContent value="cargos" className="space-y-4">
        <CargosTab />
      </TabsContent>
      <TabsContent value="usuarios" className="space-y-4">
        <UsuariosTab />
      </TabsContent>
      <TabsContent value="items-hab" className="space-y-4">
        <ItemsHabilitacionTab />
      </TabsContent>
    </Tabs>
  )
}
