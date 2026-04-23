import { mutation, query } from './_generated/server'
import { v } from 'convex/values'
import { getOrgId } from './lib/auth'

export const listByOrg = query({
  args: {},
  handler: async (ctx) => {
    const orgId = await getOrgId(ctx)
    return ctx.db
      .query('sedes')
      .withIndex('by_org', (q) => q.eq('orgId', orgId))
      .collect()
  },
})

export const create = mutation({
  args: {
    nombre: v.string(),
    codigo: v.string(),
    ciudad: v.string(),
    departamento: v.optional(v.string()),
    direccion: v.string(),
    servicios: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const orgId = await getOrgId(ctx)
    return ctx.db.insert('sedes', { ...args, orgId, activa: true })
  },
})

export const update = mutation({
  args: {
    id: v.id('sedes'),
    nombre: v.optional(v.string()),
    ciudad: v.optional(v.string()),
    departamento: v.optional(v.string()),
    direccion: v.optional(v.string()),
    activa: v.optional(v.boolean()),
    servicios: v.optional(v.array(v.string())),
  },
  handler: async (ctx, { id, ...patch }) => {
    await ctx.db.patch(id, patch)
  },
})
