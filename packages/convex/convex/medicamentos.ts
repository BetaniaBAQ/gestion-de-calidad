import { mutation, query } from './_generated/server'
import { v } from 'convex/values'

const ESTADO = v.union(
  v.literal('activo'),
  v.literal('agotado'),
  v.literal('vencido'),
  v.literal('suspendido')
)

export const listByOrg = query({
  args: { orgId: v.string() },
  handler: async (ctx, { orgId }) => {
    return ctx.db
      .query('medicamentos')
      .withIndex('by_org', (q) => q.eq('orgId', orgId))
      .collect()
  },
})

export const create = mutation({
  args: {
    orgId: v.string(),
    sedeId: v.id('sedes'),
    sedeCodigo: v.string(),
    nombre: v.string(),
    principioActivo: v.string(),
    concentracion: v.string(),
    forma: v.string(),
    laboratorio: v.string(),
    registro: v.string(),
    lote: v.string(),
    fechaVenc: v.string(),
    stock: v.number(),
    stockMinimo: v.number(),
    condicionAlm: v.string(),
    estado: ESTADO,
  },
  handler: async (ctx, args) => {
    return ctx.db.insert('medicamentos', args)
  },
})

export const update = mutation({
  args: {
    id: v.id('medicamentos'),
    sedeId: v.optional(v.id('sedes')),
    sedeCodigo: v.optional(v.string()),
    nombre: v.optional(v.string()),
    principioActivo: v.optional(v.string()),
    concentracion: v.optional(v.string()),
    forma: v.optional(v.string()),
    laboratorio: v.optional(v.string()),
    registro: v.optional(v.string()),
    lote: v.optional(v.string()),
    fechaVenc: v.optional(v.string()),
    stock: v.optional(v.number()),
    stockMinimo: v.optional(v.number()),
    condicionAlm: v.optional(v.string()),
    estado: v.optional(ESTADO),
  },
  handler: async (ctx, { id, ...patch }) => {
    await ctx.db.patch(id, patch)
  },
})

export const remove = mutation({
  args: { id: v.id('medicamentos') },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id)
  },
})
