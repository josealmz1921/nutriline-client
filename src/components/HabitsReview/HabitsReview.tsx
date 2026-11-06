import { activityLevels, calculateActivities, habitNumbers, type HabitsData } from '../Habits/habitsModel'
import styles from './HabitsReview.module.css'

const format = (value: number | null) => value === null ? 'Sin resultado: faltan datos o fuente' : value.toLocaleString('es-MX', { maximumFractionDigits: 2 })
export default function HabitsReview({ data, weight, totalsOnly = false }: { data: HabitsData; weight?: unknown; totalsOnly?: boolean }) {
  const results = calculateActivities(data, weight)
  return <section className={styles.root} aria-label={totalsOnly ? 'Resultados de actividad física' : 'Revisión de hábitos'}>
    <h3>{totalsOnly ? 'Estimaciones de las actividades registradas' : 'Hábitos · Revisión'}</h3>
    {data.availability !== 'captured' ? <p>{data.availability === 'notPerformed' ? 'Entrevista de hábitos no realizada' : data.availability === 'unavailable' ? 'Hábitos no disponibles' : 'Hábitos sin registrar'}. Sin información no significa cero.</p> : <>
      {!totalsOnly && <><dl><div><dt>Alimentos que prefiere</dt><dd>{data.preferred || 'Sin registrar'}</dd></div><div><dt>Alimentos que no le gustan</dt><dd>{data.disliked || 'Sin registrar'}</dd></div>{habitNumbers.map(field => <div key={field.id}><dt>{field.label}</dt><dd>{data[field.id] || 'Sin registrar'}</dd></div>)}<div><dt>Nivel de actividad física</dt><dd>{activityLevels.find(item => item.value === data.activityLevel)?.label || 'Sin especificar'} · Declarado, no inferido de MET</dd></div></dl>
      <p>{data.activityStatus === 'none' ? 'Sin actividad física (declarado)' : data.activityStatus === 'unavailable' ? 'Actividad física no disponible' : 'Actividades registradas'}</p>
      <ul>{results.rows.map((row, index) => <li key={index}>{row.name} · {row.duration} {row.unit === 'hours' ? 'horas' : 'minutos'}<span>{row.met || 'Sin dato'} MET · {row.source || 'Sin fuente de MET'}</span><span>{format(row.kcal)} kcal estimadas</span></li>)}</ul></>}
      <dl><div><dt>Volumen de actividad (MET·min)</dt><dd>{format(results.metMinutes)}</dd></div><div><dt>Kcal brutas estimadas</dt><dd>{format(results.kcal)}</dd></div></dl>
      <p>Por actividad: MET × 0.0175 × peso (kg) × minutos. Se suman los aportes de cada fila, no los MET de actividades distintas. No es gasto total diario ni gasto neto de ejercicio. Requiere peso disponible; sin él no se inventan kcal. Las duraciones se refieren a un día, sin superponer actividades.</p>
    </>}
  </section>
}
