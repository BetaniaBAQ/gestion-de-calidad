import { createFileRoute } from '@tanstack/react-router'
import { useRef, useState } from 'react'
import {
  CheckCircle2,
  Circle,
  FileText,
  Loader2,
  Minus,
  Upload,
} from 'lucide-react'
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@cualia/ui/components/tabs'
import { useSedeActiva, useSedes, useSetSedeActiva } from '#/lib/domain/config'
import {
  autoForSede,
  computeChecklistEstado,
  pctChecklistCumplido,
  useAutoVerificacionPorSede,
  useRespuestasPorSede,
  useUpsertRespuesta,
  useAddEvidencia,
} from '#/lib/domain/habilitacion'
import type { CheckEstado, HabCategoria } from '#/lib/types'
import { useUploadThing } from '#/lib/uploadthing-client'

export const Route = createFileRoute('/habilitacion')({
  component: HabilitacionPage,
})

const CATEGORIAS: Array<{ id: HabCategoria; nombre: string }> = [
  { id: 'rh', nombre: 'Recurso Humano' },
  { id: 'infra', nombre: 'Infraestructura' },
  { id: 'dotacion', nombre: 'Dotación' },
  { id: 'procesos', nombre: 'Procesos' },
  { id: 'reps', nombre: 'Habilitación REPS' },
]

function estadoIcon(estado: CheckEstado | 'pendiente', auto: boolean) {
  if (auto)
    return <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
  if (estado === 'cumple')
    return <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
  if (estado === 'no_cumple')
    return <Minus className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
  if (estado === 'parcial')
    return <Circle className="h-4 w-4 text-yellow-400 shrink-0 mt-0.5" />
  return <Circle className="h-4 w-4 text-muted-foreground/40 shrink-0 mt-0.5" />
}

function nextEstado(current: CheckEstado | 'pendiente'): CheckEstado {
  if (current === 'cumple') return 'no_cumple'
  if (current === 'no_cumple') return 'na'
  if (current === 'na') return 'pendiente' as CheckEstado
  return 'cumple'
}

function HabilitacionPage() {
  const sedes = useSedes()
  const sedeActiva = useSedeActiva()
  const setSedeActiva = useSetSedeActiva()
  const autoAll = useAutoVerificacionPorSede()
  const upsertRespuesta = useUpsertRespuesta()
  const addEvidencia = useAddEvidencia()

  const sede = sedes.find((s) => s.codigo === sedeActiva)
  const respuestas = useRespuestasPorSede(sedeActiva)
  const auto = autoForSede(autoAll, sedeActiva)
  const items = computeChecklistEstado(respuestas, auto)
  const pct = pctChecklistCumplido(respuestas, auto)

  async function toggle(
    itemId: string,
    isAuto: boolean,
    currentEstado: CheckEstado | 'pendiente'
  ) {
    if (isAuto || !sede) return
    const next = nextEstado(currentEstado)
    await upsertRespuesta({
      sedeId: sede._id as any,
      criterioDefId: itemId,
      estado: next === ('pendiente' as any) ? 'no_cumple' : next,
    })
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="checklist">
        <TabsList>
          <TabsTrigger value="checklist">Checklist habilitación</TabsTrigger>
        </TabsList>

        <TabsContent value="checklist" className="space-y-4">
          <KpiMeta
            modulo="HABILITACIÓN"
            valor={`${pct}%`}
            descripcion="% checklist habilitación cumplido"
            meta="≥100%"
          />

          <div className="flex flex-wrap items-center gap-2">
            {sedes
              .filter((s) => s.activa)
              .map((s) => (
                <Button
                  key={s.codigo}
                  size="sm"
                  variant={sedeActiva === s.codigo ? 'default' : 'outline'}
                  onClick={() => setSedeActiva(s.codigo)}
                >
                  {s.ciudad}
                </Button>
              ))}
          </div>

          {CATEGORIAS.map((cat) => {
            const catItems = items.filter((i) => i.def.categoria === cat.id)
            const cumple = catItems.filter((i) => i.estado === 'cumple').length
            const aplicables = catItems.filter((i) => i.estado !== 'na').length

            return (
              <Card key={cat.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center justify-between">
                    {cat.nombre}
                    <Badge variant="secondary" className="text-xs">
                      {cumple}/{aplicables}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 pt-0">
                  {catItems.map((item) => (
                    <CriterioRow
                      key={item.def.id}
                      def={item.def}
                      estado={item.estado}
                      evidencias={item.evidencias}
                      isAuto={item.def.auto && !!auto[item.def.id]}
                      onToggle={() =>
                        toggle(
                          item.def.id,
                          item.def.auto && !!auto[item.def.id],
                          item.estado
                        )
                      }
                      onAddEvidencia={async (url) => {
                        if (!sede) return
                        await addEvidencia({
                          sedeId: sede._id as any,
                          criterioDefId: item.def.id,
                          url,
                        })
                      }}
                    />
                  ))}
                </CardContent>
              </Card>
            )
          })}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function CriterioRow({
  def,
  estado,
  evidencias,
  isAuto,
  onToggle,
  onAddEvidencia,
}: {
  def: { id: string; descripcion: string; norma: string; auto: boolean }
  estado: CheckEstado | 'pendiente'
  evidencias: string[]
  isAuto: boolean
  onToggle: () => void
  onAddEvidencia: (url: string) => void
}) {
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const { startUpload } = useUploadThing('evidenciaHabilitacion', {
    onClientUploadComplete: (res) => {
      if (res[0]) onAddEvidencia(res[0].ufsUrl)
      setUploading(false)
    },
    onUploadError: () => setUploading(false),
  })

  return (
    <div className="flex items-start gap-2 py-1.5 px-1 rounded hover:bg-muted/30 group">
      <button
        type="button"
        onClick={onToggle}
        disabled={isAuto}
        className="shrink-0 mt-0.5"
      >
        {estadoIcon(estado, isAuto)}
      </button>
      <div className="flex-1 min-w-0">
        <p className="text-sm leading-tight">{def.descripcion}</p>
        <p className="text-[0.65rem] text-muted-foreground">{def.norma}</p>
        {evidencias.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {evidencias.map((url, i) => (
              <a
                key={i}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-0.5 rounded-full bg-primary/10 px-2 py-0.5 text-[0.6rem] text-primary hover:bg-primary/20"
              >
                <FileText className="h-2.5 w-2.5" />
                Doc {i + 1}
              </a>
            ))}
          </div>
        )}
      </div>
      <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <input
          ref={fileRef}
          type="file"
          accept=".pdf,image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (!file) return
            setUploading(true)
            startUpload([file])
          }}
        />
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="h-7 w-7"
          disabled={uploading || isAuto}
          onClick={() => fileRef.current?.click()}
          title="Subir evidencia"
        >
          {uploading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Upload className="h-3.5 w-3.5" />
          )}
        </Button>
      </div>
    </div>
  )
}
