import { mutation, query } from './_generated/server'
import { v } from 'convex/values'

const FRECUENCIA = v.union(
  v.literal('mensual'),
  v.literal('trimestral'),
  v.literal('semestral'),
  v.literal('anual')
)

// ── Fichas técnicas ──────────────────────────────────────────────────────────

export const listByOrg = query({
  args: { orgId: v.string() },
  handler: async (ctx, { orgId }) => {
    return ctx.db
      .query('indicadores')
      .withIndex('by_org', (q) => q.eq('orgId', orgId))
      .collect()
  },
})

export const create = mutation({
  args: {
    orgId: v.string(),
    nombre: v.string(),
    descripcion: v.string(),
    formula: v.string(),
    meta: v.number(),
    unidad: v.string(),
    frecuencia: FRECUENCIA,
    proceso: v.string(),
    responsable: v.string(),
    umbralAlerta: v.optional(v.number()),
    fuente: v.optional(v.string()),
    activo: v.boolean(),
  },
  handler: async (ctx, args) => {
    return ctx.db.insert('indicadores', args)
  },
})

export const update = mutation({
  args: {
    id: v.id('indicadores'),
    nombre: v.optional(v.string()),
    descripcion: v.optional(v.string()),
    formula: v.optional(v.string()),
    meta: v.optional(v.number()),
    unidad: v.optional(v.string()),
    frecuencia: v.optional(FRECUENCIA),
    proceso: v.optional(v.string()),
    responsable: v.optional(v.string()),
    umbralAlerta: v.optional(v.number()),
    fuente: v.optional(v.string()),
    activo: v.optional(v.boolean()),
  },
  handler: async (ctx, { id, ...patch }) => {
    await ctx.db.patch(id, patch)
  },
})

export const remove = mutation({
  args: { id: v.id('indicadores') },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id)
  },
})

// ── Mediciones ───────────────────────────────────────────────────────────────

export const listMedicionesByOrg = query({
  args: { orgId: v.string() },
  handler: async (ctx, { orgId }) => {
    return ctx.db
      .query('mediciones_indicadores')
      .withIndex('by_org', (q) => q.eq('orgId', orgId))
      .collect()
  },
})

export const createMedicion = mutation({
  args: {
    orgId: v.string(),
    indicadorId: v.id('indicadores'),
    sedeId: v.optional(v.id('sedes')),
    periodo: v.string(),
    valor: v.number(),
    meta: v.number(),
    responsable: v.string(),
    fecha: v.string(),
    observacion: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return ctx.db.insert('mediciones_indicadores', args)
  },
})

export const updateMedicion = mutation({
  args: {
    id: v.id('mediciones_indicadores'),
    valor: v.optional(v.number()),
    meta: v.optional(v.number()),
    responsable: v.optional(v.string()),
    fecha: v.optional(v.string()),
    observacion: v.optional(v.string()),
  },
  handler: async (ctx, { id, ...patch }) => {
    await ctx.db.patch(id, patch)
  },
})
