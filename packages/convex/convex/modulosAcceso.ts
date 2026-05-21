import { mutation, query } from './_generated/server'
import { v } from 'convex/values'
import { assertAdmin } from './lib/auth'

const ROL = v.union(
  v.literal('admin'),
  v.literal('calidad'),
  v.literal('director'),
  v.literal('coordinador'),
  v.literal('farmaceutico'),
  v.literal('view')
)

export const listByOrg = query({
  args: { orgId: v.string() },
  handler: async (ctx, { orgId }) => {
    await assertAdmin(ctx)
    return ctx.db
      .query('modulos_acceso')
      .withIndex('by_org', (q) => q.eq('orgId', orgId))
      .collect()
  },
})

export const upsert = mutation({
  args: {
    orgId: v.string(),
    rol: ROL,
    modulos: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    await assertAdmin(ctx)

    const existing = await ctx.db
      .query('modulos_acceso')
      .withIndex('by_org_rol', (q) =>
        q.eq('orgId', args.orgId).eq('rol', args.rol)
      )
      .unique()

    if (existing) {
      await ctx.db.patch(existing._id, { modulos: args.modulos })
      return existing._id
    }

    return ctx.db.insert('modulos_acceso', {
      orgId: args.orgId,
      rol: args.rol,
      modulos: args.modulos,
    })
  },
})
