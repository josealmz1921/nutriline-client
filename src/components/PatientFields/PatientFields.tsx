import { LuContact, LuUserRound } from 'react-icons/lu'
import Input from '../Input'
import { validateBirthDate, validateEmail, validateFullName, validateOccupation, validatePhone } from '../PatientRegistration/registrationValidation'
import styles from './PatientFields.module.css'

const fieldClasses = { input: styles.input, label: styles.label, root: styles.field }

export default function PatientFields({ today }: { today: string }) {
  return <>
    <fieldset className={styles.section}>
      <legend><span><LuUserRound aria-hidden="true" /></span> Datos personales</legend>
      <p className={styles.description}>El nombre y la fecha de nacimiento son obligatorios.</p>
      <div className={styles.fields}>
        <div className={styles.fullWidth}><Input identifier="fullName" label="Nombre completo" placeholder="Ej. Mariana Solís Peña" autoComplete="off" required="Ingresa el nombre completo." validate={validateFullName} maxLength={150} classes={fieldClasses} /></div>
        <Input identifier="birthDate" label="Fecha de nacimiento" type="date" required="Selecciona la fecha de nacimiento." validate={validateBirthDate} min="1000-01-01" max={today} classes={fieldClasses} />
        <Input identifier="occupation" label="Ocupación (opcional)" placeholder="Ej. Arquitecta" autoComplete="off" validate={validateOccupation} maxLength={150} classes={fieldClasses} />
      </div>
    </fieldset>
    <fieldset className={styles.section}>
      <legend><span><LuContact aria-hidden="true" /></span> Información de contacto</legend>
      <p className={styles.description}>Estos datos son opcionales. Puedes dejarlos sin especificar.</p>
      <div className={styles.fields}>
        <Input identifier="email" label="Correo electrónico (opcional)" type="email" placeholder="nombre@correo.com" autoComplete="off" validate={validateEmail} maxLength={254} classes={fieldClasses} />
        <Input identifier="phone" label="Teléfono (opcional)" type="tel" placeholder="Ej. +52 55 0000 0000" autoComplete="off" validate={validatePhone} maxLength={32} classes={fieldClasses} />
      </div>
    </fieldset>
  </>
}
