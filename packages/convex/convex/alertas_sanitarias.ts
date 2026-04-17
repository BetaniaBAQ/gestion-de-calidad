import { mutation, query } from './_generated/server'
import { v } from 'convex/values'

const TIPO = v.union(
  v.literal('alerta_invima'),
  v.literal('ram'),
  v.literal('evento_ad'),
  v.literal('retiro')
)

export const listByOrg = query({
  args: { orgId: v.string() },
  handler: async (ctx, { orgId }) => {
    return ctx.db
      .query('alertas_sanitarias')
      .withIndex('by_org', (q) => q.eq('orgId', orgId))
      .collect()
  },
})

export const create = mutation({
  args: {
    orgId: v.string(),
    fecha: v.string(),
    tipo: TIPO,
    fuente: v.string(),
    descripcion: v.string(),
    accion: v.optional(v.string()),
    spLink: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return ctx.db.insert('alertas_sanitarias', args)
  },
})

export const update = mutation({
  args: {
    id: v.id('alertas_sanitarias'),
    fecha: v.optional(v.string()),
    tipo: v.optional(TIPO),
    fuente: v.optional(v.string()),
    descripcion: v.optional(v.string()),
    accion: v.optional(v.string()),
    spLink: v.optional(v.string()),
  },
  handler: async (ctx, { id, ...patch }) => {
    await ctx.db.patch(id, patch)
  },
})

export const remove = mutation({
  args: { id: v.id('alertas_sanitarias') },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id)
  },
})
