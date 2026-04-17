import { mutation, query } from './_generated/server'
import { v } from 'convex/values'

export const listByOrg = query({
  args: { orgId: v.string() },
  handler: async (ctx, { orgId }) => {
    return ctx.db
      .query('cargos')
      .withIndex('by_org', (q) => q.eq('orgId', orgId))
      .collect()
  },
})

export const create = mutation({
  args: {
    orgId: v.string(),
    codigo: v.string(),
    nombre: v.string(),
    area: v.string(),
    perfil: v.string(),
    docRequeridos: v.array(v.string()),
    capRequeridas: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    return ctx.db.insert('cargos', args)
  },
})

export const update = mutation({
  args: {
    id: v.id('cargos'),
    codigo: v.optional(v.string()),
    nombre: v.optional(v.string()),
    area: v.optional(v.string()),
    perfil: v.optional(v.string()),
    docRequeridos: v.optional(v.array(v.string())),
    capRequeridas: v.optional(v.array(v.string())),
  },
  handler: async (ctx, { id, ...patch }) => {
    await ctx.db.patch(id, patch)
  },
})

export const remove = mutation({
  args: { id: v.id('cargos') },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id)
  },
})
