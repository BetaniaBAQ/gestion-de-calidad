import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

// ─── Variables de entorno validadas en runtime ────────────────────────────
//
// Usa `env.VARIABLE_NAME` en lugar de `process.env.VARIABLE_NAME` o
// `import.meta.env.VITE_*` para tener validación de tipos y errores claros
// al arrancar si falta alguna variable.
//
// Si falta una variable requerida, la app falla en startup con un mensaje
// claro indicando qué variable falta y por qué es requerida.

export const env = createEnv({
  // ── Variables de servidor (solo disponibles en SSR / funciones server) ──
  server: {
    // WorkOS — API key para operaciones server-side (crear orgs, usuarios, etc.)
    WORKOS_API_KEY: z.string().startsWith('sk_'),

    // WorkOS — Client ID de tu aplicación (igual que VITE_WORKOS_CLIENT_ID)
    WORKOS_CLIENT_ID: z.string().startsWith('client_'),

    // WorkOS — URL a la que WorkOS redirige tras autenticación
    WORKOS_REDIRECT_URI: z.string().url(),

    // Secreto para firmar cookies de sesión (mínimo 32 caracteres)
    WORKOS_COOKIE_SECRET: z.string().min(32),

    // Convex — Nombre del deployment (e.g. "dev:mi-proyecto-abc123")
    // Usado por el CLI de Convex, no por el cliente
    CONVEX_DEPLOYMENT: z.string().min(1),

    // Tenant activo en localhost (no hay subdominio en desarrollo local)
    // En producción se ignora — el tenant se resuelve por subdominio
    DEV_ORG_SLUG: z.string().min(1).optional(),
  },

  // ── Variables de cliente (expuestas al browser, prefijo VITE_) ──────────
  clientPrefix: 'VITE_',
  client: {
    // Convex — URL pública del deployment (e.g. "https://xxx.convex.cloud")
    VITE_CONVEX_URL: z.string().url(),

    // WorkOS — Client ID público para iniciar flujos de auth en el browser
    VITE_WORKOS_CLIENT_ID: z.string().startsWith('client_'),
  },

  // ── Valores en runtime ───────────────────────────────────────────────────
  // vite.config.ts carga todas las vars en process.env via loadEnv().
  // Las vars de servidor usan process.env (disponibles en SSR).
  // Las vars de cliente usan import.meta.env (solo VITE_* llegan al browser).
  runtimeEnv: {
    WORKOS_API_KEY: process.env.WORKOS_API_KEY,
    WORKOS_CLIENT_ID: process.env.WORKOS_CLIENT_ID,
    WORKOS_REDIRECT_URI: process.env.WORKOS_REDIRECT_URI,
    WORKOS_COOKIE_SECRET: process.env.WORKOS_COOKIE_SECRET,
    CONVEX_DEPLOYMENT: process.env.CONVEX_DEPLOYMENT,
    DEV_ORG_SLUG: process.env.DEV_ORG_SLUG,
    VITE_CONVEX_URL: import.meta.env.VITE_CONVEX_URL,
    VITE_WORKOS_CLIENT_ID: import.meta.env.VITE_WORKOS_CLIENT_ID,
  },

  // En Vite, import.meta.env.SSR es true en el server y false en el browser.
  // Sin esto, env-core intenta validar las vars de servidor en el cliente (donde son undefined).
  isServer: import.meta.env.SSR,

  // Omite validación en tests para no necesitar un .env en CI
  skipValidation: process.env.NODE_ENV === 'test',
})
