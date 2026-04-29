import { createFileRoute } from '@tanstack/react-router'
import { ArrowRight, CheckCircle2, Circle, Plus } from 'lucide-react'
import { useState } from 'react'
import { Badge } from '@cualia/ui/components/badge'
import { Button } from '@cualia/ui/components/button'
import {
  Card,
  CardContent,
  Card as CardFull,
  CardHeader,
  CardTitle,
} from '@cualia/ui/components/card'
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
import { useSedes } from '#/lib/domain/config'
import {
  useAcciones,
  useAuditorias,
  useAvanzarFase,
  useCiclos,
  useCreateCiclo,
  usePamecStats,
  useUpdateCiclo,
} from '#/lib/domain/pamec'
import type { AuditoriaSGC, CicloSGC } from '#/lib/domain/pamec'
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
  Select as SelectUI,
  SelectContent as SelectContentUI,
  SelectItem as SelectItemUI,
  SelectTrigger as SelectTriggerUI,
  SelectValue as SelectValueUI,
} from '@cualia/ui/components/select'
import { Textarea } from '@cualia/ui/components/textarea'

export const Route = createFileRoute('/pamec')({
  component: PamecPage,
})

const ESTADOS: Array<AuditoriaSGC['estado'] | 'all'> = [
  'all',
  'planeada',
  'en_proceso',
  'cerrada',
]

function estadoLabel(e: AuditoriaSGC['estado']): string {
  switch (e) {
    case 'planeada':
      return 'Programada'
    case 'en_proceso':
      return 'En curso'
    case 'cerrada':
      return 'Finalizada'
  }
}

function PamecPage() {
  const auditorias = useAuditorias()
  const acciones = useAcciones()
  const sedes = useSedes()
  const stats = usePamecStats()

  const [filtroEstado, setFiltroEstado] = useState<string>('all')

  const filtered = auditorias.filter(
    (a) => filtroEstado === 'all' || a.estado === filtroEstado
  )

  return (
    <div className="space-y-6">
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
        <StatCard
          label="AUDITORÍAS"
          value={stats.auditorias}
          hint="programadas y finalizadas"
        />
        <StatCard
          label="HALLAZGOS"
          value={stats.hallazgos}
          hint="total registrados"
        />
        <StatCard
          label="CERRADOS"
          value={stats.cerrados}
          hint="con acciones completadas"
        />
        <StatCard
          label="ACC. VENCIDAS"
          value={stats.accVencidas}
          hint="requieren atención"
          tone="red"
        />
      </div>

      <Tabs defaultValue="auditorias">
        <TabsList>
          <TabsTrigger value="auditorias">Auditorías</TabsTrigger>
          <TabsTrigger value="ciclos">Ciclos PHVA</TabsTrigger>
          <TabsTrigger value="plan">Plan de mejoramiento</TabsTrigger>
        </TabsList>

        <TabsContent value="auditorias" className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            {ESTADOS.map((e) => {
              const label = e === 'all' ? 'Todos' : estadoLabel(e)
              return (
                <Button
                  key={e as string}
                  size="sm"
                  variant={filtroEstado === e ? 'default' : 'outline'}
                  onClick={() => setFiltroEstado(e as string)}
                >
                  {label}
                </Button>
              )
            })}
            <div className="ml-auto">
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" /> Nueva auditoría
              </Button>
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>CÓDIGO</TableHead>
                    <TableHead>AUDITORÍA</TableHead>
                    <TableHead>TIPO</TableHead>
                    <TableHead>SEDE</TableHead>
                    <TableHead>AUDITOR</TableHead>
                    <TableHead>FECHA</TableHead>
                    <TableHead>HALLAZGOS</TableHead>
                    <TableHead>ESTADO</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((a) => {
                    const sede =
                      a.sede === 'TODAS'
                        ? 'Todas'
                        : (sedes.find((s) => s.codigo === a.sede)?.ciudad ??
                          a.sede)
                    const hallazgos = a.hallazgos.length
                    const accionesCount = a.hallazgos.filter(
                      (h) => !!h.accionCorrectiva
                    ).length
                    return (
                      <TableRow key={a._id}>
                        <TableCell className="font-mono text-xs">
                          {a.id}
                        </TableCell>
                        <TableCell className="font-medium">
                          Auditoría {a.proceso} – {sede}
                        </TableCell>
                        <TableCell>
                          {a.tipo === 'interna'
                            ? 'Interna programada'
                            : a.tipo === 'seguimiento'
                              ? 'Seguimiento'
                              : 'Externa'}
                        </TableCell>
                        <TableCell>{sede}</TableCell>
                        <TableCell>{a.auditor}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(a.fechaInicio).toLocaleDateString('es-CO')}
                        </TableCell>
                        <TableCell>
                          {hallazgos} hall.
                          {accionesCount > 0 ? ` ${accionesCount} acc.` : ''}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {estadoLabel(a.estado)}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="text-center text-muted-foreground py-8"
                      >
                        Sin auditorías con ese filtro
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plan" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>HALLAZGO</TableHead>
                    <TableHead>CAUSA</TableHead>
                    <TableHead>ACCIÓN</TableHead>
                    <TableHead>RESPONSABLE</TableHead>
                    <TableHead>LÍMITE</TableHead>
                    <TableHead>ESTADO</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {acciones.map((a) => (
                    <TableRow key={a._id}>
                      <TableCell className="max-w-xs truncate">
                        {a.hallazgo}
                      </TableCell>
                      <TableCell className="text-muted-foreground max-w-xs truncate">
                        {a.causa}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {a.accion}
                      </TableCell>
                      <TableCell>{a.responsable}</TableCell>
                      <TableCell>
                        {new Date(a.fechaLimite).toLocaleDateString('es-CO')}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {a.estado}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {acciones.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center text-muted-foreground py-8"
                      >
                        Sin acciones registradas
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="ciclos" className="space-y-4">
          <CiclosTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function StatCard({
  label,
  value,
  hint,
  tone,
}: {
  label: string
  value: number
  hint: string
  tone?: 'red'
}) {
  return (
    <Card className={tone === 'red' ? 'border-red-400/30' : ''}>
      <CardContent className="pt-4">
        <div className="text-[0.65rem] uppercase tracking-wide text-muted-foreground">
          {label}
        </div>
        <div
          className={`text-2xl font-bold ${tone === 'red' ? 'text-red-400' : 'text-foreground'}`}
        >
          {value}
        </div>
        <p className="text-[0.65rem] text-muted-foreground mt-0.5">{hint}</p>
      </CardContent>
    </Card>
  )
}

// ─── Ciclos PHVA ─────────────────────────────────────────────────────────────

const FASES = ['planear', 'hacer', 'verificar', 'actuar', 'cerrado'] as const
const FASE_LABEL: Record<string, string> = {
  planear: 'Planear',
  hacer: 'Hacer',
  verificar: 'Verificar',
  actuar: 'Actuar',
  cerrado: 'Cerrado',
}

function CiclosTab() {
  const ciclos = useCiclos()
  const sedes = useSedes()
  const createCiclo = useCreateCiclo()
  const [showNew, setShowNew] = useState(false)
  const [detalle, setDetalle] = useState<CicloSGC | null>(null)
  const [newProceso, setNewProceso] = useState('')
  const [newSede, setNewSede] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleCreate() {
    const sede = sedes.find((s) => s.codigo === newSede)
    if (!sede || !newProceso) return
    setSaving(true)
    try {
      await createCiclo({
        sedeId: sede._id as any,
        sedeCodigo: sede.codigo,
        proceso: newProceso,
      })
      setShowNew(false)
      setNewProceso('')
    } finally {
      setSaving(false)
    }
  }

  const activos = ciclos.filter((c) => c.faseActual !== 'cerrado')
  const cerrados = ciclos.filter((c) => c.faseActual === 'cerrado')

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setShowNew(true)}>
          <Plus className="h-4 w-4 mr-1" /> Nuevo ciclo PHVA
        </Button>
      </div>

      {ciclos.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              No hay ciclos PHVA registrados
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {activos.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs uppercase tracking-wide font-semibold text-muted-foreground">
                En curso ({activos.length})
              </h3>
              {activos.map((c) => (
                <CicloCard
                  key={c._id}
                  ciclo={c}
                  onClick={() => setDetalle(c)}
                />
              ))}
            </div>
          )}
          {cerrados.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs uppercase tracking-wide font-semibold text-muted-foreground">
                Cerrados ({cerrados.length})
              </h3>
              {cerrados.map((c) => (
                <CicloCard
                  key={c._id}
                  ciclo={c}
                  onClick={() => setDetalle(c)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <Dialog open={showNew} onOpenChange={setShowNew}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuevo ciclo PHVA</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-4">
            <div className="grid gap-1.5">
              <Label>Proceso a mejorar</Label>
              <Input
                value={newProceso}
                onChange={(e) => setNewProceso(e.target.value)}
                placeholder="Ej. Atención en quimioterapia"
                required
              />
            </div>
            <div className="grid gap-1.5">
              <Label>Sede</Label>
              <SelectUI value={newSede} onValueChange={setNewSede}>
                <SelectTriggerUI>
                  <SelectValueUI placeholder="Seleccionar sede" />
                </SelectTriggerUI>
                <SelectContentUI>
                  {sedes
                    .filter((s) => s.activa)
                    .map((s) => (
                      <SelectItemUI key={s.codigo} value={s.codigo}>
                        {s.ciudad}
                      </SelectItemUI>
                    ))}
                </SelectContentUI>
              </SelectUI>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button
              onClick={handleCreate}
              disabled={saving || !newProceso || !newSede}
            >
              {saving ? 'Creando...' : 'Crear ciclo'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {detalle && (
        <CicloDetalleDialog ciclo={detalle} onClose={() => setDetalle(null)} />
      )}
    </div>
  )
}

function CicloCard({
  ciclo,
  onClick,
}: {
  ciclo: CicloSGC
  onClick: () => void
}) {
  const faseIdx = FASES.indexOf(ciclo.faseActual)
  return (
    <Card
      className="cursor-pointer hover:border-primary/50 transition-colors"
      onClick={onClick}
    >
      <CardContent className="pt-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-sm font-medium">{ciclo.proceso}</div>
            <div className="text-xs text-muted-foreground">
              {ciclo.sedeCodigo} · Inicio: {ciclo.fechaInicio}
            </div>
          </div>
          <Badge
            variant={ciclo.faseActual === 'cerrado' ? 'default' : 'secondary'}
          >
            {FASE_LABEL[ciclo.faseActual]}
          </Badge>
        </div>
        <div className="flex items-center gap-1">
          {FASES.slice(0, 4).map((fase, i) => (
            <div key={fase} className="flex items-center">
              {i <= faseIdx ? (
                <CheckCircle2 className="h-4 w-4 text-primary" />
              ) : (
                <Circle className="h-4 w-4 text-muted-foreground/30" />
              )}
              <span className="text-[0.6rem] ml-0.5 mr-2">
                {FASE_LABEL[fase].charAt(0)}
              </span>
              {i < 3 && (
                <ArrowRight className="h-3 w-3 text-muted-foreground/30" />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function CicloDetalleDialog({
  ciclo,
  onClose,
}: {
  ciclo: CicloSGC
  onClose: () => void
}) {
  const updateCiclo = useUpdateCiclo()
  const avanzar = useAvanzarFase()
  const [saving, setSaving] = useState(false)

  const [criterio, setCriterio] = useState(ciclo.criterioEsperado ?? '')
  const [indicador, setIndicador] = useState(ciclo.indicadorMedicion ?? '')
  const [metodologia, setMetodologia] = useState(ciclo.metodologia ?? '')
  const [causas, setCausas] = useState(ciclo.analisisCausas ?? '')
  const [herramienta, setHerramienta] = useState(
    ciclo.herramientaAnalisis ?? 'ishikawa'
  )
  const [resultado, setResultado] = useState(ciclo.resultadoEfectividad ?? '')

  async function handleSave() {
    setSaving(true)
    try {
      await updateCiclo({
        id: ciclo._id as any,
        criterioEsperado: criterio || undefined,
        indicadorMedicion: indicador || undefined,
        metodologia: metodologia || undefined,
        analisisCausas: causas || undefined,
        herramientaAnalisis: (herramienta as any) || undefined,
        resultadoEfectividad: resultado || undefined,
      })
    } finally {
      setSaving(false)
    }
  }

  async function handleAvanzar() {
    setSaving(true)
    try {
      await handleSave()
      await avanzar({ id: ciclo._id as any })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  const fase = ciclo.faseActual
  const isCerrado = fase === 'cerrado'

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{ciclo.proceso}</DialogTitle>
        </DialogHeader>
        <div className="text-xs text-muted-foreground mb-3">
          {ciclo.sedeCodigo} · Fase: {FASE_LABEL[fase]}
        </div>

        <div className="space-y-4">
          {(fase === 'planear' || isCerrado) && (
            <fieldset disabled={isCerrado} className="grid gap-3">
              <legend className="text-xs font-semibold uppercase tracking-wide text-primary mb-2">
                Planear
              </legend>
              <div className="grid gap-1.5">
                <Label>Criterio esperado</Label>
                <Textarea
                  value={criterio}
                  onChange={(e) => setCriterio(e.target.value)}
                  placeholder="Qué se espera lograr..."
                />
              </div>
              <div className="grid gap-1.5">
                <Label>Indicador de medición</Label>
                <Input
                  value={indicador}
                  onChange={(e) => setIndicador(e.target.value)}
                  placeholder="Cómo se medirá..."
                />
              </div>
              <div className="grid gap-1.5">
                <Label>Metodología</Label>
                <Input
                  value={metodologia}
                  onChange={(e) => setMetodologia(e.target.value)}
                  placeholder="Método de auditoría..."
                />
              </div>
            </fieldset>
          )}

          {(fase === 'verificar' || isCerrado) && (
            <fieldset disabled={isCerrado} className="grid gap-3">
              <legend className="text-xs font-semibold uppercase tracking-wide text-primary mb-2">
                Verificar
              </legend>
              <div className="grid gap-1.5">
                <Label>Herramienta de análisis</Label>
                <SelectUI value={herramienta} onValueChange={setHerramienta}>
                  <SelectTriggerUI>
                    <SelectValueUI />
                  </SelectTriggerUI>
                  <SelectContentUI>
                    <SelectItemUI value="ishikawa">Ishikawa</SelectItemUI>
                    <SelectItemUI value="5_porques">5 Porqués</SelectItemUI>
                    <SelectItemUI value="pareto">Pareto</SelectItemUI>
                    <SelectItemUI value="otro">Otro</SelectItemUI>
                  </SelectContentUI>
                </SelectUI>
              </div>
              <div className="grid gap-1.5">
                <Label>Análisis de causas</Label>
                <Textarea
                  value={causas}
                  onChange={(e) => setCausas(e.target.value)}
                  placeholder="Causas identificadas..."
                  rows={3}
                />
              </div>
            </fieldset>
          )}

          {(fase === 'actuar' || isCerrado) && (
            <fieldset disabled={isCerrado} className="grid gap-3">
              <legend className="text-xs font-semibold uppercase tracking-wide text-primary mb-2">
                Actuar
              </legend>
              <div className="grid gap-1.5">
                <Label>Resultado de efectividad</Label>
                <Textarea
                  value={resultado}
                  onChange={(e) => setResultado(e.target.value)}
                  placeholder="¿Las acciones fueron efectivas? Resultado..."
                  rows={3}
                />
              </div>
            </fieldset>
          )}

          {fase === 'hacer' && (
            <div className="rounded-md border border-border p-4 text-sm text-muted-foreground">
              Fase Hacer: ejecute la auditoría desde el módulo{' '}
              <strong>Auditoría en vivo</strong> o registre una auditoría
              manualmente en la pestaña Auditorías.
            </div>
          )}
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
          {!isCerrado && (
            <>
              <Button
                variant="secondary"
                onClick={handleSave}
                disabled={saving}
              >
                Guardar
              </Button>
              <Button onClick={handleAvanzar} disabled={saving}>
                {saving
                  ? 'Guardando...'
                  : fase === 'actuar'
                    ? 'Cerrar ciclo'
                    : `Avanzar a ${FASE_LABEL[FASES[FASES.indexOf(fase as (typeof FASES)[number]) + 1]]}`}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
