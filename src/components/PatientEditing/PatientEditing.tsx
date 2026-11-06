import { Form } from 'informed'
import { Link } from 'react-router-dom'
import { LuArrowLeft, LuArrowRight, LuFlaskConical, LuPencil } from 'react-icons/lu'
import PatientFields from '../PatientFields'
import Dialog from '../Dialog'
import { usePatientEditing } from './usePatientEditing'
import { editableFields } from './patientEditingValues'
import styles from './PatientEditing.module.css'

export default function PatientEditing() {
  const { patient, headingRef, initialValues, today, handleSubmit, review, closeReview, unchanged, clearUnchanged } = usePatientEditing()
  if (!patient || !initialValues) return <section className={styles.notFound}><h1 ref={headingRef} tabIndex={-1}>Paciente no encontrado</h1><p>Este identificador no pertenece al directorio de demostración.</p><Link className={styles.back} to="/dashboard/pacientes"><LuArrowLeft aria-hidden="true" /> Volver a pacientes</Link></section>
  const recordUrl = `/dashboard/pacientes/${patient.id}`
  return <>
    <Link className={styles.back} to={recordUrl}><LuArrowLeft aria-hidden="true" /> Volver al expediente</Link>
    <header className={styles.heading}><p>DATOS DEL PACIENTE</p><h1 ref={headingRef} tabIndex={-1}>Editar paciente</h1><span>{patient.name} · {patient.id}</span></header>
    <p className={styles.demoNote}><LuFlaskConical aria-hidden="true" /> Vista de demostración. Usa datos ficticios: los cambios no se enviarán ni se guardarán.</p>
    {patient.status === 'archived' && <p className={styles.notice}>Este paciente está archivado. Revisar sus datos no lo reactiva ni habilita nuevas consultas.</p>}
    <div className={styles.layout}>
      <Form key={patient.id} initialValues={{ ...initialValues }} onSubmit={handleSubmit} onValueChange={clearUnchanged} noValidate focusOnInvalid className={styles.form}>
        <PatientFields today={today} />
        <div className={styles.actions}>
          {unchanged && <p role="status">No hay cambios para revisar. Modifica al menos un dato del paciente.</p>}
          <p>Las consultas, mediciones y el estado del paciente no se modifican aquí.</p>
          <div><Link className={styles.cancel} to={recordUrl}>Cancelar</Link><button type="submit" className={styles.primary}>Revisar cambios <LuArrowRight aria-hidden="true" /></button></div>
        </div>
      </Form>
      <aside className={styles.guide}><LuPencil aria-hidden="true" /><h2>Revisa antes de continuar</h2><p>Los campos están precargados con los datos ficticios del expediente.</p><p>Puedes dejar vacíos el correo, teléfono y ocupación para proponer que queden sin especificar.</p><p>Al revisar verás el valor actual y el propuesto. Volver al formulario conserva lo escrito; salir descarta los cambios.</p></aside>
    </div>
    {review && <Dialog isOpen onClose={closeReview} ariaLabel="Revisar cambios del paciente"><div className={styles.review}>
      <h2>Revisa los cambios</h2><p>Vista previa únicamente. No se ha guardado ni enviado información.</p>
      <dl>{editableFields.map(({ key, label }) => <div key={key} className={review[key] !== initialValues[key] ? styles.changed : styles.unchanged}>
        <dt>{label}{review[key] !== initialValues[key] && <span>Cambio propuesto</span>}</dt>
        <dd><span>Actual</span>{initialValues[key] ?? 'Sin especificar'}</dd>
        <dd><span>Propuesto</span>{review[key] ?? 'Sin especificar'}</dd>
      </div>)}</dl>
      <button className={styles.primary} type="button" onClick={closeReview}>Volver al formulario</button><Link className={styles.returnLink} to={recordUrl}>Volver al expediente sin guardar</Link>
    </div></Dialog>}
  </>
}
