import { recallMeals, type RecallData } from '../DietaryRecall/recallModel'
import RecallTotals from '../RecallTotals'
import styles from './RecallReview.module.css'

const statuses = { pending: 'Sin registrar', captured: 'Consumo registrado', notConsumed: 'No hubo consumo (declarado)', unavailable: 'Información no disponible' }

export default function RecallReview({ data }: { data: RecallData }) {
  return <section className={styles.root} aria-label="Revisión del recordatorio de 24 horas"><h3>Recordatorio de 24 horas · Revisión</h3>
    {data.availability !== 'captured' ? <p>{data.availability === 'notPerformed' ? 'Recordatorio no realizado.' : data.availability === 'unavailable' ? 'Recordatorio no disponible.' : 'Recordatorio sin registrar.'} No equivale a no haber comido ni a un consumo de cero.</p> : <>
      {recallMeals.map(meal => <section key={meal.id} className={styles.meal} aria-label={`${meal.label} para revisión`}><h4>{meal.label}</h4><p>{statuses[data.meals[meal.id].status]}</p>
        {data.meals[meal.id].preparations.map((preparation, index) => <section key={index}><h5>{preparation.name || 'Preparación sin nombre'}</h5><ul>{preparation.foods.map((food, index) => <li key={index}>{food.name || 'Alimento sin nombre'} · {food.quantity || 'Sin cantidad'} {food.unit || 'Sin unidad'}<span>{food.catalogId === 'manual' ? 'Captura libre · Sin nutrientes calculados' : `Referencia histórica ${food.catalogId} · Sin conversiones`}</span></li>)}</ul></section>)}
      </section>)}
      <RecallTotals data={data} />
    </>}
  </section>
}
