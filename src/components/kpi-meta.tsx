import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'

export function KpiMeta({
  modulo,
  valor,
  descripcion,
  meta,
}: {
  modulo: string
  valor: string
  descripcion: string
  meta: string
}) {
  return (
    <Card>
      <CardHeader className="pb-1">
        <CardTitle className="text-[0.65rem] font-medium text-muted-foreground uppercase tracking-wide">
          {modulo}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{valor}</div>
        <p className="text-[0.65rem] text-foreground mt-0.5">{descripcion}</p>
        <p className="text-[0.65rem] text-muted-foreground">Meta: {meta}</p>
      </CardContent>
    </Card>
  )
}
