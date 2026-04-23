import { mutation, query } from './_generated/server'
import { v } from 'convex/values'
import { getOrgId } from './lib/auth'

const TIPO = v.union(
  v.literal('biomedico'),
  v.literal('infraestructura'),
  v.literal('ti'),
  v.literal('preventivo'),
  v.literal('correctivo'),
  v.literal('calibracion'),
  v.literal('otro')
)

const PRIORIDAD = v.union(v.literal('alta'), v.literal('media'), v.literal('baja'))

const ESTADO = v.union(
  v.literal('abierto'),
  v.literal('asignado'),
  v.literal('en_ejecucion'),
  v.literal('cerrado'),
  v.literal('cancelado')
)

export const listByOrg = query({
  args: {},
  handler: async (ctx) => {
    const orgId = await getOrgId(ctx)
    return ctx.db
      .query('mantenimientos')
      .withIndex('by_org', (q) => q.eq('orgId', orgId))
      .collect()
  },
})

export const create = mutation({
  args: {
    sedeId: v.id('sedes'),
    sedeCodigo: v.string(),
    codigo: v.string(),
    descripcion: v.string(),
    tipo: TIPO,
    area: v.string(),
    prioridad: PRIORIDAD,
    solicitante: v.string(),
    apertura: v.string(),
    estado: ESTADO,
    equipoId: v.optional(v.id('equipos')),
    tecnico: v.optional(v.string()),
    empresa: v.optional(v.string()),
    costo: v.optional(v.number()),
    fechaCierre: v.optional(v.string()),
    observaciones: v.optional(v.string()),
    proxFecha: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const orgId = await getOrgId(ctx)
    return ctx.db.insert('mantenimientos', { ...args, orgId })
  },
})

export const update = mutation({
  args: {
    id: v.id('mantenimientos'),
    sedeCodigo: v.optional(v.string()),
    codigo: v.optional(v.string()),
    descripcion: v.optional(v.string()),
    tipo: v.optional(TIPO),
    area: v.optional(v.string()),
    prioridad: v.optional(PRIORIDAD),
    solicitante: v.optional(v.string()),
    apertura: v.optional(v.string()),
    estado: v.optional(ESTADO),
    tecnico: v.optional(v.string()),
    empresa: v.optional(v.string()),
    costo: v.optional(v.number()),
    fechaCierre: v.optional(v.string()),
    observaciones: v.optional(v.string()),
    proxFecha: v.optional(v.string()),
  },
  handler: async (ctx, { id, ...patch }) => {
    await ctx.db.patch(id, patch)
  },
})

export const remove = mutation({
  args: { id: v.id('mantenimientos') },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id)
  },
})
