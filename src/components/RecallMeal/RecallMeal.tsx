import { ArrayField, type ArrayFieldApi } from 'informed'
import type { RefObject } from 'react'
import { LuPlus } from 'react-icons/lu'
import Select from '../Select'
import RecallPreparation from '../RecallPreparation'
import type { RecallMealId } from '../DietaryRecall/recallModel'
import { useRecallMeal } from './useRecallMeal'
import styles from './RecallMeal.module.css'

const options = [{ value: '', label: 'Selecciona el estado de este tiempo' }, { value: 'captured', label: 'Hubo consumo · Capturar' }, { value: 'notConsumed', label: 'No hubo consumo' }, { value: 'unavailable', label: 'Información no disponible' }]

export default function RecallMeal({ id, label, arrayFieldApiRef, onDraftChange }: { id: RecallMealId; label: string; arrayFieldApiRef?: RefObject<ArrayFieldApi | null>; onDraftChange?: () => void }) {
  const { captured, addPreparation } = useRecallMeal(id, onDraftChange)
  const name = `recall.meals.${id}`
  return <section className={styles.meal} id={`recall-${id}`} aria-label={label}>
    <h3>{label}</h3><Select name={`${name}.status`} label={`Estado · ${label}`} options={options} classes={{ input: styles.select, standard: styles.label }} />
    <div hidden={!captured}><ArrayField name={`${name}.preparations`} arrayFieldApiRef={arrayFieldApiRef}>{({ addWithInitialValue }) => <>
      <ArrayField.Items>{({ name, index }) => <RecallPreparation name={name} mealId={id} context={`${label} · Preparación ${index + 1}`} onDraftChange={onDraftChange} />}</ArrayField.Items>
      <button type="button" className={styles.add} onClick={() => addPreparation(addWithInitialValue)}><LuPlus aria-hidden="true" /> Agregar preparación · {label}</button>
    </>}</ArrayField></div>
  </section>
}
