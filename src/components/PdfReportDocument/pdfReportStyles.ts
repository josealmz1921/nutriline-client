import { Font, StyleSheet } from '@react-pdf/renderer'
import regular from '@fontsource/plus-jakarta-sans/files/plus-jakarta-sans-latin-400-normal.woff?url'
import semibold from '@fontsource/plus-jakarta-sans/files/plus-jakarta-sans-latin-600-normal.woff?url'

// React PDF no interpreta CSS Modules: sus estilos de documento se definen aquí,
// separados del JSX. Las fuentes se sirven localmente, sin servicios externos.
Font.register({ family: 'Jakarta', fonts: [{ src: regular, fontWeight: 400 }, { src: semibold, fontWeight: 600 }] })
export const styles = StyleSheet.create({
  page: { fontFamily: 'Jakarta', fontSize: 9, lineHeight: 1.6, color: '#304e39', paddingTop: 85, paddingBottom: 65, paddingHorizontal: 42 },
  header: { position: 'absolute', top: 25, left: 42, right: 42, borderBottomWidth: 1, borderBottomColor: '#dbe5d7', paddingBottom: 10, flexDirection: 'row', justifyContent: 'space-between' },
  brand: { fontSize: 18, fontWeight: 600, color: '#316342' },
  headerNote: { fontSize: 7, color: '#637468', textAlign: 'right', maxWidth: 250 },
  title: { fontSize: 23, fontWeight: 600, lineHeight: 1.25, marginBottom: 10 },
  warning: { padding: 10, backgroundColor: '#edf3e8', color: '#42633e', fontSize: 8, marginBottom: 14 },
  identity: { marginBottom: 18, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#dbe5d7' },
  patient: { fontSize: 12, fontWeight: 600, marginBottom: 3 },
  muted: { fontSize: 8, color: '#637468' },
  sectionTitle: { fontSize: 12, fontWeight: 600, marginTop: 16, marginBottom: 8, paddingBottom: 5, borderBottomWidth: 1, borderBottomColor: '#dbe5d7' },
  paragraph: { marginBottom: 7, fontSize: 8, color: '#526958' },
  row: { flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: '#edf1e9', paddingVertical: 7 },
  label: { width: '37%', paddingRight: 12, fontSize: 8, fontWeight: 600 },
  value: { width: '63%', fontSize: 8 },
  // Coordenadas A4 explícitas: evitan posiciones fuera de página al recalcular
  // nodos dinámicos/fijos durante la paginación de React PDF.
  footer: { position: 'absolute', top: 790, height: 26, left: 42, right: 42, borderTopWidth: 1, borderTopColor: '#dbe5d7', paddingTop: 8, fontSize: 7, color: '#637468', flexDirection: 'row', justifyContent: 'space-between' },
  pageCounter: { position: 'absolute', top: 799, left: 42, right: 42, fontFamily: 'Jakarta', fontSize: 7, color: '#637468', textAlign: 'right' },
  chart: { width: 250, height: 250, alignSelf: 'center', marginVertical: 12 },
  chartLabel: { fontFamily: 'Jakarta', fontSize: 8 },
})
