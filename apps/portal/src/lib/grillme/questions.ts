import type {
  Gap,
  DrillQuestion,
  GapCategory,
} from '#/lib/stores/grillme.store'

type QuestionTemplate = {
  text: (g: Gap) => string
  hint: string
  regulatoryBasis: string
}

const TEMPLATES: Record<GapCategory, QuestionTemplate> = {
  equipos: {
    text: (g) =>
      `${g.description}. ¿Qué medidas ha tomado para garantizar la continuidad asistencial mientras este equipo no tiene mantenimiento vigente, y cuándo está programada la intervención?`,
    hint: 'Mencione el plan de contingencia, el proveedor o técnico, la fecha estimada de mantenimiento y el equipo alternativo en uso mientras tanto.',
    regulatoryBasis:
      'Dec. 4725/2005 Art. 25 — Obligación de mantenimiento preventivo de dispositivos médicos; Res. 2003/2014 Estándar Dotación',
  },
  mantenimiento: {
    text: (g) =>
      `${g.description}. ¿Cuál es el plan de acción concreto, quién es el responsable designado y cuál es la fecha compromiso de cierre?`,
    hint: 'Indique técnico o empresa asignada, fecha compromiso, estado actual del trámite y si hay impacto en la prestación del servicio.',
    regulatoryBasis:
      'Res. 2003/2014 — Estándares de habilitación: dotación y mantenimiento de equipos e infraestructura',
  },
  th: {
    text: (g) =>
      `${g.description}. ¿Cómo garantiza que esta persona presta servicios en condiciones seguras mientras sus requisitos no están al día, y cuál es el plan para regularizarlos?`,
    hint: 'Explique quién notificó al colaborador, la fecha límite para regularizar, qué documentos faltan y si existe restricción temporal de actividades.',
    regulatoryBasis:
      'Res. 2003/2014 Estándar 1 — Talento Humano: hojas de vida, habilitaciones y competencias del personal asistencial',
  },
  pqrs: {
    text: (g) =>
      `${g.description}. ¿Qué acciones tomó para responder al usuario y cómo garantizó el cumplimiento del plazo legal de 15 días hábiles?`,
    hint: 'Detalle el responsable asignado, la fecha de respuesta, el canal utilizado, si se escaló a nivel directivo y si se notificó al usuario del estado.',
    regulatoryBasis:
      'Res. 2003/2014 Estándar Derechos de los Usuarios; Ley 1438/2011 Art. 6 — Atención oportuna de PQRS en salud',
  },
  indicadores: {
    text: (g) =>
      `${g.description}. ¿Cuál es la causa raíz identificada, qué acciones de mejora están en curso y cuándo proyecta cumplir la meta?`,
    hint: 'Mencione el valor actual, la meta, el período evaluado, el análisis causal (Ishikawa o 5 porqués) y el plan de mejora con responsable y fechas.',
    regulatoryBasis:
      'Dec. 1011/2006 — SOGCS: monitoreo continuo con indicadores de calidad; obligación de análisis y planes de mejora',
  },
  pamec_acciones: {
    text: (g) =>
      `${g.description}. ¿Por qué no se cerró en el plazo acordado, quién está a cargo de su seguimiento y cuáles son las evidencias de avance?`,
    hint: 'Indique el hallazgo origen, la causa concreta del retraso, el nuevo compromiso de cierre, las evidencias de avance y si se escaló a dirección.',
    regulatoryBasis:
      'Dec. 1011/2006 Art. 7 — PAMEC: seguimiento periódico a acciones de mejora con evidencias de cierre efectivo',
  },
  pamec_hallazgos: {
    text: (g) =>
      `${g.description}. ¿Qué evidencias puede mostrar del análisis causal, las acciones correctivas formuladas y el cronograma de seguimiento?`,
    hint: 'Presente el análisis de causa raíz (Ishikawa o 5 porqués), las acciones formuladas con responsable y fecha, y el mecanismo de verificación de efectividad.',
    regulatoryBasis:
      'Dec. 1011/2006 — PAMEC: planes de mejoramiento con acciones correctivas medibles, responsables y fechas de seguimiento',
  },
}

export function buildQuestions(gaps: Gap[]): DrillQuestion[] {
  return gaps.map((gap) => {
    const tpl = TEMPLATES[gap.category]
    return {
      id: `q-${gap.id}`,
      gapId: gap.id,
      category: gap.category,
      severity: gap.severity,
      text: tpl.text(gap),
      hint: tpl.hint,
      regulatoryBasis: tpl.regulatoryBasis,
    }
  })
}
