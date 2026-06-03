import { mutation, query } from './_generated/server'
import { v } from 'convex/values'
import { getOrgId, assertAdmin } from './lib/auth'

const ROL = v.union(
  v.literal('admin'),
  v.literal('calidad'),
  v.literal('director'),
  v.literal('coordinador'),
  v.literal('farmaceutico'),
  v.literal('view')
)

export const ensureUsuario = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error('Unauthenticated')

    const workosUserId = identity.subject
    const orgId =
      (identity as Record<string, unknown>).org_id ??
      (identity as Record<string, unknown>).organizationId
    if (!orgId || typeof orgId !== 'string') {
      throw new Error('JWT missing org_id claim')
    }

    const existing = await ctx.db
      .query('usuarios')
      .withIndex('by_workos_user', (q) => q.eq('workosUserId', workosUserId))
      .unique()

    if (existing) {
      if (existing.email !== (identity.email ?? existing.email)) {
        await ctx.db.patch(existing._id, { email: identity.email! })
      }
      return existing._id
    }

    return ctx.db.insert('usuarios', {
      orgId,
      workosUserId,
      nombre:
        [identity.givenName, identity.familyName].filter(Boolean).join(' ') ||
        identity.email ||
        'Usuario',
      email: identity.email ?? '',
      rol: 'view',
      activo: true,
    })
  },
})

export const me = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return null
    return ctx.db
      .query('usuarios')
      .withIndex('by_workos_user', (q) => q.eq('workosUserId', identity.subject))
      .unique()
  },
})

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

// ── Admin queries (cross-org) ───────────────────────────────────────────────

export const listByOrgAdmin = query({
  args: { orgId: v.string() },
  handler: async (ctx, { orgId }) => {
    await assertAdmin(ctx)
    return ctx.db
      .query('usuarios')
      .withIndex('by_org', (q) => q.eq('orgId', orgId))
      .collect()
  },
})

export const updateAdmin = mutation({
  args: {
    id: v.id('usuarios'),
    rol: v.optional(ROL),
    sedeId: v.optional(v.id('sedes')),
    activo: v.optional(v.boolean()),
  },
  handler: async (ctx, { id, ...patch }) => {
    await assertAdmin(ctx)
    await ctx.db.patch(id, patch)
  },
})
