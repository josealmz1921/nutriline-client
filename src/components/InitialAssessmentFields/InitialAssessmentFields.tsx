import { Checkbox } from 'informed'
import { LuCalendarDays, LuImage, LuUserRound } from 'react-icons/lu'
import Input from '../Input'
import InputFile from '../InputFile'
import Select from '../Select'
import Textarea from '../Textarea'
import { symptoms } from '../PatientRegistration/assessmentSections'
import { validateInitialReason, validatePhoto } from './initialAssessmentValidation'
import { useInitialAssessmentFields } from './useInitialAssessmentFields'
import styles from './InitialAssessmentFields.module.css'

const inputClasses = { root: styles.field, label: styles.label, input: styles.input }
const selectClasses = { input: styles.select, standard: styles.label }
const genderOptions = [{ value: '', label: 'Sin especificar' }, { value: 'Hombre', label: 'Hombre' }, { value: 'Mujer', label: 'Mujer' }]

export default function InitialAssessmentFields() {
  const { photo, showPhoto, photoFailed, onPhotoError, nationalityOptions, nationalityMatches } = useInitialAssessmentFields()
  return <>
    <fieldset className={styles.section}><legend>Identidad complementaria</legend><p className={styles.description}>Campos del registro original. No se asignan valores por defecto ni se deducen variables para cálculos.</p>
      <div className={styles.photoRow}><span className={styles.photo}>{showPhoto && photo ? <img src={photo.base64} alt="Vista previa de la fotografía del paciente" onError={onPhotoError} /> : <LuUserRound aria-hidden="true" />}</span><div><InputFile field="photo" type="button" label={<><LuImage aria-hidden="true" /> Fotografía (opcional)</>} accept="image/jpeg,image/png,image/webp" validate={validatePhoto} classes={{ root: styles.fileRoot, input_file_button: styles.fileLabel, input_hide: styles.fileInput, file_data_container: styles.fileData, file_name: styles.fileName }} /><p className={styles.hint}>Selecciona una foto JPG, PNG o WebP, hasta 5 MB. Solo vista previa local; no se sube a ningún servicio.</p>{photoFailed && <p className={styles.hint} role="status">No se pudo mostrar esta imagen. Elige un archivo de imagen válido.</p>}</div></div>
      <div className={styles.fields}><Select name="gender" label="Género (como en el registro original)" options={genderOptions} classes={selectClasses} /><div className={styles.nationality}><Input identifier="nationalitySearch" label="Buscar nacionalidad" placeholder="Ej. México o MX" classes={inputClasses} /><Select name="nationality" label="Nacionalidad" options={nationalityOptions} classes={selectClasses} /><p className={styles.hint} role="status">{nationalityMatches} opciones del catálogo original. Puedes dejarla sin especificar.</p></div></div>
    </fieldset>
    <fieldset className={styles.section}><legend>Contexto de la consulta inicial</legend><p className={styles.description}>Separado de la identidad del paciente. Se conservará para la evaluación; todavía no hay cálculos ni guardado.</p><Textarea identifier="reason" label="Motivo de consulta" placeholder="¿Qué busca el paciente en este acompañamiento?" maxLength={500} validate={validateInitialReason} classes={{ root: styles.field, label: styles.label, input: styles.textarea }} /><p className={styles.hint}>Hasta 500 caracteres. Puede quedar pendiente en esta vista de datos iniciales.</p></fieldset>
    <fieldset className={styles.section}><legend>Signos y síntomas</legend><p className={styles.description}>Se conservan las 18 opciones del original. Marca solo lo referido por el paciente: dejar todo sin marcar no confirma ausencia de síntomas.</p><div className={styles.symptoms}>{symptoms.map(symptom => <label key={symptom.id} className={styles.symptom} htmlFor={`symptom-${symptom.id}`}><Checkbox id={`symptom-${symptom.id}`} name={`symptoms.${symptom.id}`} className={styles.checkbox} /><span>{symptom.label}</span></label>)}</div></fieldset>
    <section className={styles.schedule} aria-labelledby="schedule-title"><LuCalendarDays aria-hidden="true" /><div><h3 id="schedule-title">Programar consulta</h3><p>Acción del original conservada en el alcance. La agenda está pendiente de desarrollar; no se programará ninguna cita desde esta vista.</p><button type="button" disabled>Programar consulta · Próximamente</button></div></section>
  </>
}
