import { Link } from 'react-router-dom'
import { LuArrowLeft, LuArrowUpRight, LuFlaskConical } from 'react-icons/lu'
import ConsultationDetail from '../ConsultationDetail'
import { useConsultationRecord } from './useConsultationRecord'
import styles from './ConsultationRecord.module.css'

export default function ConsultationRecord() {
  const { entry, headingRef } = useConsultationRecord()
  if (!entry) return <section className={styles.notFound}><h1 ref={headingRef} tabIndex={-1}>Consulta no encontrada</h1><p>Este identificador no pertenece al historial de demostración.</p><Link to="/dashboard/consultas" className={styles.back}><LuArrowLeft aria-hidden="true" /> Volver a consultas</Link></section>
  const { patient, consultation } = entry
  return <div className={styles.container}>
    <Link to="/dashboard/consultas" className={styles.back}><LuArrowLeft aria-hidden="true" /> Volver a consultas</Link>
    <header className={styles.heading}><p>HISTORIAL CLÍNICO</p><h1 ref={headingRef} tabIndex={-1}>Consulta {consultation.id}</h1><span>{patient.name}</span></header>
    <p className={styles.demoNote}><LuFlaskConical aria-hidden="true" /> Consulta ficticia de solo lectura. Horarios de Ciudad de México.</p>
    <section className={styles.patient} aria-label="Paciente de la consulta"><div><strong>{patient.name}</strong><span>{patient.id} · {patient.status === 'active' ? 'Paciente activo' : 'Paciente archivado'}</span></div><Link to={`/dashboard/pacientes/${patient.id}`}>Ver expediente <LuArrowUpRight aria-hidden="true" /></Link></section>
    {patient.status === 'archived' && <p className={styles.archived}>El paciente está archivado. Su historial permanece disponible, pero no admite consultas nuevas.</p>}
    <ConsultationDetail consultation={consultation} />
  </div>
}
