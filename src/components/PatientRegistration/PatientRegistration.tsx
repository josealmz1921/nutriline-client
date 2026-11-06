import { Form } from 'informed'
import { Link } from 'react-router-dom'
import { LuArrowLeft, LuCheck, LuFlaskConical } from 'react-icons/lu'
import PatientFields from '../PatientFields'
import InitialAssessmentFields from '../InitialAssessmentFields'
import AssessmentNavigation from '../AssessmentNavigation'
import Anthropometry from '../Anthropometry'
import Biochemistry from '../Biochemistry'
import DietaryRecall from '../DietaryRecall'
import Habits from '../Habits'
import AssessmentFormulas from '../AssessmentFormulas'
import AssessmentStepActions from '../AssessmentStepActions'
import { assessmentSteps } from './assessmentProgress'
import { assessmentSections } from './assessmentSections'
import Dialog from '../Dialog'
import DevFormTools from '../DevFormTools'
import { usePatientRegistration } from './usePatientRegistration'
import styles from './PatientRegistration.module.css'

const initialValues = { gender: '', nationality: '', nationalitySearch: '' }

export default function PatientRegistration() {
  const { preview, headingRef, today, handleSubmit, closePreview, section, selectSection, panelHeadingRef, selectedSection,
    completed, formApiRef, continuePatient, submitFailed, patientChanged, anthropometryChanged, biochemistryChanged,
    completeAnthropometry, completeBiochemistry, recallChanged, completeRecall,
    habitsChanged, formulasChanged, completeHabits, completeFormulas, formulaContext } = usePatientRegistration()
  return <>
    <Link to="/dashboard/pacientes" className={styles.back}><LuArrowLeft aria-hidden="true" /> Volver a pacientes</Link>
    <header className={styles.heading}><p>UN NUEVO ACOMPAÑAMIENTO</p><h1 ref={headingRef} tabIndex={-1}>Registrar paciente</h1><span>Datos del paciente y evaluación inicial, en un espacio más claro.</span></header>
    <p className={styles.demoNote}><LuFlaskConical aria-hidden="true" /><span>Demostración de seis secciones, sin API ni guardado. Algunos métodos y catálogos siguen pendientes de validación clínica. Usa solo datos y fotografías ficticios.</span></p>
    <div className={styles.layout}>
      <AssessmentNavigation steps={assessmentSteps} completed={completed} current={section} onSelect={selectSection} />
      <section id="assessment-panel" aria-labelledby="assessment-panel-title" className={styles.panel}>
        <header className={styles.panelHeading}><p>DEMOSTRACIÓN · SIN GUARDAR</p><h2 id="assessment-panel-title" ref={panelHeadingRef} tabIndex={-1}>{selectedSection.label}</h2><span>{selectedSection.description}</span></header>
        <div hidden={section !== 'patient'}>
          <Form initialValues={initialValues} formApiRef={formApiRef} onValueChange={patientChanged} onSubmitFailure={submitFailed} onSubmit={handleSubmit} noValidate focusOnInvalid className={styles.form}>
            {import.meta.env.DEV && <DevFormTools profile="patient" />}
            <PatientFields today={today} />
            <InitialAssessmentFields />
            <AssessmentStepActions onContinue={continuePatient} note="Nombre y nacimiento son esenciales. Los campos opcionales deben ser válidos si los capturas. Continuar no guarda ni crea un expediente."><Link to="/dashboard/pacientes" className={styles.cancel}>Cancelar</Link><button type="submit" className={styles.cancel}>Revisar datos</button></AssessmentStepActions>
          </Form>
        </div>
        <div hidden={section !== 'anthropometry'}><Anthropometry onComplete={completeAnthropometry} onBack={() => selectSection('patient')} onValueChange={anthropometryChanged} /></div>
        <div hidden={section !== 'biochemistry'}><Biochemistry onComplete={completeBiochemistry} onBack={() => selectSection('anthropometry')} onValueChange={biochemistryChanged} /></div>
        <div hidden={section !== 'recall'}><DietaryRecall onComplete={completeRecall} onBack={() => selectSection('biochemistry')} onValueChange={recallChanged} /></div>
        {formulaContext.recall.availability && <div hidden={section !== 'habits'}><Habits weight={['notPerformed', 'unavailable'].includes(String(formulaContext.measurements.measurementAvailability)) ? undefined : formulaContext.measurements.weight} onComplete={completeHabits} onBack={() => selectSection('recall')} onValueChange={habitsChanged} /></div>}
        {formulaContext.habits.availability && <div hidden={section !== 'reports'}><AssessmentFormulas context={formulaContext} onComplete={completeFormulas} onBack={() => selectSection('habits')} onValueChange={formulasChanged} /></div>}
        {completed.length === 6 && section === 'reports' && <p role="status" className={styles.demoNote}>Seis secciones revisadas en demostración. No se ha guardado ni enviado información, no se creó un expediente ni una dieta prescrita. Los métodos pendientes de validación siguen sin resultados.</p>}
      </section>
    </div>
    <details className={styles.pending}><summary>Ver alcance original y métodos por validar</summary>{assessmentSections.slice(4).map(step => <section key={step.id} className={styles.inventoryGroup}><h3>{step.label}</h3>{step.groups.map(group => <section key={group.title}><h4>{group.title}</h4><ul>{group.fields.map(field => <li key={field}>{field}</li>)}</ul></section>)}</section>)}</details>
    {preview && <Dialog isOpen onClose={closePreview} ariaLabel="Revisar datos del paciente"><div className={styles.review}>
      <span className={styles.reviewIcon}><LuCheck aria-hidden="true" /></span><h2>Revisa los datos iniciales</h2><p className={styles.reviewNote}>Vista previa únicamente. No se ha guardado ni enviado información. La evaluación completa sigue pendiente.</p>
      <dl><div><dt>Nombre completo</dt><dd>{preview.fullName}</dd></div><div><dt>Fecha de nacimiento</dt><dd><time dateTime={preview.birthDate}>{preview.birthDate}</time></dd></div><div><dt>Género</dt><dd>{preview.gender ?? 'Sin especificar'}</dd></div><div><dt>Nacionalidad</dt><dd>{preview.nationality ?? 'Sin especificar'}</dd></div><div><dt>Ocupación</dt><dd>{preview.occupation ?? 'Sin especificar'}</dd></div><div><dt>Correo electrónico</dt><dd>{preview.email ?? 'Sin especificar'}</dd></div><div><dt>Teléfono</dt><dd>{preview.phone ?? 'Sin especificar'}</dd></div><div><dt>Fotografía</dt><dd>{preview.photoName ?? 'No seleccionada'}</dd></div><div><dt>Motivo de consulta</dt><dd>{preview.reason ?? 'Sin especificar'}</dd></div><div><dt>Signos y síntomas referidos</dt><dd>{preview.symptoms.length ? preview.symptoms.join(', ') : 'No registrados (no confirma ausencia)'}</dd></div></dl>
      <button type="button" onClick={closePreview} className={styles.primary}>Volver al formulario</button><Link to="/dashboard/pacientes" className={styles.returnToList}>Volver al listado sin guardar</Link>
    </div></Dialog>}
  </>
}
