import { mutation, query } from './_generated/server'
import { v } from 'convex/values'

const TIPO_AUD = v.union(
  v.literal('interna'),
  v.literal('externa'),
  v.literal('seguimiento')
)

const ESTADO_AUD = v.union(
  v.literal('planeada'),
  v.literal('en_proceso'),
  v.literal('cerrada')
)

const FASE = v.union(
  v.literal('planear'),
  v.literal('hacer'),
  v.literal('verificar'),
  v.literal('actuar')
)

const ESTADO_ACCION = v.union(
  v.literal('pendiente'),
  v.literal('en_proceso'),
  v.literal('cerrado'),
  v.literal('vencido')
)

const HALLAZGO_EMBED = v.object({
  id: v.string(),
  tipo: v.union(
    v.literal('no_conformidad'),
    v.literal('observacion'),
    v.literal('oportunidad_mejora')
  ),
  descripcion: v.string(),
  criterio: v.optional(v.string()),
  accionCorrectiva: v.optional(v.string()),
  responsable: v.optional(v.string()),
  fechaLimite: v.optional(v.string()),
  estado: v.union(
    v.literal('abierto'),
    v.literal('cerrado'),
    v.literal('vencido')
  ),
})

// ── Auditorías ───────────────────────────────────────────────────────────────

export const listAuditoriasByOrg = query({
  args: { orgId: v.string() },
  handler: async (ctx, { orgId }) => {
    return ctx.db
      .query('pamec_auditorias')
      .withIndex('by_org', (q) => q.eq('orgId', orgId))
      .collect()
  },
})

export const createAuditoria = mutation({
  args: {
    orgId: v.string(),
    sedeId: v.id('sedes'),
    sedeCodigo: v.string(),
    tipo: TIPO_AUD,
    proceso: v.string(),
    auditor: v.string(),
    fechaInicio: v.string(),
    fechaFin: v.optional(v.string()),
    estado: ESTADO_AUD,
    observaciones: v.optional(v.string()),
    hallazgos: v.optional(v.array(HALLAZGO_EMBED)),
  },
  handler: async (ctx, args) => {
    return ctx.db.insert('pamec_auditorias', args)
  },
})

export const updateAuditoria = mutation({
  args: {
    id: v.id('pamec_auditorias'),
    sedeId: v.optional(v.id('sedes')),
    sedeCodigo: v.optional(v.string()),
    tipo: v.optional(TIPO_AUD),
    proceso: v.optional(v.string()),
    auditor: v.optional(v.string()),
    fechaInicio: v.optional(v.string()),
    fechaFin: v.optional(v.string()),
    estado: v.optional(ESTADO_AUD),
    observaciones: v.optional(v.string()),
    hallazgos: v.optional(v.array(HALLAZGO_EMBED)),
  },
  handler: async (ctx, { id, ...patch }) => {
    await ctx.db.patch(id, patch)
  },
})

export const removeAuditoria = mutation({
  args: { id: v.id('pamec_auditorias') },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id)
  },
})

// ── Acciones ─────────────────────────────────────────────────────────────────

export const listAccionesByOrg = query({
  args: { orgId: v.string() },
  handler: async (ctx, { orgId }) => {
    return ctx.db
      .query('pamec_acciones')
      .withIndex('by_org', (q) => q.eq('orgId', orgId))
      .collect()
  },
})

export const createAccion = mutation({
  args: {
    orgId: v.string(),
    sedeCodigo: v.string(),
    hallazgo: v.string(),
    causa: v.string(),
    accion: v.string(),
    responsable: v.string(),
    fechaLimite: v.string(),
    estado: ESTADO_ACCION,
    fase: FASE,
    fechaCierre: v.optional(v.string()),
    resultado: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return ctx.db.insert('pamec_acciones', args)
  },
})

export const updateAccion = mutation({
  args: {
    id: v.id('pamec_acciones'),
    sedeCodigo: v.optional(v.string()),
    hallazgo: v.optional(v.string()),
    causa: v.optional(v.string()),
    accion: v.optional(v.string()),
    responsable: v.optional(v.string()),
    fechaLimite: v.optional(v.string()),
    estado: v.optional(ESTADO_ACCION),
    fase: v.optional(FASE),
    fechaCierre: v.optional(v.string()),
    resultado: v.optional(v.string()),
  },
  handler: async (ctx, { id, ...patch }) => {
    await ctx.db.patch(id, patch)
  },
})

export const removeAccion = mutation({
  args: { id: v.id('pamec_acciones') },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id)
  },
})
