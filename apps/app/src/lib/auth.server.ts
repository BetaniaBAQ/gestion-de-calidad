import '@tanstack/react-start/server-only'
import { getRequestHost } from '@tanstack/react-start/server'
import { WorkOS } from '@workos-inc/node'
import { env } from '#/env'

// ─── Cliente WorkOS (singleton) ──────────────────────────────────────────────

export const workos = new WorkOS(env.WORKOS_API_KEY)

// ─── Resolución de tenant ────────────────────────────────────────────────────
// Dev: usa DEV_ORG_SLUG del .env.local
// Prod: extrae el subdominio del host (betania.cualia.app → betania)

export function resolveOrgSlug(): string {
  if (!import.meta.env.PROD) {
    return env.DEV_ORG_SLUG ?? 'betania'
  }
  const host = getRequestHost()
  return host.split('.')[0]
}

// Busca la Organization de WorkOS por su external_id (= slug del tenant).
// Retorna el WorkOS org ID (ej. "org_01KPA2A4X3...") o null si no existe.
export async function resolveWorkosOrgId(slug: string): Promise<string | null> {
  try {
    const org = await workos.organizations.getOrganizationByExternalId(slug)
    return org.id
  } catch {
    return null
  }
}
