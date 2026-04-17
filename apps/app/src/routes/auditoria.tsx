import { createFileRoute } from '@tanstack/react-router'
import { useMutation } from 'convex/react'
import { api } from '@cualia/convex'
import { AlertTriangle, Camera, Play, Save, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Progress } from '#/components/ui/progress'
import { RadioGroup, RadioGroupItem } from '#/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { Textarea } from '#/components/ui/textarea'
import { useSedeActiva, useSedes } from '#/lib/domain/config'
import {
  useAuditoriaEnCurso,
  useAuditoriaItems,
  useDescartarAuditoria,
  useFinalizarAuditoria,
  useIniciarAuditoria,
  useResponderAuditoria,
  useSetStep,
} from '#/lib/domain/auditoriaEnVivo'
import { useOrgId } from '#/lib/org-context'
import type { AuditoriaItemVivo } from '#/lib/types'

export const Route = createFileRoute('/auditoria')({
  component: AuditoriaPage,
})

const CATEGORIA_LABEL: Record<AuditoriaItemVivo['categoria'], string> = {
  talento_humano: 'Talento Humano',
  equipos: 'Equipos Biomédicos',
  infraestructura: 'Infraestructura',
  procesos_docs: 'Procesos y Documentos',
  reps: 'Habilitación REPS',
  seguridad_paciente: 'Seguridad del Paciente',
}

function AuditoriaPage() {
  const enCurso = useAuditoriaEnCurso()

  if (enCurso) return <AuditoriaWizard />
  return <AuditoriaStart />
}

function AuditoriaStart() {
  const sedes = useSedes()
  const sedeActiva = useSedeActiva()
  const iniciar = useIniciarAuditoria()
  const items = useAuditoriaItems()

  const [sedeId, setSedeId] = useState(sedeActiva)
  const [auditor, setAuditor] = useState('Auditor')

  const porCategoria = items.reduce<Record<string, number>>((acc, i) => {
    acc[i.categoria] = (acc[i.categoria] ?? 0) + 1
    return acc
  }, {})

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm uppercase tracking-wide">
            Modo auditoría en vivo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            El sistema te guiará ítem por ítem por todos los estándares de
            habilitación. Al finalizar genera el acta con score y crea los
            hallazgos en PAMEC automáticamente.
          </p>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label className="text-[0.65rem] uppercase">Sede a auditar</Label>
              <Select value={sedeId} onValueChange={setSedeId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sedes
                    .filter((s) => s.activa)
                    .map((s) => (
                      <SelectItem key={s._id} value={s.codigo}>
                        {s.ciudad}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-[0.65rem] uppercase">Auditor</Label>
              <Input
                value={auditor}
                onChange={(e) => setAuditor(e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-md border border-border p-3 space-y-2">
            <div className="text-xs font-semibold text-foreground">
              Esta auditoría cubre:
            </div>
            <ul className="space-y-1 text-xs text-muted-foreground">
              {Object.entries(porCategoria).map(([cat, n]) => (
                <li key={cat}>
                  ·{' '}
                  <span className="text-foreground font-medium">
                    {CATEGORIA_LABEL[cat as AuditoriaItemVivo['categoria']]}
                  </span>{' '}
                  — {n} ítems
                </li>
              ))}
            </ul>
            <div className="text-xs text-foreground pt-1">
              <strong>{items.length}</strong> ítems en total · ~15 minutos
            </div>
          </div>

          <Button onClick={() => iniciar(sedeId, auditor)}>
            <Play className="h-4 w-4 mr-1" /> Iniciar auditoría
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

function AuditoriaWizard() {
  const enCurso = useAuditoriaEnCurso()!
  const items = useAuditoriaItems()
  const responder = useResponderAuditoria()
  const setStep = useSetStep()
  const finalizar = useFinalizarAuditoria()
  const descartar = useDescartarAuditoria()
  const sedes = useSedes()
  const orgId = useOrgId()
  const createAuditoria = useMutation(api.pamec.createAuditoria)

  const step = enCurso.currentStep
  const item = items[step]
  const sede = sedes.find((s) => s.codigo === enCurso.sedeId)

  const prev = () => setStep(Math.max(0, step - 1))
  const next = () => setStep(Math.min(items.length - 1, step + 1))

  const respuestaActual = enCurso.respuestas.find((r) => r.itemId === item.id)

  const [cumple, setCumple] = useState<'si' | 'no' | 'na' | ''>(
    respuestaActual?.cumple ?? ''
  )
  const [obs, setObs] = useState(respuestaActual?.observacion ?? '')

  useEffect(() => {
    setCumple(respuestaActual?.cumple ?? '')
    setObs(respuestaActual?.observacion ?? '')
  }, [step, respuestaActual])

  const guardar = () => {
    if (!cumple) return
    responder({
      itemId: item.id,
      cumple: cumple,
      observacion: obs,
    })
  }

  const pct = Math.round(((step + 1) / items.length) * 100)

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground">
                Auditoría en vivo · {sede?.ciudad}
              </div>
              <CardTitle className="text-sm">
                Ítem {step + 1} de {items.length} ·{' '}
                {CATEGORIA_LABEL[item.categoria]}
              </CardTitle>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                if (confirm('¿Descartar auditoría en curso?')) descartar()
              }}
            >
              <Trash2 className="h-4 w-4 mr-1" /> Descartar
            </Button>
          </div>
          <Progress value={pct} />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md border border-border bg-card/30 p-4">
            <div className="text-sm font-medium text-foreground">
              {item.descripcion}
            </div>
            {item.normaReferencia && (
              <div className="text-[0.65rem] text-muted-foreground mt-1">
                {item.normaReferencia}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-[0.65rem] uppercase">Cumplimiento</Label>
            <RadioGroup
              value={cumple}
              onValueChange={(v) => setCumple(v as typeof cumple)}
              className="flex gap-4"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="si" id="c-si" />
                <Label htmlFor="c-si">Cumple</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="no" id="c-no" />
                <Label htmlFor="c-no">No cumple</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="na" id="c-na" />
                <Label htmlFor="c-na">No aplica</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label className="text-[0.65rem] uppercase">Observaciones</Label>
            <Textarea
              value={obs}
              onChange={(e) => setObs(e.target.value)}
              placeholder="Evidencia, nombres, ubicaciones, documentos revisados..."
              rows={3}
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <Button variant="ghost" disabled>
              <Camera className="h-4 w-4 mr-1" /> Foto (próx.)
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={prev} disabled={step === 0}>
                Anterior
              </Button>
              <Button
                onClick={() => {
                  guardar()
                  if (step < items.length - 1) next()
                }}
                disabled={!cumple}
              >
                <Save className="h-4 w-4 mr-1" />
                {step < items.length - 1 ? 'Guardar y siguiente' : 'Guardar'}
              </Button>
              {step === items.length - 1 && (
                <Button
                  variant="default"
                  onClick={async () => {
                    guardar()
                    if (!orgId) return
                    const sedeDoc = sedes.find(
                      (s) => s.codigo === enCurso.sedeId
                    )
                    if (!sedeDoc) return
                    const audId = `AUD-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`
                    const hallazgos = enCurso.respuestas
                      .filter((r) => r.cumple === 'no')
                      .map((r, idx) => {
                        const it = items.find((i) => i.id === r.itemId)
                        return {
                          id: `${audId}-h${idx + 1}`,
                          tipo: 'no_conformidad' as const,
                          descripcion: it?.descripcion ?? r.itemId,
                          criterio: it?.normaReferencia ?? 'Auditoría en vivo',
                          estado: 'abierto' as const,
                          accionCorrectiva: r.observacion,
                        }
                      })
                    await createAuditoria({
                      orgId,
                      sedeId: sedeDoc._id,
                      sedeCodigo: sedeDoc.codigo,
                      tipo: 'interna',
                      proceso: 'Auditoría en vivo',
                      auditor: enCurso.auditor,
                      fechaInicio: enCurso.iniciadaEn.slice(0, 10),
                      fechaFin: new Date().toISOString().slice(0, 10),
                      estado: 'cerrada',
                      observaciones: `Auditoría generada desde modo en vivo · ${enCurso.respuestas.length}/${items.length} ítems`,
                      hallazgos,
                    })
                    finalizar()
                    alert(
                      'Auditoría finalizada. Los hallazgos se enviaron a PAMEC.'
                    )
                  }}
                  disabled={!cumple}
                >
                  Finalizar
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {enCurso.respuestas.some((r) => r.cumple === 'no') && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xs uppercase tracking-wide flex items-center gap-2">
              <AlertTriangle className="h-3.5 w-3.5 text-red-400" />
              Hallazgos registrados (
              {enCurso.respuestas.filter((r) => r.cumple === 'no').length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {enCurso.respuestas
              .filter((r) => r.cumple === 'no')
              .map((r) => {
                const it = items.find((i) => i.id === r.itemId)
                return (
                  <div
                    key={r.itemId}
                    className="flex items-center gap-2 rounded-md border border-red-400/20 bg-red-400/5 px-3 py-1.5 text-xs"
                  >
                    <Badge
                      variant="outline"
                      className="bg-red-400/20 text-red-400 border-red-400/40 text-[0.6rem]"
                    >
                      NO CUMPLE
                    </Badge>
                    <span className="flex-1">
                      {it?.descripcion ?? r.itemId}
                    </span>
                  </div>
                )
              })}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
