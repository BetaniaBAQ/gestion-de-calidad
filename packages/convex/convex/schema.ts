import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

// ─── Convex schema multi-tenant para Cualia SGC ────────────────────────────
//
// Todas las tablas incluyen `orgId` (WorkOS Organization ID) para aislación
// de datos por tenant. Cada query/mutation filtra por orgId.
//
// Convención de índices:
//   - by_org        → queries genéricas del tenant
//   - by_org_sede   → queries filtradas por sede dentro del tenant
//   - by_org_estado → queries por estado dentro del tenant

export default defineSchema({
  // ── Config: Tenants ─────────────────────────────────────────────────────
  tenants: defineTable({
    orgId: v.string(), // WorkOS Organization ID
    slug: v.string(), // "betania" → betania.cualia.app
    nombre: v.string(),
    customDomain: v.optional(v.string()),
    logo: v.optional(v.string()),
    colores: v.optional(v.any()),
    plan: v.union(v.literal('trial'), v.literal('pro'), v.literal('enterprise')),
    activo: v.boolean(),
  })
    .index('by_org', ['orgId'])
    .index('by_slug', ['slug'])
    .index('by_custom_domain', ['customDomain']),

  // ── Config: Sedes ────────────────────────────────────────────────────────
  sedes: defineTable({
    orgId: v.string(),
    nombre: v.string(),
    codigo: v.string(), // BAQ, SIN, STM, MTR
    ciudad: v.string(),
    departamento: v.optional(v.string()),
    direccion: v.string(),
    activa: v.boolean(),
    servicios: v.array(v.string()), // Servicios REPS habilitados
  }).index('by_org', ['orgId']),

  // ── Config: Cargos ───────────────────────────────────────────────────────
  cargos: defineTable({
    orgId: v.string(),
    nombre: v.string(),
    area: v.string(),
    perfil: v.string(),
    docRequeridos: v.array(v.string()),
    capRequeridas: v.array(v.string()),
  }).index('by_org', ['orgId']),

  // ── Config: Usuarios ─────────────────────────────────────────────────────
  usuarios: defineTable({
    orgId: v.string(),
    workosUserId: v.string(), // WorkOS User ID
    nombre: v.string(),
    email: v.string(),
    rol: v.union(
      v.literal('admin'),
      v.literal('calidad'),
      v.literal('director'),
      v.literal('coordinador'),
      v.literal('farmaceutico'),
      v.literal('view')
    ),
    sedeId: v.optional(v.id('sedes')), // null = acceso a todas las sedes
    activo: v.boolean(),
  })
    .index('by_org', ['orgId'])
    .index('by_workos_user', ['workosUserId']),

  // ── TH: Personal ─────────────────────────────────────────────────────────
  personal: defineTable({
    orgId: v.string(),
    sedeId: v.id('sedes'),
    nombre: v.string(),
    cedula: v.string(),
    cargoId: v.id('cargos'),
    fechaIngreso: v.string(),
    estado: v.union(
      v.literal('activo'),
      v.literal('inactivo'),
      v.literal('vacaciones'),
      v.literal('licencia')
    ),
    // Scores calculados en queries, no almacenados
  })
    .index('by_org', ['orgId'])
    .index('by_org_sede', ['orgId', 'sedeId'])
    .index('by_org_estado', ['orgId', 'estado']),

  // ── TH: Documentos de personal (hojas de vida, licencias, etc.) ──────────
  docs_personal: defineTable({
    orgId: v.string(),
    personaId: v.id('personal'),
    tipo: v.string(), // Tarjeta profesional, RCN, Vacuna hepatitis, etc.
    numero: v.optional(v.string()),
    fechaExp: v.string(),
    fechaVenc: v.optional(v.string()),
    archivo: v.optional(v.string()), // URL Uploadthing
    estado: v.union(
      v.literal('vigente'),
      v.literal('vencido'),
      v.literal('por_vencer'),
      v.literal('sin_cargar'),
      v.literal('por_validar')
    ),
    validadoPor: v.optional(v.string()), // userId del que validó
    validadoEn: v.optional(v.number()), // timestamp
  })
    .index('by_org', ['orgId'])
    .index('by_persona', ['personaId'])
    .index('by_org_estado', ['orgId', 'estado']),

  // ── TH: Capacitaciones ───────────────────────────────────────────────────
  caps_personal: defineTable({
    orgId: v.string(),
    personaId: v.id('personal'),
    tema: v.string(),
    fecha: v.string(),
    horas: v.number(),
    entidad: v.string(),
    certificado: v.optional(v.string()), // URL Uploadthing
  })
    .index('by_org', ['orgId'])
    .index('by_persona', ['personaId']),

  // ── Dotación: Equipos ────────────────────────────────────────────────────
  equipos: defineTable({
    orgId: v.string(),
    sedeId: v.id('sedes'),
    nombre: v.string(),
    marca: v.string(),
    modelo: v.string(),
    serie: v.string(),
    area: v.string(),
    fechaCompra: v.string(),
    ultimaMant: v.optional(v.string()),
    proxMant: v.optional(v.string()),
    estado: v.union(
      v.literal('operativo'),
      v.literal('mantenimiento'),
      v.literal('baja'),
      v.literal('reparacion')
    ),
    invima: v.optional(v.string()),
    vidaUtil: v.optional(v.number()), // años
    prioridad: v.union(v.literal('alta'), v.literal('media'), v.literal('baja')),
  })
    .index('by_org', ['orgId'])
    .index('by_org_sede', ['orgId', 'sedeId'])
    .index('by_org_estado', ['orgId', 'estado']),

  // ── Dotación: Mantenimientos ─────────────────────────────────────────────
  mantenimientos: defineTable({
    orgId: v.string(),
    equipoId: v.optional(v.id('equipos')), // null = mantenimiento de infraestructura
    sedeId: v.id('sedes'),
    codigo: v.string(),
    descripcion: v.string(),
    tipo: v.union(
      v.literal('biomedico'),
      v.literal('infraestructura'),
      v.literal('ti'),
      v.literal('preventivo'),
      v.literal('correctivo'),
      v.literal('calibracion'),
      v.literal('otro')
    ),
    area: v.string(),
    prioridad: v.union(v.literal('alta'), v.literal('media'), v.literal('baja')),
    solicitante: v.string(),
    apertura: v.string(),
    estado: v.union(
      v.literal('abierto'),
      v.literal('asignado'),
      v.literal('en_ejecucion'),
      v.literal('cerrado'),
      v.literal('cancelado')
    ),
    tecnico: v.optional(v.string()),
    empresa: v.optional(v.string()),
    costo: v.optional(v.number()),
    fechaCierre: v.optional(v.string()),
    observaciones: v.optional(v.string()),
    proxFecha: v.optional(v.string()),
  })
    .index('by_org', ['orgId'])
    .index('by_org_sede', ['orgId', 'sedeId'])
    .index('by_org_estado', ['orgId', 'estado']),

  // ── Gestión Documental ───────────────────────────────────────────────────
  documentos: defineTable({
    orgId: v.string(),
    codigo: v.string(),
    nombre: v.string(),
    tipo: v.union(
      v.literal('procedimiento'),
      v.literal('instructivo'),
      v.literal('formato'),
      v.literal('politica'),
      v.literal('manual'),
      v.literal('protocolo'),
      v.literal('guia_practica_clinica'),
      v.literal('plan'),
      v.literal('certificado'),
      v.literal('poliza'),
      v.literal('otro')
    ),
    procesoId: v.optional(v.id('procesos')),
    version: v.string(),
    fechaElaboracion: v.string(),
    fechaVigencia: v.optional(v.string()),
    elaboradoPor: v.string(),
    revisadoPor: v.optional(v.string()),
    aprobadoPor: v.optional(v.string()),
    estado: v.union(
      v.literal('borrador'),
      v.literal('en_revision'),
      v.literal('en_aprobacion'),
      v.literal('vigente'),
      v.literal('obsoleto')
    ),
    archivo: v.optional(v.string()), // URL Uploadthing
    spLink: v.optional(v.string()), // SharePoint link
  })
    .index('by_org', ['orgId'])
    .index('by_org_estado', ['orgId', 'estado']),

  // ── Medicamentos ─────────────────────────────────────────────────────────
  medicamentos: defineTable({
    orgId: v.string(),
    sedeId: v.id('sedes'),
    nombre: v.string(),
    principioActivo: v.string(),
    concentracion: v.string(),
    forma: v.string(), // tableta, ampolla, frasco, etc.
    laboratorio: v.string(),
    registro: v.string(), // Registro INVIMA
    lote: v.string(),
    fechaVenc: v.string(),
    stock: v.number(),
    stockMinimo: v.number(),
    condicionAlm: v.string(), // temperatura, luz, etc.
    estado: v.union(
      v.literal('activo'),
      v.literal('agotado'),
      v.literal('vencido'),
      v.literal('suspendido')
    ),
  })
    .index('by_org', ['orgId'])
    .index('by_org_sede', ['orgId', 'sedeId'])
    .index('by_org_estado', ['orgId', 'estado']),

  // ── Medicamentos: Alertas sanitarias ─────────────────────────────────────
  alertas_sanitarias: defineTable({
    orgId: v.string(),
    fecha: v.string(),
    tipo: v.union(
      v.literal('alerta_invima'),
      v.literal('ram'),
      v.literal('evento_ad'),
      v.literal('retiro')
    ),
    fuente: v.string(),
    descripcion: v.string(),
    accion: v.optional(v.string()),
    archivo: v.optional(v.string()),
  }).index('by_org', ['orgId']),

  // ── Habilitación ─────────────────────────────────────────────────────────
  // Definiciones de criterios (catálogo compartido por tenant, configurable)
  habilitacion_criterios: defineTable({
    orgId: v.string(),
    categoria: v.union(
      v.literal('rh'),
      v.literal('infra'),
      v.literal('dotacion'),
      v.literal('procesos'),
      v.literal('reps')
    ),
    descripcion: v.string(),
    norma: v.string(), // "Res. 3100/2019 - Estándar 3.1.2"
    serviciosAplica: v.array(v.string()), // [] = aplica a todos
    auto: v.boolean(), // si se puede auto-verificar
  }).index('by_org', ['orgId']),

  // Respuestas de habilitación por sede
  habilitacion_respuestas: defineTable({
    orgId: v.string(),
    sedeId: v.id('sedes'),
    criterioId: v.id('habilitacion_criterios'),
    servicioId: v.optional(v.string()), // para criterios específicos de servicio
    estado: v.union(
      v.literal('cumple'),
      v.literal('no_cumple'),
      v.literal('parcial'),
      v.literal('na')
    ),
    observacion: v.optional(v.string()),
    evidencia: v.optional(v.string()), // URL archivo
    revisadoPor: v.optional(v.string()),
    revisadoEn: v.optional(v.number()),
  })
    .index('by_org', ['orgId'])
    .index('by_org_sede', ['orgId', 'sedeId'])
    .index('by_criterio_sede', ['criterioId', 'sedeId']),

  // ── PAMEC: Auditorías ────────────────────────────────────────────────────
  pamec_auditorias: defineTable({
    orgId: v.string(),
    sedeId: v.id('sedes'),
    tipo: v.union(
      v.literal('interna'),
      v.literal('externa'),
      v.literal('seguimiento')
    ),
    proceso: v.string(),
    auditor: v.string(),
    fechaInicio: v.string(),
    fechaFin: v.optional(v.string()),
    estado: v.union(
      v.literal('planeada'),
      v.literal('en_proceso'),
      v.literal('cerrada')
    ),
    observaciones: v.optional(v.string()),
  })
    .index('by_org', ['orgId'])
    .index('by_org_sede', ['orgId', 'sedeId']),

  // ── PAMEC: Hallazgos ─────────────────────────────────────────────────────
  pamec_hallazgos: defineTable({
    orgId: v.string(),
    auditoriaId: v.optional(v.id('pamec_auditorias')), // puede surgir fuera de auditoría
    sedeId: v.id('sedes'),
    tipo: v.union(
      v.literal('no_conformidad'),
      v.literal('observacion'),
      v.literal('oportunidad_mejora')
    ),
    descripcion: v.string(),
    criterio: v.optional(v.string()),
    estado: v.union(
      v.literal('abierto'),
      v.literal('en_investigacion'),
      v.literal('accion_definida'),
      v.literal('en_ejecucion'),
      v.literal('verificacion'),
      v.literal('cerrado')
    ),
    fase: v.union(
      v.literal('planear'),
      v.literal('hacer'),
      v.literal('verificar'),
      v.literal('actuar')
    ),
    causa: v.optional(v.string()),
  })
    .index('by_org', ['orgId'])
    .index('by_org_sede', ['orgId', 'sedeId'])
    .index('by_org_estado', ['orgId', 'estado']),

  // ── PAMEC: Acciones correctivas/preventivas ──────────────────────────────
  pamec_acciones: defineTable({
    orgId: v.string(),
    hallazgoId: v.id('pamec_hallazgos'),
    accion: v.string(),
    responsable: v.string(),
    fechaLimite: v.string(),
    fechaCierre: v.optional(v.string()),
    estado: v.union(
      v.literal('pendiente'),
      v.literal('en_proceso'),
      v.literal('cerrado'),
      v.literal('vencido')
    ),
    resultado: v.optional(v.string()),
  })
    .index('by_org', ['orgId'])
    .index('by_hallazgo', ['hallazgoId'])
    .index('by_org_estado', ['orgId', 'estado']),

  // ── Indicadores: Fichas técnicas ─────────────────────────────────────────
  indicadores: defineTable({
    orgId: v.string(),
    nombre: v.string(),
    descripcion: v.string(),
    formula: v.string(),
    meta: v.number(),
    umbralAlerta: v.optional(v.number()),
    unidad: v.string(),
    frecuencia: v.union(
      v.literal('mensual'),
      v.literal('trimestral'),
      v.literal('semestral'),
      v.literal('anual')
    ),
    proceso: v.string(),
    responsable: v.string(),
    fuente: v.optional(v.string()), // Res. 256, GAUDI, WFH, interno
    activo: v.boolean(),
  }).index('by_org', ['orgId']),

  // ── Indicadores: Mediciones ──────────────────────────────────────────────
  mediciones_indicadores: defineTable({
    orgId: v.string(),
    indicadorId: v.id('indicadores'),
    sedeId: v.optional(v.id('sedes')), // null = consolidado todas las sedes
    periodo: v.string(), // "2024-Q1", "2024-03"
    valor: v.number(),
    meta: v.number(),
    observacion: v.optional(v.string()),
    responsable: v.string(),
    fecha: v.string(),
  })
    .index('by_org', ['orgId'])
    .index('by_indicador', ['indicadorId'])
    .index('by_org_periodo', ['orgId', 'periodo']),

  // ── PQRS ─────────────────────────────────────────────────────────────────
  pqrs: defineTable({
    orgId: v.string(),
    sedeId: v.id('sedes'),
    tipo: v.union(
      v.literal('peticion'),
      v.literal('queja'),
      v.literal('reclamo'),
      v.literal('sugerencia')
    ),
    radicado: v.string(),
    fecha: v.string(),
    nombreInteresado: v.string(),
    contacto: v.string(),
    descripcion: v.string(),
    respuesta: v.optional(v.string()),
    fechaRespuesta: v.optional(v.string()),
    responsable: v.string(),
    estado: v.union(
      v.literal('recibido'),
      v.literal('en_tramite'),
      v.literal('respondido'),
      v.literal('cerrado'),
      v.literal('vencido')
    ),
  })
    .index('by_org', ['orgId'])
    .index('by_org_sede', ['orgId', 'sedeId'])
    .index('by_org_estado', ['orgId', 'estado']),

  // ── Procesos del SGC ─────────────────────────────────────────────────────
  procesos: defineTable({
    orgId: v.string(),
    nombre: v.string(),
    tipo: v.union(
      v.literal('estrategico'),
      v.literal('misional'),
      v.literal('apoyo'),
      v.literal('evaluacion')
    ),
    responsable: v.string(),
    objetivo: v.string(),
  }).index('by_org', ['orgId']),

  // ── Adherencia a protocolos / GPC ────────────────────────────────────────
  adherencia: defineTable({
    orgId: v.string(),
    sedeId: v.id('sedes'),
    protocolo: v.string(),
    periodo: v.string(),
    totalAplicaciones: v.number(),
    conformes: v.number(),
    noConformes: v.number(),
    observaciones: v.optional(v.string()),
    responsable: v.string(),
    fecha: v.string(),
  })
    .index('by_org', ['orgId'])
    .index('by_org_sede', ['orgId', 'sedeId']),

  // ── Auditoría en vivo ────────────────────────────────────────────────────
  auditorias_en_vivo: defineTable({
    orgId: v.string(),
    sedeId: v.id('sedes'),
    auditor: v.string(),
    iniciadaEn: v.number(), // timestamp
    finalizadaEn: v.optional(v.number()),
    currentStep: v.number(),
    respuestas: v.array(
      v.object({
        itemId: v.string(),
        cumple: v.union(v.literal('si'), v.literal('no'), v.literal('na')),
        observacion: v.optional(v.string()),
        foto: v.optional(v.string()),
      })
    ),
    estado: v.union(v.literal('en_curso'), v.literal('completada')),
  })
    .index('by_org', ['orgId'])
    .index('by_org_sede', ['orgId', 'sedeId']),

  // ── Audit trail (transiciones de estado) ────────────────────────────────
  // Registra cada cambio de estado en cualquier entidad del sistema
  audit_trail: defineTable({
    orgId: v.string(),
    entidad: v.string(), // "documentos", "pamec_hallazgos", etc.
    entidadId: v.string(), // ID de la entidad
    estadoAnterior: v.optional(v.string()),
    estadoNuevo: v.string(),
    usuarioId: v.string(), // WorkOS user ID
    usuarioNombre: v.string(),
    nota: v.optional(v.string()),
    ts: v.number(), // timestamp
  })
    .index('by_org', ['orgId'])
    .index('by_entidad', ['entidad', 'entidadId']),
})
