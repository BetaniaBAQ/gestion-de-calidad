import { mutation, query } from './_generated/server'
import { v } from 'convex/values'
import { getOrgId } from './lib/auth'

const ESTADO = v.union(
  v.literal('recibido'),
  v.literal('en_tramite'),
  v.literal('respondido'),
  v.literal('cerrado'),
  v.literal('vencido')
)

const TIPO = v.union(
  v.literal('peticion'),
  v.literal('queja'),
  v.literal('reclamo'),
  v.literal('sugerencia')
)

export const listByOrg = query({
  args: {},
  handler: async (ctx) => {
    const orgId = await getOrgId(ctx)
    return ctx.db
      .query('pqrs')
      .withIndex('by_org', (q) => q.eq('orgId', orgId))
      .collect()
  },
})

export const create = mutation({
  args: {
    sedeId: v.id('sedes'),
    sedeCodigo: v.string(),
    tipo: TIPO,
    radicado: v.string(),
    fecha: v.string(),
    nombreInteresado: v.string(),
    contacto: v.string(),
    descripcion: v.string(),
    responsable: v.string(),
    estado: ESTADO,
    respuesta: v.optional(v.string()),
    fechaRespuesta: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const orgId = await getOrgId(ctx)
    return ctx.db.insert('pqrs', { ...args, orgId })
  },
})

export const update = mutation({
  args: {
    id: v.id('pqrs'),
    sedeId: v.optional(v.id('sedes')),
    sedeCodigo: v.optional(v.string()),
    tipo: v.optional(TIPO),
    radicado: v.optional(v.string()),
    fecha: v.optional(v.string()),
    nombreInteresado: v.optional(v.string()),
    contacto: v.optional(v.string()),
    descripcion: v.optional(v.string()),
    responsable: v.optional(v.string()),
    estado: v.optional(ESTADO),
    respuesta: v.optional(v.string()),
    fechaRespuesta: v.optional(v.string()),
  },
  handler: async (ctx, { id, ...patch }) => {
    await ctx.db.patch(id, patch)
  },
})

export const remove = mutation({
  args: { id: v.id('pqrs') },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id)
  },
})
