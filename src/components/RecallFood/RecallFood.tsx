import { LuTrash2 } from 'react-icons/lu'
import Input from '../Input'
import Select from '../Select'
import { recallCatalog } from '../DietaryRecall/recallCatalog'
import { recallNutrients } from '../DietaryRecall/recallNutrients'
import { recallFieldValidation } from '../DietaryRecall/recallValidation'
import type { RecallMealId } from '../DietaryRecall/recallModel'
import { useRecallFood } from './useRecallFood'
import styles from './RecallFood.module.css'

const classes = { root: styles.field, label: styles.label, input: styles.input }
const options = [{ value: 'manual', label: 'Captura libre · sin nutrientes' }, ...recallCatalog.map(food => ({ value: food.id, label: food.name }))]

export default function RecallFood({ name, mealId, context, onDraftChange }: { name: string; mealId: RecallMealId; context: string; onDraftChange?: () => void }) {
  const { reference, chooseFood, confirming, requestRemoval, cancelRemoval, remove } = useRecallFood(onDraftChange)
  return <fieldset className={styles.food}><legend>{context}</legend>
    <Select name="catalogId" id={`${name}.catalogId`} label={`Catálogo · ${context}`} options={options} onValueChange={chooseFood} classes={{ input: styles.select, standard: styles.label }} />
    <div className={styles.fields}>
      <Input identifier="name" id={`${name}.name`} label={`Alimento · ${context}`} validate={recallFieldValidation(mealId, 'text')} maxLength={150} autoComplete="off" classes={classes} />
      <Input identifier="quantity" id={`${name}.quantity`} label={`Cantidad · ${context}`} inputMode="decimal" validate={recallFieldValidation(mealId, 'quantity')} maxLength={12} classes={classes} />
      <Input identifier="unit" id={`${name}.unit`} label={`Unidad · ${context}`} validate={recallFieldValidation(mealId, 'text', 40)} maxLength={40} placeholder="Ej. taza, pieza, g" classes={classes} />
    </div>
    {reference ? <details className={styles.reference}><summary>Referencia histórica: {reference.quantity} {reference.unit} · Ver 24 datos originales</summary><p>Solo se calcula si mantienes el nombre y la unidad exactos. Sin conversiones entre piezas, tazas y gramos. Datos antiguos sin validación clínica.</p><dl>{recallNutrients.map(nutrient => <div key={nutrient.id}><dt>{nutrient.label}{nutrient.unit ? ` (${nutrient.unit})` : ' (unidad/método por verificar)'}</dt><dd>{reference.nutrients[nutrient.id] ?? 'Sin dato'}</dd></div>)}</dl></details> : <p className={styles.hint}>Captura libre: se conserva en el recordatorio, pero no se inventan nutrientes ni equivalencias.</p>}
    {confirming ? <div className={styles.confirm} role="group" aria-label={`Confirmar eliminación · ${context}`}><p>¿Quitar este alimento? Se descartarán sus datos.</p><button type="button" onClick={cancelRemoval}>Conservar alimento</button><button type="button" onClick={remove}>Confirmar eliminación de alimento</button></div> : <button type="button" onClick={requestRemoval} className={styles.remove}><LuTrash2 aria-hidden="true" /> Quitar alimento · {context}</button>}
  </fieldset>
}
