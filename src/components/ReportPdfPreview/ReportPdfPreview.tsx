import { LuDownload, LuExternalLink, LuPrinter } from 'react-icons/lu'
import type { FormulaContext, FormulaData } from '../AssessmentFormulas/formulaModel'
import type { ReportKind } from '../PdfReportDocument/reportModel'
import { useReportPdfPreview } from './useReportPdfPreview'
import styles from './ReportPdfPreview.module.css'

export default function ReportPdfPreview({ context, data, document, onClose }: { context: FormulaContext; data: FormulaData; document: ReportKind; onClose: () => void }) {
  const { model, url, error, retry, print, printHelp, iframeRef } = useReportPdfPreview(context, data, document)
  return <section className={styles.root} aria-label="Vista previa del PDF">
    <header><p>DOCUMENTO LOCAL · BORRADOR</p><h2>{model.title}</h2><span>{model.patient} · No se guarda en el expediente ni se envía a un servidor.</span></header>
    <div className={styles.actions}>
      {url ? <><a href={url} download={model.fileName}><LuDownload aria-hidden="true" /> Descargar PDF</a><a href={url} target="_blank" rel="noopener noreferrer"><LuExternalLink aria-hidden="true" /> Abrir PDF en otra pestaña</a></> : <button type="button" disabled><LuDownload aria-hidden="true" /> Descargar PDF</button>}
      <button type="button" disabled={!url} onClick={print}><LuPrinter aria-hidden="true" /> Imprimir</button>
    </div>
    {printHelp && <p className={styles.notice} role="status">Si no aparece el diálogo de impresión, abre el PDF en otra pestaña y usa la opción Imprimir de su visor. El comportamiento depende del navegador.</p>}
    {!url && !error && <p className={styles.notice} role="status">Generando PDF localmente…</p>}
    {error && <div className={styles.error} role="alert"><p>No se pudo generar el PDF. Tus datos siguen en el formulario; no se guardó ni envió información.</p><button type="button" onClick={retry}>Reintentar generación</button></div>}
    {url && <><p className={styles.mobileNotice}>En móvil, o si el visor no aparece, abre el PDF en otra pestaña para verlo o imprimirlo. La descarga contiene exactamente el mismo documento.</p><iframe className={styles.viewer} ref={iframeRef} title={`PDF · ${model.title}`} src={url} /></>}
    <details className={styles.textVersion}><summary>Consultar contenido en texto (accesible sin visor PDF)</summary>
      <article><p>BORRADOR · DATOS FICTICIOS · SIN GUARDAR</p><p>{model.patient} · Nacimiento: {model.birthDate} · Referencia: {model.referenceDate}</p>{model.sections.map((section, i) => <section key={i}><h3>{section.title}</h3>{section.paragraphs?.map((paragraph, index) => <p key={index}>{paragraph}</p>)}<dl>{section.rows?.map((row, index) => <div key={index}><dt>{row.label}</dt><dd>{row.value}</dd></div>)}</dl></section>)}</article>
    </details>
    <p className={styles.notice}>El reporte alimentario describe el R24, no una dieta. El PDF de menú diario estará disponible cuando exista su captura independiente.</p>
    <button className={styles.back} type="button" onClick={onClose}>Volver a fórmulas</button>
  </section>
}
