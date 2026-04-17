import {
  AlertTriangle,
  CheckCircle2,
  Flame,
  ShieldAlert,
  Zap,
} from 'lucide-react'
import type { Gap, DrillQuestion } from '#/lib/stores/grillme.store'
import { calcScore } from '#/lib/stores/grillme.store'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'

type Props = {
  gaps: Gap[]
  questions: DrillQuestion[]
  onStart: () => void
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

export default function GrillMeStart({ gaps, questions, onStart }: Props) {
  const criticas = gaps.filter((g) => g.severity === 'critica')
  const altas = gaps.filter((g) => g.severity === 'alta')
  const medias = gaps.filter((g) => g.severity === 'media')
  const score = calcScore(gaps)

  const scoreColor =
    score >= 80
      ? 'text-emerald-400'
      : score >= 60
        ? 'text-yellow-400'
        : 'text-red-400'

  const scoreLabel =
    score >= 80 ? 'Preparado' : score >= 60 ? 'Con brechas' : 'Vulnerable'

  if (gaps.length === 0) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-3">
              <CheckCircle2 className="h-12 w-12 text-emerald-400" />
            </div>
            <CardTitle className="text-xl">Sin brechas detectadas</CardTitle>
            <CardDescription>
              El sistema no encontró incumplimientos activos en ningún módulo.
              Todos los indicadores están dentro de los rangos esperados.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center text-sm text-muted-foreground">
            Vuelve a revisar cuando ingreses más datos o cuando venzan próximos
            plazos.
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-foreground">
          Simulacro de visita de inspección
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          El sistema analizó los datos reales del SGC y generó{' '}
          {questions.length} pregunta{questions.length !== 1 ? 's' : ''} basadas
          en brechas activas. Responde como si fuera un inspector de la
          Secretaría de Salud.
        </p>
      </div>

      {/* Score estimado */}
      <Card className="border-border">
        <CardContent className="pt-5 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                Preparación estimada
              </p>
              <p className={`text-3xl font-bold ${scoreColor}`}>{score}/100</p>
              <p className={`text-sm font-medium ${scoreColor}`}>
                {scoreLabel}
              </p>
            </div>
            <div className="text-right space-y-1">
              <div className="flex items-center gap-2 justify-end">
                <Flame className="h-3.5 w-3.5 text-red-400" />
                <span className="text-xs text-muted-foreground">
                  {criticas.length} crítica{criticas.length !== 1 ? 's' : ''} (−
                  {criticas.length * 15} pts)
                </span>
              </div>
              <div className="flex items-center gap-2 justify-end">
                <ShieldAlert className="h-3.5 w-3.5 text-yellow-400" />
                <span className="text-xs text-muted-foreground">
                  {altas.length} alta{altas.length !== 1 ? 's' : ''} (−
                  {altas.length * 8} pts)
                </span>
              </div>
              <div className="flex items-center gap-2 justify-end">
                <AlertTriangle className="h-3.5 w-3.5 text-blue-400" />
                <span className="text-xs text-muted-foreground">
                  {medias.length} media{medias.length !== 1 ? 's' : ''} (−
                  {medias.length * 3} pts)
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Brechas detectadas */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">
            Brechas detectadas ({gaps.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-2">
          {gaps.map((g) => (
            <div
              key={g.id}
              className="flex items-start gap-2.5 py-1.5 border-b border-border/40 last:border-0"
            >
              <SeverityDot severity={g.severity} />
              <div className="min-w-0">
                <p className="text-xs text-foreground leading-snug">
                  {g.description}
                </p>
                {g.context && (
                  <p className="text-[0.7rem] text-muted-foreground mt-0.5">
                    {g.context}
                  </p>
                )}
              </div>
              <Badge
                variant="outline"
                className="text-[0.65rem] shrink-0 ml-auto"
              >
                {CATEGORY_LABELS[g.category] ?? g.category}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* CTA */}
      <div className="flex items-center gap-4">
        <Button onClick={onStart} className="gap-2 flex-1">
          <Zap className="h-4 w-4" />
          Iniciar simulacro ({questions.length} preguntas)
        </Button>
      </div>
      <p className="text-[0.7rem] text-muted-foreground text-center">
        Las preguntas están ordenadas por severidad. Responde con el mismo nivel
        de detalle que exigiría un inspector oficial.
      </p>
    </div>
  )
}

function SeverityDot({ severity }: { severity: Gap['severity'] }) {
  const cls =
    severity === 'critica'
      ? 'bg-red-500'
      : severity === 'alta'
        ? 'bg-yellow-500'
        : 'bg-blue-500'
  return <span className={`mt-1 h-2 w-2 rounded-full shrink-0 ${cls}`} />
}
