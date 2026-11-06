import { LuArrowDownWideNarrow, LuArrowLeft, LuArrowRight, LuCalendarDays, LuClipboardList } from 'react-icons/lu'
import ConsultationDetail from '../ConsultationDetail'
import type { ConsultationPreview } from '../PatientRecord/types'
import { formatConsultation } from './formatConsultation'
import { useConsultationHistory } from './useConsultationHistory'
import styles from './ConsultationHistory.module.css'

export default function ConsultationHistory({ consultations }: { consultations: readonly ConsultationPreview[] }) {
  const { visible, selected, currentPage, pageCount, total, from, to, selectConsultation, previousPage, nextPage } = useConsultationHistory(consultations)
  return <section className={styles.history} aria-labelledby="history-title">
    <header className={styles.heading}><h2 id="history-title">Historial de consultas <span>{total}</span></h2><span><LuArrowDownWideNarrow aria-hidden="true" /> Más recientes</span></header>
    <p className={styles.timezone}>Horarios de Ciudad de México · Datos de demostración</p>
    {total === 0 ? <div className={styles.empty} role="status"><span><LuClipboardList aria-hidden="true" /></span><h3>Aún no hay consultas</h3><p>El historial aparecerá aquí cuando se registren consultas para este paciente.</p></div> : <>
      <ol className={styles.list} aria-label="Consultas del paciente">
        {visible.map(consultation => <li key={consultation.id}><button type="button" aria-pressed={selected?.id === consultation.id} aria-controls="consultation-detail" onClick={() => selectConsultation(consultation.id)} aria-label={`Ver consulta: ${formatConsultation(consultation.occurredAt)}, ${consultation.id}`}>
          <span className={styles.calendar}><LuCalendarDays aria-hidden="true" /></span><span className={styles.summary}><time dateTime={consultation.occurredAt}>{formatConsultation(consultation.occurredAt)}</time><strong>{consultation.reason}</strong><span>{consultation.id}</span></span><LuArrowRight aria-hidden="true" className={styles.arrow} />
        </button></li>)}
      </ol>
      <div className={styles.pagination}><p>{from}–{to} de {total} consultas</p><nav aria-label="Paginación de consultas"><button type="button" onClick={previousPage} disabled={currentPage === 1} aria-label="Consultas anteriores"><LuArrowLeft aria-hidden="true" /></button><span>Página {currentPage} de {pageCount}</span><button type="button" onClick={nextPage} disabled={currentPage === pageCount} aria-label="Consultas siguientes"><LuArrowRight aria-hidden="true" /></button></nav></div>
      {selected && <ConsultationDetail consultation={selected} />}
    </>}
  </section>
}
