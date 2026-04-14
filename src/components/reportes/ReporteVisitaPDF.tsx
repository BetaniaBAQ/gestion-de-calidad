import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer'

export type ReporteVisitaData = {
  sedeNombre: string
  ciudad: string
  departamento: string
  fechaHoy: string
  servicios: string[]
  scoreGlobal: string
  atencionRequerida: boolean
  kpis: {
    personal: number
    docsValidados: number
    alertasDocs: number
    habilitacion: string
    hallazgosPamec: number
    accPendientes: number
  }
  personas: Array<{
    nombre: string
    cargo: string
    ok: string
    alertas: number
    estado: string
  }>
  alertas: Array<{
    persona: string
    requisito: string
    estado: string
    fechaVigencia?: string | null
  }>
}

const styles = StyleSheet.create({
  page: {
    padding: 32,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#1a1a1a',
  },
  title: {
    fontSize: 9,
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  institutionName: {
    fontSize: 14,
    fontWeight: 700,
    marginBottom: 2,
  },
  sedeName: {
    fontSize: 12,
    fontWeight: 700,
    marginBottom: 2,
  },
  meta: {
    fontSize: 9,
    color: '#666',
    marginBottom: 12,
  },
  servicios: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  servicioPill: {
    backgroundColor: '#eef2ff',
    color: '#312e81',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
    fontSize: 8,
  },
  scoreBlock: {
    backgroundColor: '#fef3c7',
    padding: 8,
    marginBottom: 12,
    borderRadius: 4,
  },
  scoreLabel: {
    fontSize: 9,
    color: '#92400e',
    textTransform: 'uppercase',
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: 700,
    color: '#92400e',
  },
  scoreHint: {
    fontSize: 9,
    color: '#92400e',
    marginTop: 2,
  },
  kpiGrid: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  kpiCard: {
    width: '30%',
    padding: 6,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 3,
    marginBottom: 4,
  },
  kpiCardLabel: {
    fontSize: 8,
    color: '#666',
    textTransform: 'uppercase',
  },
  kpiCardValue: {
    fontSize: 18,
    fontWeight: 700,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 700,
    marginTop: 12,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  table: {
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 3,
    marginBottom: 12,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  tableRowHeader: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  tableCell: {
    padding: 4,
    fontSize: 9,
    flex: 1,
  },
  tableHeadCell: {
    padding: 4,
    fontSize: 8,
    fontWeight: 700,
    flex: 1,
    textTransform: 'uppercase',
  },
  alertItem: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 3,
    padding: 4,
    backgroundColor: '#fef2f2',
    borderRadius: 3,
  },
  alertBadge: {
    fontSize: 8,
    fontWeight: 700,
    color: '#b91c1c',
    width: 60,
  },
  alertText: {
    fontSize: 9,
    flex: 1,
  },
})

export function ReporteVisitaPDF(data: ReporteVisitaData) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>
          Informe interno · Uso exclusivo coordinación de calidad
        </Text>
        <Text style={styles.institutionName}>
          Instituto Oncohematológico Betania
        </Text>
        <Text style={styles.sedeName}>Sede {data.ciudad}</Text>
        <Text style={styles.meta}>
          {data.ciudad}, {data.departamento} · {data.fechaHoy}
        </Text>

        <View style={styles.servicios}>
          {data.servicios.map((s) => (
            <Text key={s} style={styles.servicioPill}>
              {s}
            </Text>
          ))}
        </View>

        <View style={styles.scoreBlock}>
          <Text style={styles.scoreLabel}>Score global</Text>
          <Text style={styles.scoreValue}>{data.scoreGlobal}</Text>
          {data.atencionRequerida && (
            <Text style={styles.scoreHint}>Atención requerida</Text>
          )}
        </View>

        <View style={styles.kpiGrid}>
          <Kpi label="Personal" value={`${data.kpis.personal}`} />
          <Kpi label="Docs validados" value={`${data.kpis.docsValidados}`} />
          <Kpi label="Alertas docs" value={`${data.kpis.alertasDocs}`} />
          <Kpi label="Habilitación" value={data.kpis.habilitacion} />
          <Kpi label="Hallazgos PAMEC" value={`${data.kpis.hallazgosPamec}`} />
          <Kpi label="Acc. pendientes" value={`${data.kpis.accPendientes}`} />
        </View>

        <Text style={styles.sectionTitle}>Personal asistencial</Text>
        <View style={styles.table}>
          <View style={styles.tableRowHeader}>
            <Text style={styles.tableHeadCell}>Nombre</Text>
            <Text style={styles.tableHeadCell}>Cargo</Text>
            <Text style={styles.tableHeadCell}>OK</Text>
            <Text style={styles.tableHeadCell}>Alertas</Text>
            <Text style={styles.tableHeadCell}>Estado</Text>
          </View>
          {data.personas.map((p, i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={styles.tableCell}>{p.nombre}</Text>
              <Text style={styles.tableCell}>{p.cargo}</Text>
              <Text style={styles.tableCell}>{p.ok}</Text>
              <Text style={styles.tableCell}>{p.alertas}</Text>
              <Text style={styles.tableCell}>{p.estado}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Requisitos con alertas</Text>
        {data.alertas.map((a, i) => (
          <View key={i} style={styles.alertItem}>
            <Text style={styles.alertBadge}>{a.estado}</Text>
            <Text style={styles.alertText}>
              {a.persona} · {a.requisito}
              {a.fechaVigencia
                ? ` · Vence ${new Date(a.fechaVigencia).toLocaleDateString('es-CO')}`
                : ''}
            </Text>
          </View>
        ))}
      </Page>
    </Document>
  )
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.kpiCard}>
      <Text style={styles.kpiCardLabel}>{label}</Text>
      <Text style={styles.kpiCardValue}>{value}</Text>
    </View>
  )
}
