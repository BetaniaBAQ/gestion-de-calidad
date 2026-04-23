import { mutation, query } from './_generated/server'
import { v } from 'convex/values'
import { getOrgId } from './lib/auth'

export const listByOrg = query({
  args: {},
  handler: async (ctx) => {
    const orgId = await getOrgId(ctx)
    return ctx.db
      .query('cargos')
      .withIndex('by_org', (q) => q.eq('orgId', orgId))
      .collect()
  },
})

export const create = mutation({
  args: {
    codigo: v.string(),
    nombre: v.string(),
    tipo: v.union(
      v.literal('asistencial'),
      v.literal('administrativo'),
      v.literal('apoyo'),
      v.literal('directivo')
    ),
    area: v.string(),
    perfil: v.string(),
    docRequeridos: v.array(v.string()),
    capRequeridas: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const orgId = await getOrgId(ctx)
    return ctx.db.insert('cargos', { ...args, orgId })
  },
})

export const update = mutation({
  args: {
    id: v.id('cargos'),
    codigo: v.optional(v.string()),
    nombre: v.optional(v.string()),
    tipo: v.optional(
      v.union(
        v.literal('asistencial'),
        v.literal('administrativo'),
        v.literal('apoyo'),
        v.literal('directivo')
      )
    ),
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
