import { useState } from 'react'
import { Flame, ShieldAlert, AlertTriangle, BookOpen } from 'lucide-react'
import type { DrillQuestion, DrillSession } from '#/lib/stores/grillme.store'
import { useGrillMeStore } from '#/lib/stores/grillme.store'
import { Button } from '@cualia/ui/components/button'
import { Card, CardContent, CardHeader } from '@cualia/ui/components/card'
import { Textarea } from '@cualia/ui/components/textarea'
import { Progress } from '@cualia/ui/components/progress'

type Props = {
  question: DrillQuestion
  session: DrillSession
}

const SEVERITY_CONFIG = {
  critica: {
    icon: Flame,
    label: 'Crítica',
    color: 'text-red-400',
    badgeClass: 'bg-red-500/15 text-red-400 border-red-500/30',
  },
  alta: {
    icon: ShieldAlert,
    label: 'Alta',
    color: 'text-yellow-400',
    badgeClass: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  },
  media: {
    icon: AlertTriangle,
    label: 'Media',
    color: 'text-blue-400',
    badgeClass: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  },
}

const CATEGORY_LABELS: Record<string, string> = {
  equipos: 'Equipos',
  mantenimiento: 'Mantenimiento',
  th: 'Talento Humano',
  pqrs: 'PQRS',
  indicadores: 'Indicadores',
  pamec_acciones: 'Acciones PAMEC',
  pamec_hallazgos: 'Hallazgos PAMEC',
}

export default function GrillMeQuestion({ question, session }: Props) {
  const [answer, setAnswer] = useState('')
  const submitAnswer = useGrillMeStore((s) => s.submitAnswer)

  const total = session.questions.length
  const current = session.currentIndex + 1
  const progress = ((current - 1) / total) * 100

  const cfg = SEVERITY_CONFIG[question.severity]
  const SeverityIcon = cfg.icon

  const canSubmit = answer.trim().length >= 10

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Progreso */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Pregunta {current} de {total}
          </span>
          <span>{CATEGORY_LABELS[question.category] ?? question.category}</span>
        </div>
        <Progress value={progress} className="h-1.5" />
      </div>

      {/* Badge severidad */}
      <div className="flex items-center gap-2">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${cfg.badgeClass}`}
        >
          <SeverityIcon className="h-3 w-3" />
          Brecha {cfg.label}
        </span>
      </div>

      {/* Pregunta */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start gap-2">
            <span className="text-muted-foreground font-semibold text-sm shrink-0 mt-0.5">
              P{current}.
            </span>
            <p className="text-sm leading-relaxed text-foreground">
              {question.text}
            </p>
          </div>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          <Textarea
            placeholder="Escriba su respuesta como lo haría ante un inspector oficial..."
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            rows={5}
            className="resize-none text-sm"
          />
          <div className="flex items-center justify-between">
            <span className="text-[0.7rem] text-muted-foreground">
              {answer.trim().length < 10
                ? `Mínimo 10 caracteres (${answer.trim().length}/10)`
                : `${answer.trim().length} caracteres`}
            </span>
            <Button
              onClick={() => submitAnswer(question.id, answer.trim())}
              disabled={!canSubmit}
              size="sm"
            >
              Responder
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Base normativa */}
      <div className="flex items-start gap-2 rounded-md bg-muted/40 px-3 py-2.5">
        <BookOpen className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
        <p className="text-[0.7rem] text-muted-foreground leading-snug">
          {question.regulatoryBasis}
        </p>
      </div>
    </div>
  )
}
