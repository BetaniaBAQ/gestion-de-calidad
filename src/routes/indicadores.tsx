import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { Badge } from '#/components/ui/badge'
import { Card, CardContent } from '#/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '#/components/ui/tabs'
import { useAdherenciaPromedio } from '#/lib/domain/adherencia'
import {
  useDocumentos,
  usePctConSp,
  usePctVigentes,
} from '#/lib/domain/documentos'
import { equipoMantVigente, useEquiposTodos } from '#/lib/domain/equipos'
import {
  autoForSede,
  pctChecklistCumplido,
  useAutoVerificacionPorSede,
  useHabilitacionesAll,
} from '#/lib/domain/habilitacion'
import { useIndicadores } from '#/lib/domain/indicadores'
import {
  useMantenimientosTodos,
  usePctCerradas,
} from '#/lib/domain/mantenimiento'
import {
  usePctConAccion,
  useAlertasSanitarias,
} from '#/lib/domain/medicamentos'
import { useSedesActivas } from '#/lib/domain/config'
import { completitudPersona, usePersonasTodas } from '#/lib/domain/personal'
import { usePqrsStats } from '#/lib/domain/pqrs'
import { CAPACITACIONES_PROGRAMADAS0 } from '#/lib/data'
import type { Indicador } from '#/lib/types'

export const Route = createFileRoute('/indicadores')({
  component: IndicadoresPage,
})

// Marca cada indicador como Normativo / Gestión
const TIPOS: Record<string, 'Normativo' | 'Gestión'> = {
  i_th_caps_ejec: 'Normativo',
  i_th_doc_completa: 'Normativo',
  i_th_caps_norm: 'Normativo',
  i_eq_mant: 'Normativo',
  i_eq_calib: 'Normativo',
  i_eq_hv: 'Gestión',
  i_hab_check: 'Normativo',
  i_doc_vigentes: 'Normativo',
  i_doc_sp: 'Gestión',
  i_pqrs_termino: 'Normativo',
  i_pqrs_tiempo: 'Normativo',
  i_gpc_adh: 'Normativo',
  i_med_alertas: 'Normativo',
  i_mant_cerradas: 'Gestión',
}

const REFERENCIAS: Record<string, string> = {
  i_th_caps_ejec: 'Res. 3100/2019',
  i_th_doc_completa: 'Res. 3100/2019',
  i_th_caps_norm: 'Res. 3100/2019',
  i_eq_mant: 'Inv. 4702',
  i_eq_calib: 'Inv. 4702',
  i_eq_hv: 'Inv. 4702',
  i_hab_check: 'Res. 3100/2019',
  i_doc_vigentes: 'Dec. 780/2016',
  i_pqrs_termino: 'Res. 1552/2013',
  i_pqrs_tiempo: 'Res. 1552/2013',
  i_gpc_adh: 'Res. 256/2016',
  i_med_alertas: 'Dec. 780/2016',
}

function IndicadoresPage() {
  const indicadores = useIndicadores()

  // Valores live
  const personas = usePersonasTodas()
  const equipos = useEquiposTodos()
  const mantenimientos = useMantenimientosTodos()
  const docs = useDocumentos()
  const sedesActivas = useSedesActivas()
  const habs = useHabilitacionesAll()
  const autoAll = useAutoVerificacionPorSede()
  const pctVig = usePctVigentes()
  const pctSp = usePctConSp()
  const pctMant = useMemo(() => {
    if (equipos.length === 0) return 0
    return Math.round(
      (equipos.filter(equipoMantVigente).length / equipos.length) * 100
    )
  }, [equipos])
  const pctHv = useMemo(() => {
    if (equipos.length === 0) return 0
    return Math.round(
      (equipos.filter((e) => e.docs.length > 0).length / equipos.length) * 100
    )
  }, [equipos])
  const pctCerradas = usePctCerradas()
  const pctAccion = usePctConAccion()
  const alertas = useAlertasSanitarias()
  const pqrsStats = usePqrsStats()
  const adhGpc = useAdherenciaPromedio()

  const pctChecklistPromedio = useMemo(() => {
    if (sedesActivas.length === 0) return 0
    const vals = sedesActivas.map((s) =>
      pctChecklistCumplido(habs[s.id], autoForSede(autoAll, s.id))
    )
    return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length)
  }, [sedesActivas, habs, autoAll])

  const pctDocCompleta = useMemo(() => {
    if (personas.length === 0) return 0
    const completas = personas.filter(
      (p) => completitudPersona(p) === 100
    ).length
    return Math.round((completas / personas.length) * 100)
  }, [personas])

  const totalCaps = CAPACITACIONES_PROGRAMADAS0.length
  const capsEjec = CAPACITACIONES_PROGRAMADAS0.filter(
    (c) => c.estado === 'ejecutada'
  ).length
  const pctCapsEjec =
    totalCaps > 0 ? Math.round((capsEjec / totalCaps) * 100) : 0

  const valores: Record<string, string> = {
    i_th_caps_ejec: `${pctCapsEjec}%`,
    i_th_doc_completa: `${pctDocCompleta}%`,
    i_th_caps_norm: `${pctCapsEjec}%`,
    i_eq_mant: `${pctMant}%`,
    i_eq_calib: '0%',
    i_eq_hv: `${pctHv}%`,
    i_hab_check: `${pctChecklistPromedio}%`,
    i_doc_vigentes: `${pctVig}%`,
    i_doc_sp: `${pctSp}%`,
    i_pqrs_termino: `${pqrsStats.pctTermino}%`,
    i_pqrs_tiempo: `${pqrsStats.tiempoPromedio}días`,
    i_gpc_adh: `${adhGpc}%`,
    i_med_alertas: alertas.length === 0 ? 'Sin datos' : `${pctAccion}%`,
    i_mant_cerradas: `${pctCerradas}%`,
  }

  const [filtroModulo, setFiltroModulo] = useState<string>('all')
  const [filtroTipo, setFiltroTipo] = useState<'all' | 'Normativo' | 'Gestión'>(
    'all'
  )

  const modulos = Array.from(new Set(indicadores.map((i) => i.proceso)))

  const filtered = indicadores.filter((i) => {
    if (filtroModulo !== 'all' && i.proceso !== filtroModulo) return false
    if (filtroTipo !== 'all' && TIPOS[i.id] !== filtroTipo) return false
    return true
  })

  const grouped = filtered.reduce<Record<string, Indicador[]>>((acc, i) => {
    const bucket = acc[i.proceso] ?? []
    bucket.push(i)
    acc[i.proceso] = bucket
    return acc
  }, {})

  return (
    <div className="space-y-6">
      <Tabs defaultValue="sistema">
        <TabsList>
          <TabsTrigger value="sistema">Indicadores del sistema</TabsTrigger>
          <TabsTrigger value="clinicos">Indicadores clínicos</TabsTrigger>
          <TabsTrigger value="financieros">Indicadores financieros</TabsTrigger>
          <TabsTrigger value="metas">Metas y umbrales</TabsTrigger>
        </TabsList>

        <TabsContent value="sistema" className="space-y-4">
          <p className="text-xs text-muted-foreground">
            Indicadores calculados automáticamente desde los datos del sistema.
            Se actualizan en tiempo real sin necesidad de registro manual.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs text-muted-foreground">Filtrar por:</span>
            <Select value={filtroModulo} onValueChange={setFiltroModulo}>
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Todos los módulos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los módulos</SelectItem>
                {modulos.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filtroTipo}
              onValueChange={(v) =>
                setFiltroTipo(v as 'all' | 'Normativo' | 'Gestión')
              }
            >
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Normativos y de gestión" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Normativos y de gestión</SelectItem>
                <SelectItem value="Normativo">Solo normativos</SelectItem>
                <SelectItem value="Gestión">Solo gestión interna</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {Object.entries(grouped).map(([modulo, inds]) => (
            <section key={modulo} className="space-y-2">
              <h3 className="text-xs uppercase tracking-wide font-semibold text-muted-foreground">
                {modulo}
              </h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {inds.map((i) => (
                  <Card key={i.id}>
                    <CardContent className="pt-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[0.6rem] uppercase tracking-wide text-muted-foreground">
                          {i.proceso}
                        </span>
                        <Badge variant="outline" className="text-[0.6rem]">
                          {TIPOS[i.id] ?? 'Normativo'}
                        </Badge>
                      </div>
                      <div className="text-2xl font-bold text-foreground">
                        {valores[i.id] ?? '—'}
                      </div>
                      <div className="text-sm text-foreground">{i.nombre}</div>
                      <div className="text-[0.65rem] text-muted-foreground">
                        {i.descripcion}
                      </div>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[0.65rem] text-muted-foreground">
                          Meta: ≥{i.meta}
                          {i.unidad}
                        </span>
                        {REFERENCIAS[i.id] && (
                          <span className="text-[0.65rem] text-muted-foreground">
                            {REFERENCIAS[i.id]}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          ))}
        </TabsContent>

        <TabsContent value="clinicos">
          <Card>
            <CardContent className="pt-6 text-sm text-muted-foreground">
              Indicadores clínicos (infecciones, mortalidad, eventos adversos).
              Detalle en próxima iteración.
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="financieros">
          <Card>
            <CardContent className="pt-6 text-sm text-muted-foreground">
              Indicadores financieros. Detalle en próxima iteración.
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="metas">
          <Card>
            <CardContent className="pt-6 text-sm text-muted-foreground">
              Catálogo de metas y umbrales. Detalle en próxima iteración.
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
