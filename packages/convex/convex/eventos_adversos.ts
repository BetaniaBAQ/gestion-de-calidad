import { mutation, query } from './_generated/server'
import { v } from 'convex/values'
import { getOrgId } from './lib/auth'

const TIPO = v.union(
  v.literal('incidente'),
  v.literal('evento_adverso_prevenible'),
  v.literal('evento_adverso_no_prevenible'),
  v.literal('evento_centinela')
)

const ESTADO = v.union(
  v.literal('reportado'),
  v.literal('clasificado'),
  v.literal('en_investigacion'),
  v.literal('acciones_definidas'),
  v.literal('en_seguimiento'),
  v.literal('cerrado')
)

const LONDON_PROTOCOL = v.object({
  lineaTiempo: v.optional(v.string()),
  problemasAtencion: v.optional(v.string()),
  factoresContributivos: v.optional(v.string()),
  causasRaiz: v.optional(v.string()),
  recomendaciones: v.optional(v.string()),
  planAccion: v.optional(v.string()),
  completado: v.boolean(),
})

export const listByOrg = query({
  args: {},
  handler: async (ctx) => {
    const orgId = await getOrgId(ctx)
    return ctx.db
      .query('eventos_adversos')
      .withIndex('by_org', (q) => q.eq('orgId', orgId))
      .collect()
  },
})

export const create = mutation({
  args: {
    sedeId: v.id('sedes'),
    sedeCodigo: v.string(),
    tipo: TIPO,
    fecha: v.string(),
    hora: v.optional(v.string()),
    servicio: v.string(),
    descripcion: v.string(),
    reportanteNombre: v.optional(v.string()),
    reportanteCargo: v.optional(v.string()),
    anonimo: v.boolean(),
  },
  handler: async (ctx, args) => {
    const orgId = await getOrgId(ctx)
    return ctx.db.insert('eventos_adversos', {
      ...args,
      orgId,
      estado: 'reportado',
    })
  },
})

export const update = mutation({
  args: {
    id: v.id('eventos_adversos'),
    tipo: v.optional(TIPO),
    estado: v.optional(ESTADO),
    servicio: v.optional(v.string()),
    descripcion: v.optional(v.string()),
    gestionadoPor: v.optional(v.string()),
  },
  handler: async (ctx, { id, ...patch }) => {
    await ctx.db.patch(id, patch)
  },
})

export const updateLondonProtocol = mutation({
  args: {
    id: v.id('eventos_adversos'),
    londonProtocol: LONDON_PROTOCOL,
  },
  handler: async (ctx, { id, londonProtocol }) => {
    await ctx.db.patch(id, { londonProtocol })
  },
})

export const avanzarEstado = mutation({
  args: { id: v.id('eventos_adversos') },
  handler: async (ctx, { id }) => {
    const identity = await ctx.auth.getUserIdentity()
    const evento = await ctx.db.get(id)
    if (!evento) throw new Error('Evento not found')

    const orden: string[] = [
      'reportado',
      'clasificado',
      'en_investigacion',
      'acciones_definidas',
      'en_seguimiento',
      'cerrado',
    ]
    const idx = orden.indexOf(evento.estado)
    if (idx < orden.length - 1) {
      await ctx.db.patch(id, {
        estado: orden[idx + 1] as any,
        gestionadoPor: identity?.subject,
      })
    }
  },
})

export const remove = mutation({
  args: { id: v.id('eventos_adversos') },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id)
  },
})
