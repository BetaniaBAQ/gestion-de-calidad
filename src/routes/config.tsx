import { createFileRoute } from '@tanstack/react-router'
import { Pencil, Plus } from 'lucide-react'
import { useState } from 'react'
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
import { useCargos } from '#/lib/domain/personal'
import { useConfigStore } from '#/lib/stores/config.store'
import { usePersonalStore } from '#/lib/stores/personal.store'
import type { Cargo, Rol, Sede, ServicioHabilitado, Usuario } from '#/lib/types'

export const Route = createFileRoute('/config')({
  component: ConfigPage,
})

const ROL_LABELS: Record<Rol, string> = {
  admin: 'Administrador',
  calidad: 'Coordinador Calidad',
  director: 'Director Médico',
  coordinador: 'Coordinador',
  aux_adm: 'Auxiliar Administrativo',
  view: 'Solo lectura',
}

const SERVICIOS_CATALOGO: ServicioHabilitado[] = [
  'Consulta externa',
  'Hematología',
  'Oncología',
  'Infusión IV',
]

// ── Sede Form ──────────────────────────────────────────────────────────────────

const SEDE_EMPTY: Omit<Sede, 'id'> = {
  nombre: '',
  ciudad: '',
  departamento: '',
  direccion: '',
  activa: true,
  servicios: [],
}

function SedeForm({
  initial,
  onSave,
  onCancel,
}: {
  initial: Partial<Sede>
  onSave: (s: Sede) => void
  onCancel: () => void
}) {
  const [form, setForm] = useState({ ...SEDE_EMPTY, ...initial })
  const [servicioCheck, setServicioCheck] = useState<ServicioHabilitado[]>(
    initial.servicios ?? []
  )

  function field<TKey extends keyof typeof SEDE_EMPTY>(
    k: TKey,
    v: (typeof SEDE_EMPTY)[TKey]
  ) {
    setForm((f) => ({ ...f, [k]: v }))
  }

  function toggleServicio(s: ServicioHabilitado) {
    setServicioCheck((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    )
  }

  function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault()
    const id =
      initial.id ??
      form.ciudad
        .toUpperCase()
        .slice(0, 3)
        .replace(/\s/g, '')
    onSave({ ...form, id, servicios: servicioCheck } as Sede)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label>Nombre / Código *</Label>
          <Input
            value={form.nombre}
            onChange={(e) => field('nombre', e.target.value)}
            required
            placeholder="Sede Barranquilla"
          />
        </div>
        <div className="space-y-1">
          <Label>Ciudad *</Label>
          <Input
            value={form.ciudad}
            onChange={(e) => field('ciudad', e.target.value)}
            required
          />
        </div>
        <div className="space-y-1">
          <Label>Departamento</Label>
          <Input
            value={form.departamento ?? ''}
            onChange={(e) =>
              setForm((f) => ({ ...f, departamento: e.target.value }))
            }
          />
        </div>
        <div className="space-y-1">
          <Label>Estado</Label>
          <Select
            value={form.activa ? 'activa' : 'inactiva'}
            onValueChange={(v) => field('activa', v === 'activa')}
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
          <Label>Dirección</Label>
          <Input
            value={form.direccion}
            onChange={(e) => field('direccion', e.target.value)}
          />
        </div>
        <div className="col-span-2 space-y-1">
          <Label>Servicios habilitados</Label>
          <div className="flex flex-wrap gap-2 pt-1">
            {SERVICIOS_CATALOGO.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => toggleServicio(s)}
                className={`rounded-full border px-2.5 py-1 text-xs transition-colors ${
                  servicioCheck.includes(s)
                    ? 'bg-primary/20 text-primary border-primary/40'
                    : 'border-border text-muted-foreground hover:border-primary/40'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
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
  const [docStr, setDocStr] = useState(
    (initial.docRequeridos ?? []).join('\n')
  )
  const [capStr, setCapStr] = useState(
    (initial.capRequeridas ?? []).join('\n')
  )

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
          <p className="text-[0.65rem] text-muted-foreground">
            Uno por línea
          </p>
          <Textarea
            value={docStr}
            onChange={(e) => setDocStr(e.target.value)}
            rows={4}
            placeholder={'Hoja de vida\nTítulo profesional\nTarjeta profesional'}
          />
        </div>
        <div className="space-y-1">
          <Label>Capacitaciones requeridas</Label>
          <p className="text-[0.65rem] text-muted-foreground">
            Una por línea
          </p>
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

// ── Usuario Form ──────────────────────────────────────────────────────────────

const USUARIO_EMPTY: Omit<Usuario, 'id'> = {
  nombre: '',
  email: '',
  rol: 'view',
  sede: 'BAQ',
  clave: '',
}

function UsuarioForm({
  initial,
  onSave,
  onCancel,
  sedes,
}: {
  initial: Partial<Usuario>
  onSave: (u: Usuario) => void
  onCancel: () => void
  sedes: { id: string; ciudad: string }[]
}) {
  const [form, setForm] = useState({ ...USUARIO_EMPTY, ...initial })

  function field<TKey extends keyof typeof USUARIO_EMPTY>(
    k: TKey,
    v: (typeof USUARIO_EMPTY)[TKey]
  ) {
    setForm((f) => ({ ...f, [k]: v }))
  }

  function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault()
    const id = initial.id ?? `USR-${Date.now()}`
    onSave({ ...form, id } as Usuario)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 space-y-1">
          <Label>Nombre completo *</Label>
          <Input
            value={form.nombre}
            onChange={(e) => field('nombre', e.target.value)}
            required
          />
        </div>
        <div className="space-y-1">
          <Label>Email *</Label>
          <Input
            type="email"
            value={form.email}
            onChange={(e) => field('email', e.target.value)}
            required
          />
        </div>
        <div className="space-y-1">
          <Label>{initial.id ? 'Nueva clave (vacío = no cambiar)' : 'Clave *'}</Label>
          <Input
            type="password"
            value={form.clave}
            onChange={(e) => field('clave', e.target.value)}
            required={!initial.id}
          />
        </div>
        <div className="space-y-1">
          <Label>Rol *</Label>
          <Select
            value={form.rol}
            onValueChange={(v) => field('rol', v as Rol)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(
                [
                  'admin',
                  'calidad',
                  'director',
                  'coordinador',
                  'aux_adm',
                  'view',
                ] as const
              ).map((r) => (
                <SelectItem key={r} value={r}>
                  {ROL_LABELS[r]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label>Sede</Label>
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
  const sedes = useSedes()
  const addSede = useConfigStore((s) => s.addSede)
  const updateSede = useConfigStore((s) => s.updateSede)
  const [dialog, setDialog] = useState<
    null | { mode: 'add' } | { mode: 'edit'; sede: Sede }
  >(null)

  function handleSave(sede: Sede) {
    if (dialog?.mode === 'edit') updateSede(sede.id, sede)
    else addSede(sede)
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
          <Card key={sede.id}>
            <CardContent className="pt-4 space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-foreground">
                    {sede.nombre || sede.ciudad}
                  </div>
                  <div className="text-[0.65rem] text-muted-foreground">
                    {sede.ciudad}
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
                {(sede.servicios ?? []).map((s) => (
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
                  onClick={() => setDialog({ mode: 'edit', sede })}
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
              initial={dialog.mode === 'edit' ? dialog.sede : {}}
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
  const cargos = useCargos()
  const addCargo = usePersonalStore((s) => s.addCargo)
  const updateCargo = usePersonalStore((s) => s.updateCargo)
  const [dialog, setDialog] = useState<
    null | { mode: 'add' } | { mode: 'edit'; cargo: Cargo }
  >(null)

  function handleSave(c: Cargo) {
    if (dialog?.mode === 'edit') updateCargo(c.id, c)
    else addCargo(c)
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
                <TableRow key={c.id}>
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
              onSave={handleSave}
              onCancel={() => setDialog(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

function UsuariosTab() {
  const usuarios = useConfigStore((s) => s.usuarios)
  const sedes = useSedes()
  const addUsuario = useConfigStore((s) => s.addUsuario)
  const updateUsuario = useConfigStore((s) => s.updateUsuario)
  const [dialog, setDialog] = useState<
    null | { mode: 'add' } | { mode: 'edit'; usuario: Usuario }
  >(null)

  function handleSave(u: Usuario) {
    if (dialog?.mode === 'edit') {
      const data: Partial<Usuario> =
        u.clave ? u : { ...u, clave: dialog.usuario.clave }
      updateUsuario(u.id, data)
    } else {
      addUsuario(u)
    }
    setDialog(null)
  }

  return (
    <>
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setDialog({ mode: 'add' })}>
          <Plus className="h-4 w-4 mr-1" /> Nuevo usuario
        </Button>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>NOMBRE</TableHead>
                <TableHead>EMAIL</TableHead>
                <TableHead>ROL</TableHead>
                <TableHead>SEDE</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {usuarios.map((u) => {
                const sede = sedes.find((s) => s.id === u.sede)
                return (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.nombre}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {u.email}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">
                        {ROL_LABELS[u.rol]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {sede?.ciudad ?? u.sede}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() =>
                          setDialog({ mode: 'edit', usuario: u })
                        }
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {dialog?.mode === 'edit' ? 'Editar usuario' : 'Nuevo usuario'}
            </DialogTitle>
          </DialogHeader>
          {dialog !== null && (
            <UsuarioForm
              initial={dialog.mode === 'edit' ? dialog.usuario : {}}
              onSave={handleSave}
              onCancel={() => setDialog(null)}
              sedes={sedes.filter((s) => s.activa)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
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
        Catálogo normativo (solo lectura). Actualizaciones por norma se
        reflejan desde el código fuente.
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
