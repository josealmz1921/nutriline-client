import { Link } from 'react-router-dom'
import { LuArrowUpRight, LuArchive, LuCheck } from 'react-icons/lu'
import type { ConsultationEntry } from '../Consultations/consultationDirectory'
import { formatConsultation } from '../ConsultationHistory/formatConsultation'
import styles from './ConsultationDirectory.module.css'

export default function ConsultationDirectory({ entries }: { entries: readonly ConsultationEntry[] }) {
  return <table className={styles.table} role="table" aria-label="Historial general de consultas"><thead role="rowgroup"><tr role="row"><th scope="col" role="columnheader">Paciente</th><th scope="col" role="columnheader">Fecha y hora</th><th scope="col" role="columnheader">Motivo de consulta</th><th scope="col" role="columnheader"><span className={styles.srOnly}>Acciones</span></th></tr></thead><tbody className={styles.body} role="rowgroup">
    {entries.map(({ patient, consultation }) => <tr key={consultation.id} role="row">
      <td role="cell" data-label="Paciente"><Link to={`/dashboard/pacientes/${patient.id}`} className={styles.patient}>{patient.name}</Link><span className={patient.status === 'active' ? styles.active : styles.archived}>{patient.status === 'active' ? <LuCheck aria-hidden="true" /> : <LuArchive aria-hidden="true" />}{patient.status === 'active' ? 'Paciente activo' : 'Paciente archivado'}</span></td>
      <td role="cell" data-label="Fecha y hora"><time dateTime={consultation.occurredAt}>{formatConsultation(consultation.occurredAt)}</time><span className={styles.identifier}>{consultation.id}</span></td>
      <td role="cell" data-label="Motivo">{consultation.reason}</td>
      <td role="cell" className={styles.action}><Link to={`/dashboard/consultas/${consultation.id}`} aria-label={`Ver consulta ${consultation.id} de ${patient.name}`}>Ver consulta <LuArrowUpRight aria-hidden="true" /></Link></td>
    </tr>)}
  </tbody></table>
}
