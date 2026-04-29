import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

export type TendenciaPoint = {
  periodo: string
  valor: number
  meta: number
}

export function TendenciaChart({
  data,
  meta,
  unidad,
}: {
  data: TendenciaPoint[]
  meta: number
  unidad: string
}) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">
        Sin mediciones registradas
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis
          dataKey="periodo"
          tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
          tickLine={false}
          axisLine={{ stroke: 'hsl(var(--border))' }}
        />
        <YAxis
          tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
          tickLine={false}
          axisLine={false}
          unit={unidad === '%' ? '%' : ''}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: 8,
            fontSize: 12,
          }}
          formatter={(value: number) => [
            `${value}${unidad === '%' ? '%' : ` ${unidad}`}`,
            'Valor',
          ]}
        />
        <ReferenceLine
          y={meta}
          stroke="hsl(var(--primary))"
          strokeDasharray="6 3"
          strokeWidth={1.5}
          label={{
            value: `Meta: ${meta}${unidad === '%' ? '%' : ''}`,
            position: 'right',
            fontSize: 10,
            fill: 'hsl(var(--primary))',
          }}
        />
        <Line
          type="monotone"
          dataKey="valor"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          dot={{ r: 4, fill: 'hsl(var(--primary))' }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
