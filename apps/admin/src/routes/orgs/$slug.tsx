import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useAction, useConvexAuth, useMutation, useQuery } from 'convex/react'
import { api } from '@cualia/convex'
import {
  ArrowLeft,
  Building2,
  Edit2,
  Mail,
  Save,
  Shield,
  Users,
  X,
} from 'lucide-react'
import { Badge } from '@cualia/ui/components/badge'
import { Button } from '@cualia/ui/components/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@cualia/ui/components/card'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@cualia/ui/components/tabs'

export const Route = createFileRoute('/orgs/$slug')({
  component: OrgDetailPage,
})

function useAuthArgs(): Record<string, never> | 'skip' {
  const { isAuthenticated } = useConvexAuth()
  return isAuthenticated ? {} : 'skip'
}

const ROLES = [
  'admin',
  'calidad',
  'director',
  'coordinador',
  'farmaceutico',
  'view',
] as const

const ROL_LABELS: Record<string, string> = {
  admin: 'Admin',
  calidad: 'Calidad',
  director: 'Director',
  coordinador: 'Coordinador',
  farmaceutico: 'Farmacéutico',
  view: 'Solo lectura',
}

const MODULOS = [
  { key: 'th', label: 'Talento Humano' },
  { key: 'dotacion', label: 'Dotación' },
  { key: 'mantenimiento', label: 'Mantenimiento' },
  { key: 'habilitacion', label: 'Habilitación' },
  { key: 'indicadores', label: 'Indicadores' },
  { key: 'documentos', label: 'Gestión Documental' },
  { key: 'medicamentos', label: 'Medicamentos' },
  { key: 'proveedores', label: 'Proveedores' },
  { key: 'pamec', label: 'PAMEC' },
  { key: 'auditoria', label: 'Auditoría' },
  { key: 'seguridad_paciente', label: 'Seguridad Paciente' },
] as const

function OrgDetailPage() {
  const { slug } = Route.useParams()
  const tenant = useQuery(api.tenants.getBySlugAdmin, { slug })
  const stats = useQuery(
    api.tenants.getStats,
    tenant ? { orgId: tenant.orgId } : 'skip'
  )

  if (tenant === undefined) {
    return (
      <div className="max-w-4xl mx-auto p-4 text-muted-foreground">
        Cargando...
      </div>
    )
  }
  if (!tenant) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <p className="text-destructive">Organización no encontrada</p>
        <Link to="/orgs" className="text-primary text-sm underline">
          Volver
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3">
        <Link to="/orgs">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold">{tenant.nombre}</h1>
          <p className="text-sm text-muted-foreground">
            {tenant.slug}.cualia.app
          </p>
        </div>
        <div className="flex gap-2 ml-auto">
          <Badge variant="secondary">{tenant.plan}</Badge>
          <Badge variant={tenant.activo ? 'default' : 'destructive'}>
            {tenant.activo ? 'Activo' : 'Inactivo'}
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="usuarios" className="gap-1.5">
            <Users className="h-3.5 w-3.5" />
            Usuarios
            {stats && (
              <Badge
                variant="secondary"
                className="h-5 min-w-5 px-1 text-[0.6rem]"
              >
                {stats.usuarios}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="modulos" className="gap-1.5">
            <Shield className="h-3.5 w-3.5" />
            Módulos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <GeneralTab tenant={tenant} stats={stats} />
        </TabsContent>

        <TabsContent value="usuarios">
          <UsuariosTab orgId={tenant.orgId} />
        </TabsContent>

        <TabsContent value="modulos">
          <ModulosTab orgId={tenant.orgId} tenant={tenant} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ─── General Tab ─────────────────────────────────────────────────────────────

type Tenant = NonNullable<
  ReturnType<typeof useQuery<typeof api.tenants.getById>>
>

function GeneralTab({
  tenant,
  stats,
}: {
  tenant: Tenant
  stats:
    | {
        usuarios: number
        usuariosActivos: number
        sedes: number
        sedesActivas: number
      }
    | undefined
}) {
  const updateTenant = useMutation(api.tenants.updateTenant)
  const [editing, setEditing] = useState(false)
  const [nombre, setNombre] = useState(tenant.nombre)
  const [plan, setPlan] = useState(tenant.plan)
  const [activo, setActivo] = useState(tenant.activo)
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    try {
      await updateTenant({
        id: tenant._id,
        nombre,
        plan: plan as any,
        activo,
      })
      setEditing(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center justify-between">
            Información
            {!editing && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setEditing(true)}
              >
                <Edit2 className="h-3.5 w-3.5 mr-1" /> Editar
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-1.5">
            <Label className="text-xs text-muted-foreground">Nombre</Label>
            {editing ? (
              <Input
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />
            ) : (
              <p className="text-sm font-medium">{tenant.nombre}</p>
            )}
          </div>
          <div className="grid gap-1.5">
            <Label className="text-xs text-muted-foreground">Slug</Label>
            <p className="text-sm font-mono">{tenant.slug}</p>
          </div>
          <div className="grid gap-1.5">
            <Label className="text-xs text-muted-foreground">Subdominio</Label>
            <p className="text-sm text-primary">{tenant.slug}.cualia.app</p>
          </div>
          <div className="grid gap-1.5">
            <Label className="text-xs text-muted-foreground">Plan</Label>
            {editing ? (
              <Select value={plan} onValueChange={setPlan}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="trial">Trial</SelectItem>
                  <SelectItem value="pro">Pro</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <Badge variant="secondary" className="w-fit">
                {tenant.plan}
              </Badge>
            )}
          </div>
          <div className="grid gap-1.5">
            <Label className="text-xs text-muted-foreground">Estado</Label>
            {editing ? (
              <Select
                value={activo ? 'activo' : 'inactivo'}
                onValueChange={(v) => setActivo(v === 'activo')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="activo">Activo</SelectItem>
                  <SelectItem value="inactivo">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <Badge
                variant={tenant.activo ? 'default' : 'destructive'}
                className="w-fit"
              >
                {tenant.activo ? 'Activo' : 'Inactivo'}
              </Badge>
            )}
          </div>
          <div className="grid gap-1.5">
            <Label className="text-xs text-muted-foreground">
              WorkOS Org ID
            </Label>
            <p className="text-xs font-mono text-muted-foreground">
              {tenant.orgId}
            </p>
          </div>
          {editing && (
            <div className="flex gap-2 pt-2">
              <Button size="sm" onClick={handleSave} disabled={saving}>
                <Save className="h-3.5 w-3.5 mr-1" />
                {saving ? 'Guardando...' : 'Guardar'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setEditing(false)
                  setNombre(tenant.nombre)
                  setPlan(tenant.plan)
                  setActivo(tenant.activo)
                }}
              >
                <X className="h-3.5 w-3.5 mr-1" /> Cancelar
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Card>
          <CardContent className="pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase">
                  Usuarios
                </p>
                <p className="text-2xl font-bold">{stats?.usuarios ?? '—'}</p>
                <p className="text-xs text-muted-foreground">
                  {stats?.usuariosActivos ?? 0} activos
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase">Sedes</p>
                <p className="text-2xl font-bold">{stats?.sedes ?? '—'}</p>
                <p className="text-xs text-muted-foreground">
                  {stats?.sedesActivas ?? 0} activas
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ─── Usuarios Tab ────────────────────────────────────────────────────────────

function UsuariosTab({ orgId }: { orgId: string }) {
  const usuarios = useQuery(api.usuarios.listByOrgAdmin, { orgId })
  const sedes = useQuery(api.sedes.listByOrgAdmin, { orgId })
  const updateUser = useMutation(api.usuarios.updateAdmin)
  const inviteUser = useAction(api.invitations.inviteUser)

  const [inviteOpen, setInviteOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviting, setInviting] = useState(false)
  const [inviteResult, setInviteResult] = useState<string | null>(null)
  const [sedeFiltro, setSedeFiltro] = useState<string>('all')

  const filtered = (usuarios ?? []).filter(
    (u) => sedeFiltro === 'all' || u.sedeId === sedeFiltro
  )

  async function handleInvite() {
    setInviting(true)
    try {
      const res = await inviteUser({ email: inviteEmail, orgId })
      setInviteResult(res.invitationUrl ?? 'Invitación enviada')
      setInviteEmail('')
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error')
    } finally {
      setInviting(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {sedes && sedes.length > 1 && (
            <Select value={sedeFiltro} onValueChange={setSedeFiltro}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Todas las sedes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las sedes</SelectItem>
                {sedes.map((s) => (
                  <SelectItem key={s._id} value={s._id}>
                    {s.ciudad}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        <Button
          size="sm"
          onClick={() => {
            setInviteOpen(true)
            setInviteResult(null)
          }}
        >
          <Mail className="h-4 w-4 mr-1" /> Invitar usuario
        </Button>
      </div>

      {!usuarios ? (
        <p className="text-sm text-muted-foreground">Cargando...</p>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground">
              No hay usuarios en esta organización
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0 pt-2">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Sede</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((u) => {
                  const sede = sedes?.find((s) => s._id === u.sedeId)
                  return (
                    <TableRow key={u._id}>
                      <TableCell className="font-medium">{u.nombre}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {u.email}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={u.rol}
                          onValueChange={async (v) => {
                            await updateUser({
                              id: u._id as any,
                              rol: v as any,
                            })
                          }}
                        >
                          <SelectTrigger className="h-7 w-[130px] text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ROLES.map((r) => (
                              <SelectItem key={r} value={r}>
                                {ROL_LABELS[r]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={u.sedeId ?? 'todas'}
                          onValueChange={async (v) => {
                            await updateUser({
                              id: u._id as any,
                              sedeId: v === 'todas' ? undefined : (v as any),
                            })
                          }}
                        >
                          <SelectTrigger className="h-7 w-[130px] text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="todas">Todas</SelectItem>
                            {sedes?.map((s) => (
                              <SelectItem key={s._id} value={s._id}>
                                {s.ciudad}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={u.activo ? 'default' : 'destructive'}
                          className="cursor-pointer text-[0.6rem]"
                          onClick={async () => {
                            await updateUser({
                              id: u._id as any,
                              activo: !u.activo,
                            })
                          }}
                        >
                          {u.activo ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-xs text-muted-foreground">
                        {u.workosUserId.slice(0, 12)}...
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invitar usuario</DialogTitle>
          </DialogHeader>
          {inviteResult ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Invitación enviada
              </p>
              <p className="text-xs font-mono break-all text-primary">
                {inviteResult}
              </p>
              <Button
                size="sm"
                onClick={() => {
                  setInviteResult(null)
                  setInviteOpen(false)
                }}
              >
                Cerrar
              </Button>
            </div>
          ) : (
            <div className="grid gap-3">
              <div className="grid gap-1.5">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="usuario@ejemplo.com"
                />
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancelar</Button>
                </DialogClose>
                <Button
                  onClick={handleInvite}
                  disabled={inviting || !inviteEmail}
                >
                  {inviting ? 'Enviando...' : 'Enviar invitación'}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ─── Módulos Tab ─────────────────────────────────────────────────────────────

function ModulosTab({ orgId, tenant }: { orgId: string; tenant: Tenant }) {
  const modulosAcceso = useQuery(api.modulosAcceso.listByOrg, { orgId })
  const updateTenant = useMutation(api.tenants.updateTenant)
  const upsertAcceso = useMutation(api.modulosAcceso.upsert)

  const [orgModulos, setOrgModulos] = useState<Set<string>>(
    new Set(tenant.modulosActivos ?? MODULOS.map((m) => m.key))
  )
  const [rolModulos, setRolModulos] = useState<Record<string, Set<string>>>({})
  const [initialized, setInitialized] = useState(false)
  const [saving, setSaving] = useState(false)

  if (modulosAcceso && !initialized) {
    const map: Record<string, Set<string>> = {}
    for (const entry of modulosAcceso) {
      map[entry.rol] = new Set(entry.modulos)
    }
    setRolModulos(map)
    setInitialized(true)
  }

  function toggleOrgModulo(key: string) {
    setOrgModulos((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  function toggleRolModulo(rol: string, key: string) {
    setRolModulos((prev) => {
      const current = new Set(prev[rol] ?? [])
      if (current.has(key)) current.delete(key)
      else current.add(key)
      return { ...prev, [rol]: current }
    })
  }

  async function handleSave() {
    setSaving(true)
    try {
      await updateTenant({
        id: tenant._id,
        modulosActivos: Array.from(orgModulos),
      })
      for (const rol of ROLES) {
        const mods = rol in rolModulos ? Array.from(rolModulos[rol]) : []
        await upsertAcceso({
          orgId,
          rol: rol as any,
          modulos: mods.filter((m) => orgModulos.has(m)),
        })
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Módulos de la organización</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground mb-3">
            Los módulos desactivados no aparecen en el portal para ningún
            usuario.
          </p>
          <div className="flex flex-wrap gap-2">
            {MODULOS.map((m) => (
              <Badge
                key={m.key}
                variant={orgModulos.has(m.key) ? 'default' : 'outline'}
                className="cursor-pointer text-xs px-3 py-1"
                onClick={() => toggleOrgModulo(m.key)}
              >
                {m.label}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Acceso por rol</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground mb-3">
            Dentro de los módulos activos, configura qué puede ver cada rol.
          </p>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">Rol</TableHead>
                  {MODULOS.filter((m) => orgModulos.has(m.key)).map((m) => (
                    <TableHead
                      key={m.key}
                      className="text-center text-[0.6rem] px-1"
                    >
                      {m.label}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {ROLES.map((rol) => (
                  <TableRow key={rol}>
                    <TableCell className="font-medium text-sm">
                      {ROL_LABELS[rol]}
                    </TableCell>
                    {MODULOS.filter((m) => orgModulos.has(m.key)).map((m) => {
                      const has =
                        rol in rolModulos && rolModulos[rol].has(m.key)
                      return (
                        <TableCell key={m.key} className="text-center px-1">
                          <Badge
                            variant={has ? 'default' : 'outline'}
                            className="cursor-pointer text-[0.6rem] px-2"
                            onClick={() => toggleRolModulo(rol, m.key)}
                          >
                            {has ? '✓' : '—'}
                          </Badge>
                        </TableCell>
                      )
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-1" />
          {saving ? 'Guardando...' : 'Guardar configuración'}
        </Button>
      </div>
    </div>
  )
}
