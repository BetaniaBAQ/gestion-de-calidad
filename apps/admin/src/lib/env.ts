import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

export const env = createEnv({
  server: {
    WORKOS_API_KEY: z.string().startsWith('sk_'),
    WORKOS_CLIENT_ID: z.string().startsWith('client_'),
    WORKOS_REDIRECT_URI: z.string().url(),
    WORKOS_COOKIE_PASSWORD: z.string().min(32),
    CONVEX_DEPLOYMENT: z.string().min(1),
    CUALIA_ADMIN_ORG_ID: z.string().startsWith('org_'),
  },
  clientPrefix: 'VITE_',
  client: {
    VITE_CONVEX_URL: z.string().url(),
  },
  runtimeEnv: {
    WORKOS_API_KEY: process.env.WORKOS_API_KEY,
    WORKOS_CLIENT_ID: process.env.WORKOS_CLIENT_ID,
    WORKOS_REDIRECT_URI: process.env.WORKOS_REDIRECT_URI,
    WORKOS_COOKIE_PASSWORD: process.env.WORKOS_COOKIE_PASSWORD,
    CONVEX_DEPLOYMENT: process.env.CONVEX_DEPLOYMENT,
    CUALIA_ADMIN_ORG_ID: process.env.CUALIA_ADMIN_ORG_ID,
    VITE_CONVEX_URL: import.meta.env.VITE_CONVEX_URL,
  },
  isServer: import.meta.env.SSR,
  skipValidation: process.env.NODE_ENV === 'test',
})
