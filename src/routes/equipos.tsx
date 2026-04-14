import { createFileRoute } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { KpiMeta } from '#/components/kpi-meta'
import { SedePills } from '#/components/sede-pills'
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
import { equipoMantVigente, useEquipos } from '#/lib/domain/equipos'

export const Route = createFileRoute('/equipos')({
  component: EquiposPage,
})

function EquiposPage() {
  const equipos = useEquipos()
  const sedes = useSedes()

  const mantOk = equipos.filter(equipoMantVigente).length
  const pctMant =
    equipos.length > 0 ? Math.round((mantOk / equipos.length) * 100) : 0
  const conDocs = equipos.filter((e) => e.docs.length > 0).length
  const pctHv =
    equipos.length > 0 ? Math.round((conDocs / equipos.length) * 100) : 0

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-3">
        <KpiMeta
          modulo="DOTACIÓN"
          valor={`${pctMant}%`}
          descripcion="% equipos con mantenimiento vigente"
          meta="≥100%"
        />
        <KpiMeta
          modulo="DOTACIÓN"
          valor="0%"
          descripcion="% equipos con calibración vigente"
          meta="≥100%"
        />
        <KpiMeta
          modulo="DOTACIÓN"
          valor={`${pctHv}%`}
          descripcion="% HV técnicas cargadas en equipos"
          meta="≥100%"
        />
      </div>

      <SedePills />

      <div className="flex justify-end">
        <Button size="sm">
          <Plus className="h-4 w-4 mr-1" /> Agregar equipo
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>EQUIPO</TableHead>
                <TableHead>MARCA / MODELO</TableHead>
                <TableHead>SERIAL</TableHead>
                <TableHead>SEDE</TableHead>
                <TableHead>UBICACIÓN</TableHead>
                <TableHead>PRÓX. MANT.</TableHead>
                <TableHead>CALIBRACIÓN</TableHead>
                <TableHead>DOCS</TableHead>
                <TableHead>ESTADO</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {equipos.map((e) => {
                const vigente = equipoMantVigente(e)
                const sede = sedes.find((s) => s.id === e.sede)
                return (
                  <TableRow key={e.id}>
                    <TableCell className="font-medium">{e.nombre}</TableCell>
                    <TableCell>
                      {e.marca} {e.modelo}
                    </TableCell>
                    <TableCell>{e.serie}</TableCell>
                    <TableCell>{sede?.ciudad ?? e.sede}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {e.area || '—'}
                    </TableCell>
                    <TableCell>
                      {new Date(e.proxMant).toLocaleDateString('es-CO')}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(e.ultimaMant).toLocaleDateString('es-CO')}
                    </TableCell>
                    <TableCell>{e.docs.length}/4</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          vigente
                            ? 'bg-emerald-400/20 text-emerald-400 border-emerald-400/40'
                            : 'bg-red-400/20 text-red-400 border-red-400/40'
                        }
                      >
                        {vigente ? 'Vigente' : 'Vencido'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                )
              })}
              {equipos.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="text-center text-muted-foreground py-8"
                  >
                    Sin equipos en esta sede
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
