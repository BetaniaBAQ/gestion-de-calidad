import { createFileRoute, Link } from '@tanstack/react-router'
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  GraduationCap,
  Hospital,
  ShieldAlert,
  Stethoscope,
  Users,
} from 'lucide-react'
import { CAPACITACIONES_PROGRAMADAS0 } from '#/lib/data'
import {
  useScoreGlobal,
  useSedeActiva,
  useSedes,
  useSedesActivas,
  useVistaCompleta,
} from '#/lib/domain/config'
import { useDocumentosVencidos } from '#/lib/domain/documentos'
import {
  useEquipos,
  useEquiposProximos,
  useEquiposVencidos,
} from '#/lib/domain/equipos'
import {
  useCargos,
  usePendientesValidacion,
  usePersonas,
  usePersonasTodas,
  resolveRequisitos,
} from '#/lib/domain/personal'
import {
  autoForSede,
  computeChecklistEstado,
  useAutoVerificacionPorSede,
  useHabilitacionesAll,
} from '#/lib/domain/habilitacion'
import { scoreSede, diasHasta } from '#/lib/utils-sgc'
import { Badge } from '@cualia/ui/components/badge'
import { Button } from '@cualia/ui/components/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@cualia/ui/components/card'

export const Route = createFileRoute('/dashboard')({
  component: DashboardPage,
})

function DashboardPage() {
  const scoreG = useScoreGlobal()
  const sedes = useSedes()
  const sedesActivas = useSedesActivas()
  const sedeActiva = useSedeActiva()
  const vistaCompleta = useVistaCompleta()

  const personasVisible = usePersonas()
  const personasTodas = usePersonasTodas()
  const cargos = useCargos()

  const equipos = useEquipos()
  const equiposVencidos = useEquiposVencidos()
  const equiposProximos = useEquiposProximos()

  const docsVencidos = useDocumentosVencidos()

  const pendientes = usePendientesValidacion()
  const habilitaciones = useHabilitacionesAll()
  const autoAll = useAutoVerificacionPorSede()

  // Alertas documentales cruzando personas x requisitos (por vista)
  const alertasReq = personasVisible.flatMap((p) =>
    resolveRequisitos(p)
      .filter((r) => ['VENCIDO', 'CRITICO', 'SIN_CARGAR'].includes(r.estado))
      .map((r) => ({ persona: p, ...r }))
  )

  // Capacitaciones próximas (≤30d) o vencidas
  const capsAtencion = CAPACITACIONES_PROGRAMADAS0.filter((c) => {
    if (c.estado === 'ejecutada') return false
    const d = diasHasta(c.fechaObjetivo)
    return d < 0 || d <= 30
  })

  const personalCount = personasVisible.length

  return (
    <div className="space-y-6">
      {/* ── 6 KPI cards ──────────────────────────────────────────── */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
        <KpiCard
          icon={<Hospital className="h-4 w-4" />}
          label="SCORE GLOBAL"
          value={scoreG.label}
          hint={vistaCompleta ? 'Promedio todas las sedes' : 'Sede actual'}
          accent
        />
        <KpiCard
          icon={<Building2 className="h-4 w-4" />}
          label="SEDES ACTIVAS"
          value={sedesActivas.length.toString()}
          hint="en operación"
        />
        <KpiCard
          icon={<Users className="h-4 w-4" />}
          label="PERSONAL"
          value={personalCount.toString()}
          hint="registrado"
        />
        <KpiCard
          icon={<ClipboardCheck className="h-4 w-4" />}
          label="POR VALIDAR"
          value={pendientes.length.toString()}
          hint="documentos cargados"
        />
        <KpiCard
          icon={<ShieldAlert className="h-4 w-4" />}
          label="ALERTAS DOCS"
          value={alertasReq.length.toString()}
          hint="requisitos pendientes"
        />
        <KpiCard
          icon={<GraduationCap className="h-4 w-4" />}
          label="CAPS. PRÓXIMAS"
          value={capsAtencion.length.toString()}
          hint="≤30 días o vencidas"
        />
      </div>

      {/* ── PREPARACIÓN POR SEDE ────────────────────────────────── */}
      <section>
        <h2 className="text-base font-semibold text-foreground mb-3">
          Preparación por sede
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {sedesActivas.map((sede) => {
            const score = scoreSede(personasTodas, cargos, sede.codigo)
            const personalSede = personasTodas.filter(
              (p) => p.sede === sede.codigo
            )
            const equiposSede = equipos.filter((e) => e.sede === sede.codigo)
            const hab = habilitaciones[sede.codigo]
            const auto = autoForSede(autoAll, sede.codigo)
            const checklistItems = computeChecklistEstado(hab, auto)
            const cumplen = checklistItems.filter(
              (i) => i.estado === 'cumple'
            ).length
            const pendientesSede = personalSede.reduce(
              (acc, p) =>
                acc +
                resolveRequisitos(p).filter((r) => r.estado === 'POR_VALIDAR')
                  .length,
              0
            )
            const isActive = sede.codigo === sedeActiva && !vistaCompleta
            return (
              <Card
                key={sede._id}
                className={isActive ? 'ring-1 ring-primary/70' : ''}
              >
                <CardContent className="pt-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-foreground truncate">
                        {sede.ciudad}
                      </div>
                      <div className="text-[0.65rem] text-muted-foreground truncate">
                        {sede.ciudad} · {sede.departamento ?? ''}
                      </div>
                    </div>
                    <Badge variant="outline" className="text-sm font-semibold">
                      {score.label}
                    </Badge>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5">
                    <div
                      className="h-1.5 rounded-full bg-primary transition-all"
                      style={{ width: `${score.valor}%` }}
                    />
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" /> {personalSede.length}
                    </span>
                    <span className="flex items-center gap-1">
                      <Stethoscope className="h-3 w-3" /> {equiposSede.length}
                    </span>
                    <span className="flex items-center gap-1">
                      <ClipboardCheck className="h-3 w-3" /> {cumplen}/34
                    </span>
                  </div>
                  {pendientesSede > 0 && (
                    <div className="text-[0.65rem] text-yellow-400">
                      {pendientesSede} por validar
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      {/* ── PENDIENTES DE VALIDACIÓN ───────────────────────────── */}
      {pendientes.length > 0 && (
        <section>
          <h2 className="text-base font-semibold text-foreground mb-2 flex items-center gap-2">
            <ClipboardCheck className="h-4 w-4 text-yellow-400" />
            Pendientes de validación
          </h2>
          <p className="text-xs text-muted-foreground mb-3">
            {pendientes.length} documento
            {pendientes.length === 1 ? '' : 's'} esperando revisión
          </p>
          <div className="space-y-2">
            {pendientes.slice(0, 5).map((p, i) => {
              const sede = sedes.find((s) => s.codigo === p.persona.sede)
              return (
                <div
                  key={`${p.persona.id}-${p.def.id}-${i}`}
                  className="flex items-center gap-3 rounded-lg border border-yellow-400/20 bg-yellow-400/5 px-4 py-2"
                >
                  <Badge
                    variant="outline"
                    className="bg-yellow-400/20 text-yellow-400 border-yellow-400/40 text-[0.65rem]"
                  >
                    VALIDAR
                  </Badge>
                  <div className="flex-1 min-w-0 text-sm">
                    <strong className="text-foreground">
                      {p.persona.nombre}
                    </strong>{' '}
                    <span className="text-muted-foreground">
                      — {p.def.nombre}
                    </span>
                    <span className="text-[0.65rem] text-muted-foreground ml-2">
                      {sede?.ciudad}
                    </span>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/personal">
                      Ir <ArrowRight className="h-3 w-3 ml-1" />
                    </Link>
                  </Button>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* ── ALERTAS DOCUMENTALES ──────────────────────────────── */}
      {alertasReq.length > 0 && (
        <section>
          <h2 className="text-base font-semibold text-foreground mb-2 flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-red-400" />
            Alertas documentales
          </h2>
          <p className="text-xs text-muted-foreground mb-3">
            {alertasReq.length} requisitos requieren atención
          </p>
          <div className="space-y-2">
            {alertasReq.slice(0, 10).map((a, i) => {
              const sede = sedes.find((s) => s.codigo === a.persona.sede)
              const label =
                a.estado === 'VENCIDO'
                  ? a.fechaVigencia
                    ? `${diasHasta(a.fechaVigencia)}d`
                    : 'VENCIDO'
                  : a.estado === 'POR_VALIDAR'
                    ? 'POR VALIDAR'
                    : 'SIN CARGAR'
              return (
                <div
                  key={`${a.persona.id}-${a.def.id}-${i}`}
                  className="flex items-center gap-3 rounded-lg border border-red-400/20 bg-red-400/5 px-4 py-2"
                >
                  <Badge
                    variant="outline"
                    className="bg-red-400/20 text-red-400 border-red-400/40 text-[0.65rem]"
                  >
                    {label}
                  </Badge>
                  <div className="flex-1 min-w-0 text-sm">
                    <strong className="text-foreground">
                      {a.persona.nombre}
                    </strong>{' '}
                    <span className="text-muted-foreground">
                      — {a.def.nombre}
                    </span>
                    <span className="text-[0.65rem] text-muted-foreground ml-2">
                      {sede?.ciudad}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* ── CAPACITACIONES QUE REQUIEREN ATENCIÓN ──────────── */}
      {capsAtencion.length > 0 && (
        <section>
          <h2 className="text-base font-semibold text-foreground mb-2 flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-yellow-400" />
            Capacitaciones que requieren atención
          </h2>
          <p className="text-xs text-muted-foreground mb-3">
            {capsAtencion.length} próximas o vencidas
          </p>
          <div className="space-y-2">
            {capsAtencion.map((c) => {
              const d = diasHasta(c.fechaObjetivo)
              const label = d < 0 ? `Vencida ${Math.abs(d)}d` : `En ${d}d`
              const tone = d < 0 ? 'red' : 'yellow'
              return (
                <div
                  key={c.id}
                  className={`flex items-center gap-3 rounded-lg border px-4 py-2 ${
                    tone === 'red'
                      ? 'border-red-400/20 bg-red-400/5'
                      : 'border-yellow-400/20 bg-yellow-400/5'
                  }`}
                >
                  <Badge
                    variant="outline"
                    className={
                      tone === 'red'
                        ? 'bg-red-400/20 text-red-400 border-red-400/40 text-[0.65rem]'
                        : 'bg-yellow-400/20 text-yellow-400 border-yellow-400/40 text-[0.65rem]'
                    }
                  >
                    {label}
                  </Badge>
                  <div className="flex-1 min-w-0 text-sm">
                    <strong className="text-foreground">{c.nombre}</strong>
                    <span className="text-[0.65rem] text-muted-foreground ml-2">
                      {c.area} ·{' '}
                      {new Date(c.fechaObjetivo).toLocaleDateString('es-CO')}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {equiposVencidos.length === 0 &&
        equiposProximos.length === 0 &&
        docsVencidos.length === 0 &&
        alertasReq.length === 0 && (
          <div className="flex items-center gap-3 rounded-lg border border-emerald-400/20 bg-emerald-400/5 px-4 py-3">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span className="text-sm text-foreground">
              Sin alertas críticas en este momento
            </span>
          </div>
        )}
    </div>
  )
}

function KpiCard({
  icon,
  label,
  value,
  hint,
  accent,
}: {
  icon: React.ReactNode
  label: string
  value: string
  hint: string
  accent?: boolean
}) {
  return (
    <Card className={accent ? 'border-primary/30' : ''}>
      <CardHeader className="pb-1">
        <CardTitle className="text-[0.65rem] font-medium text-muted-foreground flex items-center gap-1.5 uppercase tracking-wide">
          {icon}
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className={`text-2xl font-bold ${accent ? 'text-primary' : 'text-foreground'}`}
        >
          {value}
        </div>
        <p className="text-[0.65rem] text-muted-foreground mt-0.5">{hint}</p>
      </CardContent>
    </Card>
  )
}
