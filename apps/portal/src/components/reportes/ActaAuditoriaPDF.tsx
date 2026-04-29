import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer'

export type ActaAuditoriaData = {
  sede: string
  ciudad: string
  auditor: string
  fechaInicio: string
  fechaFin: string
  totalItems: number
  cumple: number
  noCumple: number
  na: number
  pctCumplimiento: number
  items: Array<{
    categoria: string
    descripcion: string
    cumple: 'si' | 'no' | 'na' | ''
    observacion?: string
  }>
  hallazgos: Array<{
    id: string
    descripcion: string
    criterio: string
    accion?: string
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
  meta: {
    fontSize: 9,
    color: '#666',
    marginBottom: 1,
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
    gap: 12,
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
    fontSize: 18,
    fontWeight: 700,
  },
  table: { marginBottom: 12 },
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
  td: { fontSize: 8 },
  badge: {
    fontSize: 7,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
    color: '#fff',
    textAlign: 'center',
  },
  badgeVerde: { backgroundColor: '#22c55e' },
  badgeRojo: { backgroundColor: '#ef4444' },
  badgeGris: { backgroundColor: '#9ca3af' },
  hallazgoBox: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 4,
    padding: 8,
    marginBottom: 6,
  },
  hallazgoId: {
    fontSize: 8,
    fontWeight: 700,
    color: '#b91c1c',
    marginBottom: 2,
  },
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
  signatureLine: {
    marginTop: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 40,
  },
  signatureBox: {
    flex: 1,
    borderTopWidth: 1,
    borderTopColor: '#999',
    paddingTop: 4,
  },
  signatureLabel: {
    fontSize: 8,
    color: '#666',
    textAlign: 'center',
  },
})

export function ActaAuditoriaPDF({ data }: { data: ActaAuditoriaData }) {
  return (
    <Document>
      <Page size="LETTER" style={s.page}>
        <View style={s.header}>
          <Text style={s.kicker}>Acta de Auditoría en Vivo</Text>
          <Text style={s.title}>Instituto Oncohematológico Betania</Text>
          <Text style={s.subtitle}>
            Sede {data.sede} — {data.ciudad}
          </Text>
          <Text style={s.meta}>
            Auditor: {data.auditor} · {data.fechaInicio} a {data.fechaFin}
          </Text>
        </View>

        <View style={s.kpiRow}>
          <View style={s.kpiBox}>
            <Text style={s.kpiLabel}>Cumplimiento</Text>
            <Text
              style={[
                s.kpiValue,
                { color: data.pctCumplimiento >= 80 ? '#22c55e' : '#ef4444' },
              ]}
            >
              {data.pctCumplimiento}%
            </Text>
          </View>
          <View style={s.kpiBox}>
            <Text style={s.kpiLabel}>Cumple</Text>
            <Text style={s.kpiValue}>{data.cumple}</Text>
          </View>
          <View style={s.kpiBox}>
            <Text style={s.kpiLabel}>No cumple</Text>
            <Text
              style={[s.kpiValue, data.noCumple > 0 && { color: '#ef4444' }]}
            >
              {data.noCumple}
            </Text>
          </View>
          <View style={s.kpiBox}>
            <Text style={s.kpiLabel}>N/A</Text>
            <Text style={s.kpiValue}>{data.na}</Text>
          </View>
          <View style={s.kpiBox}>
            <Text style={s.kpiLabel}>Total</Text>
            <Text style={s.kpiValue}>{data.totalItems}</Text>
          </View>
        </View>

        <Text style={s.sectionTitle}>Detalle de ítems evaluados</Text>
        <View style={s.table}>
          <View style={s.tableHeader}>
            <Text style={[s.th, { flex: 1 }]}>Cat.</Text>
            <Text style={[s.th, { flex: 5 }]}>Criterio</Text>
            <Text style={[s.th, { flex: 1 }]}>Resultado</Text>
            <Text style={[s.th, { flex: 3 }]}>Observación</Text>
          </View>
          {data.items.map((item, i) => (
            <View key={i} style={s.tableRow}>
              <Text style={[s.td, { flex: 1 }]}>{item.categoria}</Text>
              <Text style={[s.td, { flex: 5 }]}>{item.descripcion}</Text>
              <Text
                style={[
                  s.badge,
                  { flex: 1 },
                  item.cumple === 'si'
                    ? s.badgeVerde
                    : item.cumple === 'no'
                      ? s.badgeRojo
                      : s.badgeGris,
                ]}
              >
                {item.cumple === 'si'
                  ? 'Cumple'
                  : item.cumple === 'no'
                    ? 'No cumple'
                    : item.cumple === 'na'
                      ? 'N/A'
                      : 'Pend.'}
              </Text>
              <Text style={[s.td, { flex: 3, color: '#666' }]}>
                {item.observacion ?? ''}
              </Text>
            </View>
          ))}
        </View>

        {data.hallazgos.length > 0 && (
          <>
            <Text style={s.sectionTitle}>
              Hallazgos ({data.hallazgos.length})
            </Text>
            {data.hallazgos.map((h) => (
              <View key={h.id} style={s.hallazgoBox}>
                <Text style={s.hallazgoId}>{h.id}</Text>
                <Text style={s.td}>{h.descripcion}</Text>
                <Text style={[s.td, { color: '#666', marginTop: 2 }]}>
                  Criterio: {h.criterio}
                </Text>
                {h.accion && (
                  <Text style={[s.td, { color: '#666', marginTop: 2 }]}>
                    Acción correctiva: {h.accion}
                  </Text>
                )}
              </View>
            ))}
          </>
        )}

        <View style={s.signatureLine}>
          <View style={s.signatureBox}>
            <Text style={s.signatureLabel}>Auditor</Text>
          </View>
          <View style={s.signatureBox}>
            <Text style={s.signatureLabel}>Responsable de sede</Text>
          </View>
        </View>

        <View style={s.footer} fixed>
          <Text>Cualia SGC — Auditoría en vivo</Text>
          <Text>Generado: {data.fechaFin}</Text>
        </View>
      </Page>
    </Document>
  )
}
