import { createFileRoute } from '@tanstack/react-router'
import { Printer } from 'lucide-react'
import { useState } from 'react'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { Card, CardContent } from '#/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'
import { useSedes } from '#/lib/domain/config'
import { useDocumentos } from '#/lib/domain/documentos'
import {
  autoForSede,
  computeChecklistEstado,
  useAutoVerificacionPorSede,
  useHabilitacionesAll,
} from '#/lib/domain/habilitacion'
import { useAcciones, usePamecStats } from '#/lib/domain/pamec'
import {
  estadoCompletitud,
  pendientesValidacion,
  resolveRequisitos,
  useCargos,
  usePersonasTodas,
} from '#/lib/domain/personal'
import { scoreSede } from '#/lib/utils-sgc'

export const Route = createFileRoute('/reportes')({
  component: ReportesPage,
})

function ReportesPage() {
  const sedes = useSedes()
  const [activeSedeId, setActiveSedeId] = useState(
    sedes.find((s) => s.activa)?.codigo ?? 'BAQ'
  )
  const sede = sedes.find((s) => s.codigo === activeSedeId)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {sedes
          .filter((s) => s.activa)
          .map((s) => (
            <Button
              key={s._id}
              size="sm"
              variant={s.codigo === activeSedeId ? 'default' : 'outline'}
              onClick={() => setActiveSedeId(s.codigo)}
            >
              {s.ciudad}
            </Button>
          ))}
        <div className="ml-auto">
          <ExportPdfButton sedeId={activeSedeId} />
        </div>
      </div>

      {sede && <ReporteContent sede={sede} />}
    </div>
  )
}

function ReporteContent({
  sede,
}: {
  sede: ReturnType<typeof useSedes>[number]
}) {
  const personas = usePersonasTodas()
  const cargos = useCargos()
  const personasSede = personas.filter((p) => p.sede === sede.codigo)
  const score = scoreSede(personas, cargos, sede.codigo)
  const docs = useDocumentos()
  const docsValidados = docs.filter((d) => d.estado === 'vigente').length
  const alertasReq = personasSede.flatMap((p) =>
    resolveRequisitos(p).filter((r) =>
      ['VENCIDO', 'CRITICO', 'SIN_CARGAR'].includes(r.estado)
    )
  )
  const habs = useHabilitacionesAll()
  const autoAll = useAutoVerificacionPorSede()
  const items = computeChecklistEstado(
    habs[sede.codigo],
    autoForSede(autoAll, sede.codigo)
  )
  const cumplen = items.filter((i) => i.estado === 'cumple').length
  const pamec = usePamecStats()
  const accPendientes = useAcciones().filter(
    (a) => a.estado === 'pendiente' || a.estado === 'en_proceso'
  ).length

  const fechaHoy = new Intl.DateTimeFormat('es-CO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date())

  return (
    <Card>
      <CardContent className="pt-6 space-y-6">
        <header className="space-y-1">
          <div className="text-[0.65rem] uppercase tracking-wide text-muted-foreground">
            Informe interno · Uso exclusivo coordinación de calidad
          </div>
          <h1 className="text-xl font-semibold text-foreground">
            Instituto Oncohematológico Betania
          </h1>
          <div className="text-base font-semibold text-foreground">
            Sede {sede.ciudad}
          </div>
          <div className="text-xs text-muted-foreground">
            {sede.ciudad}, {sede.departamento ?? ''} · {fechaHoy}
          </div>
        </header>

        <div className="flex flex-wrap gap-1">
          {sede.servicios.map((s) => (
            <Badge key={s} variant="secondary" className="text-[0.6rem]">
              {s}
            </Badge>
          ))}
        </div>

        <div className="rounded-md bg-yellow-400/10 border border-yellow-400/30 p-4">
          <div className="text-[0.65rem] uppercase tracking-wide text-yellow-500">
            Score global
          </div>
          <div className="text-3xl font-bold text-yellow-500">
            {score.label}
          </div>
          <div className="text-[0.65rem] text-yellow-500">
            Atención requerida
          </div>
        </div>

        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
          <Kpi label="Personal" value={personasSede.length.toString()} />
          <Kpi label="Docs validados" value={docsValidados.toString()} />
          <Kpi label="Alertas docs" value={alertasReq.length.toString()} />
          <Kpi label="Habilitación" value={`${cumplen}/34`} />
          <Kpi label="Hallazgos PAMEC" value={pamec.hallazgos.toString()} />
          <Kpi label="Acc. pendientes" value={accPendientes.toString()} />
        </div>

        <section>
          <h2 className="text-xs uppercase tracking-wide font-semibold text-muted-foreground mb-2">
            Personal asistencial
          </h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>NOMBRE</TableHead>
                <TableHead>CARGO</TableHead>
                <TableHead>OK</TableHead>
                <TableHead>ALERTAS</TableHead>
                <TableHead>ESTADO</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {personasSede.map((p) => {
                const reqs = resolveRequisitos(p)
                const ok = reqs.filter((i) => i.estado === 'VIGENTE').length
                const cargo = cargos.find((c) => c.id === p.cargo)
                return (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.nombre}</TableCell>
                    <TableCell>{cargo?.nombre ?? p.cargo}</TableCell>
                    <TableCell>
                      {ok}/{reqs.length}
                    </TableCell>
                    <TableCell>
                      {pendientesValidacion(p) + (reqs.length - ok)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {estadoCompletitud(p)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </section>

        <section>
          <h2 className="text-xs uppercase tracking-wide font-semibold text-muted-foreground mb-2">
            Requisitos con alertas
          </h2>
          <div className="space-y-1">
            {personasSede.flatMap((p) =>
              resolveRequisitos(p)
                .filter((r) =>
                  ['VENCIDO', 'CRITICO', 'SIN_CARGAR', 'POR_VALIDAR'].includes(
                    r.estado
                  )
                )
                .map((r) => (
                  <div
                    key={`${p.id}-${r.def.id}`}
                    className="flex items-center gap-2 rounded-md border border-red-400/20 bg-red-400/5 px-3 py-1.5"
                  >
                    <Badge
                      variant="outline"
                      className="bg-red-400/20 text-red-400 border-red-400/40 text-[0.6rem]"
                    >
                      {r.estado.replace('_', ' ')}
                    </Badge>
                    <span className="text-xs flex-1">
                      <strong>{p.nombre}</strong> · {r.def.nombre}
                      {r.fechaVigencia
                        ? ` · Vence ${new Date(r.fechaVigencia).toLocaleDateString('es-CO')}`
                        : ''}
                    </span>
                  </div>
                ))
            )}
          </div>
        </section>
      </CardContent>
    </Card>
  )
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="pt-4">
        <div className="text-[0.65rem] uppercase tracking-wide text-muted-foreground">
          {label}
        </div>
        <div className="text-xl font-bold text-foreground">{value}</div>
      </CardContent>
    </Card>
  )
}

function ExportPdfButton({ sedeId }: { sedeId: string }) {
  const sedes = useSedes()
  const personas = usePersonasTodas()
  const cargos = useCargos()
  const docs = useDocumentos()
  const habs = useHabilitacionesAll()
  const autoAll = useAutoVerificacionPorSede()
  const pamec = usePamecStats()
  const accPendientes = useAcciones().filter(
    (a) => a.estado === 'pendiente' || a.estado === 'en_proceso'
  ).length

  const handleExport = async () => {
    const sede = sedes.find((s) => s.codigo === sedeId)
    if (!sede) return

    const personasSede = personas.filter((p) => p.sede === sede.codigo)
    const score = scoreSede(personas, cargos, sede.codigo)
    const docsValidados = docs.filter((d) => d.estado === 'vigente').length
    const alertasReq = personasSede.flatMap((p) =>
      resolveRequisitos(p)
        .filter((r) =>
          ['VENCIDO', 'CRITICO', 'SIN_CARGAR', 'POR_VALIDAR'].includes(r.estado)
        )
        .map((r) => ({ persona: p.nombre, ...r }))
    )
    const items = computeChecklistEstado(
      habs[sede.codigo],
      autoForSede(autoAll, sede.codigo)
    )
    const cumplen = items.filter((i) => i.estado === 'cumple').length

    const fechaHoy = new Intl.DateTimeFormat('es-CO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date())

    const personasPdf = personasSede.map((p) => {
      const reqs = resolveRequisitos(p)
      const ok = reqs.filter((r) => r.estado === 'VIGENTE').length
      const cargo = cargos.find((c) => c.id === p.cargo)
      return {
        nombre: p.nombre,
        cargo: cargo?.nombre ?? p.cargo,
        ok: `${ok}/${reqs.length}`,
        alertas: reqs.length - ok,
        estado: estadoCompletitud(p),
      }
    })

    const { pdf } = await import('@react-pdf/renderer')
    const { ReporteVisitaPDF } =
      await import('#/components/reportes/ReporteVisitaPDF')

    const doc = (
      <ReporteVisitaPDF
        sedeNombre={sede.nombre}
        ciudad={sede.ciudad}
        departamento={sede.departamento ?? ''}
        fechaHoy={fechaHoy}
        servicios={sede.servicios}
        scoreGlobal={score.label}
        atencionRequerida={score.valor < 80}
        kpis={{
          personal: personasSede.length,
          docsValidados,
          alertasDocs: alertasReq.length,
          habilitacion: `${cumplen}/34`,
          hallazgosPamec: pamec.hallazgos,
          accPendientes,
        }}
        personas={personasPdf}
        alertas={alertasReq.map((a) => ({
          persona: a.persona,
          requisito: a.def.nombre,
          estado: a.estado,
          fechaVigencia: a.fechaVigencia,
        }))}
      />
    )

    const blob = await pdf(doc).toBlob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `reporte-visita-${sede.codigo}-${new Date().toISOString().slice(0, 10)}.pdf`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Button size="sm" onClick={handleExport}>
      <Printer className="h-4 w-4 mr-1" /> Exportar PDF
    </Button>
  )
}
