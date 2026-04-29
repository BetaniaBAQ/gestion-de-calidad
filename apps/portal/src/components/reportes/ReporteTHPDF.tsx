import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer'

export type ReporteTHData = {
  institucion: string
  sedeNombre: string
  fechaHoy: string
  totalPersonal: number
  pctDocCompleta: number
  pctCapsEjec: number
  countPorValidar: number
  countVencidos: number
  personal: Array<{
    nombre: string
    cedula: string
    cargo: string
    sede: string
    completitud: number
    estado: string
  }>
  alertas: Array<{
    persona: string
    requisito: string
    fechaVigencia: string
    diasRestantes: number
    urgencia: string
  }>
  suficiencia: Array<{
    sede: string
    cargo: string
    minimo: number
    actual: number
    deficit: number
  }>
}

const s = StyleSheet.create({
  page: {
    padding: 32,
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: '#1a1a1a',
  },
  header: {
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
    paddingBottom: 12,
  },
  kicker: {
    fontSize: 8,
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: 700,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 10,
    color: '#666',
    marginBottom: 2,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 700,
    marginTop: 16,
    marginBottom: 8,
    color: '#333',
  },
  kpiRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  kpiBox: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    borderRadius: 4,
    padding: 8,
  },
  kpiLabel: {
    fontSize: 7,
    color: '#888',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  kpiValue: {
    fontSize: 16,
    fontWeight: 700,
  },
  table: {
    marginBottom: 12,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f3f3f3',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#eee',
    paddingVertical: 3,
    paddingHorizontal: 6,
  },
  th: {
    fontSize: 7,
    fontWeight: 700,
    color: '#666',
    textTransform: 'uppercase',
  },
  td: {
    fontSize: 8,
  },
  tdBold: {
    fontSize: 8,
    fontWeight: 700,
  },
  badge: {
    fontSize: 7,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
    color: '#fff',
  },
  badgeRojo: { backgroundColor: '#ef4444' },
  badgeAmarillo: { backgroundColor: '#eab308', color: '#1a1a1a' },
  badgeVerde: { backgroundColor: '#22c55e' },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 32,
    right: 32,
    fontSize: 7,
    color: '#aaa',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
})

export function ReporteTHPDF({ data }: { data: ReporteTHData }) {
  return (
    <Document>
      <Page size="LETTER" style={s.page}>
        {/* Header */}
        <View style={s.header}>
          <Text style={s.kicker}>Reporte de Talento Humano</Text>
          <Text style={s.title}>{data.institucion}</Text>
          <Text style={s.subtitle}>
            {data.sedeNombre} — {data.fechaHoy}
          </Text>
        </View>

        {/* KPIs */}
        <View style={s.kpiRow}>
          <View style={s.kpiBox}>
            <Text style={s.kpiLabel}>Personal</Text>
            <Text style={s.kpiValue}>{data.totalPersonal}</Text>
          </View>
          <View style={s.kpiBox}>
            <Text style={s.kpiLabel}>Doc. completa</Text>
            <Text style={s.kpiValue}>{data.pctDocCompleta}%</Text>
          </View>
          <View style={s.kpiBox}>
            <Text style={s.kpiLabel}>Caps. ejecutadas</Text>
            <Text style={s.kpiValue}>{data.pctCapsEjec}%</Text>
          </View>
          <View style={s.kpiBox}>
            <Text style={s.kpiLabel}>Por validar</Text>
            <Text style={s.kpiValue}>{data.countPorValidar}</Text>
          </View>
          <View style={s.kpiBox}>
            <Text style={s.kpiLabel}>Vencidos</Text>
            <Text
              style={[
                s.kpiValue,
                data.countVencidos > 0 && { color: '#ef4444' },
              ]}
            >
              {data.countVencidos}
            </Text>
          </View>
        </View>

        {/* Personal */}
        <Text style={s.sectionTitle}>Personal registrado</Text>
        <View style={s.table}>
          <View style={s.tableHeader}>
            <Text style={[s.th, { flex: 3 }]}>Nombre</Text>
            <Text style={[s.th, { flex: 1 }]}>Cédula</Text>
            <Text style={[s.th, { flex: 2 }]}>Cargo</Text>
            <Text style={[s.th, { flex: 1 }]}>Sede</Text>
            <Text style={[s.th, { flex: 1 }]}>Completitud</Text>
            <Text style={[s.th, { flex: 1 }]}>Estado</Text>
          </View>
          {data.personal.map((p, i) => (
            <View key={i} style={s.tableRow}>
              <Text style={[s.tdBold, { flex: 3 }]}>{p.nombre}</Text>
              <Text style={[s.td, { flex: 1 }]}>{p.cedula}</Text>
              <Text style={[s.td, { flex: 2 }]}>{p.cargo}</Text>
              <Text style={[s.td, { flex: 1 }]}>{p.sede}</Text>
              <Text style={[s.td, { flex: 1 }]}>{p.completitud}%</Text>
              <Text
                style={[
                  s.badge,
                  { flex: 1 },
                  p.estado === 'Crítico'
                    ? s.badgeRojo
                    : p.estado === 'Alerta'
                      ? s.badgeAmarillo
                      : s.badgeVerde,
                ]}
              >
                {p.estado}
              </Text>
            </View>
          ))}
        </View>

        {/* Alertas */}
        {data.alertas.length > 0 && (
          <>
            <Text style={s.sectionTitle}>
              Alertas de vencimiento ({data.alertas.length})
            </Text>
            <View style={s.table}>
              <View style={s.tableHeader}>
                <Text style={[s.th, { flex: 3 }]}>Persona</Text>
                <Text style={[s.th, { flex: 3 }]}>Requisito</Text>
                <Text style={[s.th, { flex: 2 }]}>Vence</Text>
                <Text style={[s.th, { flex: 1 }]}>Días</Text>
              </View>
              {data.alertas.map((a, i) => (
                <View key={i} style={s.tableRow}>
                  <Text style={[s.td, { flex: 3 }]}>{a.persona}</Text>
                  <Text style={[s.td, { flex: 3 }]}>{a.requisito}</Text>
                  <Text style={[s.td, { flex: 2 }]}>{a.fechaVigencia}</Text>
                  <Text
                    style={[
                      s.badge,
                      { flex: 1 },
                      a.diasRestantes < 0
                        ? s.badgeRojo
                        : a.diasRestantes <= 30
                          ? s.badgeAmarillo
                          : s.badgeVerde,
                    ]}
                  >
                    {a.diasRestantes < 0
                      ? `${Math.abs(a.diasRestantes)}d vencido`
                      : `${a.diasRestantes}d`}
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Footer */}
        <View style={s.footer} fixed>
          <Text>Cualia SGC — Talento Humano</Text>
          <Text>Generado: {data.fechaHoy}</Text>
        </View>
      </Page>
    </Document>
  )
}
