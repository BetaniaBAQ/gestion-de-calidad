import { create } from 'zustand'

export type GapSeverity = 'critica' | 'alta' | 'media'

export type GapCategory =
  | 'equipos'
  | 'mantenimiento'
  | 'th'
  | 'pqrs'
  | 'indicadores'
  | 'pamec_acciones'
  | 'pamec_hallazgos'

export type Gap = {
  id: string
  category: GapCategory
  severity: GapSeverity
  description: string
  context?: string
}

export type DrillQuestion = {
  id: string
  gapId: string
  category: GapCategory
  severity: GapSeverity
  text: string
  hint: string
  regulatoryBasis: string
}

export type DrillAnswer = {
  questionId: string
  text: string
  timestamp: number
}

export type DrillPhase = 'question' | 'feedback' | 'score'

export type DrillSession = {
  questions: DrillQuestion[]
  answers: DrillAnswer[]
  currentIndex: number
  phase: DrillPhase
}

type GrillMeState = {
  session: DrillSession | null
  startSession: (questions: DrillQuestion[]) => void
  submitAnswer: (questionId: string, text: string) => void
  nextQuestion: () => void
  restart: () => void
}

export const useGrillMeStore = create<GrillMeState>((set) => ({
  session: null,

  startSession: (questions) =>
    set({
      session: {
        questions,
        answers: [],
        currentIndex: 0,
        phase: 'question',
      },
    }),

  submitAnswer: (questionId, text) =>
    set((state) => {
      if (!state.session) return state
      const answer: DrillAnswer = { questionId, text, timestamp: Date.now() }
      return {
        session: {
          ...state.session,
          answers: [...state.session.answers, answer],
          phase: 'feedback',
        },
      }
    }),

  nextQuestion: () =>
    set((state) => {
      if (!state.session) return state
      const next = state.session.currentIndex + 1
      if (next >= state.session.questions.length) {
        return { session: { ...state.session, phase: 'score' } }
      }
      return {
        session: {
          ...state.session,
          currentIndex: next,
          phase: 'question',
        },
      }
    }),

  restart: () => set({ session: null }),
}))

// ─── Selector: score actual basado en gaps detectados ─────────────────────────

const DEDUCTIONS: Record<GapSeverity, number> = {
  critica: 15,
  alta: 8,
  media: 3,
}

export function calcScore(gaps: Gap[]): number {
  const total = gaps.reduce((acc, g) => acc + DEDUCTIONS[g.severity], 0)
  return Math.max(0, 100 - total)
}
