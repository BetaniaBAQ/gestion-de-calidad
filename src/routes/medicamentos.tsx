import { createFileRoute } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { KpiMeta } from '#/components/kpi-meta'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '#/components/ui/tabs'
import {
  useAlertasSanitarias,
  usePctConAccion,
} from '#/lib/domain/medicamentos'

export const Route = createFileRoute('/medicamentos')({
  component: MedicamentosPage,
})

function MedicamentosPage() {
  const alertas = useAlertasSanitarias()
  const pctAccion = usePctConAccion()

  return (
    <div className="space-y-6">
      <KpiMeta
        modulo="MEDICAMENTOS Y DM"
        valor={alertas.length === 0 ? '—' : `${pctAccion}%`}
        descripcion="% alertas sanitarias con acción"
        meta="≥100%"
      />

      <Tabs defaultValue="alertas">
        <TabsList>
          <TabsTrigger value="alertas">Alertas sanitarias</TabsTrigger>
          <TabsTrigger value="vigiflow">Reportes Vigiflow</TabsTrigger>
          <TabsTrigger value="temp">Control de temperatura</TabsTrigger>
        </TabsList>

        <TabsContent value="alertas" className="space-y-4">
          <p className="text-xs text-muted-foreground">
            Registro de alertas sanitarias del INVIMA, RAM y eventos
            relacionados con medicamentos y dispositivos médicos. Se debe
            consultar periódicamente el portal INVIMA y registrar aquí las
            alertas relevantes.
          </p>
          <div className="flex justify-end">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" /> Nueva alerta
            </Button>
          </div>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>FECHA</TableHead>
                    <TableHead>TIPO</TableHead>
                    <TableHead>FUENTE</TableHead>
                    <TableHead>DESCRIPCIÓN</TableHead>
                    <TableHead>ACCIÓN</TableHead>
                    <TableHead>SP</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {alertas.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell>
                        {new Date(a.fecha).toLocaleDateString('es-CO')}
                      </TableCell>
                      <TableCell>{a.tipo}</TableCell>
                      <TableCell>{a.fuente}</TableCell>
                      <TableCell className="max-w-md truncate">
                        {a.descripcion}
                      </TableCell>
                      <TableCell>{a.accion ?? '—'}</TableCell>
                      <TableCell>{a.spLink ? 'Sí' : 'Sin'}</TableCell>
                    </TableRow>
                  ))}
                  {alertas.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center text-muted-foreground py-8"
                      >
                        Sin alertas registradas. Consulte regularmente el portal
                        INVIMA.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vigiflow">
          <Card>
            <CardContent className="pt-6 text-sm text-muted-foreground">
              Reportes Vigiflow. Detalle en próxima iteración.
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="temp">
          <Card>
            <CardContent className="pt-6 text-sm text-muted-foreground">
              Control de temperatura de refrigeradores y áreas de
              almacenamiento. Detalle en próxima iteración.
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
