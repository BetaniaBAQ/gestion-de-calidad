import { createFileRoute } from '@tanstack/react-router'
import { ExternalLink, Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { KpiMeta } from '#/components/kpi-meta'
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
  DialogContent,
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
import {
  useDocumentos,
  useCreateDocumento,
  useUpdateDocumento,
  useRemoveDocumento,
  usePctConSp,
  usePctVigentes,
} from '#/lib/domain/documentos'
import type { DocSGC } from '#/lib/domain/documentos'
import { diasHasta } from '#/lib/utils-sgc'
import type { DocumentoEstado, DocumentoTipo } from '#/lib/types'

export const Route = createFileRoute('/documentos')({
  component: DocumentosPage,
})

const TIPOS_OPTS: Array<{ v: DocumentoTipo | 'all'; label: string }> = [
  { v: 'all', label: 'Todos' },
  { v: 'politica', label: 'Política' },
  { v: 'procedimiento', label: 'Procedimiento' },
  { v: 'protocolo', label: 'Protocolo' },
  { v: 'guia_practica_clinica', label: 'Guía de práctica clínica' },
  { v: 'manual', label: 'Manual' },
  { v: 'formato', label: 'Formato' },
  { v: 'instructivo', label: 'Instructivo' },
  { v: 'plan', label: 'Plan' },
  { v: 'certificado', label: 'Certificado' },
  { v: 'poliza', label: 'Póliza' },
  { v: 'otro', label: 'Otro' },
]

const ESTADOS_OPTS: Array<{ v: DocumentoEstado | 'all'; label: string }> = [
  { v: 'all', label: 'Todos' },
  { v: 'vigente', label: 'Vigente' },
  { v: 'en_revision', label: 'En revisión' },
  { v: 'en_aprobacion', label: 'En aprobación' },
  { v: 'borrador', label: 'Borrador' },
  { v: 'obsoleto', label: 'Obsoleto' },
]

const PROCESOS_OPTS = [
  'all',
  'Gestión de calidad',
  'Talento humano',
  'Atención al paciente',
  'Gestión de equipos',
  'Habilitación',
  'Farmacia',
  'Seguridad del paciente',
  'PQR',
  'Gestión financiera',
] as const

function tipoLabel(t: DocumentoTipo): string {
  return TIPOS_OPTS.find((o) => o.v === t)?.label ?? t
}

function estadoLabel(e: DocumentoEstado): string {
  return ESTADOS_OPTS.find((o) => o.v === e)?.label ?? e
}

function EstadoBadge({ estado }: { estado: DocumentoEstado }) {
  const cls: Record<DocumentoEstado, string> = {
    vigente: 'bg-emerald-400/20 text-emerald-400 border-emerald-400/40',
    en_revision: 'bg-blue-400/20 text-blue-400 border-blue-400/40',
    en_aprobacion: 'bg-yellow-400/20 text-yellow-400 border-yellow-400/40',
    borrador: 'bg-zinc-400/20 text-zinc-400 border-zinc-400/40',
    obsoleto: 'bg-red-400/20 text-red-400 border-red-400/40',
  }
  return (
    <Badge variant="outline" className={cls[estado]}>
      {estadoLabel(estado)}
    </Badge>
  )
}

function VencimientoCell({ fecha }: { fecha: string }) {
  const dias = diasHasta(fecha)
  const cls =
    dias < 0
      ? 'text-red-400 font-medium'
      : dias <= 30
        ? 'text-yellow-400 font-medium'
        : 'text-muted-foreground'
  return (
    <span className={cls}>
      {new Date(fecha).toLocaleDateString('es-CO')}
      {dias < 0 && (
        <span className="ml-1 text-[0.65rem]">({Math.abs(dias)}d venc.)</span>
      )}
      {dias >= 0 && dias <= 30 && (
        <span className="ml-1 text-[0.65rem]">({dias}d)</span>
      )}
    </span>
  )
}

const EMPTY: Omit<DocSGC, '_id' | 'id' | 'elaboradoPor'> = {
  codigo: '',
  nombre: '',
  tipo: 'procedimiento',
  proceso: 'Gestión de calidad',
  version: 'v1.0',
  fechaElaboracion: new Date().toISOString().slice(0, 10),
  fechaVigencia: '',
  responsable: '',
  estado: 'vigente',
  spLink: '',
}

function DocForm({
  initial,
  onSave,
  onCancel,
}: {
  initial: Partial<DocSGC>
  onSave: (d: Omit<DocSGC, '_id' | 'id' | 'elaboradoPor'>) => void
  onCancel: () => void
}) {
  const [form, setForm] = useState({ ...EMPTY, ...initial })

  function field<TKey extends keyof typeof EMPTY>(
    k: TKey,
    v: (typeof EMPTY)[TKey]
  ) {
    setForm((f) => ({ ...f, [k]: v }))
  }

  function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault()
    onSave(form)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label>Código *</Label>
          <Input
            value={form.codigo}
            onChange={(e) => field('codigo', e.target.value)}
            required
            placeholder="SGC-PRO-001"
          />
        </div>
        <div className="space-y-1">
          <Label>Versión</Label>
          <Input
            value={form.version}
            onChange={(e) => field('version', e.target.value)}
            placeholder="v1.0"
          />
        </div>
        <div className="col-span-2 space-y-1">
          <Label>Nombre del documento *</Label>
          <Input
            value={form.nombre}
            onChange={(e) => field('nombre', e.target.value)}
            required
          />
        </div>
        <div className="space-y-1">
          <Label>Tipo *</Label>
          <Select
            value={form.tipo}
            onValueChange={(v) => field('tipo', v as DocumentoTipo)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIPOS_OPTS.filter((o) => o.v !== 'all').map((o) => (
                <SelectItem key={o.v} value={o.v}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label>Proceso</Label>
          <Select
            value={form.proceso}
            onValueChange={(v) => field('proceso', v)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PROCESOS_OPTS.filter((p) => p !== 'all').map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label>Fecha elaboración</Label>
          <Input
            type="date"
            value={form.fechaElaboracion}
            onChange={(e) => field('fechaElaboracion', e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label>Fecha vigencia *</Label>
          <Input
            type="date"
            value={form.fechaVigencia}
            onChange={(e) => field('fechaVigencia', e.target.value)}
            required
          />
        </div>
        <div className="space-y-1">
          <Label>Responsable</Label>
          <Input
            value={form.responsable}
            onChange={(e) => field('responsable', e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label>Estado</Label>
          <Select
            value={form.estado}
            onValueChange={(v) => field('estado', v as DocumentoEstado)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ESTADOS_OPTS.filter((o) => o.v !== 'all').map((o) => (
                <SelectItem key={o.v} value={o.v}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="col-span-2 space-y-1">
          <Label>Enlace SharePoint / Drive</Label>
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

function DocumentosPage() {
  const docs = useDocumentos()
  const pctVig = usePctVigentes()
  const pctSp = usePctConSp()
  const createDocumento = useCreateDocumento()
  const updateDocumento = useUpdateDocumento()
  const removeDocumento = useRemoveDocumento()

  const [tipo, setTipo] = useState<string>('all')
  const [estado, setEstado] = useState<string>('all')
  const [proceso, setProceso] = useState<string>('all')
  const [dialog, setDialog] = useState<
    null | { mode: 'add' } | { mode: 'edit'; doc: DocSGC }
  >(null)
  const [deleteTarget, setDeleteTarget] = useState<DocSGC | null>(null)

  const filtered = docs.filter((d) => {
    if (tipo !== 'all' && d.tipo !== tipo) return false
    if (estado !== 'all' && d.estado !== estado) return false
    if (proceso !== 'all' && d.proceso !== proceso) return false
    return true
  })

  const enCiclo = docs.filter(
    (d) =>
      d.estado === 'en_revision' ||
      d.estado === 'en_aprobacion' ||
      d.estado === 'borrador'
  )
  const vencidosProximos = docs
    .filter((d) => d.estado === 'vigente' && diasHasta(d.fechaVigencia) <= 60)
    .sort((a, b) => diasHasta(a.fechaVigencia) - diasHasta(b.fechaVigencia))

  function handleSave(d: Omit<DocSGC, '_id' | 'id' | 'elaboradoPor'>) {
    if (dialog?.mode === 'edit') {
      updateDocumento(dialog.doc._id, d)
    } else {
      createDocumento(d as any)
    }
    setDialog(null)
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2">
        <KpiMeta
          modulo="GESTIÓN DOCUMENTAL"
          valor={`${pctVig}%`}
          descripcion="% documentos vigentes"
          meta="≥100%"
        />
        <KpiMeta
          modulo="GESTIÓN DOCUMENTAL"
          valor={`${pctSp}%`}
          descripcion="% documentos con SP cargado"
          meta="≥100%"
        />
      </div>

      <Tabs defaultValue="documentos">
        <TabsList>
          <TabsTrigger value="documentos">Documentos</TabsTrigger>
          <TabsTrigger value="control">
            Control de cambios
            {enCiclo.length > 0 && (
              <Badge
                variant="outline"
                className="ml-2 text-[0.6rem] py-0 px-1 bg-yellow-400/20 text-yellow-400 border-yellow-400/40"
              >
                {enCiclo.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="documentos" className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Select value={tipo} onValueChange={setTipo}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                {TIPOS_OPTS.map((o) => (
                  <SelectItem key={o.v} value={o.v}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={estado} onValueChange={setEstado}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                {ESTADOS_OPTS.map((o) => (
                  <SelectItem key={o.v} value={o.v}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={proceso} onValueChange={setProceso}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Proceso" />
              </SelectTrigger>
              <SelectContent>
                {PROCESOS_OPTS.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p === 'all' ? 'Todos' : p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="ml-auto">
              <Button size="sm" onClick={() => setDialog({ mode: 'add' })}>
                <Plus className="h-4 w-4 mr-1" /> Nuevo documento
              </Button>
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>CÓDIGO</TableHead>
                    <TableHead>DOCUMENTO</TableHead>
                    <TableHead>TIPO</TableHead>
                    <TableHead>PROCESO</TableHead>
                    <TableHead>VER.</TableHead>
                    <TableHead>VENCIMIENTO</TableHead>
                    <TableHead>ESTADO</TableHead>
                    <TableHead>SP</TableHead>
                    <TableHead className="w-20" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((d) => (
                    <TableRow key={d._id}>
                      <TableCell className="font-mono text-xs">
                        {d.codigo}
                      </TableCell>
                      <TableCell className="font-medium max-w-xs truncate">
                        {d.nombre}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {tipoLabel(d.tipo)}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {d.proceso}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {d.version}
                      </TableCell>
                      <TableCell>
                        <VencimientoCell fecha={d.fechaVigencia} />
                      </TableCell>
                      <TableCell>
                        <EstadoBadge estado={d.estado} />
                      </TableCell>
                      <TableCell>
                        {d.spLink ? (
                          <a
                            href={d.spLink}
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
                            onClick={() => setDialog({ mode: 'edit', doc: d })}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-red-400 hover:text-red-300"
                            onClick={() => setDeleteTarget(d)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={9}
                        className="text-center text-muted-foreground py-8"
                      >
                        Sin documentos con los filtros aplicados
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="control" className="space-y-6">
          {enCiclo.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs uppercase tracking-wide">
                  En ciclo de revisión / aprobación
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {enCiclo.map((d) => (
                  <div
                    key={d._id}
                    className="flex items-center gap-3 rounded-md border border-border/60 bg-card/30 px-3 py-2"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground truncate">
                        {d.nombre}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {d.codigo} · {tipoLabel(d.tipo)} · {d.proceso}
                      </div>
                    </div>
                    <EstadoBadge estado={d.estado} />
                    <Button
                      size="sm"
                      variant="outline"
                      className="shrink-0"
                      onClick={() => setDialog({ mode: 'edit', doc: d })}
                    >
                      Actualizar
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {vencidosProximos.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs uppercase tracking-wide">
                  Vencidos o próximos a vencer (≤60 días)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {vencidosProximos.map((d) => {
                  const dias = diasHasta(d.fechaVigencia)
                  return (
                    <div
                      key={d._id}
                      className="flex items-center gap-3 rounded-md border border-border/60 bg-card/30 px-3 py-2"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-foreground truncate">
                          {d.nombre}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {d.codigo} · {d.version}
                        </div>
                      </div>
                      <span
                        className={`text-xs font-medium ${dias < 0 ? 'text-red-400' : 'text-yellow-400'}`}
                      >
                        {dias < 0
                          ? `Vencido hace ${Math.abs(dias)}d`
                          : `Vence en ${dias}d`}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        className="shrink-0"
                        onClick={() => setDialog({ mode: 'edit', doc: d })}
                      >
                        Revisar
                      </Button>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          )}

          {enCiclo.length === 0 && vencidosProximos.length === 0 && (
            <Card>
              <CardContent className="pt-6 text-sm text-muted-foreground text-center">
                Todos los documentos están vigentes y al día.
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

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
              {dialog?.mode === 'edit' ? 'Editar documento' : 'Nuevo documento'}
            </DialogTitle>
          </DialogHeader>
          {dialog !== null && (
            <DocForm
              initial={dialog.mode === 'edit' ? dialog.doc : {}}
              onSave={handleSave}
              onCancel={() => setDialog(null)}
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
            <DialogTitle>Eliminar documento</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            ¿Confirmas eliminar{' '}
            <span className="font-medium text-foreground">
              {deleteTarget?.nombre}
            </span>
            ? Esta acción no se puede deshacer.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (deleteTarget) removeDocumento({ id: deleteTarget._id })
                setDeleteTarget(null)
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
