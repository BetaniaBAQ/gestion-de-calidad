import { createRootRoute, Link, HeadContent, Scripts  } from '@tanstack/react-router'
import {
  LayoutDashboard,
  Users,
  Stethoscope,
  Wrench,
  ClipboardCheck,
  BarChart3,
  TrendingUp,
  Search,
  FileText,
  Pill,
  GitBranch,
  FileBarChart,
  MessageSquare,
  Settings,
  Building2,
} from 'lucide-react'
import { useConfigStore } from '#/lib/stores/config.store'
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
import appCss from '../styles.css?url'

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/personal', label: 'Talento Humano', icon: Users },
  { to: '/equipos', label: 'Dotación', icon: Stethoscope },
  { to: '/mantenimiento', label: 'Mantenimiento', icon: Wrench },
  { to: '/habilitacion', label: 'Habilitación', icon: ClipboardCheck },
  { to: '/indicadores', label: 'Indicadores', icon: BarChart3 },
  { to: '/pamec', label: 'PAMEC', icon: TrendingUp },
  { to: '/auditoria', label: 'Auditoría', icon: Search },
  { to: '/documentos', label: 'Documentos', icon: FileText },
  { to: '/medicamentos', label: 'Medicamentos', icon: Pill },
  { to: '/procesos', label: 'Procesos', icon: GitBranch },
  { to: '/reportes', label: 'Reportes', icon: FileBarChart },
  { to: '/pqrs', label: 'PQRS', icon: MessageSquare },
  { to: '/config', label: 'Configuración', icon: Settings },
] as const

export const Route = createRootRoute({
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
  const { sedes, sedeActiva, setSedeActiva, usuarioActual } = useConfigStore()
  const sedeNombre =
    sedes.find((s) => s.id === sedeActiva)?.nombre ?? sedeActiva

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border pb-3">
        <div className="flex items-center gap-2 px-2 pt-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm shrink-0">
            B
          </div>
          <div className="flex flex-col min-w-0 group-data-[collapsible=icon]:hidden">
            <span className="text-xs font-semibold text-foreground truncate">
              SGC Betania
            </span>
            <span className="text-xs text-muted-foreground truncate">
              {sedeNombre}
            </span>
          </div>
        </div>
        <div className="px-2 group-data-[collapsible=icon]:hidden">
          <select
            value={sedeActiva}
            onChange={(e) => setSedeActiva(e.target.value)}
            className="w-full rounded-md border border-sidebar-border bg-sidebar-accent text-sidebar-foreground text-xs px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {sedes
              .filter((s) => s.activa)
              .map((s) => (
                <option key={s.id} value={s.id}>
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

      <SidebarFooter className="border-t border-sidebar-border pt-2">
        <div className="flex items-center gap-2 px-2 py-1 group-data-[collapsible=icon]:hidden">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-bold shrink-0">
            {usuarioActual?.nombre.charAt(0) ?? 'A'}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-medium text-foreground truncate">
              {usuarioActual?.nombre ?? 'Usuario'}
            </span>
            <span className="text-xs text-muted-foreground truncate capitalize">
              {usuarioActual?.rol ?? ''}
            </span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="dark">
      <head>
        <HeadContent />
      </head>
      <body className="bg-background text-foreground antialiased">
        <SidebarProvider>
          <AppSidebar />
          <div className="flex flex-col flex-1 min-w-0">
            <header className="flex h-12 items-center gap-2 border-b border-border px-4 bg-card/50 backdrop-blur-sm shrink-0">
              <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Building2 className="h-3 w-3" />
                <span>Instituto Oncohematológico Betania</span>
              </div>
            </header>
            <main className="flex-1 overflow-auto p-6">{children}</main>
          </div>
        </SidebarProvider>
        <Scripts />
      </body>
    </html>
  )
}
