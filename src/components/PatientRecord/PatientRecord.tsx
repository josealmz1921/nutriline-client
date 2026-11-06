import { Link } from 'react-router-dom'
import { LuArchive, LuArrowLeft, LuCheck, LuClipboardPlus, LuFlaskConical, LuPencil, LuUserRound } from 'react-icons/lu'
import Dialog from '../Dialog'
import ConsultationHistory from '../ConsultationHistory'
import { usePatientRecord } from './usePatientRecord'
import styles from './PatientRecord.module.css'

const dateOnly = new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })

export default function PatientRecord() {
  const { patient, headingRef, pendingMessage, closePending, openEdit, previewArchive, openConsultation } = usePatientRecord()

  if (!patient) return <section className={styles.notFound}>
    <span className={styles.avatar}><LuUserRound aria-hidden="true" /></span>
    <h1 ref={headingRef} tabIndex={-1}>Paciente no encontrado</h1>
    <p>Este identificador no pertenece al directorio de demostración.</p>
    <Link to="/dashboard/pacientes" className={styles.back}><LuArrowLeft aria-hidden="true" /> Volver a pacientes</Link>
  </section>

  return <>
    <div className={styles.topline}><Link to="/dashboard/pacientes" className={styles.back}><LuArrowLeft aria-hidden="true" /> Volver a pacientes</Link><span>Expediente {patient.id}</span></div>
    <p className={styles.demoNote}><LuFlaskConical aria-hidden="true" /> Datos y consultas ficticios. No hay conexión a la API ni cambios guardados.</p>
    <section className={styles.patientHeader} aria-labelledby="patient-name">
      <div className={styles.identity}><span className={styles.avatar} aria-hidden="true">{patient.name.split(' ').slice(0, 2).map(part => part[0]).join('')}</span><div><p className={styles.eyebrow}>EXPEDIENTE DEL PACIENTE</p><h1 ref={headingRef} tabIndex={-1} id="patient-name">{patient.name}</h1><p className={styles.age}>{patient.age} años <span>·</span> Edad de demostración al 05/11/2026</p></div><span className={patient.status === 'active' ? styles.active : styles.archived}>{patient.status === 'active' ? <LuCheck aria-hidden="true" /> : <LuArchive aria-hidden="true" />}{patient.status === 'active' ? 'Activo' : 'Archivado'}</span></div>
      <div className={styles.actions}><button type="button" className={styles.primary} disabled={patient.status === 'archived'} onClick={openConsultation} aria-describedby="consultation-help"><LuClipboardPlus aria-hidden="true" /> Nueva consulta</button><button type="button" className={styles.secondary} onClick={openEdit}><LuPencil aria-hidden="true" /> Editar paciente</button><button type="button" className={styles.archiveAction} onClick={previewArchive}><LuArchive aria-hidden="true" />{patient.status === 'active' ? 'Archivar paciente' : 'Reactivar paciente'}</button></div>
      <p id="consultation-help" className={patient.status === 'archived' ? styles.archivedHelp : styles.actionHelp}>{patient.status === 'archived' ? 'Paciente archivado: el historial se conserva visible, pero no se pueden crear consultas nuevas.' : 'Nueva consulta y edición permiten revisar datos sin guardarlos. Archivar sigue pendiente.'}</p>
    </section>
    <div className={styles.content}>
      <section className={styles.personal} aria-labelledby="personal-title"><h2 id="personal-title"><LuUserRound aria-hidden="true" /> Datos personales</h2><dl><div><dt>Fecha de nacimiento</dt><dd><time dateTime={patient.birthDate}>{dateOnly.format(new Date(`${patient.birthDate}T12:00:00Z`))}</time></dd></div><div><dt>Ocupación</dt><dd>{patient.occupation ?? 'Sin especificar'}</dd></div><div><dt>Correo electrónico</dt><dd>{patient.email || 'Sin especificar'}</dd></div><div><dt>Teléfono</dt><dd>{patient.phone || 'Sin especificar'}</dd></div></dl><p className={styles.personalNote}>La información clínica y las mediciones pertenecen a cada consulta.</p></section>
      <ConsultationHistory key={patient.id} consultations={patient.consultations} />
    </div>
    {pendingMessage && <Dialog isOpen onClose={closePending} ariaLabel="Funcionalidad de próxima etapa"><div className={styles.pending}><p className={styles.eyebrow}>PRÓXIMA ETAPA</p><h2>Estamos preparando esta función</h2><p>{pendingMessage}</p><button type="button" onClick={closePending} className={styles.primary}>Entendido</button></div></Dialog>}
  </>
}
