import { mutation, query } from './_generated/server'
import { v } from 'convex/values'

export const listByOrg = query({
  args: { orgId: v.string() },
  handler: async (ctx, { orgId }) => {
    return ctx.db
      .query('adherencia')
      .withIndex('by_org', (q) => q.eq('orgId', orgId))
      .collect()
  },
})

export const create = mutation({
  args: {
    orgId: v.string(),
    sedeId: v.id('sedes'),
    sedeCodigo: v.string(),
    protocolo: v.string(),
    periodo: v.string(),
    totalAplicaciones: v.number(),
    conformes: v.number(),
    noConformes: v.number(),
    responsable: v.string(),
    fecha: v.string(),
    observaciones: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return ctx.db.insert('adherencia', args)
  },
})

export const update = mutation({
  args: {
    id: v.id('adherencia'),
    sedeId: v.optional(v.id('sedes')),
    sedeCodigo: v.optional(v.string()),
    protocolo: v.optional(v.string()),
    periodo: v.optional(v.string()),
    totalAplicaciones: v.optional(v.number()),
    conformes: v.optional(v.number()),
    noConformes: v.optional(v.number()),
    responsable: v.optional(v.string()),
    fecha: v.optional(v.string()),
    observaciones: v.optional(v.string()),
  },
  handler: async (ctx, { id, ...patch }) => {
    await ctx.db.patch(id, patch)
  },
})

export const remove = mutation({
  args: { id: v.id('adherencia') },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id)
  },
})
