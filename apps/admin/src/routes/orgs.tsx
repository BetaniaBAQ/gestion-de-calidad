import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useAction, useQuery, useConvexAuth } from 'convex/react'
import { api } from '@cualia/convex'
import { Badge } from '@cualia/ui/components/badge'
import { Button } from '@cualia/ui/components/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Building2, Plus } from 'lucide-react'

export const Route = createFileRoute('/orgs')({
  component: AdminOrgsPage,
})

function useAuthArgs(): Record<string, never> | 'skip' {
  const { isAuthenticated } = useConvexAuth()
  return isAuthenticated ? {} : 'skip'
}

function AdminOrgsPage() {
  const tenants = useQuery(api.tenants.listAll, useAuthArgs())

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Organizaciones</h1>
          <p className="text-sm text-muted-foreground">
            Gestiona los tenants de Cualia SGC
          </p>
        </div>
        <CreateOrgDialog />
      </div>

      {tenants === undefined ? (
        <p className="text-sm text-muted-foreground">Cargando...</p>
      ) : tenants.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Building2 className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">No hay organizaciones aún</p>
          <p className="text-sm text-muted-foreground">
            Crea la primera con el botón de arriba
          </p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>WorkOS Org ID</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tenants.map((t) => (
              <TableRow key={t._id}>
                <TableCell className="font-medium">{t.nombre}</TableCell>
                <TableCell className="font-mono text-sm">{t.slug}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{t.plan}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={t.activo ? 'default' : 'destructive'}>
                    {t.activo ? 'Activo' : 'Inactivo'}
                  </Badge>
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {t.orgId}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}

function CreateOrgDialog() {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [email, setEmail] = useState('')
  const [plan, setPlan] = useState<'trial' | 'pro' | 'enterprise'>('trial')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    workosOrgId: string
    invitationUrl: string | null
  } | null>(null)

  const createTenant = useAction(api.tenants.createTenant)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await createTenant({ name, slug, ownerEmail: email, plan })
      setResult(res)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al crear')
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setName('')
    setSlug('')
    setEmail('')
    setPlan('trial')
    setResult(null)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nueva organización
        </Button>
      </DialogTrigger>
      <DialogContent>
        {result ? (
          <>
            <DialogHeader>
              <DialogTitle>Organización creada</DialogTitle>
              <DialogDescription>
                Se envió invitación a {email}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-muted-foreground">WorkOS Org ID: </span>
                <code className="text-xs">{result.workosOrgId}</code>
              </div>
              {result.invitationUrl && (
                <div>
                  <span className="text-muted-foreground">
                    Link de invitación:{' '}
                  </span>
                  <a
                    href={result.invitationUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary underline text-xs break-all"
                  >
                    {result.invitationUrl}
                  </a>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button onClick={reset}>Cerrar</Button>
            </DialogFooter>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Nueva organización</DialogTitle>
              <DialogDescription>
                Crea un tenant en WorkOS + Convex y envía invitación al owner
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Instituto Oncohematológico Betania"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={slug}
                  onChange={(e) =>
                    setSlug(
                      e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-')
                    )
                  }
                  placeholder="betania"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Será el subdominio: {slug || '___'}.cualia.app
                </p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email del owner</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@betania.com"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="plan">Plan</Label>
                <Select
                  value={plan}
                  onValueChange={(v) =>
                    setPlan(v as 'trial' | 'pro' | 'enterprise')
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="trial">Trial</SelectItem>
                    <SelectItem value="pro">Pro</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </DialogClose>
              <Button type="submit" disabled={loading}>
                {loading ? 'Creando...' : 'Crear organización'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
