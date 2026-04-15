// ─── Configuración de autenticación para Convex ───────────────────────────
//
// Este archivo le dice a Convex cómo verificar los tokens JWT emitidos por
// WorkOS. Cuando el usuario hace login con WorkOS AuthKit, WorkOS emite un
// JWT firmado con sus claves privadas. Convex verifica ese token usando las
// claves públicas de WorkOS (JWKS) antes de ejecutar cualquier query o
// mutation que requiera autenticación.
//
// Flujo:
//   1. Usuario hace login → WorkOS AuthKit
//   2. WorkOS emite un JWT (access token)
//   3. El cliente envía ese token en cada request a Convex
//   4. Convex verifica el token contra el JWKS de WorkOS
//   5. Si es válido, `ctx.auth.getUserIdentity()` devuelve los datos del usuario
//
// JWKS de WorkOS:
//   WorkOS publica sus claves públicas en:
//   https://api.workos.com/user_management/jwks/{CLIENT_ID}
//
//   Convex descubre este endpoint automáticamente desde el OIDC well-known:
//   https://api.workos.com/.well-known/openid-configuration
//
// SETUP REQUERIDO:
//   Antes de hacer deploy, configura el CLIENT_ID en las variables de Convex:
//
//     cd packages/convex
//     npx convex env set WORKOS_CLIENT_ID client_TU_CLIENT_ID
//
//   Puedes verificar las variables configuradas con:
//     npx convex env ls

export default {
  providers: [
    {
      // Issuer del JWT — WorkOS pone "https://api.workos.com" en el campo `iss`
      // Convex llama a {domain}/.well-known/openid-configuration para descubrir
      // el JWKS URI automáticamente.
      domain: 'https://api.workos.com',

      // Audience del JWT — WorkOS pone el Client ID en el campo `aud`
      // Este valor se lee de las variables de entorno de Convex (no del .env.local).
      // Configúralo con: npx convex env set WORKOS_CLIENT_ID client_xxx
      applicationID: process.env.WORKOS_CLIENT_ID ?? '',
    },
  ],
}
