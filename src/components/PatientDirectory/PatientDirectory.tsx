import { LuArrowUpRight, LuCalendarDays, LuCheck, LuArchive, LuMail, LuPhone } from 'react-icons/lu'
import type { PatientPreview } from '../Patients/types'
import styles from './PatientDirectory.module.css'
import { Link } from 'react-router-dom'

interface Props {
  patients: readonly PatientPreview[]
}

const dateFormat = new Intl.DateTimeFormat('es-MX', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' })

export default function PatientDirectory({ patients }: Props) {
  return <table className={styles.table} role="table" aria-label="Directorio de pacientes">
    <thead className={styles.head} role="rowgroup"><tr role="row">
      <th scope="col" role="columnheader">Paciente</th><th scope="col" role="columnheader">Contacto</th><th scope="col" role="columnheader">Estado</th><th scope="col" role="columnheader">Última consulta</th><th scope="col" role="columnheader"><span className={styles.srOnly}>Acciones</span></th>
    </tr></thead>
    <tbody role="rowgroup" className={styles.body}>
      {patients.map(patient => <tr key={patient.id} role="row" className={styles.row}>
        <th role="rowheader" scope="row" className={styles.patient}>
          <span className={styles.avatar} aria-hidden="true">{patient.name.split(' ').slice(0, 2).map(part => part[0]).join('')}</span>
          <span><strong>{patient.name}</strong><span>{patient.age} años <span aria-hidden="true">·</span> {patient.id}</span></span>
        </th>
        <td role="cell" className={styles.contact}><span><LuMail aria-hidden="true" />{patient.email}</span><span><LuPhone aria-hidden="true" />{patient.phone}</span></td>
        <td role="cell" className={styles.statusCell}><span className={patient.status === 'active' ? styles.active : styles.archived}>
          {patient.status === 'active' ? <LuCheck aria-hidden="true" /> : <LuArchive aria-hidden="true" />}{patient.status === 'active' ? 'Activo' : 'Archivado'}
        </span></td>
        <td role="cell" className={styles.visit}><span className={styles.mobileLabel}>Última consulta</span><span><LuCalendarDays aria-hidden="true" />{patient.lastVisit ? <time dateTime={patient.lastVisit}>{dateFormat.format(new Date(`${patient.lastVisit}T12:00:00Z`))}</time> : 'Sin consultas'}</span></td>
        <td role="cell" className={styles.action}><Link to={`/dashboard/pacientes/${patient.id}`} aria-label={`Ver expediente de ${patient.name}`}>Ver expediente <LuArrowUpRight aria-hidden="true" /></Link></td>
      </tr>)}
    </tbody>
  </table>
}
