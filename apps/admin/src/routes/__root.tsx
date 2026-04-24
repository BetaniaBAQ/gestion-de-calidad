import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
  redirect,
} from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { AuthKitProvider } from '@workos/authkit-tanstack-react-start/client'
import { ConvexProviderWithAuth } from 'convex/react'
import { convexClient } from '#/lib/convex'
import { useAuthFromWorkOS } from '#/lib/convex-auth'
import { Building2, LogOut } from 'lucide-react'
import { Button } from '@cualia/ui/components/button'
import { ThemeToggle } from '@cualia/ui/components/theme-toggle'
import appCss from '../styles.css?url'

type AdminSession = {
  email: string
  firstName: string | null
  orgId: string
}

const getSessionFn = createServerFn({ method: 'POST' }).handler(
  async (): Promise<AdminSession | null> => {
    const { getAuth } = await import('@workos/authkit-tanstack-react-start')
    const { env } = await import('#/lib/env')
    const auth = await getAuth()
    if (!auth.user || auth.organizationId !== env.CUALIA_ADMIN_ORG_ID) {
      return null
    }
    return {
      email: auth.user.email,
      firstName: auth.user.firstName,
      orgId: auth.organizationId,
    }
  }
)

const getSignInUrlFn = createServerFn({ method: 'POST' }).handler(async () => {
  const { getSignInUrl } = await import('@workos/authkit-tanstack-react-start')
  const { env } = await import('#/lib/env')
  return getSignInUrl({ data: { organizationId: env.CUALIA_ADMIN_ORG_ID } })
})

export const Route = createRootRoute({
  beforeLoad: async ({ location }) => {
    if (location.pathname.startsWith('/auth')) {
      return { session: null as AdminSession | null }
    }
    const session = await getSessionFn()
    if (!session) {
      const signInUrl = await getSignInUrlFn()
      throw redirect({ href: signInUrl })
    }
    return { session }
  },
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Cualia Admin' },
    ],
    links: [{ rel: 'stylesheet', href: appCss }],
  }),
  component: RootDocument,
})

function RootDocument() {
  const { session } = Route.useRouteContext()
  const isAuthRoute =
    typeof window !== 'undefined' &&
    window.location.pathname.startsWith('/auth')

  return (
    <html lang="es" className="dark">
      <head>
        <HeadContent />
      </head>
      <body className="bg-background text-foreground antialiased min-h-svh">
        <AuthKitProvider>
          <ConvexProviderWithAuth
            client={convexClient}
            useAuth={useAuthFromWorkOS}
          >
            {isAuthRoute ? (
              <Outlet />
            ) : (
              <div className="flex flex-col min-h-svh">
                <header className="flex items-center justify-between border-b border-border px-6 py-3">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    <span className="font-semibold">Cualia Admin</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <ThemeToggle />
                    <span className="text-muted-foreground">
                      {session?.email}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        window.location.href = '/auth/logout'
                      }}
                    >
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </div>
                </header>
                <main className="flex-1 p-6">
                  <Outlet />
                </main>
              </div>
            )}
          </ConvexProviderWithAuth>
        </AuthKitProvider>
        <Scripts />
      </body>
    </html>
  )
}
