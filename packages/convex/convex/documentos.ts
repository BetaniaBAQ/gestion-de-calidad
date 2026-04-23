import { mutation, query } from './_generated/server'
import { v } from 'convex/values'
import { getOrgId } from './lib/auth'

const TIPO = v.union(
  v.literal('procedimiento'),
  v.literal('instructivo'),
  v.literal('formato'),
  v.literal('politica'),
  v.literal('manual'),
  v.literal('protocolo'),
  v.literal('guia_practica_clinica'),
  v.literal('plan'),
  v.literal('certificado'),
  v.literal('poliza'),
  v.literal('otro')
)

const ESTADO = v.union(
  v.literal('borrador'),
  v.literal('en_revision'),
  v.literal('en_aprobacion'),
  v.literal('vigente'),
  v.literal('obsoleto')
)

export const listByOrg = query({
  args: {},
  handler: async (ctx) => {
    const orgId = await getOrgId(ctx)
    return ctx.db
      .query('documentos')
      .withIndex('by_org', (q) => q.eq('orgId', orgId))
      .collect()
  },
})

export const create = mutation({
  args: {
    codigo: v.string(),
    nombre: v.string(),
    tipo: TIPO,
    proceso: v.optional(v.string()),
    version: v.string(),
    fechaElaboracion: v.string(),
    fechaVigencia: v.optional(v.string()),
    elaboradoPor: v.string(),
    estado: ESTADO,
    spLink: v.optional(v.string()),
    archivo: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const orgId = await getOrgId(ctx)
    return ctx.db.insert('documentos', { ...args, orgId })
  },
})

export const update = mutation({
  args: {
    id: v.id('documentos'),
    codigo: v.optional(v.string()),
    nombre: v.optional(v.string()),
    tipo: v.optional(TIPO),
    proceso: v.optional(v.string()),
    version: v.optional(v.string()),
    fechaElaboracion: v.optional(v.string()),
    fechaVigencia: v.optional(v.string()),
    elaboradoPor: v.optional(v.string()),
    estado: v.optional(ESTADO),
    spLink: v.optional(v.string()),
    archivo: v.optional(v.string()),
  },
  handler: async (ctx, { id, ...patch }) => {
    await ctx.db.patch(id, patch)
  },
})

export const remove = mutation({
  args: { id: v.id('documentos') },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id)
  },
})
