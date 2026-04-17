import { mutation } from './_generated/server'
import { v } from 'convex/values'

// ─── Datos semilla — Instituto Oncohematológico Betania ───────────────────────

const SEDES = [
  {
    codigo: 'BAQ',
    nombre: 'Betania Barranquilla',
    ciudad: 'Barranquilla',
    departamento: 'Atlántico',
    direccion: 'Cra. 38 #79-25',
    servicios: [
      'Enfermería',
      'Fisioterapia',
      'Hematología',
      'Medicina Física y Rehabilitación',
      'Medicina General',
      'Medicina Interna',
      'Nutrición y Dietética',
      'Oncología Clínica',
      'Oncología y Hematología Pediátrica',
      'Ortopedia y/o Traumatología',
      'Psicología',
      'Quimioterapia',
      'Reumatología',
      'Servicio Farmacéutico',
    ],
  },
  {
    codigo: 'SIN',
    nombre: 'Betania Sincelejo',
    ciudad: 'Sincelejo',
    departamento: 'Sucre',
    direccion: 'Cl. 20 #25-30',
    servicios: [
      'Enfermería',
      'Fisioterapia',
      'Hematología',
      'Medicina General',
      'Medicina Interna',
      'Nutrición y Dietética',
      'Oncología Clínica',
      'Ortopedia y/o Traumatología',
      'Psicología',
      'Quimioterapia',
      'Reumatología',
      'Servicio Farmacéutico',
    ],
  },
  {
    codigo: 'STM',
    nombre: 'Betania Santa Marta',
    ciudad: 'Santa Marta',
    departamento: 'Magdalena',
    direccion: 'Av. del Río #15-40',
    servicios: [
      'Enfermería',
      'Fisioterapia',
      'Hematología',
      'Medicina Física y Rehabilitación',
      'Medicina General',
      'Medicina Interna',
      'Nutrición y Dietética',
      'Ortopedia y/o Traumatología',
      'Psicología',
      'Servicio Farmacéutico',
    ],
  },
  {
    codigo: 'MTR',
    nombre: 'Betania Montería',
    ciudad: 'Montería',
    departamento: 'Córdoba',
    direccion: 'Cl. 28 #5-60',
    servicios: [
      'Enfermería',
      'Fisioterapia',
      'Hematología',
      'Servicio Farmacéutico',
    ],
  },
]

const CARGOS = [
  {
    codigo: 'MD',
    nombre: 'Médico Hematólogo',
    tipo: 'asistencial' as const,
    area: 'Asistencial',
    perfil: 'Médico con especialización en hematología',
    docRequeridos: ['tarjeta_profesional', 'rethus'],
    capRequeridas: ['acls', 'gpc_hemofilia', 'humanizacion'],
  },
  {
    codigo: 'MD_ONC',
    nombre: 'Médico Oncólogo',
    tipo: 'asistencial' as const,
    area: 'Asistencial',
    perfil: 'Médico con especialización en oncología',
    docRequeridos: ['tarjeta_profesional', 'rethus'],
    capRequeridas: ['bls', 'manejo_quimio'],
  },
  {
    codigo: 'MD_GEN',
    nombre: 'Médico General',
    tipo: 'asistencial' as const,
    area: 'Asistencial',
    perfil: 'Médico general con experiencia en atención ambulatoria',
    docRequeridos: ['tarjeta_profesional', 'rethus'],
    capRequeridas: ['bls'],
  },
  {
    codigo: 'ENF',
    nombre: 'Enfermera Jefe',
    tipo: 'asistencial' as const,
    area: 'Asistencial',
    perfil: 'Enfermero/a profesional jefe de servicio',
    docRequeridos: ['tarjeta_profesional', 'rethus'],
    capRequeridas: ['acls', 'manejo_ams'],
  },
  {
    codigo: 'AUX_ENF',
    nombre: 'Auxiliar de Enfermería',
    tipo: 'asistencial' as const,
    area: 'Asistencial',
    perfil: 'Técnico auxiliar de enfermería',
    docRequeridos: ['titulo_tecnico', 'rethus'],
    capRequeridas: ['bls', 'bioseguridad'],
  },
  {
    codigo: 'QF',
    nombre: 'Químico Farmacéutico',
    tipo: 'asistencial' as const,
    area: 'Asistencial',
    perfil: 'Químico farmacéutico titulado',
    docRequeridos: ['tarjeta_profesional', 'rethus'],
    capRequeridas: ['cadena_frio', 'manejo_citotoxicos'],
  },
  {
    codigo: 'ADM',
    nombre: 'Auxiliar Administrativo',
    tipo: 'administrativo' as const,
    area: 'Administrativa',
    perfil: 'Técnico o tecnólogo administrativo',
    docRequeridos: ['titulo_tecnico'],
    capRequeridas: ['atencion_usuario'],
  },
  {
    codigo: 'COORD_CAL',
    nombre: 'Coordinador de Calidad',
    tipo: 'administrativo' as const,
    area: 'Calidad',
    perfil: 'Profesional de salud con formación en gestión de calidad',
    docRequeridos: ['titulo_profesional', 'tarjeta_profesional'],
    capRequeridas: ['normas_iso', 'auditoria_interna'],
  },
]

// Requisitos por defecto según cargo (estado inicial para seed)
const REQ_SEED: Record<string, Array<{ defId: string; estado: string; fechaVigencia?: string }>> = {
  MD: [
    { defId: 'rq_diploma', estado: 'VIGENTE', fechaVigencia: '2029-01-01' },
    { defId: 'rq_tp', estado: 'VIGENTE', fechaVigencia: '2026-06-01' },
    { defId: 'rq_rethus', estado: 'VIGENTE', fechaVigencia: '2027-01-01' },
    { defId: 'rq_diploma_esp', estado: 'VIGENTE', fechaVigencia: '2029-01-01' },
    { defId: 'rq_tp_esp', estado: 'VIGENTE', fechaVigencia: '2026-06-01' },
    { defId: 'rq_cert_acls', estado: 'VENCIDO', fechaVigencia: '2024-03-01' },
    { defId: 'rq_hep_b', estado: 'VIGENTE', fechaVigencia: '2026-12-01' },
    { defId: 'rq_tetanos', estado: 'SIN_CARGAR' },
    { defId: 'rq_covid', estado: 'VIGENTE', fechaVigencia: '2025-12-01' },
    { defId: 'rq_cap_hem', estado: 'VIGENTE', fechaVigencia: '2026-01-01' },
    { defId: 'rq_cap_seg', estado: 'SIN_CARGAR' },
    { defId: 'rq_cap_hum', estado: 'SIN_CARGAR' },
  ],
  ENF: [
    { defId: 'rq_diploma', estado: 'VIGENTE', fechaVigencia: '2028-01-01' },
    { defId: 'rq_tp', estado: 'VIGENTE', fechaVigencia: '2026-08-01' },
    { defId: 'rq_rethus', estado: 'VIGENTE', fechaVigencia: '2027-01-01' },
    { defId: 'rq_cert_acls', estado: 'VIGENTE', fechaVigencia: '2026-04-01' },
    { defId: 'rq_hep_b', estado: 'VIGENTE', fechaVigencia: '2026-12-01' },
    { defId: 'rq_tetanos', estado: 'VIGENTE', fechaVigencia: '2025-10-01' },
    { defId: 'rq_covid', estado: 'VIGENTE', fechaVigencia: '2025-12-01' },
    { defId: 'rq_cap_seg', estado: 'POR_VALIDAR' },
    { defId: 'rq_cap_ams', estado: 'VIGENTE', fechaVigencia: '2026-02-01' },
  ],
  AUX_ENF: [
    { defId: 'rq_titulo_tec', estado: 'VIGENTE', fechaVigencia: '2029-01-01' },
    { defId: 'rq_rethus', estado: 'VIGENTE', fechaVigencia: '2027-01-01' },
    { defId: 'rq_hep_b', estado: 'VIGENTE', fechaVigencia: '2026-12-01' },
    { defId: 'rq_tetanos', estado: 'SIN_CARGAR' },
    { defId: 'rq_covid', estado: 'VIGENTE', fechaVigencia: '2025-12-01' },
    { defId: 'rq_cap_bio', estado: 'VIGENTE', fechaVigencia: '2026-03-01' },
  ],
  QF: [
    { defId: 'rq_diploma', estado: 'VIGENTE', fechaVigencia: '2028-06-01' },
    { defId: 'rq_tp', estado: 'VIGENTE', fechaVigencia: '2026-09-01' },
    { defId: 'rq_rethus', estado: 'VIGENTE', fechaVigencia: '2027-01-01' },
    { defId: 'rq_hep_b', estado: 'VIGENTE', fechaVigencia: '2026-12-01' },
    { defId: 'rq_covid', estado: 'VIGENTE', fechaVigencia: '2025-12-01' },
    { defId: 'rq_cap_cito', estado: 'VIGENTE', fechaVigencia: '2026-05-01' },
    { defId: 'rq_cap_frio', estado: 'SIN_CARGAR' },
  ],
  MD_ONC: [
    { defId: 'rq_diploma', estado: 'VIGENTE', fechaVigencia: '2029-01-01' },
    { defId: 'rq_tp', estado: 'VIGENTE', fechaVigencia: '2026-11-01' },
    { defId: 'rq_rethus', estado: 'VIGENTE', fechaVigencia: '2027-01-01' },
    { defId: 'rq_diploma_esp', estado: 'VIGENTE', fechaVigencia: '2029-01-01' },
    { defId: 'rq_tp_esp', estado: 'VIGENTE', fechaVigencia: '2026-11-01' },
    { defId: 'rq_hep_b', estado: 'VIGENTE', fechaVigencia: '2026-12-01' },
    { defId: 'rq_covid', estado: 'VIGENTE', fechaVigencia: '2025-12-01' },
    { defId: 'rq_cap_quimio', estado: 'VIGENTE', fechaVigencia: '2026-06-01' },
  ],
  MD_GEN: [
    { defId: 'rq_diploma', estado: 'VIGENTE', fechaVigencia: '2028-01-01' },
    { defId: 'rq_tp', estado: 'VENCIDO', fechaVigencia: '2025-01-01' },
    { defId: 'rq_rethus', estado: 'VIGENTE', fechaVigencia: '2027-01-01' },
    { defId: 'rq_hep_b', estado: 'SIN_CARGAR' },
    { defId: 'rq_covid', estado: 'VIGENTE', fechaVigencia: '2025-12-01' },
  ],
  ADM: [
    { defId: 'rq_titulo_tec', estado: 'VIGENTE', fechaVigencia: '2029-01-01' },
    { defId: 'rq_cap_atencion', estado: 'VIGENTE', fechaVigencia: '2026-01-01' },
  ],
}

const PERSONAS = [
  {
    nombre: 'Dr. Andrés Ospino',
    cedula: '1234567890',
    cargoCodigo: 'MD',
    sedeCodigo: 'BAQ',
    fechaIngreso: '2021-03-01',
    estado: 'activo' as const,
    requisitos: REQ_SEED['MD'],
  },
  {
    nombre: 'Enf. Claudia Martínez',
    cedula: '2345678901',
    cargoCodigo: 'ENF',
    sedeCodigo: 'BAQ',
    fechaIngreso: '2020-07-15',
    estado: 'activo' as const,
    requisitos: REQ_SEED['ENF'],
  },
  {
    nombre: 'Dr. Luis Palomino',
    cedula: '3456789012',
    cargoCodigo: 'MD_GEN',
    sedeCodigo: 'SIN',
    fechaIngreso: '2022-01-10',
    estado: 'activo' as const,
    requisitos: REQ_SEED['MD_GEN'],
  },
  {
    nombre: 'Enf. Patricia Díaz',
    cedula: '4567890123',
    cargoCodigo: 'AUX_ENF',
    sedeCodigo: 'STM',
    fechaIngreso: '2023-05-01',
    estado: 'activo' as const,
    requisitos: REQ_SEED['AUX_ENF'],
  },
  {
    nombre: 'Quím. Mario Herrera',
    cedula: '5678901234',
    cargoCodigo: 'QF',
    sedeCodigo: 'MTR',
    fechaIngreso: '2021-09-20',
    estado: 'activo' as const,
    requisitos: REQ_SEED['QF'],
  },
  {
    nombre: 'Dra. Sandra Roa',
    cedula: '6789012345',
    cargoCodigo: 'MD_ONC',
    sedeCodigo: 'BAQ',
    fechaIngreso: '2019-11-01',
    estado: 'activo' as const,
    requisitos: REQ_SEED['MD_ONC'],
  },
  {
    nombre: 'Enf. Rosa Berrío',
    cedula: '7890123456',
    cargoCodigo: 'AUX_ENF',
    sedeCodigo: 'SIN',
    fechaIngreso: '2022-08-01',
    estado: 'activo' as const,
    requisitos: REQ_SEED['AUX_ENF'],
  },
]

const INDICADORES = [
  {
    nombre: '% capacitaciones ejecutadas',
    descripcion: 'Capacitaciones con estado Ejecutada / total programadas',
    formula: '(Ejecutadas / Programadas) × 100',
    meta: 80,
    unidad: '%',
    frecuencia: 'mensual' as const,
    proceso: 'Talento Humano',
    responsable: 'Coord. Calidad',
  },
  {
    nombre: '% personal con documentación completa',
    descripcion: 'Personas con todos los requisitos documentales validados',
    formula: '(Personas completas / Total personas) × 100',
    meta: 100,
    unidad: '%',
    frecuencia: 'mensual' as const,
    proceso: 'Talento Humano',
    responsable: 'Coord. Calidad',
  },
  {
    nombre: '% capacitaciones normativas ejecutadas',
    descripcion: 'Capacitaciones obligatorias por norma con estado Ejecutada',
    formula: '(Ejecutadas normativas / Programadas normativas) × 100',
    meta: 100,
    unidad: '%',
    frecuencia: 'mensual' as const,
    proceso: 'Talento Humano',
    responsable: 'Coord. Calidad',
  },
  {
    nombre: '% equipos con mantenimiento vigente',
    descripcion: 'Equipos con próximo mantenimiento en fecha futura / total',
    formula: '(Mant. vigentes / Total equipos) × 100',
    meta: 100,
    unidad: '%',
    frecuencia: 'mensual' as const,
    proceso: 'Dotación',
    responsable: 'Coord. Calidad',
  },
  {
    nombre: '% equipos con calibración vigente',
    descripcion: 'Equipos con calibración vigente / total',
    formula: '(Calibración vigente / Total equipos) × 100',
    meta: 100,
    unidad: '%',
    frecuencia: 'mensual' as const,
    proceso: 'Dotación',
    responsable: 'Coord. Calidad',
  },
  {
    nombre: '% HV técnicas cargadas en equipos',
    descripcion: 'Equipos con link HV técnica cargado / total',
    formula: '(Con HV / Total) × 100',
    meta: 100,
    unidad: '%',
    frecuencia: 'mensual' as const,
    proceso: 'Dotación',
    responsable: 'Coord. Calidad',
  },
  {
    nombre: '% checklist habilitación cumplido',
    descripcion: 'Promedio de ítems cumplidos por sede habilitada',
    formula: 'avg(Cumple / Total ítems) × 100',
    meta: 100,
    unidad: '%',
    frecuencia: 'trimestral' as const,
    proceso: 'Habilitación',
    responsable: 'Coord. Calidad',
  },
  {
    nombre: '% documentos vigentes',
    descripcion: 'Documentos con estado Vigente / total',
    formula: '(Vigentes / Total) × 100',
    meta: 100,
    unidad: '%',
    frecuencia: 'mensual' as const,
    proceso: 'Gestión Documental',
    responsable: 'Coord. Calidad',
  },
  {
    nombre: '% documentos con SP cargado',
    descripcion: 'Documentos con link SharePoint cargado / total',
    formula: '(Con SP / Total) × 100',
    meta: 100,
    unidad: '%',
    frecuencia: 'mensual' as const,
    proceso: 'Gestión Documental',
    responsable: 'Coord. Calidad',
  },
  {
    nombre: '% PQRS respondidas en término',
    descripcion: 'PQRS cerradas dentro de 15 días hábiles / total cerradas',
    formula: '(A término / Cerradas) × 100',
    meta: 95,
    unidad: '%',
    frecuencia: 'mensual' as const,
    proceso: 'Satisfacción',
    responsable: 'Coord. Calidad',
  },
  {
    nombre: 'Tiempo promedio respuesta PQRS (días)',
    descripcion: 'Promedio de días entre recepción y cierre de PQRS',
    formula: 'avg(días entre recepción y cierre)',
    meta: 15,
    unidad: 'días',
    frecuencia: 'mensual' as const,
    proceso: 'Satisfacción',
    responsable: 'Coord. Calidad',
  },
  {
    nombre: '% adherencia a GPC (promedio)',
    descripcion: 'Promedio de adherencia a todas las GPC medidas en el período',
    formula: 'avg(% adherencia por GPC)',
    meta: 95,
    unidad: '%',
    frecuencia: 'trimestral' as const,
    proceso: 'Pertinencia',
    responsable: 'Coord. Calidad',
  },
  {
    nombre: '% alertas sanitarias con acción',
    descripcion: 'Alertas sanitarias con acción tomada registrada / total',
    formula: '(Con acción / Total) × 100',
    meta: 100,
    unidad: '%',
    frecuencia: 'mensual' as const,
    proceso: 'Medicamentos y DM',
    responsable: 'Coord. Calidad',
  },
  {
    nombre: '% solicitudes mantenimiento cerradas',
    descripcion: 'Solicitudes de mantenimiento con estado Cerrado / total',
    formula: '(Cerradas / Total) × 100',
    meta: 80,
    unidad: '%',
    frecuencia: 'mensual' as const,
    proceso: 'Mantenimiento',
    responsable: 'Coord. Calidad',
  },
]

const DOCUMENTOS = [
  {
    codigo: 'GC-MA-001',
    nombre: 'Manual de Calidad Betania',
    tipo: 'manual' as const,
    proceso: 'Gestión de calidad',
    version: 'v3.0',
    fechaElaboracion: '2024-01-15',
    fechaVigencia: '2025-01-15',
    elaboradoPor: 'Coord. Calidad',
    estado: 'vigente' as const,
  },
  {
    codigo: 'GC-PO-001',
    nombre: 'Política de Seguridad del Paciente',
    tipo: 'politica' as const,
    proceso: 'Seguridad del paciente',
    version: 'v2.1',
    fechaElaboracion: '2024-03-10',
    fechaVigencia: '2025-03-10',
    elaboradoPor: 'Dir. Médico',
    estado: 'vigente' as const,
  },
  {
    codigo: 'AT-PR-001',
    nombre: 'Protocolo Manejo Hemofilia – Infusión IV',
    tipo: 'protocolo' as const,
    proceso: 'Atención al paciente',
    version: 'v4.0',
    fechaElaboracion: '2024-06-01',
    fechaVigencia: '2025-06-01',
    elaboradoPor: 'Dir. Médico',
    estado: 'vigente' as const,
  },
  {
    codigo: 'AT-GPC-001',
    nombre: 'GPC Hemofilia – Diagnóstico y Tratamiento',
    tipo: 'guia_practica_clinica' as const,
    proceso: 'Atención al paciente',
    version: 'v1.2',
    fechaElaboracion: '2023-11-20',
    fechaVigencia: '2024-11-20',
    elaboradoPor: 'Dir. Médico',
    estado: 'en_revision' as const,
  },
  {
    codigo: 'TH-PR-001',
    nombre: 'Procedimiento Gestión Hojas de Vida',
    tipo: 'procedimiento' as const,
    proceso: 'Talento humano',
    version: 'v2.0',
    fechaElaboracion: '2026-02-01',
    fechaVigencia: '2027-02-01',
    elaboradoPor: 'Coord. Calidad',
    estado: 'vigente' as const,
  },
  {
    codigo: 'EQ-PR-001',
    nombre: 'Procedimiento Mantenimiento Biomédico',
    tipo: 'procedimiento' as const,
    proceso: 'Gestión de equipos',
    version: 'v1.5',
    fechaElaboracion: '2024-04-15',
    fechaVigencia: '2025-04-15',
    elaboradoPor: 'Coord. Calidad',
    estado: 'vigente' as const,
  },
  {
    codigo: 'GC-PR-002',
    nombre: 'Procedimiento Gestión de PQR',
    tipo: 'procedimiento' as const,
    proceso: 'PQR',
    version: 'v2.2',
    fechaElaboracion: '2024-07-01',
    fechaVigencia: '2025-07-01',
    elaboradoPor: 'Coord. Calidad',
    estado: 'vigente' as const,
  },
  {
    codigo: 'SP-PR-001',
    nombre: 'Protocolo Manejo Eventos Adversos',
    tipo: 'protocolo' as const,
    proceso: 'Seguridad del paciente',
    version: 'v3.1',
    fechaElaboracion: '2024-05-20',
    fechaVigencia: '2025-05-20',
    elaboradoPor: 'Coord. Calidad',
    estado: 'en_aprobacion' as const,
  },
  {
    codigo: 'FIN-CE-001',
    nombre: 'Certificado Suficiencia Patrimonial',
    tipo: 'certificado' as const,
    proceso: 'Gestión financiera',
    version: 'v1.0',
    fechaElaboracion: '2025-01-15',
    fechaVigencia: '2026-01-15',
    elaboradoPor: 'Dir. Administrativo',
    estado: 'vigente' as const,
  },
  {
    codigo: 'FIN-PO-001',
    nombre: 'Póliza Responsabilidad Civil Extracontractual',
    tipo: 'poliza' as const,
    proceso: 'Gestión financiera',
    version: 'v1.0',
    fechaElaboracion: '2025-02-01',
    fechaVigencia: '2026-02-01',
    elaboradoPor: 'Dir. Administrativo',
    estado: 'vigente' as const,
  },
]

// ─── Datos adicionales ───────────────────────────────────────────────────────

const EQUIPOS = [
  {
    sedeCodigo: 'BAQ', nombre: 'Bomba de Infusión IV', marca: 'Baxter',
    modelo: 'SIGMA Spectrum', serie: 'SIG-001', area: 'Sala de infusión',
    fechaCompra: '2022-06-10', ultimaMant: '2024-10-15', proxMant: '2025-04-15',
    estado: 'operativo' as const, invima: 'INVIMA 2020DM-0001', vidaUtil: 10, prioridad: 'alta' as const,
  },
  {
    sedeCodigo: 'BAQ', nombre: 'Bomba de Infusión IV', marca: 'Baxter',
    modelo: 'SIGMA Spectrum', serie: 'SIG-002', area: 'Sala de infusión',
    fechaCompra: '2022-06-10', ultimaMant: '2024-10-15', proxMant: '2025-04-15',
    estado: 'operativo' as const, invima: 'INVIMA 2020DM-0001', vidaUtil: 10, prioridad: 'alta' as const,
  },
  {
    sedeCodigo: 'SIN', nombre: 'Monitor Signos Vitales', marca: 'Mindray',
    modelo: 'MEC-1200', serie: 'MEC-001', area: 'Urgencias',
    fechaCompra: '2021-02-10', ultimaMant: '2024-11-20', proxMant: '2025-05-20',
    estado: 'operativo' as const, invima: 'INVIMA 2020DM-0456', vidaUtil: 10, prioridad: 'alta' as const,
  },
  {
    sedeCodigo: 'STM', nombre: 'Bomba de Infusión IV', marca: 'Fresenius',
    modelo: 'Agilia', serie: 'AGI-001', area: 'Sala de infusión',
    fechaCompra: '2020-09-01', ultimaMant: '2024-09-05', proxMant: '2025-03-05',
    estado: 'operativo' as const, invima: 'INVIMA 2019DM-0789', vidaUtil: 10, prioridad: 'alta' as const,
  },
  {
    sedeCodigo: 'MTR', nombre: 'Refrigerador Médico', marca: 'Helmer',
    modelo: 'HLR-105', serie: 'HLR-001', area: 'Farmacia',
    fechaCompra: '2019-07-15', ultimaMant: '2024-08-01', proxMant: '2025-02-01',
    estado: 'operativo' as const, invima: 'INVIMA 2018DM-0234', vidaUtil: 15, prioridad: 'alta' as const,
  },
  {
    sedeCodigo: 'MTR', nombre: 'Monitor Signos Vitales', marca: 'Mindray',
    modelo: 'MEC-2000', serie: 'MEC-002', area: 'Consulta externa',
    fechaCompra: '2023-01-05', ultimaMant: '2025-01-10', proxMant: '2025-07-10',
    estado: 'operativo' as const, invima: 'INVIMA 2020DM-0456', vidaUtil: 10, prioridad: 'alta' as const,
  },
]

const MANTENIMIENTOS_SEED = [
  {
    sedeCodigo: 'BAQ', codigo: 'MNT-2025-001',
    descripcion: 'Alarma de oclusión activa de forma intermitente sin causa aparente. Equipo fuera de servicio.',
    tipo: 'biomedico' as const, area: 'Sala de infusión', prioridad: 'alta' as const,
    solicitante: 'Enf. Claudia Martínez', apertura: '2025-03-10', estado: 'en_ejecucion' as const,
  },
  {
    sedeCodigo: 'SIN', codigo: 'MNT-2025-002',
    descripcion: 'Filtro de aire acondicionado obstruido. Olores y temperatura inadecuada para pacientes.',
    tipo: 'infraestructura' as const, area: 'Sala de espera', prioridad: 'media' as const,
    solicitante: 'Dr. Luis Palomino', apertura: '2025-03-15', estado: 'cerrado' as const,
  },
  {
    sedeCodigo: 'BAQ', codigo: 'MNT-2025-003',
    descripcion: 'Computador de recepción presenta lentitud extrema al abrir el sistema de historias clínicas.',
    tipo: 'ti' as const, area: 'Recepción', prioridad: 'baja' as const,
    solicitante: 'Coord. Calidad', apertura: '2025-04-01', estado: 'abierto' as const,
  },
]

const PQRS_SEED = [
  {
    sedeCodigo: 'BAQ', radicado: 'PQR-2026-001', tipo: 'queja' as const,
    fecha: '2026-03-10', nombreInteresado: 'María Fernández', contacto: '3001234567',
    descripcion: 'Demora en la atención en sala de infusión — paciente esperó más de 2 horas.',
    responsable: 'Coord. Calidad', estado: 'en_tramite' as const,
  },
  {
    sedeCodigo: 'SIN', radicado: 'PQR-2026-002', tipo: 'peticion' as const,
    fecha: '2026-03-15', nombreInteresado: 'Carlos Ramos', contacto: '3151234567',
    descripcion: 'Solicitud de copia de historia clínica.',
    respuesta: 'Se entregó copia en fecha 25/03/2026.', fechaRespuesta: '2026-03-25',
    responsable: 'Admisionista', estado: 'cerrado' as const,
  },
  {
    sedeCodigo: 'BAQ', radicado: 'PQR-2026-003', tipo: 'reclamo' as const,
    fecha: '2026-04-01', nombreInteresado: 'Luis Pérez', contacto: '3012345678',
    descripcion: 'Cobro indebido por medicamento no POS.',
    responsable: 'Coord. Calidad', estado: 'vencido' as const,
  },
]

const ADHERENCIA_SEED = [
  {
    sedeCodigo: 'BAQ', protocolo: 'GPC Hemofilia – Diagnóstico',
    periodo: '2026-T1', totalAplicaciones: 50, conformes: 46, noConformes: 4,
    observaciones: 'Adherencia aceptable', responsable: 'Dir. Médico', fecha: '2026-04-05',
  },
  {
    sedeCodigo: 'BAQ', protocolo: 'Protocolo identificación del paciente',
    periodo: '2026-T1', totalAplicaciones: 200, conformes: 184, noConformes: 16,
    observaciones: 'Plan de refuerzo en puntos de admisión', responsable: 'Coord. Calidad', fecha: '2026-04-05',
  },
  {
    sedeCodigo: 'BAQ', protocolo: 'Protocolo administración medicamentos',
    periodo: '2026-T1', totalAplicaciones: 150, conformes: 135, noConformes: 15,
    observaciones: '', responsable: 'Coord. Calidad', fecha: '2026-04-05',
  },
  {
    sedeCodigo: 'BAQ', protocolo: 'Lavado de manos clínico',
    periodo: '2026-T1', totalAplicaciones: 300, conformes: 270, noConformes: 30,
    observaciones: 'Reforzar con observación directa', responsable: 'Jefe de Enfermería', fecha: '2026-04-05',
  },
]

const PAMEC_AUDITORIAS_SEED = [
  {
    sedeCodigo: 'BAQ', tipo: 'interna' as const, proceso: 'Talento Humano',
    auditor: 'Coord. Calidad', fechaInicio: '2025-05-15', fechaFin: '2025-05-15',
    estado: 'planeada' as const, observaciones: 'Auditoría programada sobre requisitos documentales',
    hallazgos: [],
  },
  {
    sedeCodigo: 'TODAS', tipo: 'interna' as const, proceso: 'Equipos Biomédicos',
    auditor: 'Coord. Calidad', fechaInicio: '2025-06-10', fechaFin: '2025-06-12',
    estado: 'planeada' as const, observaciones: 'Auditoría de equipos biomédicos en todas las sedes',
    hallazgos: [],
  },
  {
    sedeCodigo: 'SIN', tipo: 'seguimiento' as const, proceso: 'Habilitación',
    auditor: 'Coord. Calidad', fechaInicio: '2024-11-20', fechaFin: '2024-11-20',
    estado: 'cerrada' as const,
    observaciones: 'Seguimiento a plan de habilitación — 2 hallazgos identificados',
    hallazgos: [
      {
        id: 'h1', tipo: 'no_conformidad' as const,
        descripcion: 'Procedimientos nuevos sin socialización documentada',
        criterio: 'Res. 3100/2019', estado: 'abierto' as const,
        accionCorrectiva: 'Elaborar cronograma de socialización trimestral',
        responsable: 'Coord. Calidad', fechaLimite: '2025-12-31',
      },
      {
        id: 'h2', tipo: 'observacion' as const,
        descripcion: 'Registros de capacitación sin firma de asistencia',
        criterio: 'Res. 3100/2019', estado: 'cerrado' as const,
      },
    ],
  },
]

const PAMEC_ACCIONES_SEED = [
  {
    sedeCodigo: 'SIN',
    hallazgo: 'Protocolo de manejo seguro de medicamentos no socializado',
    causa: 'Alta rotación de personal y falta de cronograma formal',
    accion: 'Elaborar cronograma de socialización trimestral y registrar asistencia',
    responsable: 'Coord. Calidad', fechaLimite: '2025-12-31',
    estado: 'vencido' as const, fase: 'planear' as const,
  },
]

// ─── Seed mutation ────────────────────────────────────────────────────────────

export const seedBetania = mutation({
  args: { orgId: v.string() },
  handler: async (ctx, { orgId }) => {
    const results = {
      tenant: 'skipped' as 'created' | 'skipped',
      sedes: 0,
      cargos: 0,
      indicadores: 0,
      documentos: 0,
      personal: 0,
      equipos: 0,
      mantenimientos: 0,
      pqrs: 0,
      adherencia: 0,
      pamecAuditorias: 0,
      pamecAcciones: 0,
    }

    // ── 1. Tenant ─────────────────────────────────────────────────────────────
    const existingTenant = await ctx.db
      .query('tenants')
      .withIndex('by_org', (q) => q.eq('orgId', orgId))
      .first()

    if (!existingTenant) {
      await ctx.db.insert('tenants', {
        orgId,
        slug: 'betania',
        nombre: 'Instituto Oncohematológico Betania',
        plan: 'pro',
        activo: true,
      })
      results.tenant = 'created'
    }

    // ── 2. Sedes ──────────────────────────────────────────────────────────────
    for (const sede of SEDES) {
      const existing = await ctx.db
        .query('sedes')
        .withIndex('by_org', (q) => q.eq('orgId', orgId))
        .filter((q) => q.eq(q.field('codigo'), sede.codigo))
        .first()

      if (!existing) {
        await ctx.db.insert('sedes', { orgId, ...sede, activa: true })
        results.sedes++
      }
    }

    // ── 3. Cargos ─────────────────────────────────────────────────────────────
    for (const cargo of CARGOS) {
      const existing = await ctx.db
        .query('cargos')
        .withIndex('by_org', (q) => q.eq('orgId', orgId))
        .filter((q) => q.eq(q.field('nombre'), cargo.nombre))
        .first()

      if (!existing) {
        await ctx.db.insert('cargos', { orgId, ...cargo })
        results.cargos++
      } else {
        const patch: Record<string, unknown> = {}
        if (!existing.codigo) patch.codigo = cargo.codigo
        if (!existing.tipo) patch.tipo = cargo.tipo
        if (Object.keys(patch).length > 0) await ctx.db.patch(existing._id, patch)
      }
    }

    // ── 4. Indicadores ────────────────────────────────────────────────────────
    for (const ind of INDICADORES) {
      const existing = await ctx.db
        .query('indicadores')
        .withIndex('by_org', (q) => q.eq('orgId', orgId))
        .filter((q) => q.eq(q.field('nombre'), ind.nombre))
        .first()

      if (!existing) {
        await ctx.db.insert('indicadores', { orgId, ...ind, activo: true })
        results.indicadores++
      }
    }

    // ── 5. Personal ───────────────────────────────────────────────────────────
    for (const persona of PERSONAS) {
      const existing = await ctx.db
        .query('personal')
        .withIndex('by_org', (q) => q.eq('orgId', orgId))
        .filter((q) => q.eq(q.field('cedula'), persona.cedula))
        .first()

      if (!existing) {
        const sede = await ctx.db
          .query('sedes')
          .withIndex('by_org', (q) => q.eq('orgId', orgId))
          .filter((q) => q.eq(q.field('codigo'), persona.sedeCodigo))
          .first()
        const cargo = await ctx.db
          .query('cargos')
          .withIndex('by_org', (q) => q.eq('orgId', orgId))
          .filter((q) => q.eq(q.field('codigo'), persona.cargoCodigo))
          .first()

        if (sede && cargo) {
          await ctx.db.insert('personal', {
            orgId,
            sedeId: sede._id,
            sedeCodigo: persona.sedeCodigo,
            cargoId: cargo._id,
            cargoCodigo: persona.cargoCodigo,
            nombre: persona.nombre,
            cedula: persona.cedula,
            fechaIngreso: persona.fechaIngreso,
            estado: persona.estado,
            requisitos: (persona.requisitos ?? []).map((r) => ({
              defId: r.defId,
              estado: r.estado as any,
              fechaVigencia: r.fechaVigencia,
            })),
          })
          results.personal++
        }
      }
    }

    // ── 6. Documentos ─────────────────────────────────────────────────────────
    for (const doc of DOCUMENTOS) {
      const existing = await ctx.db
        .query('documentos')
        .withIndex('by_org', (q) => q.eq('orgId', orgId))
        .filter((q) => q.eq(q.field('codigo'), doc.codigo))
        .first()

      if (!existing) {
        await ctx.db.insert('documentos', { orgId, ...doc })
        results.documentos++
      }
    }

    // ── 7. Mapeo sedes → sedeId (para los módulos que lo requieren) ──────────
    const allSedes = await ctx.db
      .query('sedes')
      .withIndex('by_org', (q) => q.eq('orgId', orgId))
      .collect()
    const sedeMap = Object.fromEntries(allSedes.map((s) => [s.codigo, s._id]))
    const baqId = sedeMap['BAQ'] // fallback para 'TODAS'

    // ── 8. Equipos ────────────────────────────────────────────────────────────
    for (const eq of EQUIPOS) {
      const existing = await ctx.db
        .query('equipos')
        .withIndex('by_org', (q) => q.eq('orgId', orgId))
        .filter((q) => q.eq(q.field('serie'), eq.serie))
        .first()
      if (!existing) {
        const sedeId = sedeMap[eq.sedeCodigo] ?? baqId
        if (!sedeId) continue
        await ctx.db.insert('equipos', { orgId, sedeId, ...eq })
        results.equipos++
      }
    }

    // ── 9. Mantenimientos ─────────────────────────────────────────────────────
    for (const m of MANTENIMIENTOS_SEED) {
      const existing = await ctx.db
        .query('mantenimientos')
        .withIndex('by_org', (q) => q.eq('orgId', orgId))
        .filter((q) => q.eq(q.field('codigo'), m.codigo))
        .first()
      if (!existing) {
        const sedeId = sedeMap[m.sedeCodigo] ?? baqId
        if (!sedeId) continue
        await ctx.db.insert('mantenimientos', { orgId, sedeId, ...m })
        results.mantenimientos++
      }
    }

    // ── 10. PQRS ──────────────────────────────────────────────────────────────
    for (const p of PQRS_SEED) {
      const existing = await ctx.db
        .query('pqrs')
        .withIndex('by_org', (q) => q.eq('orgId', orgId))
        .filter((q) => q.eq(q.field('radicado'), p.radicado))
        .first()
      if (!existing) {
        const sedeId = sedeMap[p.sedeCodigo] ?? baqId
        if (!sedeId) continue
        await ctx.db.insert('pqrs', { orgId, sedeId, ...p })
        results.pqrs++
      }
    }

    // ── 11. Adherencia ────────────────────────────────────────────────────────
    for (const a of ADHERENCIA_SEED) {
      const existing = await ctx.db
        .query('adherencia')
        .withIndex('by_org', (q) => q.eq('orgId', orgId))
        .filter((q) =>
          q.and(
            q.eq(q.field('protocolo'), a.protocolo),
            q.eq(q.field('periodo'), a.periodo)
          )
        )
        .first()
      if (!existing) {
        const sedeId = sedeMap[a.sedeCodigo] ?? baqId
        if (!sedeId) continue
        await ctx.db.insert('adherencia', { orgId, sedeId, ...a })
        results.adherencia++
      }
    }

    // ── 12. PAMEC auditorías ──────────────────────────────────────────────────
    for (const aud of PAMEC_AUDITORIAS_SEED) {
      const existing = await ctx.db
        .query('pamec_auditorias')
        .withIndex('by_org', (q) => q.eq('orgId', orgId))
        .filter((q) =>
          q.and(
            q.eq(q.field('proceso'), aud.proceso),
            q.eq(q.field('fechaInicio'), aud.fechaInicio)
          )
        )
        .first()
      if (!existing) {
        const sedeId = (aud.sedeCodigo !== 'TODAS' ? sedeMap[aud.sedeCodigo] : baqId) ?? baqId
        if (!sedeId) continue
        await ctx.db.insert('pamec_auditorias', { orgId, sedeId, ...aud })
        results.pamecAuditorias++
      }
    }

    // ── 13. PAMEC acciones ────────────────────────────────────────────────────
    for (const ac of PAMEC_ACCIONES_SEED) {
      const existing = await ctx.db
        .query('pamec_acciones')
        .withIndex('by_org', (q) => q.eq('orgId', orgId))
        .filter((q) => q.eq(q.field('hallazgo'), ac.hallazgo))
        .first()
      if (!existing) {
        await ctx.db.insert('pamec_acciones', { orgId, ...ac })
        results.pamecAcciones++
      }
    }

    return results
  },
})
