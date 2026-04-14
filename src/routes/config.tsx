import { createFileRoute } from '@tanstack/react-router'
import { ArrowRight, Plus } from 'lucide-react'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '#/components/ui/tabs'
import { HABILITACION_CATALOGO } from '#/lib/data-catalogs'
import { useSedes } from '#/lib/domain/config'
import { useCargos } from '#/lib/domain/personal'

export const Route = createFileRoute('/config')({
  component: ConfigPage,
})

function ConfigPage() {
  return (
    <Tabs defaultValue="sedes" className="space-y-4">
      <TabsList>
        <TabsTrigger value="sedes">Sedes y servicios</TabsTrigger>
        <TabsTrigger value="cargos">Cargos y requisitos</TabsTrigger>
        <TabsTrigger value="servicios">Catálogo de servicios</TabsTrigger>
        <TabsTrigger value="usuarios">Usuarios y roles</TabsTrigger>
        <TabsTrigger value="metas">Indicadores (metas)</TabsTrigger>
        <TabsTrigger value="items-hab">Ítems Habilitación</TabsTrigger>
      </TabsList>

      <TabsContent value="sedes" className="space-y-4">
        <SedesTab />
      </TabsContent>
      <TabsContent value="cargos" className="space-y-4">
        <CargosTab />
      </TabsContent>
      <TabsContent value="servicios">
        <Placeholder text="Catálogo de servicios habilitables. Detalle en próxima iteración." />
      </TabsContent>
      <TabsContent value="usuarios">
        <Placeholder text="Usuarios y roles. Detalle en próxima iteración." />
      </TabsContent>
      <TabsContent value="metas">
        <Placeholder text="Metas de indicadores. Detalle en próxima iteración." />
      </TabsContent>
      <TabsContent value="items-hab" className="space-y-4">
        <ItemsHabilitacionTab />
      </TabsContent>
    </Tabs>
  )
}

function SedesTab() {
  const sedes = useSedes()
  return (
    <>
      <div className="flex justify-end">
        <Button size="sm">
          <Plus className="h-4 w-4 mr-1" /> Nueva sede
        </Button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {sedes.map((sede) => (
          <Card key={sede.id}>
            <CardContent className="pt-4 space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-foreground truncate">
                    {sede.ciudad}
                  </div>
                  <div className="text-[0.65rem] text-muted-foreground">
                    · {sede.ciudad}
                    {sede.departamento ? `, ${sede.departamento}` : ''}
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={
                    sede.activa
                      ? 'bg-emerald-400/20 text-emerald-400 border-emerald-400/40'
                      : ''
                  }
                >
                  {sede.activa ? 'Activa' : 'Inactiva'}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-1">
                {(sede.servicios ?? []).map((s) => (
                  <Badge key={s} variant="secondary" className="text-[0.6rem]">
                    {s}
                  </Badge>
                ))}
              </div>
              <div className="text-[0.65rem] text-muted-foreground">
                {sede.direccion}
              </div>
              <div className="flex justify-end">
                <Button variant="ghost" size="sm">
                  Editar <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  )
}

function CargosTab() {
  const cargos = useCargos()
  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>CARGO</TableHead>
              <TableHead>ÁREA</TableHead>
              <TableHead>PERFIL</TableHead>
              <TableHead>REQUISITOS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cargos.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.nombre}</TableCell>
                <TableCell>{c.area}</TableCell>
                <TableCell className="text-muted-foreground max-w-md truncate">
                  {c.perfil}
                </TableCell>
                <TableCell>
                  {c.docRequeridos.length + c.capRequeridas.length}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

function ItemsHabilitacionTab() {
  const categorias = {
    rh: 'Recurso Humano',
    infra: 'Infraestructura',
    dotacion: 'Dotación',
    procesos: 'Procesos',
    reps: 'Habilitación REPS',
  } as const
  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        Catálogo normativo (solo lectura). Actualizaciones por norma se reflejan
        desde el código fuente.
      </p>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>CATEGORÍA</TableHead>
                <TableHead>DESCRIPCIÓN</TableHead>
                <TableHead>NORMA</TableHead>
                <TableHead>AUTO</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {HABILITACION_CATALOGO.map((i) => (
                <TableRow key={i.id}>
                  <TableCell className="text-xs uppercase">
                    {categorias[i.categoria]}
                  </TableCell>
                  <TableCell>{i.descripcion}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {i.norma}
                  </TableCell>
                  <TableCell>
                    {i.auto ? (
                      <Badge variant="outline">Auto</Badge>
                    ) : (
                      <span className="text-muted-foreground">Manual</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

function Placeholder({ text }: { text: string }) {
  return (
    <Card>
      <CardContent className="pt-6 text-sm text-muted-foreground">
        {text}
      </CardContent>
    </Card>
  )
}
