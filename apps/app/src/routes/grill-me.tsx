import { createFileRoute } from '@tanstack/react-router'
import { useGrillMeStore } from '#/lib/stores/grillme.store'
import { buildGaps } from '#/lib/grillme/gaps'
import { buildQuestions } from '#/lib/grillme/questions'
import { useEquiposTodos } from '#/lib/domain/equipos'
import { useMantenimientosTodos } from '#/lib/domain/mantenimiento'
import { usePersonasTodas } from '#/lib/domain/personal'
import { usePqrsTodas } from '#/lib/domain/pqrs'
import { useIndicadores, useMediciones } from '#/lib/domain/indicadores'
import { useAcciones, useAuditorias } from '#/lib/domain/pamec'
import GrillMeStart from '#/components/grillme/GrillMeStart'
import GrillMeQuestion from '#/components/grillme/GrillMeQuestion'
import GrillMeFeedback from '#/components/grillme/GrillMeFeedback'
import GrillMeScore from '#/components/grillme/GrillMeScore'

export const Route = createFileRoute('/grill-me')({
  component: GrillMePage,
})

function GrillMePage() {
  const equipos = useEquiposTodos()
  const mantenimientos = useMantenimientosTodos()
  const personas = usePersonasTodas()
  const pqrs = usePqrsTodas()
  const indicadores = useIndicadores()
  const mediciones = useMediciones()
  const acciones = useAcciones()
  const auditorias = useAuditorias()

  const session = useGrillMeStore((s) => s.session)
  const startSession = useGrillMeStore((s) => s.startSession)

  const gaps = buildGaps({
    equipos,
    mantenimientos,
    personas,
    pqrs,
    indicadores,
    mediciones,
    acciones,
    auditorias,
  })

  const questions = buildQuestions(gaps)

  if (!session) {
    return (
      <GrillMeStart
        gaps={gaps}
        questions={questions}
        onStart={() => startSession(questions)}
      />
    )
  }

  if (session.phase === 'score') {
    return <GrillMeScore session={session} />
  }

  const currentQ = session.questions[session.currentIndex]

  if (session.phase === 'feedback') {
    const currentAnswer = session.answers[session.answers.length - 1]
    return <GrillMeFeedback question={currentQ} answer={currentAnswer} />
  }

  return <GrillMeQuestion question={currentQ} session={session} />
}
