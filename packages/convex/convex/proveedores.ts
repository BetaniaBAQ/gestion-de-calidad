import { mutation, query } from './_generated/server'
import { v } from 'convex/values'
import { getOrgId } from './lib/auth'

const TIPO = v.union(
  v.literal('servicios_salud'),
  v.literal('suministros'),
  v.literal('mantenimiento'),
  v.literal('laboratorio'),
  v.literal('otro')
)

export const listByOrg = query({
  args: {},
  handler: async (ctx) => {
    const orgId = await getOrgId(ctx)
    return ctx.db
      .query('proveedores')
      .withIndex('by_org', (q) => q.eq('orgId', orgId))
      .collect()
  },
})

export const create = mutation({
  args: {
    nombre: v.string(),
    nit: v.string(),
    tipo: TIPO,
    contacto: v.optional(v.string()),
    telefono: v.optional(v.string()),
    email: v.optional(v.string()),
    rutUrl: v.optional(v.string()),
    camaraComercioUrl: v.optional(v.string()),
    camaraVigencia: v.optional(v.string()),
    habilitacionUrl: v.optional(v.string()),
    polizaUrl: v.optional(v.string()),
    polizaVigencia: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const orgId = await getOrgId(ctx)
    return ctx.db.insert('proveedores', { ...args, orgId, activo: true })
  },
})

export const update = mutation({
  args: {
    id: v.id('proveedores'),
    nombre: v.optional(v.string()),
    nit: v.optional(v.string()),
    tipo: v.optional(TIPO),
    contacto: v.optional(v.string()),
    telefono: v.optional(v.string()),
    email: v.optional(v.string()),
    activo: v.optional(v.boolean()),
    rutUrl: v.optional(v.string()),
    camaraComercioUrl: v.optional(v.string()),
    camaraVigencia: v.optional(v.string()),
    habilitacionUrl: v.optional(v.string()),
    polizaUrl: v.optional(v.string()),
    polizaVigencia: v.optional(v.string()),
  },
  handler: async (ctx, { id, ...patch }) => {
    await ctx.db.patch(id, patch)
  },
})

export const remove = mutation({
  args: { id: v.id('proveedores') },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id)
  },
})
