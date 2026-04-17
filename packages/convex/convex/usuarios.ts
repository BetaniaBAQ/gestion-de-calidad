import { mutation, query } from './_generated/server'
import { v } from 'convex/values'

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
  args: { orgId: v.string() },
  handler: async (ctx, { orgId }) => {
    return ctx.db
      .query('usuarios')
      .withIndex('by_org', (q) => q.eq('orgId', orgId))
      .collect()
  },
})

// Crea o actualiza el perfil de usuario en Convex al hacer login.
// El rol por defecto es 'view' hasta que el admin lo cambie.
export const upsertFromAuth = mutation({
  args: {
    orgId: v.string(),
    workosUserId: v.string(),
    nombre: v.string(),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('usuarios')
      .withIndex('by_workos_user', (q) =>
        q.eq('workosUserId', args.workosUserId)
      )
      .unique()

    if (existing) {
      await ctx.db.patch(existing._id, {
        orgId: args.orgId,
        nombre: args.nombre,
        email: args.email,
      })
      return existing._id
    }

    return ctx.db.insert('usuarios', {
      orgId: args.orgId,
      workosUserId: args.workosUserId,
      nombre: args.nombre,
      email: args.email,
      rol: 'view', // El admin asigna el rol real
      activo: true,
    })
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
