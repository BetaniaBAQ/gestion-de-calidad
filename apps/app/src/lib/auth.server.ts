import '@tanstack/react-start/server-only'
import { useSession, getRequestHost } from '@tanstack/react-start/server'
import { WorkOS } from '@workos-inc/node'
import { env } from '#/env'

// ─── Tipos ───────────────────────────────────────────────────────────────────

export type SessionData = {
  userId: string
  email: string
  firstName: string | null
  lastName: string | null
  orgSlug: string
  orgId: string // slug del tenant — usado en todas las queries de Convex
  accessToken: string
  sealedSession?: string // WorkOS session token — necesario para logout completo
}

// ─── Cliente WorkOS (singleton) ──────────────────────────────────────────────

export const workos = new WorkOS(env.WORKOS_API_KEY)

// ─── Configuración de sesión ─────────────────────────────────────────────────

const SESSION_CONFIG = {
  password: env.WORKOS_COOKIE_SECRET,
  maxAge: 7 * 24 * 60 * 60, // 7 días en segundos
  name: 'cualia_session',
  cookie: {
    httpOnly: true,
    secure: import.meta.env.PROD,
    sameSite: 'lax' as const,
    path: '/',
  },
} as const

// ─── Helpers de sesión ───────────────────────────────────────────────────────

export async function getSession(): Promise<SessionData | null> {
  const session = await useSession<SessionData>(SESSION_CONFIG)
  if (!session.data.userId) return null
  return session.data as SessionData
}

export async function saveSession(data: SessionData): Promise<void> {
  const session = await useSession<SessionData>(SESSION_CONFIG)
  await session.update(() => data)
}

export async function clearSession(): Promise<void> {
  const session = await useSession<SessionData>(SESSION_CONFIG)
  await session.clear()
}

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
