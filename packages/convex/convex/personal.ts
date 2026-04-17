import { mutation, query } from './_generated/server'
import { v } from 'convex/values'

const ESTADO = v.union(
  v.literal('activo'),
  v.literal('inactivo'),
  v.literal('vacaciones'),
  v.literal('licencia')
)

const ESTADO_REQ = v.union(
  v.literal('VIGENTE'),
  v.literal('POR_VALIDAR'),
  v.literal('SIN_CARGAR'),
  v.literal('VENCIDO'),
  v.literal('CRITICO'),
  v.literal('NO_APLICA'),
)

const REQUISITO = v.object({
  defId: v.string(),
  estado: ESTADO_REQ,
  fechaVigencia: v.optional(v.string()),
  observacion: v.optional(v.string()),
})

export const listByOrg = query({
  args: { orgId: v.string() },
  handler: async (ctx, { orgId }) => {
    return ctx.db
      .query('personal')
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
    cedula: v.string(),
    cargoId: v.id('cargos'),
    cargoCodigo: v.string(),
    fechaIngreso: v.string(),
    estado: ESTADO,
    requisitos: v.optional(v.array(REQUISITO)),
  },
  handler: async (ctx, args) => {
    return ctx.db.insert('personal', args)
  },
})

export const update = mutation({
  args: {
    id: v.id('personal'),
    sedeId: v.optional(v.id('sedes')),
    sedeCodigo: v.optional(v.string()),
    nombre: v.optional(v.string()),
    cedula: v.optional(v.string()),
    cargoId: v.optional(v.id('cargos')),
    cargoCodigo: v.optional(v.string()),
    fechaIngreso: v.optional(v.string()),
    estado: v.optional(ESTADO),
    requisitos: v.optional(v.array(REQUISITO)),
  },
  handler: async (ctx, { id, ...patch }) => {
    await ctx.db.patch(id, patch)
  },
})

export const remove = mutation({
  args: { id: v.id('personal') },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id)
  },
})
