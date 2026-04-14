import { createFileRoute } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { KpiMeta } from '#/components/kpi-meta'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { Card, CardContent } from '#/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
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
  useDocumentos,
  usePctConSp,
  usePctVigentes,
} from '#/lib/domain/documentos'
import type { Documento, DocumentoEstado, DocumentoTipo } from '#/lib/types'

export const Route = createFileRoute('/documentos')({
  component: DocumentosPage,
})

const TIPOS_OPTS: Array<{ v: DocumentoTipo | 'all'; label: string }> = [
  { v: 'all', label: 'Todos' },
  { v: 'politica', label: 'Política' },
  { v: 'procedimiento', label: 'Procedimiento' },
  { v: 'protocolo', label: 'Protocolo' },
  { v: 'guia_practica_clinica', label: 'Guía de práctica clínica' },
  { v: 'manual', label: 'Manual' },
  { v: 'formato', label: 'Formato' },
  { v: 'instructivo', label: 'Instructivo' },
  { v: 'plan', label: 'Plan' },
  { v: 'certificado', label: 'Certificado' },
  { v: 'poliza', label: 'Póliza' },
]

const ESTADOS_OPTS: Array<{ v: DocumentoEstado | 'all'; label: string }> = [
  { v: 'all', label: 'Todos' },
  { v: 'vigente', label: 'Vigente' },
  { v: 'en_revision', label: 'En revisión' },
  { v: 'en_aprobacion', label: 'En aprobación' },
  { v: 'obsoleto', label: 'Obsoleto' },
]

const PROCESOS_OPTS = [
  'all',
  'Gestión de calidad',
  'Talento humano',
  'Atención al paciente',
  'Gestión de equipos',
  'Habilitación',
  'Farmacia',
  'Seguridad del paciente',
  'PQR',
  'Gestión financiera',
] as const

function tipoLabel(t: DocumentoTipo): string {
  return TIPOS_OPTS.find((o) => o.v === t)?.label ?? t
}
function estadoLabel(e: DocumentoEstado): string {
  return ESTADOS_OPTS.find((o) => o.v === e)?.label ?? e
}

function DocumentosPage() {
  const docs = useDocumentos()
  const pctVig = usePctVigentes()
  const pctSp = usePctConSp()

  const [tipo, setTipo] = useState<string>('all')
  const [estado, setEstado] = useState<string>('all')
  const [proceso, setProceso] = useState<string>('all')

  const filtered = docs.filter((d) => {
    if (tipo !== 'all' && d.tipo !== tipo) return false
    if (estado !== 'all' && d.estado !== estado) return false
    if (proceso !== 'all' && d.proceso !== proceso) return false
    return true
  })

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2">
        <KpiMeta
          modulo="GESTIÓN DOCUMENTAL"
          valor={`${pctVig}%`}
          descripcion="% documentos vigentes"
          meta="≥100%"
        />
        <KpiMeta
          modulo="GESTIÓN DOCUMENTAL"
          valor={`${pctSp}%`}
          descripcion="% documentos con SP cargado"
          meta="≥100%"
        />
      </div>

      <Tabs defaultValue="documentos">
        <TabsList>
          <TabsTrigger value="documentos">Documentos</TabsTrigger>
          <TabsTrigger value="control">Control de cambios</TabsTrigger>
        </TabsList>

        <TabsContent value="documentos" className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Select value={tipo} onValueChange={setTipo}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                {TIPOS_OPTS.map((o) => (
                  <SelectItem key={o.v} value={o.v}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={estado} onValueChange={setEstado}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                {ESTADOS_OPTS.map((o) => (
                  <SelectItem key={o.v} value={o.v}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={proceso} onValueChange={setProceso}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Proceso" />
              </SelectTrigger>
              <SelectContent>
                {PROCESOS_OPTS.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p === 'all' ? 'Todos' : p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="ml-auto">
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" /> Nuevo documento
              </Button>
            </div>
          </div>

          <DocumentosTable documentos={filtered} />
        </TabsContent>

        <TabsContent value="control">
          <Card>
            <CardContent className="pt-6 text-sm text-muted-foreground">
              Historial de cambios y versiones. Detalle en próxima iteración.
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function DocumentosTable({ documentos }: { documentos: Documento[] }) {
  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>CÓDIGO</TableHead>
              <TableHead>DOCUMENTO</TableHead>
              <TableHead>TIPO</TableHead>
              <TableHead>PROCESO</TableHead>
              <TableHead>VERSIÓN</TableHead>
              <TableHead>EMISIÓN</TableHead>
              <TableHead>VENCIMIENTO</TableHead>
              <TableHead>ESTADO</TableHead>
              <TableHead>SP</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documentos.map((d) => (
              <TableRow key={d.id}>
                <TableCell className="font-mono text-xs">{d.codigo}</TableCell>
                <TableCell className="font-medium">{d.nombre}</TableCell>
                <TableCell>{tipoLabel(d.tipo)}</TableCell>
                <TableCell className="text-muted-foreground">
                  {d.proceso}
                </TableCell>
                <TableCell>{d.version}</TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(d.fechaElaboracion).toLocaleDateString('es-CO')}
                </TableCell>
                <TableCell>
                  {new Date(d.fechaVigencia).toLocaleDateString('es-CO')}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{estadoLabel(d.estado)}</Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {d.spLink ? 'Sí' : 'Sin'}
                </TableCell>
              </TableRow>
            ))}
            {documentos.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="text-center text-muted-foreground py-8"
                >
                  Sin documentos con los filtros aplicados
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
