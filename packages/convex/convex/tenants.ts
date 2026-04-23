import { action, mutation, query } from './_generated/server'
import { v } from 'convex/values'
import { api } from './_generated/api'

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

// Crea un nuevo tenant de punta a punta:
//   1. Crea una Organization en WorkOS con external_id = slug
//   2. Envía una invitación al owner (rol admin una vez se loguea)
//   3. Persiste el tenant en Convex
//
// Uso típico: desde un script local de seed o desde admin.cualia.app
export const createTenant = action({
  args: {
    name: v.string(),
    slug: v.string(),
    ownerEmail: v.string(),
    ownerFirstName: v.optional(v.string()),
    ownerLastName: v.optional(v.string()),
    plan: v.optional(
      v.union(v.literal('trial'), v.literal('pro'), v.literal('enterprise'))
    ),
  },
  handler: async (
    ctx,
    args
  ): Promise<{
    workosOrgId: string
    invitationId: string
    invitationUrl: string | null
    tenantId: string
  }> => {
    const apiKey = process.env.WORKOS_API_KEY
    if (!apiKey) {
      throw new Error(
        'WORKOS_API_KEY no está configurado en Convex. Corre: npx convex env set WORKOS_API_KEY <key>'
      )
    }

    // 1. Crear Organization en WorkOS
    const orgRes = await fetch('https://api.workos.com/organizations', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: args.name,
        external_id: args.slug,
      }),
    })
    if (!orgRes.ok) {
      throw new Error(
        `WorkOS createOrganization falló (${orgRes.status}): ${await orgRes.text()}`
      )
    }
    const org = (await orgRes.json()) as { id: string }

    // 2. Enviar invitación al owner — quedará asociado a esta org al aceptar
    const inviteRes = await fetch(
      'https://api.workos.com/user_management/invitations',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: args.ownerEmail,
          organization_id: org.id,
        }),
      }
    )
    if (!inviteRes.ok) {
      throw new Error(
        `WorkOS createInvitation falló (${inviteRes.status}): ${await inviteRes.text()}`
      )
    }
    const invite = (await inviteRes.json()) as {
      id: string
      accept_invitation_url?: string
    }

    // 3. Persistir el tenant en Convex
    const tenantId = await ctx.runMutation(api.tenants.upsert, {
      orgId: org.id,
      slug: args.slug,
      nombre: args.name,
      plan: args.plan ?? 'trial',
    })

    return {
      workosOrgId: org.id,
      invitationId: invite.id,
      invitationUrl: invite.accept_invitation_url ?? null,
      tenantId: tenantId as unknown as string,
    }
  },
})
