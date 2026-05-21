import type { QueryCtx, MutationCtx, ActionCtx } from '../_generated/server'

// Extrae el org_id del JWT verificado por Convex.
export async function getOrgId(
  ctx: QueryCtx | MutationCtx | ActionCtx
): Promise<string> {
  const identity = await ctx.auth.getUserIdentity()
  if (!identity) {
    throw new Error('Unauthenticated')
  }
  const orgId =
    (identity as Record<string, unknown>).org_id ??
    (identity as Record<string, unknown>).organizationId
  if (!orgId || typeof orgId !== 'string') {
    throw new Error('JWT missing org_id claim')
  }
  return orgId
}

// Verifica que el caller pertenece a la org admin (CUALIA_ADMIN_ORG_ID).
export async function assertAdmin(
  ctx: QueryCtx | MutationCtx | ActionCtx
): Promise<void> {
  const orgId = await getOrgId(ctx)
  const adminOrgId = process.env.CUALIA_ADMIN_ORG_ID
  if (!adminOrgId || orgId !== adminOrgId) {
    throw new Error('Forbidden: admin only')
  }
}
