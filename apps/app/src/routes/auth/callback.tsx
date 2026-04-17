import { createFileRoute, redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

// Intercambia el code de WorkOS por tokens, resuelve el tenant y guarda la sesión
const handleCallback = createServerFn()
  .inputValidator(z.object({ code: z.string() }))
  .handler(async ({ data }) => {
    const { workos, saveSession, resolveOrgSlug } =
      await import('#/lib/auth.server')
    const { env } = await import('#/env')
    const { ConvexHttpClient } = await import('convex/browser')
    const { api } = await import('@cualia/convex')

    const auth = await workos.userManagement.authenticateWithCode({
      clientId: env.WORKOS_CLIENT_ID,
      code: data.code,
    })

    // El tenant se identifica siempre por el slug (betania, etc.).
    // El WorkOS organizationId es sólo para autenticación — no se usa como orgId de datos.
    const orgSlug = resolveOrgSlug()

    // Upsert del perfil de usuario en Convex (no bloquea el login si falla)
    try {
      const convex = new ConvexHttpClient(env.VITE_CONVEX_URL)
      // Sin WorkOS Organization el accessToken es opaco (no JWT) — no usar setAuth
      // La mutation upsertFromAuth no requiere ctx.auth, funciona sin token

      const nombre =
        [auth.user.firstName, auth.user.lastName].filter(Boolean).join(' ') ||
        auth.user.email

      await convex.mutation(api.usuarios.upsertFromAuth, {
        orgId: orgSlug,
        workosUserId: auth.user.id,
        nombre,
        email: auth.user.email,
      })
    } catch (e) {
      console.error('[auth/callback] Convex upsertFromAuth falló:', e)
    }

    await saveSession({
      userId: auth.user.id,
      email: auth.user.email,
      firstName: auth.user.firstName ?? null,
      lastName: auth.user.lastName ?? null,
      orgSlug,
      orgId: orgSlug,
      accessToken: auth.accessToken,
      sealedSession: auth.sealedSession,
    })

    throw redirect({ to: '/dashboard' })
  })

export const Route = createFileRoute('/auth/callback')({
  validateSearch: z.object({
    code: z.string().optional(),
    error: z.string().optional(),
  }),
  beforeLoad: async ({ search }) => {
    if (!search.code) throw redirect({ to: '/auth/login' })
    await handleCallback({ data: { code: search.code } })
  },
  component: () => null,
})
