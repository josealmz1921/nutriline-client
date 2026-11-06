import { Checkbox, Form } from 'informed'
import { Link } from 'react-router-dom'
import Input from '../Input'
import Textarea from '../Textarea'
import DevFormTools from '../DevFormTools'
import AssessmentStepActions from '../AssessmentStepActions'
import { symptoms } from '../PatientRegistration/assessmentSections'
import { validateConsultationTime, validateNotes, validateReason } from '../ConsultationRegistration/consultationValidation'
import { useConsultationInformation, type ConsultationInformationData } from './useConsultationInformation'
import styles from './ConsultationInformation.module.css'

const classes = { input: styles.input, root: styles.field, label: styles.label }
export default function ConsultationInformation({ onComplete, onValueChange, cancelUrl }: { onComplete: (data: ConsultationInformationData) => void; onValueChange: () => void; cancelUrl: string }) {
  const { formApiRef, handleSubmit, continueStep, timeZone } = useConsultationInformation(onComplete)
  return <Form formApiRef={formApiRef} onSubmit={handleSubmit} onValueChange={onValueChange} noValidate focusOnInvalid className={styles.form}>
    {import.meta.env.DEV && <DevFormTools profile="consultation" />}
    <fieldset className={styles.section}><legend>Información de la consulta</legend><p>Los horarios se interpretan en la zona de este dispositivo: {timeZone}. No se copian datos de consultas anteriores.</p><div className={styles.fields}>
      <Input identifier="occurredAt" label="Fecha y hora de consulta" type="datetime-local" min="1000-01-01T00:00" required="Selecciona la fecha y hora de consulta." validate={validateConsultationTime} classes={classes} />
      <Input identifier="measuredAt" label="Fecha y hora de mediciones" type="datetime-local" min="1000-01-01T00:00" required="Selecciona la fecha y hora de mediciones." validate={validateConsultationTime} classes={classes} />
      <div className={styles.fullWidth}><Textarea identifier="reason" label="Motivo de consulta" required="Ingresa el motivo de consulta." validate={validateReason} maxLength={500} classes={classes} /></div>
    </div></fieldset>
    <fieldset className={styles.section}><legend>Signos y síntomas referidos en esta consulta</legend><p>Opcionales. No seleccionar opciones significa no registrados, no ausencia confirmada.</p><div className={styles.symptoms}>{symptoms.map(item => <label key={item.id}><Checkbox name={`symptoms.${item.id}`} /><span>{item.label}</span></label>)}</div></fieldset>
    <fieldset className={styles.section}><legend>Notas del profesional</legend><Textarea identifier="notes" label="Notas (opcional)" validate={validateNotes} maxLength={10000} classes={classes} /></fieldset>
    <AssessmentStepActions onContinue={continueStep} note="Continúa sin guardar. La ficha del paciente se consulta como referencia y no se vuelve a registrar."><Link className={styles.cancel} to={cancelUrl}>Cancelar</Link></AssessmentStepActions>
  </Form>
}
