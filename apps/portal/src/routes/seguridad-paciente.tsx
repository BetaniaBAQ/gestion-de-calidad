import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { AlertTriangle, Plus, Shield } from 'lucide-react'
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
import { Textarea } from '@cualia/ui/components/textarea'
import { useSedes } from '#/lib/domain/config'
import {
  ESTADO_LABELS,
  TIPO_LABELS,
  useAvanzarEstado,
  useCreateEvento,
  useEventosAdversos,
  useEventosStats,
  useUpdateEvento,
  useUpdateLondonProtocol,
} from '#/lib/domain/eventosAdversos'
import type { EventoAdverso } from '#/lib/domain/eventosAdversos'
import { KpiMeta } from '#/components/kpi-meta'

export const Route = createFileRoute('/seguridad-paciente')({
  component: SeguridadPacientePage,
})

function SeguridadPacientePage() {
  const eventos = useEventosAdversos()
  const stats = useEventosStats()
  const [showReporte, setShowReporte] = useState(false)
  const [detalleEvento, setDetalleEvento] = useState<EventoAdverso | null>(null)

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-4">
        <KpiMeta
          modulo="SEG. PACIENTE"
          valor={`${stats.total}`}
          descripcion="eventos registrados"
          meta=""
        />
        <KpiMeta
          modulo="SEG. PACIENTE"
          valor={`${stats.abiertos}`}
          descripcion="abiertos"
          meta="0"
        />
        <KpiMeta
          modulo="SEG. PACIENTE"
          valor={`${stats.centinela}`}
          descripcion="centinela"
          meta="0"
        />
        <KpiMeta
          modulo="SEG. PACIENTE"
          valor={`${stats.sinLondon}`}
          descripcion="sin London Protocol"
          meta="0"
        />
      </div>

      <Tabs defaultValue="eventos">
        <TabsList>
          <TabsTrigger value="eventos">Eventos</TabsTrigger>
          <TabsTrigger value="reportar">Reportar evento</TabsTrigger>
        </TabsList>

        <TabsContent value="eventos" className="space-y-4">
          {eventos.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Shield className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-muted-foreground">
                  No hay eventos registrados
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0 pt-2">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Servicio</TableHead>
                      <TableHead>Descripción</TableHead>
                      <TableHead>Sede</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>London</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {eventos.map((e) => (
                      <TableRow
                        key={e._id}
                        className="cursor-pointer"
                        onClick={() => setDetalleEvento(e)}
                      >
                        <TableCell className="text-sm">{e.fecha}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              e.tipo === 'evento_centinela'
                                ? 'destructive'
                                : 'secondary'
                            }
                            className="text-[0.6rem]"
                          >
                            {TIPO_LABELS[e.tipo]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{e.servicio}</TableCell>
                        <TableCell className="text-sm max-w-[200px] truncate">
                          {e.descripcion}
                        </TableCell>
                        <TableCell className="text-sm">
                          {e.sedeCodigo}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[0.6rem]">
                            {ESTADO_LABELS[e.estado]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {e.londonProtocol?.completado ? (
                            <Badge variant="default" className="text-[0.6rem]">
                              Completo
                            </Badge>
                          ) : e.tipo === 'evento_centinela' ||
                            e.tipo === 'evento_adverso_prevenible' ? (
                            <Badge
                              variant="destructive"
                              className="text-[0.6rem]"
                            >
                              Pendiente
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              N/A
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="reportar">
          <ReporteEventoForm />
        </TabsContent>
      </Tabs>

      {detalleEvento && (
        <EventoDetalleDialog
          evento={detalleEvento}
          onClose={() => setDetalleEvento(null)}
        />
      )}
    </div>
  )
}

function ReporteEventoForm() {
  const sedes = useSedes()
  const createEvento = useCreateEvento()
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [form, setForm] = useState({
    sedeId: '',
    tipo: 'incidente' as EventoAdverso['tipo'],
    fecha: new Date().toISOString().slice(0, 10),
    hora: '',
    servicio: '',
    descripcion: '',
    reportanteNombre: '',
    reportanteCargo: '',
    anonimo: false,
  })

  function set<TKey extends keyof typeof form>(
    key: TKey,
    value: (typeof form)[TKey]
  ) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const sede = sedes.find((s) => s.codigo === form.sedeId)
    if (!sede) return
    setSaving(true)
    try {
      await createEvento({
        sedeId: sede._id as any,
        sedeCodigo: sede.codigo,
        tipo: form.tipo,
        fecha: form.fecha,
        hora: form.hora || undefined,
        servicio: form.servicio,
        descripcion: form.descripcion,
        reportanteNombre: form.anonimo
          ? undefined
          : form.reportanteNombre || undefined,
        reportanteCargo: form.anonimo
          ? undefined
          : form.reportanteCargo || undefined,
        anonimo: form.anonimo,
      })
      setSuccess(true)
      setForm({
        sedeId: '',
        tipo: 'incidente',
        fecha: new Date().toISOString().slice(0, 10),
        hora: '',
        servicio: '',
        descripcion: '',
        reportanteNombre: '',
        reportanteCargo: '',
        anonimo: false,
      })
    } finally {
      setSaving(false)
    }
  }

  if (success) {
    return (
      <Card>
        <CardContent className="py-12 text-center space-y-3">
          <AlertTriangle className="h-10 w-10 text-primary mx-auto" />
          <p className="font-medium">Evento reportado exitosamente</p>
          <p className="text-sm text-muted-foreground">
            El equipo de calidad revisará el reporte y dará seguimiento.
          </p>
          <Button onClick={() => setSuccess(false)}>
            Reportar otro evento
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Reportar evento adverso</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4 max-w-lg">
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>Sede</Label>
              <Select
                value={form.sedeId}
                onValueChange={(v) => set('sedeId', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  {sedes
                    .filter((s) => s.activa)
                    .map((s) => (
                      <SelectItem key={s.codigo} value={s.codigo}>
                        {s.ciudad}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Tipo de evento</Label>
              <Select
                value={form.tipo}
                onValueChange={(v) => set('tipo', v as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="incidente">Incidente</SelectItem>
                  <SelectItem value="evento_adverso_prevenible">
                    EA Prevenible
                  </SelectItem>
                  <SelectItem value="evento_adverso_no_prevenible">
                    EA No Prevenible
                  </SelectItem>
                  <SelectItem value="evento_centinela">
                    Evento Centinela
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="grid gap-1.5">
              <Label>Fecha</Label>
              <Input
                type="date"
                value={form.fecha}
                onChange={(e) => set('fecha', e.target.value)}
                required
              />
            </div>
            <div className="grid gap-1.5">
              <Label>Hora</Label>
              <Input
                type="time"
                value={form.hora}
                onChange={(e) => set('hora', e.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label>Servicio</Label>
              <Input
                value={form.servicio}
                onChange={(e) => set('servicio', e.target.value)}
                placeholder="Quimioterapia"
                required
              />
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label>Descripción del evento</Label>
            <Textarea
              value={form.descripcion}
              onChange={(e) => set('descripcion', e.target.value)}
              placeholder="Describa qué ocurrió, cuándo, dónde y quién estuvo involucrado..."
              rows={4}
              required
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="anonimo"
              checked={form.anonimo}
              onChange={(e) => set('anonimo', e.target.checked)}
              className="rounded border-border"
            />
            <Label htmlFor="anonimo" className="text-sm font-normal">
              Reporte anónimo
            </Label>
          </div>

          {!form.anonimo && (
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label>Nombre del reportante</Label>
                <Input
                  value={form.reportanteNombre}
                  onChange={(e) => set('reportanteNombre', e.target.value)}
                />
              </div>
              <div className="grid gap-1.5">
                <Label>Cargo</Label>
                <Input
                  value={form.reportanteCargo}
                  onChange={(e) => set('reportanteCargo', e.target.value)}
                />
              </div>
            </div>
          )}

          <Button
            type="submit"
            disabled={saving || !form.sedeId || !form.descripcion}
          >
            {saving ? 'Reportando...' : 'Reportar evento'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

function EventoDetalleDialog({
  evento,
  onClose,
}: {
  evento: EventoAdverso
  onClose: () => void
}) {
  const updateEvento = useUpdateEvento()
  const avanzar = useAvanzarEstado()
  const updateLondon = useUpdateLondonProtocol()
  const [saving, setSaving] = useState(false)

  const [lp, setLp] = useState({
    lineaTiempo: evento.londonProtocol?.lineaTiempo ?? '',
    problemasAtencion: evento.londonProtocol?.problemasAtencion ?? '',
    factoresContributivos: evento.londonProtocol?.factoresContributivos ?? '',
    causasRaiz: evento.londonProtocol?.causasRaiz ?? '',
    recomendaciones: evento.londonProtocol?.recomendaciones ?? '',
    planAccion: evento.londonProtocol?.planAccion ?? '',
  })

  const needsLondon =
    evento.tipo === 'evento_centinela' ||
    evento.tipo === 'evento_adverso_prevenible'
  const isCerrado = evento.estado === 'cerrado'

  async function handleAvanzar() {
    setSaving(true)
    try {
      await avanzar({ id: evento._id as any })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  async function handleSaveLondon() {
    setSaving(true)
    try {
      const allFilled =
        lp.lineaTiempo &&
        lp.problemasAtencion &&
        lp.factoresContributivos &&
        lp.causasRaiz &&
        lp.recomendaciones &&
        lp.planAccion
      await updateLondon({
        id: evento._id as any,
        londonProtocol: {
          ...lp,
          lineaTiempo: lp.lineaTiempo || undefined,
          problemasAtencion: lp.problemasAtencion || undefined,
          factoresContributivos: lp.factoresContributivos || undefined,
          causasRaiz: lp.causasRaiz || undefined,
          recomendaciones: lp.recomendaciones || undefined,
          planAccion: lp.planAccion || undefined,
          completado: !!allFilled,
        },
      })
    } finally {
      setSaving(false)
    }
  }

  const LONDON_FIELDS = [
    {
      key: 'lineaTiempo',
      label: 'Línea de tiempo',
      placeholder: 'Secuencia cronológica de los hechos...',
    },
    {
      key: 'problemasAtencion',
      label: 'Problemas de atención',
      placeholder: 'Problemas identificados en la atención...',
    },
    {
      key: 'factoresContributivos',
      label: 'Factores contributivos',
      placeholder: 'Factores del paciente, equipo, entorno, organización...',
    },
    {
      key: 'causasRaiz',
      label: 'Causas raíz',
      placeholder: 'Causas fundamentales del evento...',
    },
    {
      key: 'recomendaciones',
      label: 'Recomendaciones',
      placeholder: 'Acciones para prevenir recurrencia...',
    },
    {
      key: 'planAccion',
      label: 'Plan de acción',
      placeholder: 'Actividades, responsables, fechas...',
    },
  ] as const

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Badge
              variant={
                evento.tipo === 'evento_centinela' ? 'destructive' : 'secondary'
              }
            >
              {TIPO_LABELS[evento.tipo]}
            </Badge>
            {evento.servicio}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
            <div>
              Fecha: {evento.fecha} {evento.hora ?? ''}
            </div>
            <div>Sede: {evento.sedeCodigo}</div>
            <div>
              Estado:{' '}
              <Badge variant="outline">{ESTADO_LABELS[evento.estado]}</Badge>
            </div>
            <div>
              {evento.anonimo
                ? 'Reporte anónimo'
                : (evento.reportanteNombre ?? '')}
            </div>
          </div>

          <div className="rounded-md border border-border p-3">
            <p className="text-xs font-semibold text-muted-foreground mb-1">
              Descripción
            </p>
            <p className="text-sm">{evento.descripcion}</p>
          </div>

          {needsLondon && (
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                London Protocol
                {evento.londonProtocol?.completado && (
                  <Badge variant="default" className="ml-2 text-[0.6rem]">
                    Completo
                  </Badge>
                )}
              </p>
              {LONDON_FIELDS.map(({ key, label, placeholder }) => (
                <div key={key} className="grid gap-1">
                  <Label className="text-xs">{label}</Label>
                  <Textarea
                    value={lp[key]}
                    onChange={(e) =>
                      setLp((prev) => ({ ...prev, [key]: e.target.value }))
                    }
                    placeholder={placeholder}
                    rows={2}
                    disabled={isCerrado}
                  />
                </div>
              ))}
              {!isCerrado && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleSaveLondon}
                  disabled={saving}
                >
                  {saving ? 'Guardando...' : 'Guardar London Protocol'}
                </Button>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
          {!isCerrado && (
            <Button onClick={handleAvanzar} disabled={saving}>
              {saving
                ? 'Guardando...'
                : `Avanzar a ${
                    ESTADO_LABELS[
                      (
                        [
                          'reportado',
                          'clasificado',
                          'en_investigacion',
                          'acciones_definidas',
                          'en_seguimiento',
                          'cerrado',
                        ] as const
                      )[
                        (
                          [
                            'reportado',
                            'clasificado',
                            'en_investigacion',
                            'acciones_definidas',
                            'en_seguimiento',
                            'cerrado',
                          ] as const
                        ).indexOf(evento.estado) + 1
                      ] ?? 'cerrado'
                    ]
                  }`}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
