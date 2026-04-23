import { mutation, query } from './_generated/server'
import { v } from 'convex/values'
import { getOrgId } from './lib/auth'

const ESTADO = v.union(
  v.literal('operativo'),
  v.literal('mantenimiento'),
  v.literal('baja'),
  v.literal('reparacion')
)

const PRIORIDAD = v.union(v.literal('alta'), v.literal('media'), v.literal('baja'))

export const listByOrg = query({
  args: {},
  handler: async (ctx) => {
    const orgId = await getOrgId(ctx)
    return ctx.db
      .query('equipos')
      .withIndex('by_org', (q) => q.eq('orgId', orgId))
      .collect()
  },
})

export const create = mutation({
  args: {
    sedeId: v.id('sedes'),
    sedeCodigo: v.string(),
    nombre: v.string(),
    marca: v.string(),
    modelo: v.string(),
    serie: v.string(),
    area: v.string(),
    fechaCompra: v.string(),
    ultimaMant: v.optional(v.string()),
    proxMant: v.optional(v.string()),
    estado: ESTADO,
    invima: v.optional(v.string()),
    vidaUtil: v.optional(v.number()),
    prioridad: PRIORIDAD,
  },
  handler: async (ctx, args) => {
    const orgId = await getOrgId(ctx)
    return ctx.db.insert('equipos', { ...args, orgId })
  },
})

export const update = mutation({
  args: {
    id: v.id('equipos'),
    sedeId: v.optional(v.id('sedes')),
    sedeCodigo: v.optional(v.string()),
    nombre: v.optional(v.string()),
    marca: v.optional(v.string()),
    modelo: v.optional(v.string()),
    serie: v.optional(v.string()),
    area: v.optional(v.string()),
    fechaCompra: v.optional(v.string()),
    ultimaMant: v.optional(v.string()),
    proxMant: v.optional(v.string()),
    estado: v.optional(ESTADO),
    invima: v.optional(v.string()),
    vidaUtil: v.optional(v.number()),
    prioridad: v.optional(PRIORIDAD),
  },
  handler: async (ctx, { id, ...patch }) => {
    await ctx.db.patch(id, patch)
  },
})

export const remove = mutation({
  args: { id: v.id('equipos') },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id)
  },
})
