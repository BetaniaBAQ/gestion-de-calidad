import {
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Flame,
  ShieldAlert,
} from 'lucide-react'
import type { DrillSession } from '#/lib/stores/grillme.store'
import { calcScore, useGrillMeStore } from '#/lib/stores/grillme.store'
import { Button } from '#/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { Badge } from '#/components/ui/badge'

type Props = {
  session: DrillSession
}

const CATEGORY_LABELS: Record<string, string> = {
  equipos: 'Equipos / Dotación',
  mantenimiento: 'Mantenimiento',
  th: 'Talento Humano',
  pqrs: 'PQRS',
  indicadores: 'Indicadores',
  pamec_acciones: 'Acciones PAMEC',
  pamec_hallazgos: 'Hallazgos PAMEC',
}

export default function GrillMeScore({ session }: Props) {
  const restart = useGrillMeStore((s) => s.restart)
  const gaps = session.questions.map((q) => ({
    id: q.gapId,
    severity: q.severity,
    category: q.category,
  }))
  const score = calcScore(gaps as Parameters<typeof calcScore>[0])

  const criticas = gaps.filter((g) => g.severity === 'critica')
  const altas = gaps.filter((g) => g.severity === 'alta')
  const medias = gaps.filter((g) => g.severity === 'media')

  const scoreColor =
    score >= 80
      ? 'text-emerald-400'
      : score >= 60
        ? 'text-yellow-400'
        : 'text-red-400'
  const ScoreIcon =
    score >= 80 ? CheckCircle2 : score >= 60 ? AlertTriangle : XCircle
  const scoreLabel =
    score >= 80
      ? 'Preparado para visita'
      : score >= 60
        ? 'Brechas que atender'
        : 'Alto riesgo regulatorio'
  const scoreDesc =
    score >= 80
      ? 'El IPS demuestra control general del sistema. Mantenga el seguimiento de los puntos críticos antes de la visita.'
      : score >= 60
        ? 'Existen brechas activas que un inspector identificaría. Priorice cierres antes de la próxima visita de habilitación.'
        : 'El sistema presenta vulnerabilidades críticas. Se recomienda acción inmediata sobre los ítems marcados antes de cualquier visita.'

  // Group answered questions by category
  const byCategory = session.questions.reduce<
    Record<string, typeof session.questions>
  >((acc, q) => {
    const bucket = acc[q.category] ?? []
    bucket.push(q)
    acc[q.category] = bucket
    return acc
  }, {})

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Score principal */}
      <Card>
        <CardContent className="pt-6 pb-5">
          <div className="flex flex-col items-center text-center gap-2">
            <ScoreIcon className={`h-12 w-12 ${scoreColor}`} />
            <p className={`text-5xl font-bold ${scoreColor}`}>{score}</p>
            <p className="text-base font-semibold text-foreground">
              {scoreLabel}
            </p>
            <p className="text-sm text-muted-foreground max-w-sm">
              {scoreDesc}
            </p>
          </div>

          {/* Desglose */}
          <div className="mt-5 grid grid-cols-3 gap-3">
            <DesgloseBadge
              icon={<Flame className="h-3.5 w-3.5 text-red-400" />}
              count={criticas.length}
              label="Crítica"
              deduccion={criticas.length * 15}
              colorClass="text-red-400"
            />
            <DesgloseBadge
              icon={<ShieldAlert className="h-3.5 w-3.5 text-yellow-400" />}
              count={altas.length}
              label="Alta"
              deduccion={altas.length * 8}
              colorClass="text-yellow-400"
            />
            <DesgloseBadge
              icon={<AlertTriangle className="h-3.5 w-3.5 text-blue-400" />}
              count={medias.length}
              label="Media"
              deduccion={medias.length * 3}
              colorClass="text-blue-400"
            />
          </div>
        </CardContent>
      </Card>

      {/* Preguntas y respuestas por categoría */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">
            Resumen por módulo
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-4">
          {Object.entries(byCategory).map(([category, qs]) => (
            <div key={category}>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="text-[0.65rem]">
                  {CATEGORY_LABELS[category] ?? category}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {qs.length} pregunta{qs.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="space-y-1.5 pl-2">
                {qs.map((q) => {
                  const ans = session.answers.find((a) => a.questionId === q.id)
                  return (
                    <div key={q.id} className="border-l-2 border-border pl-3">
                      <p className="text-xs text-muted-foreground leading-snug line-clamp-2">
                        {q.text}
                      </p>
                      {ans && (
                        <p className="text-xs text-foreground mt-0.5 leading-snug line-clamp-2">
                          → {ans.text}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Reiniciar */}
      <div className="flex justify-center pb-4">
        <Button variant="outline" onClick={restart} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Nuevo simulacro
        </Button>
      </div>
    </div>
  )
}

function DesgloseBadge({
  icon,
  count,
  label,
  deduccion,
  colorClass,
}: {
  icon: React.ReactNode
  count: number
  label: string
  deduccion: number
  colorClass: string
}) {
  return (
    <div className="rounded-md bg-muted/40 px-3 py-2 text-center">
      <div className="flex items-center justify-center gap-1 mb-1">{icon}</div>
      <p className={`text-lg font-semibold ${colorClass}`}>{count}</p>
      <p className="text-[0.65rem] text-muted-foreground">{label}</p>
      <p className="text-[0.65rem] text-muted-foreground">−{deduccion} pts</p>
    </div>
  )
}
