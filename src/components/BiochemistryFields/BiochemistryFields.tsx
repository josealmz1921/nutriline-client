import { LuFlaskConical } from 'react-icons/lu'
import Input from '../Input'
import Select from '../Select'
import DevFormTools from '../DevFormTools'
import { useBiochemistryFields } from './useBiochemistryFields'
import BiochemicalDetermination from '../BiochemicalDetermination'
import { biochemicalDeterminations } from '../Biochemistry/biochemistryModel'
import { validateBiochemistryField, validateLabDate, validateLabText } from '../Biochemistry/biochemistryValidation'
import styles from './BiochemistryFields.module.css'

const fieldClasses = { root: styles.field, label: styles.label, input: styles.input }
const availabilityOptions = [{ value: '', label: 'Selecciona una opción' }, { value: 'captured', label: 'Capturar resultados' }, { value: 'notPerformed', label: 'Estudio no realizado' }, { value: 'unavailable', label: 'Resultados no disponibles' }]

// Campos sin Form ni estado propio: se conectan al formulario de cada evaluación/consulta.
export default function BiochemistryFields() {
  const { unavailable } = useBiochemistryFields()
  return <section className={styles.root} aria-labelledby="biochemistry-fields-title">
    {import.meta.env.DEV && <DevFormTools profile="biochemistry" />}
    <header className={styles.header}><LuFlaskConical aria-hidden="true" /><div><h2 id="biochemistry-fields-title">Química sanguínea</h2><p>Diez determinaciones del original. Captura solo datos ficticios del informe: valor, unidad, referencia y resultado o interpretación manual. Dejar vacío no significa cero ni normalidad.</p></div></header>
    <p className={styles.notice}>Sin interpretación automática. Las referencias dependen del laboratorio, método y paciente; no se precargan los rangos antiguos ni se convierten unidades.</p>
    <div className={styles.availability}><Select name="biochemistry.availability" label="Disponibilidad del estudio" options={availabilityOptions} classes={{ input: styles.select, standard: styles.label }} /></div>
    {unavailable && <p role="status" className={styles.notice}>Estudio declarado no realizado o no disponible. No se interpretará como normalidad. El borrador se conserva si vuelves a capturar, pero no se incluye en la revisión mientras mantengas este estado.</p>}
    <div hidden={unavailable}>
    <div className={styles.metadata}>
      <Input identifier="biochemistry.collectedOn" label="Fecha de toma de muestra (opcional)" type="date" min="1000-01-01" validate={validateBiochemistryField(validateLabDate)} classes={fieldClasses} />
      <Input identifier="biochemistry.laboratory" label="Laboratorio (opcional)" maxLength={150} validate={validateBiochemistryField(validateLabText(150))} autoComplete="off" classes={fieldClasses} />
    </div>
    <div className={styles.determinations}>{biochemicalDeterminations.map(determination => <BiochemicalDetermination key={determination.id} determination={determination} />)}</div>
    </div>
    <details className={styles.pending}><summary>Otros estudios y acciones pendientes</summary><p>Biometría hemática y examen general de orina aparecen como opciones en el original, sin captura ni cambio de panel implementados en el código revisado. No se presentan como estudios disponibles aquí.</p><p>Agregar o quitar análisis e imprimir también siguen pendientes. Las diez determinaciones permanecen visibles y no se borran al cambiar de sección. No hay guardado ni exportación.</p></details>
  </section>
}
