import { mutation, query } from './_generated/server'
import { v } from 'convex/values'
import { getOrgId } from './lib/auth'

const TIPO = v.union(
  v.literal('alerta_invima'),
  v.literal('ram'),
  v.literal('evento_ad'),
  v.literal('retiro')
)

export const listByOrg = query({
  args: {},
  handler: async (ctx) => {
    const orgId = await getOrgId(ctx)
    return ctx.db
      .query('alertas_sanitarias')
      .withIndex('by_org', (q) => q.eq('orgId', orgId))
      .collect()
  },
})

export const create = mutation({
  args: {
    fecha: v.string(),
    tipo: TIPO,
    fuente: v.string(),
    descripcion: v.string(),
    accion: v.optional(v.string()),
    spLink: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const orgId = await getOrgId(ctx)
    return ctx.db.insert('alertas_sanitarias', { ...args, orgId })
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
