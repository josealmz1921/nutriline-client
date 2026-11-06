import { ArrayField } from 'informed'
import { LuHeartPulse, LuPlus } from 'react-icons/lu'
import Input from '../Input'
import Textarea from '../Textarea'
import Select from '../Select'
import HabitActivity from '../HabitActivity'
import HabitsReview from '../HabitsReview'
import DevFormTools from '../DevFormTools'
import { activityLevels, habitNumbers } from '../Habits/habitsModel'
import { validateHabitNumber, validateHabitText } from '../Habits/habitsValidation'
import { useHabitsFields } from './useHabitsFields'
import styles from './HabitsFields.module.css'

const classes = { root: styles.field, label: styles.label, input: styles.input }
const availability = [{ value: '', label: 'Selecciona una opción' }, { value: 'captured', label: 'Capturar entrevista de hábitos' }, { value: 'notPerformed', label: 'Entrevista de hábitos no realizada' }, { value: 'unavailable', label: 'Hábitos no disponibles' }]
const statuses = [{ value: '', label: 'Selecciona una opción' }, { value: 'captured', label: 'Registrar actividades del día' }, { value: 'none', label: 'Sin actividad física (declarado)' }, { value: 'unavailable', label: 'Actividad física no disponible' }]
export default function HabitsFields({ weight, onDraftChange }: { weight?: unknown; onDraftChange?: () => void }) {
  const { activitiesApiRef, addActivity, fillDevRows, consultationWeight, inactive, activitiesHidden, data, search, setSearch, matches } = useHabitsFields(onDraftChange)
  return <section className={styles.root} aria-label="Captura de hábitos">
    {import.meta.env.DEV && <DevFormTools profile="habits" onFillRows={fillDevRows} />}
    <header className={styles.header}><LuHeartPulse aria-hidden="true" /><div><h2>Alimentación, descanso y movimiento</h2><p>Entrevista y actividades de un día. Usa datos ficticios. No se guarda ni se prescribe tratamiento.</p></div></header>
    <Select name="habits.availability" label="Disponibilidad de hábitos" options={availability} classes={{ input: styles.select, standard: styles.label }} />
    {inactive && <p className={styles.notice}>Entrevista no realizada o no disponible. El borrador se conserva, pero se excluye de revisión y cálculos.</p>}
    <div hidden={inactive}>
      <div className={styles.fields}>
        <Textarea identifier="habits.preferred" label="Alimentos que prefiere" maxLength={2000} validate={validateHabitText} classes={{ ...classes, input: styles.textarea }} />
        <Textarea identifier="habits.disliked" label="Alimentos que no le gustan" maxLength={2000} validate={validateHabitText} classes={{ ...classes, input: styles.textarea }} />
        {habitNumbers.map(field => <Input key={field.id} identifier={`habits.${field.id}`} label={field.label} maxLength={10} inputMode="decimal" validate={validateHabitNumber(field.id)} classes={classes} />)}
      </div><p className={styles.notice}>Los campos de la entrevista son opcionales. Vacío significa sin información, no cero ni ausencia de preferencias. Un vaso no se convierte a mililitros sin conocer su capacidad.</p>
      <h3>Actividad física del día</h3><Select name="habits.activityStatus" label="Disponibilidad de actividad física" options={statuses} classes={{ input: styles.select, standard: styles.label }} />
      <Select name="habits.activityLevel" label="Nivel de actividad física (declarado)" options={activityLevels} classes={{ input: styles.select, standard: styles.label }} />
      <div hidden={activitiesHidden}><ArrayField name="habits.activities" arrayFieldApiRef={activitiesApiRef}>{({ addWithInitialValue }) => <>
        <div className={styles.catalog}><label htmlFor="habits-activity-search">Buscar deporte o actividad · Catálogo de demostración</label><input id="habits-activity-search" className={styles.input} value={search} onChange={event => setSearch(event.target.value)} placeholder="Ej. yoga o ciclismo" /><p>Seis referencias exactas del catálogo antiguo, sin validación clínica. Para otra actividad usa captura libre y transcribe el MET y su fuente si se conocen.</p><ul>{matches.map(item => <li key={item.id}><button type="button" onClick={() => addActivity(addWithInitialValue, { name: item.name, duration: '', unit: '', met: item.met, source: `Catálogo histórico deportsmets · ${item.id} · sin validación clínica` })}>{item.name} · {item.met} MET <LuPlus aria-hidden="true" /></button></li>)}</ul>{!matches.length && <p>No hay coincidencias en este subconjunto.</p>}</div>
        <ArrayField.Items>{({ name, index }) => <HabitActivity name={name} index={index} onDraftChange={onDraftChange} />}</ArrayField.Items>
        <button type="button" className={styles.add} onClick={() => addActivity(addWithInitialValue, { name: '', duration: '', unit: '', met: '', source: '' })}><LuPlus aria-hidden="true" /> Agregar actividad libre</button>
      </>}</ArrayField></div>
      <HabitsReview data={data} weight={weight ?? consultationWeight} totalsOnly />
    </div>
  </section>
}
