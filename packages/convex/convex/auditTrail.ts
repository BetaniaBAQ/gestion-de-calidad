import { mutation, internalMutation, query } from './_generated/server'
import { v } from 'convex/values'

// ─── Mutation pública: registrar transición de estado ────────────────────────

export const registrar = mutation({
  args: {
    orgId: v.string(),
    entidad: v.string(),
    entidadId: v.string(),
    estadoAnterior: v.optional(v.string()),
    estadoNuevo: v.string(),
    usuarioId: v.string(),
    usuarioNombre: v.string(),
    nota: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert('audit_trail', {
      ...args,
      ts: Date.now(),
    })
  },
})

// ─── Mutation interna: usar desde otras mutations sin exponer al cliente ──────

export const registrarInterno = internalMutation({
  args: {
    orgId: v.string(),
    entidad: v.string(),
    entidadId: v.string(),
    estadoAnterior: v.optional(v.string()),
    estadoNuevo: v.string(),
    usuarioId: v.string(),
    usuarioNombre: v.string(),
    nota: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert('audit_trail', {
      ...args,
      ts: Date.now(),
    })
  },
})

// ─── Query: historial de una entidad ─────────────────────────────────────────

export const listarPorEntidad = query({
  args: {
    entidad: v.string(),
    entidadId: v.string(),
  },
  handler: async (ctx, { entidad, entidadId }) => {
    return ctx.db
      .query('audit_trail')
      .withIndex('by_entidad', (q) =>
        q.eq('entidad', entidad).eq('entidadId', entidadId)
      )
      .order('desc')
      .collect()
  },
})
