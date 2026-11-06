import { Link } from 'react-router-dom'
import { LuArrowLeft, LuFlaskConical } from 'react-icons/lu'
import Dialog from '../Dialog'
import AssessmentNavigation from '../AssessmentNavigation'
import ConsultationInformation from '../ConsultationInformation'
import Anthropometry from '../Anthropometry'
import Biochemistry from '../Biochemistry'
import DietaryRecall from '../DietaryRecall'
import Habits from '../Habits'
import AssessmentFormulas from '../AssessmentFormulas'
import AssessmentReport from '../AssessmentReport'
import BiochemistryReview from '../BiochemistryReview'
import { consultationSteps } from '../ConsultationRegistration/consultationSteps'
import { useConsultationWizard } from './useConsultationWizard'
import styles from './ConsultationWizard.module.css'

export default function ConsultationWizard() {
  const { patient, headingRef, panelHeadingRef, timeZone, review, closeReview, section, completed, context, selectSection,
    informationChanged, anthropometryChanged, biochemistryChanged, recallChanged, habitsChanged, formulasChanged,
    completeInformation, completeAnthropometry, completeBiochemistry, completeRecall, completeHabits, completeFormulas } = useConsultationWizard()
  const recordUrl = patient ? `/dashboard/pacientes/${patient.id}` : '/dashboard/pacientes'
  if (!patient || patient.status === 'archived') return <section className={styles.unavailable}>
    <h1 ref={headingRef} tabIndex={-1}>{patient ? 'Paciente archivado' : 'Paciente no encontrado'}</h1>
    <p>{patient ? 'El historial se conserva visible, pero no se pueden crear consultas nuevas.' : 'Este identificador no pertenece al directorio de demostración.'}</p>
    <Link className={styles.back} to={recordUrl}><LuArrowLeft aria-hidden="true" />{patient ? 'Volver al expediente' : 'Volver a pacientes'}</Link>
  </section>
  return <>
    <Link className={styles.back} to={recordUrl}><LuArrowLeft aria-hidden="true" /> Volver al expediente</Link>
    <header className={styles.heading}><p>ACOMPAÑAMIENTO NUTRICIONAL</p><h1 ref={headingRef} tabIndex={-1}>Nueva consulta</h1><span>{patient.name} · {patient.id} · Nacimiento: {patient.birthDate}</span></header>
    <p className={styles.demoNote}><LuFlaskConical aria-hidden="true" /> Seis pasos con datos ficticios. No se enviarán ni se añadirán al historial. La ficha del paciente es de referencia; no se vuelve a registrar.</p>
    <div className={styles.layout}>
      <AssessmentNavigation steps={consultationSteps} completed={completed} current={section} onSelect={selectSection} label="Secciones de la consulta" />
      <section id="assessment-panel" className={styles.panel} aria-labelledby="consultation-panel-title">
        <header className={styles.panelHeading}><p>DEMOSTRACIÓN · SIN GUARDAR</p><h2 id="consultation-panel-title" ref={panelHeadingRef} tabIndex={-1}>{consultationSteps.find(step => step.id === section)?.label}</h2><span>Se conservan tus borradores al volver. Editar una sección confirmada exige revisar de nuevo los pasos siguientes. Salir de esta pantalla descarta la captura.</span></header>
        <div hidden={section !== 'information'}><section aria-label="Ficha de referencia del paciente"><dl className={styles.summary}><div><dt>Correo</dt><dd>{patient.email}</dd></div><div><dt>Teléfono</dt><dd>{patient.phone}</dd></div><div><dt>Ocupación</dt><dd>{patient.occupation || 'Sin registrar'}</dd></div></dl></section><ConsultationInformation cancelUrl={recordUrl} onComplete={completeInformation} onValueChange={informationChanged} /></div>
        <div hidden={section !== 'anthropometry'}><Anthropometry onComplete={completeAnthropometry} onBack={() => selectSection('information')} onValueChange={anthropometryChanged} /></div>
        <div hidden={section !== 'biochemistry'}><Biochemistry onComplete={completeBiochemistry} onBack={() => selectSection('anthropometry')} onValueChange={biochemistryChanged} /></div>
        <div hidden={section !== 'recall'}><DietaryRecall onComplete={completeRecall} onBack={() => selectSection('biochemistry')} onValueChange={recallChanged} /></div>
        {context.recall.availability && <div hidden={section !== 'habits'}><Habits weight={['notPerformed', 'unavailable'].includes(String(context.measurements.measurementAvailability)) ? undefined : context.measurements.weight} onComplete={completeHabits} onBack={() => selectSection('recall')} onValueChange={habitsChanged} /></div>}
        {context.habits.availability && <div hidden={section !== 'reports'}><AssessmentFormulas consultation context={context} onComplete={completeFormulas} onBack={() => selectSection('habits')} onValueChange={formulasChanged} /></div>}
        {completed.length === 6 && <p className={styles.demoNote} role="status">Seis secciones revisadas en demostración. No se creó una consulta ni se modificó el expediente. No equivale a aprobación clínica.</p>}
      </section>
    </div>
    {review && <Dialog isOpen onClose={closeReview} ariaLabel="Revisar consulta"><div className={styles.review}>
      <h2>Revisa la consulta</h2><p className={styles.description}>{patient.name}. Vista previa: no se ha guardado ni enviado información.</p>
      <dl className={styles.summary}><div><dt>Fecha y hora de consulta</dt><dd>{review.info.occurredAt.replace('T', ' ')} ({timeZone})</dd></div><div><dt>Fecha y hora de mediciones declarada</dt><dd>{review.info.measuredAt.replace('T', ' ')} ({timeZone})</dd></div><div><dt>Motivo de consulta</dt><dd>{review.info.reason}</dd></div><div><dt>Signos y síntomas referidos</dt><dd>{review.info.symptoms.join(', ') || 'No registrados (no confirma ausencia)'}</dd></div><div><dt>Notas</dt><dd>{review.info.notes || 'Sin notas registradas.'}</dd></div></dl>
      <AssessmentReport context={review.context} data={review.formulas} document="anthropometry" />
      <BiochemistryReview data={review.biochemistry} />
      <AssessmentReport context={review.context} data={review.formulas} document="diet" />
      <button className={styles.primary} type="button" onClick={closeReview}>Volver al formulario</button><Link className={styles.returnLink} to={recordUrl}>Volver al expediente sin guardar</Link>
    </div></Dialog>}
  </>
}
