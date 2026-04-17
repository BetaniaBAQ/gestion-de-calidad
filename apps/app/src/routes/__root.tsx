import {
  createRootRoute,
  HeadContent,
  Link,
  Scripts,
  redirect,
  useLocation,
} from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { ConvexProvider } from 'convex/react'
import type { SessionData } from '#/lib/auth.server'
import { convexClient } from '#/lib/convex'
import {
  BadgeCheck,
  Building2,
  Calendar,
  ChevronDown,
  ClipboardCheck,
  FileBarChart,
  FileText,
  GitBranch,
  Hospital,
  LayoutDashboard,
  LogOut,
  MapPin,
  Pill,
  PlaySquare,
  Settings,
  Stethoscope,
  Swords,
  TrendingUp,
  Users,
  Wrench,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import {
  useSedes,
  useSedeActiva,
  useSedeActivaNombre,
  useSetSedeActiva,
  useVistaCompleta,
  useSetVistaCompleta,
  useScoreGlobal,
} from '#/lib/domain/config'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '#/components/ui/sidebar'
import { Toggle } from '#/components/ui/toggle'
import { StoreHydrator } from '#/lib/hydration'
import { OrgContext } from '#/lib/org-context'
import appCss from '../styles.css?url'

// ─── Server function: lee la sesión desde la cookie ─────────────────────────
const getSessionFn = createServerFn({ method: 'POST' }).handler(async () => {
  const { getSession } = await import('#/lib/auth.server')
  return getSession()
})

// ─── Server function: cierra la sesión ───────────────────────────────────────
// Borra la sesión local y revoca las sesiones de WorkOS para el usuario.
// Devuelve la URL de login de WorkOS para que el cliente navegue allí.
const logoutFn = createServerFn({ method: 'POST' }).handler(async () => {
  const { getSession, clearSession, workos } = await import('#/lib/auth.server')
  const { env } = await import('#/env')
  const session = await getSession()
  await clearSession()

  // Revocar todas las sesiones activas del usuario en WorkOS
  if (session?.userId) {
    try {
      const { data: sessions } = await workos.userManagement.listSessions(
        session.userId
      )
      await Promise.all(
        sessions.map((s) =>
          workos.userManagement.revokeSession({ sessionId: s.id })
        )
      )
      console.log('[logout] sesiones WorkOS revocadas:', sessions.length)
    } catch (e) {
      console.warn(
        '[logout] revokeSession falló (sessions no habilitadas?):',
        e
      )
    }
  }

  // Devolver URL de login de WorkOS
  return workos.userManagement.getAuthorizationUrl({
    clientId: env.WORKOS_CLIENT_ID,
    redirectUri: env.WORKOS_REDIRECT_URI,
    provider: 'authkit',
    prompt: 'login',
  })
})

type NavItem = {
  to: string
  label: string
  icon: LucideIcon
}

const NAV_ITEMS: readonly NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/personal', label: 'Talento Humano', icon: Users },
  { to: '/equipos', label: 'Dotación', icon: Stethoscope },
  { to: '/mantenimiento', label: 'Mantenimiento', icon: Wrench },
  { to: '/habilitacion', label: 'Habilitación', icon: ClipboardCheck },
  { to: '/indicadores', label: 'Indicadores', icon: TrendingUp },
  { to: '/documentos', label: 'Gestión Documental', icon: FileText },
  { to: '/medicamentos', label: 'Medicamentos y DM', icon: Pill },
  { to: '/procesos', label: 'Procesos Prioritarios', icon: GitBranch },
  { to: '/pamec', label: 'PAMEC', icon: BadgeCheck },
  { to: '/auditoria', label: 'Auditoría en vivo', icon: PlaySquare },
  { to: '/grill-me', label: 'Simulacro inspección', icon: Swords },
  { to: '/reportes', label: 'Reporte visita', icon: FileBarChart },
  { to: '/config', label: 'Configuración', icon: Settings },
] as const

const PAGE_HEADERS: Record<string, { title: string }> = {
  '/dashboard': { title: 'Dashboard' },
  '/personal': { title: 'Talento Humano' },
  '/equipos': { title: 'Dotación' },
  '/mantenimiento': { title: 'Mantenimiento' },
  '/habilitacion': { title: 'Habilitación' },
  '/indicadores': { title: 'Indicadores' },
  '/documentos': { title: 'Gestión Documental' },
  '/medicamentos': { title: 'Medicamentos y DM' },
  '/procesos': { title: 'Procesos Prioritarios' },
  '/pamec': { title: 'PAMEC' },
  '/auditoria': { title: 'Auditoría en vivo' },
  '/grill-me': { title: 'Simulacro de inspección' },
  '/reportes': { title: 'Reporte visita' },
  '/config': { title: 'Configuración' },
}

export const Route = createRootRoute({
  // Guard: redirige a /auth/login si no hay sesión activa.
  // Las rutas /auth/* están exentas.
  beforeLoad: async ({ location }) => {
    if (location.pathname.startsWith('/auth')) {
      return { session: null as SessionData | null }
    }
    const session = await getSessionFn()
    if (!session) throw redirect({ to: '/auth/login' })
    return { session }
  },
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'SGC · Instituto Oncohematológico Betania' },
    ],
    links: [{ rel: 'stylesheet', href: appCss }],
  }),
  shellComponent: RootDocument,
})

function AppSidebar() {
  const sedes = useSedes()
  const sedeActiva = useSedeActiva()
  const setSedeActiva = useSetSedeActiva()
  const sedeNombre = useSedeActivaNombre()
  const vistaCompleta = useVistaCompleta()
  const scoreG = useScoreGlobal()
  const { session } = Route.useRouteContext()
  const nombreUsuario = session?.firstName
    ? [session.firstName, session.lastName].filter(Boolean).join(' ')
    : (session?.email ?? 'Usuario')

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border pb-3">
        <div className="flex items-center gap-2 px-2 pt-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm shrink-0">
            B
          </div>
          <div className="flex flex-col min-w-0 group-data-[collapsible=icon]:hidden">
            <span className="text-xs font-semibold text-foreground truncate">
              betania
            </span>
            <span className="text-xs text-muted-foreground truncate">
              SGC · HEMOFILIA
            </span>
          </div>
        </div>
        <div className="px-2 group-data-[collapsible=icon]:hidden">
          <select
            value={sedeActiva}
            onChange={(e) => setSedeActiva(e.target.value)}
            disabled={vistaCompleta}
            className="w-full rounded-md border border-sidebar-border bg-sidebar-accent text-sidebar-foreground text-xs px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
          >
            {sedes
              .filter((s) => s.activa)
              .map((s) => (
                <option key={s._id} value={s.codigo}>
                  {s.ciudad}
                </option>
              ))}
          </select>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Módulos SGC</SidebarGroupLabel>
          <SidebarMenu>
            {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
              <SidebarMenuItem key={to}>
                <SidebarMenuButton asChild tooltip={label}>
                  <Link
                    to={to}
                    activeProps={{
                      className: 'bg-sidebar-accent text-primary font-medium',
                    }}
                    className="flex items-center gap-2"
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border pt-2 gap-3">
        <div className="px-2 group-data-[collapsible=icon]:hidden">
          <div className="rounded-md bg-sidebar-accent/40 px-3 py-2">
            <div className="text-[0.65rem] uppercase tracking-wide text-muted-foreground">
              Score global
            </div>
            <div className="text-lg font-semibold text-foreground">
              {scoreG.label}
            </div>
            <div className="text-[0.65rem] text-muted-foreground truncate">
              {vistaCompleta ? 'Vista completa' : sedeNombre}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 px-2 py-1 group-data-[collapsible=icon]:hidden">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-bold shrink-0">
            {nombreUsuario.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-medium text-foreground truncate">
              {nombreUsuario}
            </span>
            <span className="text-xs text-muted-foreground truncate">
              {session?.orgSlug ?? ''}
            </span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}

function HeaderBar() {
  const location = useLocation()
  const vistaCompleta = useVistaCompleta()
  const setVistaCompleta = useSetVistaCompleta()
  const sedeNombre = useSedeActivaNombre()
  const { session } = Route.useRouteContext()
  const nombreUsuario = session?.firstName
    ? [session.firstName, session.lastName].filter(Boolean).join(' ')
    : (session?.email ?? 'Usuario')

  const pageHeader = PAGE_HEADERS[location.pathname] ?? { title: 'SGC' }

  const fechaHoy = new Intl.DateTimeFormat('es-CO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date())

  const descriptor = vistaCompleta
    ? 'Vista completa · Instituto Oncohematológico Betania'
    : `${sedeNombre} · Instituto Oncohematológico Betania`

  return (
    <header className="flex h-14 items-center gap-3 border-b border-border px-4 bg-card/50 backdrop-blur-sm shrink-0">
      <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
      <div className="flex flex-col min-w-0 flex-1">
        <h1 className="text-sm font-semibold text-foreground leading-tight truncate">
          {pageHeader.title}
        </h1>
        <p className="text-xs text-muted-foreground leading-tight truncate">
          {descriptor}
        </p>
      </div>
      <Toggle
        aria-label="Vista completa"
        pressed={vistaCompleta}
        onPressedChange={setVistaCompleta}
        className="gap-2 text-xs"
      >
        <Hospital className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Vista completa</span>
      </Toggle>
      <div className="hidden md:flex items-center gap-1.5 text-xs text-muted-foreground">
        <Calendar className="h-3.5 w-3.5" />
        <span>{fechaHoy}</span>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-bold">
              {nombreUsuario.charAt(0).toUpperCase()}
            </div>
            <span className="hidden sm:inline text-xs font-medium">
              {nombreUsuario}
            </span>
            <Badge variant="secondary" className="hidden md:inline">
              {session?.orgSlug ?? ''}
            </Badge>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>{nombreUsuario}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem disabled>
            <MapPin className="mr-2 h-4 w-4" />
            {sedeNombre}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={async () => {
              const url = await logoutFn()
              window.location.href = url
            }}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Cerrar sesión
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const isAuthRoute = location.pathname.startsWith('/auth')
  const { session } = Route.useRouteContext()

  // ConvexProvider siempre está en el árbol para evitar que useQuery falle
  // durante la transición dashboard → rutas /auth (desmontado antes que los hijos).
  // Las queries en rutas /auth no se ejecutan porque orgId es '' (skip).
  return (
    <html lang="es" className="dark">
      <head>
        <HeadContent />
      </head>
      <body
        className={
          isAuthRoute
            ? 'bg-background text-foreground antialiased flex min-h-svh items-center justify-center'
            : 'bg-background text-foreground antialiased'
        }
      >
        <OrgContext.Provider value={session?.orgId ?? ''}>
          <ConvexProvider client={convexClient}>
            {isAuthRoute ? (
              children
            ) : (
              <>
                <StoreHydrator />
                <SidebarProvider>
                  <AppSidebar />
                  <div className="flex flex-col flex-1 min-w-0">
                    <HeaderBar />
                    <div className="flex items-center gap-1 border-b border-border px-4 py-1.5 text-xs text-muted-foreground">
                      <Building2 className="h-3 w-3" />
                      <span>Instituto Oncohematológico Betania</span>
                    </div>
                    <main className="flex-1 overflow-auto p-6">{children}</main>
                  </div>
                </SidebarProvider>
              </>
            )}
          </ConvexProvider>
        </OrgContext.Provider>
        <Scripts />
      </body>
    </html>
  )
}
