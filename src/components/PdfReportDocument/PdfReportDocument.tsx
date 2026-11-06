import { Circle, Document, Line, Page, Rect, Svg, Text, View } from '@react-pdf/renderer'
import type { ReportModel, ReportSection } from './reportModel'
import { styles } from './pdfReportStyles'

const renderRow = (row: NonNullable<ReportSection['rows']>[number], index: number) => <View key={index} wrap={row.value.length + row.label.length > 500} style={styles.row}><Text style={styles.label}>{row.label}</Text><Text style={styles.value}>{row.value}</Text></View>

export default function PdfReportDocument({ model }: { model: ReportModel }) {
  const extent = model.point ? Math.max(5, Math.ceil(Math.max(Math.abs(model.point.x), Math.abs(model.point.y)) / 5) * 5) : 5
  const x = model.point ? 125 + model.point.x / extent * 95 : null
  const y = model.point ? 125 - model.point.y / extent * 95 : null
  return <Document title={model.title} author="Nutriline · Demostración" subject="Borrador con datos ficticios, sin guardar ni aprobación clínica" language="es-MX">
    <Page size="A4" style={styles.page} wrap>
      <View fixed style={styles.header}><Text style={styles.brand}>nutriline</Text><Text style={styles.headerNote}>ESPACIO DE NUTRICIÓN{'\n'}Profesional: sin configurar · Sin firma ni cédula</Text></View>
      <Text style={styles.title}>{model.title}</Text>
      <Text style={styles.warning}>BORRADOR · DATOS FICTICIOS · SIN GUARDAR{ '\n' }No es un documento clínico validado, una dieta prescrita ni una aprobación profesional.</Text>
      <View style={styles.identity}><Text style={styles.patient}>{model.patient}</Text><Text style={styles.muted}>Nacimiento: {model.birthDate} · Referencia de fórmulas: {model.referenceDate}</Text></View>
      {model.sections.map((section, index) => {
        const first = section.rows?.[0]
        const keepFirst = first && first.value.length + first.label.length <= 500
        return <View key={`${index}-${section.title}`}>
          <View wrap={false}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.paragraphs?.map((paragraph, i) => <Text key={i} style={styles.paragraph}>{paragraph}</Text>)}
            {keepFirst && renderRow(first, 0)}
          </View>
          {(keepFirst ? section.rows?.slice(1) : section.rows)?.map(renderRow)}
        </View>
      })}
      {model.kind !== 'diet' && <View wrap={false}>
        <Text style={styles.sectionTitle}>Somatotipo · Proyección Heath–Carter</Text>
        {model.point && x !== null && y !== null ? <><Svg viewBox="0 0 250 250" style={styles.chart}>
          <Rect x="30" y="30" width="190" height="190" fill="#f3f6ef" stroke="#c2cfbc" strokeWidth="1" />
          <Line x1="30" y1="125" x2="220" y2="125" stroke="#8c9f85" strokeWidth="1" />
          <Line x1="125" y1="30" x2="125" y2="220" stroke="#8c9f85" strokeWidth="1" />
          <Text style={styles.chartLabel} x="125" y="17" textAnchor="middle" fill="#42633e">Y · Mesomorfia</Text><Text style={styles.chartLabel} x="125" y="244" textAnchor="middle" fill="#42633e">X · Ectomorfia - Endomorfia</Text>
          <Text style={styles.chartLabel} x="30" y="139" fill="#637468">-{extent}</Text><Text style={styles.chartLabel} x="208" y="139" fill="#637468">{extent}</Text>
          <Text style={styles.chartLabel} x="132" y="37" fill="#637468">{extent}</Text><Text style={styles.chartLabel} x="132" y="218" fill="#637468">-{extent}</Text>
          <Circle cx={x} cy={y} r="4" fill="#316342" />
        </Svg><Text style={styles.paragraph}>X: {model.point.x.toFixed(2)} · Y: {model.point.y.toFixed(2)}. Escala igual en ambos ejes: ±{extent}. Sin zonas de interpretación ni metas.</Text></> : <Text style={styles.paragraph}>Sin punto calculable: faltan datos válidos para las tres componentes. No se dibuja un punto ficticio en el origen.</Text>}
      </View>}
      <View fixed style={styles.footer}><Text>BORRADOR · Sin guardar · Uso de demostración</Text></View>
      <Text fixed style={styles.pageCounter} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
    </Page>
  </Document>
}
