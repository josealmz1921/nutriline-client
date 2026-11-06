import { LuClipboardList, LuRuler } from 'react-icons/lu'
import type { ConsultationPreview } from '../PatientRecord/types'
import { formatConsultation } from '../ConsultationHistory/formatConsultation'
import styles from './ConsultationDetail.module.css'

const measurement = (value: string, minimum: number) => Number(value).toLocaleString('en-US', { useGrouping: false, minimumFractionDigits: minimum, maximumFractionDigits: 3 })

export default function ConsultationDetail({ consultation }: { consultation: ConsultationPreview }) {
  return <section id="consultation-detail" aria-labelledby="consultation-detail-title" className={styles.detail}>
    <div className={styles.header}><span><LuClipboardList aria-hidden="true" /> CONSULTA DE DEMOSTRACIÓN</span><h3 id="consultation-detail-title">Detalle de consulta</h3><time dateTime={consultation.occurredAt}>{formatConsultation(consultation.occurredAt)}</time><p>{consultation.id}</p></div>
    <div className={styles.reason}><h4>Motivo de consulta</h4><p>{consultation.reason}</p></div>
    <h4 className={styles.measurementTitle}><LuRuler aria-hidden="true" /> Mediciones</h4>
    <dl className={styles.measurements}>
      <div><dt>Peso</dt><dd>{measurement(consultation.weightKg, 2)} <span>kg</span></dd></div>
      <div><dt>Talla</dt><dd>{measurement(consultation.heightCm, 1)} <span>cm</span></dd></div>
      <div className={styles.bmi}><dt>IMC numérico</dt><dd>{consultation.bmi} <span>kg/m²</span></dd></div>
      <div><dt>Cintura</dt><dd>{consultation.waistCm === null ? <span>No registrada</span> : <>{measurement(consultation.waistCm, 1)} <span>cm</span></>}</dd></div>
      <div><dt>Cadera</dt><dd>{consultation.hipCm === null ? <span>No registrada</span> : <>{measurement(consultation.hipCm, 1)} <span>cm</span></>}</dd></div>
    </dl>
    <p className={styles.bmiNote}>Valor numérico de demostración, sin clasificación clínica.</p>
    <section className={styles.notes} aria-labelledby="consultation-notes-title"><h4 id="consultation-notes-title">Notas del profesional</h4><p>{consultation.notes ?? 'Sin notas registradas.'}</p></section>
  </section>
}
