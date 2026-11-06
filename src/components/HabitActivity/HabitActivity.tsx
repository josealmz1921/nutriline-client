import Input from '../Input'
import Select from '../Select'
import { validateActivity } from '../Habits/habitsValidation'
import { useHabitActivity } from './useHabitActivity'
import styles from './HabitActivity.module.css'

const classes = { root: styles.field, label: styles.label, input: styles.input }
const units = [{ value: '', label: 'Selecciona unidad' }, { value: 'minutes', label: 'Minutos' }, { value: 'hours', label: 'Horas' }]
export default function HabitActivity({ name, index, onDraftChange }: { name: string; index: number; onDraftChange?: () => void }) {
  const { confirming, remove, requestRemoval, cancelRemoval } = useHabitActivity(onDraftChange)
  return <fieldset className={styles.row}><legend>Actividad {index + 1}</legend><div className={styles.fields}>
    <Input identifier="name" id={`${name}.name`} label={`Actividad · ${index + 1}`} validate={validateActivity('name')} maxLength={300} classes={classes} />
    <Input identifier="duration" id={`${name}.duration`} label={`Duración · Actividad ${index + 1}`} inputMode="decimal" validate={validateActivity('duration')} maxLength={10} classes={classes} />
    <Select name="unit" id={`${name}.unit`} label={`Unidad · Actividad ${index + 1}`} options={units} validate={validateActivity('unit')} classes={{ input: styles.select, standard: styles.label }} />
    <Input identifier="met" id={`${name}.met`} label={`MET (opcional) · Actividad ${index + 1}`} inputMode="decimal" validate={validateActivity('met')} maxLength={8} classes={classes} />
    <Input identifier="source" id={`${name}.source`} label={`Fuente del MET · Actividad ${index + 1}`} validate={validateActivity('source')} maxLength={300} classes={classes} />
  </div><p>Sin MET y fuente no se calcula aporte; el tiempo y la actividad sí se conservan.</p>
    {confirming ? <div className={styles.actions}><span>¿Descartar esta actividad?</span><button type="button" onClick={cancelRemoval}>Conservar actividad</button><button type="button" onClick={remove}>Confirmar eliminación de actividad</button></div> : <button className={styles.remove} type="button" onClick={requestRemoval}>Quitar actividad {index + 1}</button>}
  </fieldset>
}
