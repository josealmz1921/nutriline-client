import { LuUtensils } from 'react-icons/lu'
import Select from '../Select'
import RecallMeal from '../RecallMeal'
import RecallTotals from '../RecallTotals'
import DevFormTools from '../DevFormTools'
import { recallMeals } from '../DietaryRecall/recallModel'
import { useRecallFields } from './useRecallFields'
import styles from './RecallFields.module.css'

const options = [{ value: '', label: 'Selecciona una opción' }, { value: 'captured', label: 'Capturar recordatorio' }, { value: 'notPerformed', label: 'Recordatorio no realizado' }, { value: 'unavailable', label: 'Recordatorio no disponible' }]

// No crea un Form: el contenedor inicial o la consulta son dueños de la captura.
export default function RecallFields({ onDraftChange }: { onDraftChange?: () => void }) {
  const { inactive, review, arrayRefs, fillDevRows } = useRecallFields(onDraftChange)
  return <section className={styles.root} aria-label="Captura del recordatorio de 24 horas">
    {import.meta.env.DEV && <DevFormTools profile="recall" onFillRows={fillDevRows} />}
    <header className={styles.header}><LuUtensils aria-hidden="true" /><div><h2>¿Qué consumió durante las últimas 24 horas?</h2><p>Captura preparaciones y alimentos por tiempo de comida, con cantidad y unidad. Usa datos ficticios: no se enviarán ni guardarán.</p></div></header>
    <div className={styles.availability}><Select name="recall.availability" label="Disponibilidad del recordatorio" options={options} classes={{ input: styles.select, standard: styles.label }} /></div>
    {inactive && <p className={styles.notice} role="status">Recordatorio declarado no realizado o no disponible. No equivale a no haber comido. El borrador se conserva al volver a capturar, pero sus alimentos no se incluyen en la revisión ni en cálculos.</p>}
    <div hidden={inactive}>
      <p className={styles.notice}>Catálogo local de demostración: seis referencias históricas, no el catálogo completo. Puedes elegir una referencia o capturar un alimento libre; los libres no generan nutrientes. No se asumen equivalencias ni se calcula una dieta prescrita.</p>
      <nav className={styles.mealLinks} aria-label="Tiempos del recordatorio">{recallMeals.map(meal => <a key={meal.id} href={`#recall-${meal.id}`}>{meal.label}</a>)}</nav>
      {recallMeals.map(meal => <RecallMeal key={meal.id} id={meal.id} label={meal.label} arrayFieldApiRef={arrayRefs[meal.id]} onDraftChange={onDraftChange} />)}
      <RecallTotals data={review} />
    </div>
  </section>
}
