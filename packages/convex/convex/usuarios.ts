import { mutation, query } from './_generated/server'
import { v } from 'convex/values'
import { getOrgId } from './lib/auth'

const ROL = v.union(
  v.literal('admin'),
  v.literal('calidad'),
  v.literal('director'),
  v.literal('coordinador'),
  v.literal('farmaceutico'),
  v.literal('view')
)

export const getByWorkosUserId = query({
  args: { workosUserId: v.string() },
  handler: async (ctx, { workosUserId }) => {
    return ctx.db
      .query('usuarios')
      .withIndex('by_workos_user', (q) => q.eq('workosUserId', workosUserId))
      .unique()
  },
})

export const listByOrg = query({
  args: {},
  handler: async (ctx) => {
    const orgId = await getOrgId(ctx)
    return ctx.db
      .query('usuarios')
      .withIndex('by_org', (q) => q.eq('orgId', orgId))
      .collect()
  },
})

export const update = mutation({
  args: {
    id: v.id('usuarios'),
    rol: v.optional(ROL),
    sedeId: v.optional(v.id('sedes')),
    activo: v.optional(v.boolean()),
  },
  handler: async (ctx, { id, ...patch }) => {
    await ctx.db.patch(id, patch)
  },
})
