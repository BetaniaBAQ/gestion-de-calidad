import { mutation, query } from './_generated/server'
import { v } from 'convex/values'

const ESTADO = v.union(
  v.literal('programada'),
  v.literal('ejecutada'),
  v.literal('cancelada')
)

export const listByOrg = query({
  args: { orgId: v.string() },
  handler: async (ctx, { orgId }) => {
    return ctx.db
      .query('capacitaciones_programadas')
      .withIndex('by_org', (q) => q.eq('orgId', orgId))
      .collect()
  },
})

export const create = mutation({
  args: {
    orgId: v.string(),
    nombre: v.string(),
    area: v.string(),
    fechaObjetivo: v.string(),
    responsable: v.string(),
    estado: ESTADO,
    sedeId: v.optional(v.id('sedes')),
    observaciones: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return ctx.db.insert('capacitaciones_programadas', args)
  },
})

export const update = mutation({
  args: {
    id: v.id('capacitaciones_programadas'),
    nombre: v.optional(v.string()),
    area: v.optional(v.string()),
    fechaObjetivo: v.optional(v.string()),
    responsable: v.optional(v.string()),
    estado: v.optional(ESTADO),
    sedeId: v.optional(v.id('sedes')),
    observaciones: v.optional(v.string()),
    evidenciaUrl: v.optional(v.string()),
  },
  handler: async (ctx, { id, ...patch }) => {
    await ctx.db.patch(id, patch)
  },
})

export const remove = mutation({
  args: { id: v.id('capacitaciones_programadas') },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id)
  },
})
