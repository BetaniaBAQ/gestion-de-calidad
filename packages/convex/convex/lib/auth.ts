import type { QueryCtx, MutationCtx, ActionCtx } from '../_generated/server'

// Extrae el org_id del JWT verificado por Convex.
// Lanza error si no hay sesión autenticada o si el JWT no tiene org_id.
export async function getOrgId(
  ctx: QueryCtx | MutationCtx | ActionCtx
): Promise<string> {
  const identity = await ctx.auth.getUserIdentity()
  if (!identity) {
    throw new Error('Unauthenticated')
  }
  // WorkOS pone el org_id en el claim custom del JWT cuando la sesión es org-scoped
  const orgId =
    (identity as Record<string, unknown>).org_id ??
    (identity as Record<string, unknown>).organizationId
  if (!orgId || typeof orgId !== 'string') {
    throw new Error('JWT missing org_id claim')
  }
  return orgId
}
