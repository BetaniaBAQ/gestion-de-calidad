import { Lightbulb, ArrowRight, BookOpen } from 'lucide-react'
import type { DrillQuestion, DrillAnswer } from '#/lib/stores/grillme.store'
import { useGrillMeStore } from '#/lib/stores/grillme.store'
import { Button } from '#/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'

type Props = {
  question: DrillQuestion
  answer: DrillAnswer
}

export default function GrillMeFeedback({ question, answer }: Props) {
  const nextQuestion = useGrillMeStore((s) => s.nextQuestion)
  const session = useGrillMeStore((s) => s.session)

  const total = session?.questions.length ?? 1
  const current = (session?.currentIndex ?? 0) + 1
  const isLast = current >= total

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Cabecera */}
      <div>
        <p className="text-xs text-muted-foreground">
          Pregunta {current} de {total} — revisión de respuesta
        </p>
        <p className="text-sm font-medium text-foreground mt-1 leading-relaxed">
          {question.text}
        </p>
      </div>

      {/* Respuesta del usuario */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Su respuesta
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
            {answer.text}
          </p>
        </CardContent>
      </Card>

      {/* Pista — qué espera el inspector */}
      <Card className="border-yellow-500/30 bg-yellow-500/5">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-yellow-400" />
            <CardTitle className="text-xs font-medium text-yellow-400 uppercase tracking-wide">
              Qué espera ver un inspector
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-foreground leading-relaxed">
            {question.hint}
          </p>
        </CardContent>
      </Card>

      {/* Base normativa */}
      <div className="flex items-start gap-2 rounded-md bg-muted/40 px-3 py-2.5">
        <BookOpen className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
        <p className="text-[0.7rem] text-muted-foreground leading-snug">
          {question.regulatoryBasis}
        </p>
      </div>

      {/* Continuar */}
      <div className="flex justify-end">
        <Button onClick={nextQuestion} className="gap-2">
          {isLast ? 'Ver resultados' : 'Siguiente pregunta'}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
