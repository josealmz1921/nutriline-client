import Input from '../Input'
import Textarea from '../Textarea'
import type { biochemicalDeterminations } from '../Biochemistry/biochemistryModel'
import { validateBiochemistryField, validateLabText, validateLabUnit, validateLabValue } from '../Biochemistry/biochemistryValidation'
import styles from './BiochemicalDetermination.module.css'

const fieldClasses = { root: styles.field, label: styles.label, input: styles.input }

export default function BiochemicalDetermination({ determination }: { determination: typeof biochemicalDeterminations[number] }) {
  const name = `biochemistry.results.${determination.id}`
  return <fieldset className={styles.card}><legend>{determination.label}</legend>
    <div className={styles.fields}>
      <Input identifier={`${name}.value`} label={`Valor · ${determination.label}`} inputMode="decimal" maxLength={24} validate={validateBiochemistryField(validateLabValue)} placeholder="Sin registrar" autoComplete="off" classes={fieldClasses} />
      <Input identifier={`${name}.unit`} label={`Unidad · ${determination.label}`} maxLength={40} validate={(value, values) => validateLabUnit(value, values, determination.id)} placeholder="La del informe" autoComplete="off" classes={fieldClasses} />
      <div className={styles.fullWidth}><Input identifier={`${name}.reference`} label={`Referencia del laboratorio · ${determination.label}`} maxLength={200} validate={validateBiochemistryField(validateLabText(200))} placeholder="Rango o criterio tal como aparece en el informe" autoComplete="off" classes={fieldClasses} /></div>
      <div className={styles.fullWidth}><Textarea identifier={`${name}.interpretation`} label={`Resultado / interpretación manual · ${determination.label}`} maxLength={500} validate={validateBiochemistryField(validateLabText(500))} placeholder="Opcional; no se genera un diagnóstico automáticamente" classes={{ ...fieldClasses, input: styles.textarea }} /></div>
    </div>
    <p className={styles.hint}>Hasta 24 caracteres en el valor, 40 en unidad, 200 en referencia y 500 en interpretación. Si capturas un valor, indica su unidad. Referencia e interpretación pueden quedar pendientes.</p>
  </fieldset>
}
