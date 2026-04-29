import { mutation, query } from './_generated/server'
import { v } from 'convex/values'
import { getOrgId } from './lib/auth'

const ESTADO = v.union(
  v.literal('cumple'),
  v.literal('no_cumple'),
  v.literal('parcial'),
  v.literal('na')
)

export const listRespuestasByOrgSede = query({
  args: { sedeId: v.id('sedes') },
  handler: async (ctx, { sedeId }) => {
    const orgId = await getOrgId(ctx)
    return ctx.db
      .query('habilitacion_respuestas')
      .withIndex('by_org_sede', (q) =>
        q.eq('orgId', orgId).eq('sedeId', sedeId)
      )
      .collect()
  },
})

export const upsertRespuesta = mutation({
  args: {
    sedeId: v.id('sedes'),
    criterioDefId: v.string(),
    estado: ESTADO,
    observacion: v.optional(v.string()),
    evidencias: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const orgId = await getOrgId(ctx)
    const identity = await ctx.auth.getUserIdentity()

    const existing = await ctx.db
      .query('habilitacion_respuestas')
      .withIndex('by_org_sede', (q) =>
        q.eq('orgId', orgId).eq('sedeId', args.sedeId)
      )
      .filter((q) => q.eq(q.field('criterioDefId'), args.criterioDefId))
      .unique()

    const data = {
      estado: args.estado,
      observacion: args.observacion,
      evidencias: args.evidencias,
      revisadoPor: identity?.subject,
      revisadoEn: Date.now(),
    }

    if (existing) {
      await ctx.db.patch(existing._id, data)
      return existing._id
    }

    return ctx.db.insert('habilitacion_respuestas', {
      orgId,
      sedeId: args.sedeId,
      criterioDefId: args.criterioDefId,
      ...data,
    })
  },
})

export const addEvidencia = mutation({
  args: {
    sedeId: v.id('sedes'),
    criterioDefId: v.string(),
    url: v.string(),
  },
  handler: async (ctx, args) => {
    const orgId = await getOrgId(ctx)

    const existing = await ctx.db
      .query('habilitacion_respuestas')
      .withIndex('by_org_sede', (q) =>
        q.eq('orgId', orgId).eq('sedeId', args.sedeId)
      )
      .filter((q) => q.eq(q.field('criterioDefId'), args.criterioDefId))
      .unique()

    if (existing) {
      const evidencias = [...(existing.evidencias ?? []), args.url]
      await ctx.db.patch(existing._id, { evidencias })
      return existing._id
    }

    return ctx.db.insert('habilitacion_respuestas', {
      orgId,
      sedeId: args.sedeId,
      criterioDefId: args.criterioDefId,
      estado: 'no_cumple',
      evidencias: [args.url],
    })
  },
})

export const removeEvidencia = mutation({
  args: {
    respuestaId: v.id('habilitacion_respuestas'),
    url: v.string(),
  },
  handler: async (ctx, { respuestaId, url }) => {
    const doc = await ctx.db.get(respuestaId)
    if (!doc) return
    const evidencias = (doc.evidencias ?? []).filter((e) => e !== url)
    await ctx.db.patch(respuestaId, { evidencias })
  },
})
