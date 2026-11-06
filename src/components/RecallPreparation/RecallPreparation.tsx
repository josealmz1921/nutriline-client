import { ArrayField } from 'informed'
import { LuPlus } from 'react-icons/lu'
import Input from '../Input'
import RecallFood from '../RecallFood'
import type { RecallMealId } from '../DietaryRecall/recallModel'
import { recallFieldValidation } from '../DietaryRecall/recallValidation'
import { useRecallPreparation } from './useRecallPreparation'
import styles from './RecallPreparation.module.css'

export default function RecallPreparation({ name, mealId, context, onDraftChange }: { name: string; mealId: RecallMealId; context: string; onDraftChange?: () => void }) {
  const { confirming, addFood, remove, requestRemoval, cancelRemoval } = useRecallPreparation(onDraftChange)
  return <section className={styles.preparation} aria-label={context}>
    <Input identifier="name" id={`${name}.name`} label={`Nombre de preparación · ${context}`} validate={recallFieldValidation(mealId, 'text')} maxLength={150} classes={{ root: styles.field, label: styles.label, input: styles.input }} />
    <ArrayField name="foods">{({ addWithInitialValue }) => <>
      <ArrayField.Items>{({ name, index }) => <RecallFood name={name} mealId={mealId} context={`${context} · Alimento ${index + 1}`} onDraftChange={onDraftChange} />}</ArrayField.Items>
      <button type="button" className={styles.add} onClick={() => addFood(addWithInitialValue)}><LuPlus aria-hidden="true" /> Agregar alimento · {context}</button>
    </>}</ArrayField>
    {confirming ? <div className={styles.confirm} role="group" aria-label={`Confirmar eliminación · ${context}`}><p>Se quitarán la preparación y todos sus alimentos. ¿Continuar?</p><button type="button" onClick={cancelRemoval}>Conservar preparación</button><button type="button" onClick={remove}>Confirmar eliminación de preparación</button></div> : <button type="button" onClick={requestRemoval} className={styles.remove}>Quitar preparación · {context}</button>}
  </section>
}
