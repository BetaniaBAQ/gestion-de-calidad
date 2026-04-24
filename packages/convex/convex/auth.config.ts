// WorkOS AuthKit JWT verification for Convex.
// WorkOS access tokens have iss = https://api.workos.com/user_management/{clientId}
// and no `aud` claim, so we use customJwt with explicit issuer + jwks.
export default {
  providers: [
    {
      type: 'customJwt' as const,
      issuer: `https://api.workos.com/user_management/${process.env.WORKOS_CLIENT_ID}`,
      jwks: `https://api.workos.com/sso/jwks/${process.env.WORKOS_CLIENT_ID}`,
      algorithm: 'RS256' as const,
    },
  ],
}
