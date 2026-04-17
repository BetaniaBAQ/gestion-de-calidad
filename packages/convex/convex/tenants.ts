import { mutation, query } from './_generated/server'
import { v } from 'convex/values'

// Busca un tenant por su slug (e.g. "betania")
// Usado en el callback de auth para resolver el orgId
export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    return ctx.db
      .query('tenants')
      .withIndex('by_slug', (q) => q.eq('slug', slug))
      .unique()
  },
})

// Busca un tenant por su WorkOS Organization ID
export const getByOrgId = query({
  args: { orgId: v.string() },
  handler: async (ctx, { orgId }) => {
    return ctx.db
      .query('tenants')
      .withIndex('by_org', (q) => q.eq('orgId', orgId))
      .unique()
  },
})

// Crea o actualiza un tenant
// Llamado automáticamente la primera vez que el admin hace login
export const upsert = mutation({
  args: {
    orgId: v.string(),
    slug: v.string(),
    nombre: v.string(),
    plan: v.union(
      v.literal('trial'),
      v.literal('pro'),
      v.literal('enterprise')
    ),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('tenants')
      .withIndex('by_org', (q) => q.eq('orgId', args.orgId))
      .unique()

    if (existing) {
      await ctx.db.patch(existing._id, { slug: args.slug, nombre: args.nombre })
      return existing._id
    }

    return ctx.db.insert('tenants', {
      orgId: args.orgId,
      slug: args.slug,
      nombre: args.nombre,
      plan: args.plan,
      activo: true,
    })
  },
})
