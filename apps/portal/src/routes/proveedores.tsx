import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import {
  AlertTriangle,
  Building2,
  CheckCircle,
  Edit2,
  ExternalLink,
  Plus,
  Trash2,
} from 'lucide-react'
import { Badge } from '@cualia/ui/components/badge'
import { Button } from '@cualia/ui/components/button'
import { Card, CardContent } from '@cualia/ui/components/card'
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
  credencialEstado,
  useCreateProveedor,
  useProveedores,
  useRemoveProveedor,
  useUpdateProveedor,
} from '#/lib/domain/proveedores'
import type { ProveedorSGC } from '#/lib/domain/proveedores'
import { KpiMeta } from '#/components/kpi-meta'

export const Route = createFileRoute('/proveedores')({
  component: ProveedoresPage,
})

const TIPO_LABELS: Record<string, string> = {
  servicios_salud: 'Servicios de salud',
  suministros: 'Suministros',
  mantenimiento: 'Mantenimiento',
  laboratorio: 'Laboratorio',
  otro: 'Otro',
}

function CredBadge({ vigencia, label }: { vigencia?: string; label: string }) {
  const estado = credencialEstado(vigencia)
  return (
    <Badge
      variant={
        estado === 'vigente'
          ? 'default'
          : estado === 'vencido'
            ? 'destructive'
            : estado === 'por_vencer'
              ? 'secondary'
              : 'outline'
      }
      className="text-[0.6rem]"
    >
      {label}:{' '}
      {estado === 'vigente'
        ? 'OK'
        : estado === 'vencido'
          ? 'Vencido'
          : estado === 'por_vencer'
            ? '<30d'
            : 'Falta'}
    </Badge>
  )
}

function ProveedoresPage() {
  const proveedores = useProveedores()
  const [dialog, setDialog] = useState<
    null | { mode: 'add' } | { mode: 'edit'; prov: ProveedorSGC }
  >(null)
  const [deleteTarget, setDeleteTarget] = useState<ProveedorSGC | null>(null)
  const removeProv = useRemoveProveedor()

  const activos = proveedores.filter((p) => p.activo)
  const conAlertas = activos.filter((p) => {
    const c = credencialEstado(p.camaraVigencia)
    const pol = credencialEstado(p.polizaVigencia)
    return (
      c !== 'vigente' || pol !== 'vigente' || !p.rutUrl || !p.habilitacionUrl
    )
  })

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-3">
        <KpiMeta
          modulo="PROVEEDORES"
          valor={`${activos.length}`}
          descripcion="proveedores activos"
          meta=""
        />
        <KpiMeta
          modulo="PROVEEDORES"
          valor={`${conAlertas.length}`}
          descripcion="con credenciales pendientes"
          meta="0"
        />
        <KpiMeta
          modulo="PROVEEDORES"
          valor={`${activos.length > 0 ? Math.round(((activos.length - conAlertas.length) / activos.length) * 100) : 0}%`}
          descripcion="documentación completa"
          meta="100%"
        />
      </div>

      <div className="flex justify-end">
        <Button size="sm" onClick={() => setDialog({ mode: 'add' })}>
          <Plus className="h-4 w-4 mr-1" /> Agregar proveedor
        </Button>
      </div>

      {proveedores.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Building2 className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground">
              No hay proveedores registrados
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
                  <TableHead>NIT</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Credenciales</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {proveedores.map((p) => (
                  <TableRow key={p._id}>
                    <TableCell>
                      <div className="font-medium text-sm">{p.nombre}</div>
                      {p.contacto && (
                        <div className="text-xs text-muted-foreground">
                          {p.contacto}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-sm">{p.nit}</TableCell>
                    <TableCell className="text-sm">
                      {TIPO_LABELS[p.tipo] ?? p.tipo}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        <CredBadge
                          label="RUT"
                          vigencia={p.rutUrl ? '2099-01-01' : undefined}
                        />
                        <CredBadge label="Cámara" vigencia={p.camaraVigencia} />
                        <CredBadge
                          label="Hab."
                          vigencia={
                            p.habilitacionUrl ? '2099-01-01' : undefined
                          }
                        />
                        <CredBadge label="Póliza" vigencia={p.polizaVigencia} />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={p.activo ? 'default' : 'secondary'}>
                        {p.activo ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7"
                          onClick={() => setDialog({ mode: 'edit', prov: p })}
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-destructive"
                          onClick={() => setDeleteTarget(p)}
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
      )}

      {dialog && (
        <ProveedorFormDialog
          open
          onOpenChange={(open) => {
            if (!open) setDialog(null)
          }}
          proveedor={dialog.mode === 'edit' ? dialog.prov : null}
        />
      )}

      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar proveedor</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            ¿Eliminar a <strong>{deleteTarget?.nombre}</strong>? Esta acción no
            se puede deshacer.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (deleteTarget) {
                  await removeProv({ id: deleteTarget._id as any })
                  setDeleteTarget(null)
                }
              }}
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

type ProvForm = {
  nombre: string
  nit: string
  tipo: string
  contacto: string
  telefono: string
  email: string
  rutUrl: string
  camaraComercioUrl: string
  camaraVigencia: string
  habilitacionUrl: string
  polizaUrl: string
  polizaVigencia: string
}

function ProveedorFormDialog({
  open,
  onOpenChange,
  proveedor,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  proveedor: ProveedorSGC | null
}) {
  const createProv = useCreateProveedor()
  const updateProv = useUpdateProveedor()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<ProvForm>({
    nombre: proveedor?.nombre ?? '',
    nit: proveedor?.nit ?? '',
    tipo: proveedor?.tipo ?? 'suministros',
    contacto: proveedor?.contacto ?? '',
    telefono: proveedor?.telefono ?? '',
    email: proveedor?.email ?? '',
    rutUrl: proveedor?.rutUrl ?? '',
    camaraComercioUrl: proveedor?.camaraComercioUrl ?? '',
    camaraVigencia: proveedor?.camaraVigencia ?? '',
    habilitacionUrl: proveedor?.habilitacionUrl ?? '',
    polizaUrl: proveedor?.polizaUrl ?? '',
    polizaVigencia: proveedor?.polizaVigencia ?? '',
  })

  function set(field: keyof ProvForm, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const data = {
        nombre: form.nombre,
        nit: form.nit,
        tipo: form.tipo as any,
        contacto: form.contacto || undefined,
        telefono: form.telefono || undefined,
        email: form.email || undefined,
        rutUrl: form.rutUrl || undefined,
        camaraComercioUrl: form.camaraComercioUrl || undefined,
        camaraVigencia: form.camaraVigencia || undefined,
        habilitacionUrl: form.habilitacionUrl || undefined,
        polizaUrl: form.polizaUrl || undefined,
        polizaVigencia: form.polizaVigencia || undefined,
      }
      if (proveedor) {
        await updateProv({ id: proveedor._id as any, ...data })
      } else {
        await createProv(data)
      }
      onOpenChange(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {proveedor ? 'Editar proveedor' : 'Nuevo proveedor'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label>Nombre / Razón social</Label>
                <Input
                  value={form.nombre}
                  onChange={(e) => set('nombre', e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-1.5">
                <Label>NIT</Label>
                <Input
                  value={form.nit}
                  onChange={(e) => set('nit', e.target.value)}
                  placeholder="900.123.456-7"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label>Tipo</Label>
                <Select value={form.tipo} onValueChange={(v) => set('tipo', v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="servicios_salud">
                      Servicios de salud
                    </SelectItem>
                    <SelectItem value="suministros">Suministros</SelectItem>
                    <SelectItem value="mantenimiento">Mantenimiento</SelectItem>
                    <SelectItem value="laboratorio">Laboratorio</SelectItem>
                    <SelectItem value="otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label>Contacto</Label>
                <Input
                  value={form.contacto}
                  onChange={(e) => set('contacto', e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label>Teléfono</Label>
                <Input
                  value={form.telefono}
                  onChange={(e) => set('telefono', e.target.value)}
                />
              </div>
              <div className="grid gap-1.5">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => set('email', e.target.value)}
                />
              </div>
            </div>

            <p className="text-xs font-semibold text-muted-foreground mt-2 uppercase tracking-wide">
              Credenciales normativas
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label>RUT (URL)</Label>
                <Input
                  value={form.rutUrl}
                  onChange={(e) => set('rutUrl', e.target.value)}
                  placeholder="https://..."
                />
              </div>
              <div className="grid gap-1.5">
                <Label>Habilitación (URL)</Label>
                <Input
                  value={form.habilitacionUrl}
                  onChange={(e) => set('habilitacionUrl', e.target.value)}
                  placeholder="https://..."
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label>Cámara de comercio (URL)</Label>
                <Input
                  value={form.camaraComercioUrl}
                  onChange={(e) => set('camaraComercioUrl', e.target.value)}
                  placeholder="https://..."
                />
              </div>
              <div className="grid gap-1.5">
                <Label>Vigencia cámara</Label>
                <Input
                  type="date"
                  value={form.camaraVigencia}
                  onChange={(e) => set('camaraVigencia', e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label>Póliza (URL)</Label>
                <Input
                  value={form.polizaUrl}
                  onChange={(e) => set('polizaUrl', e.target.value)}
                  placeholder="https://..."
                />
              </div>
              <div className="grid gap-1.5">
                <Label>Vigencia póliza</Label>
                <Input
                  type="date"
                  value={form.polizaVigencia}
                  onChange={(e) => set('polizaVigencia', e.target.value)}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" disabled={saving}>
              {saving ? 'Guardando...' : proveedor ? 'Guardar' : 'Crear'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
