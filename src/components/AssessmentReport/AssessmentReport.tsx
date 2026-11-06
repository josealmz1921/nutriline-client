import { calculateAnthropometry } from '../Anthropometry/anthropometryCalculations'
import { measurements } from '../Anthropometry/measurements'
import RecallReview from '../RecallReview'
import HabitsReview from '../HabitsReview'
import FormulaReview from '../FormulaReview'
import { calculateFormulas } from '../AssessmentFormulas/formulaCalculations'
import type { FormulaContext, FormulaData } from '../AssessmentFormulas/formulaModel'
import styles from './AssessmentReport.module.css'

export default function AssessmentReport({ context, data, document }: { context: FormulaContext; data: FormulaData; document: 'anthropometry' | 'diet' }) {
  const unavailable = ['notPerformed', 'unavailable'].includes(String(context.measurements.measurementAvailability))
  const results = calculateAnthropometry(unavailable ? {} : context.measurements)
  return <article className={styles.root} aria-label="Vista previa de reporte"><h2>{document === 'anthropometry' ? 'Reporte de antropometría' : 'Reporte alimentario · R24, no dieta prescrita'}</h2><p className={styles.warning}>BORRADOR · DATOS FICTICIOS · SIN GUARDAR · No es un documento clínico validado.</p><p>{context.name || 'Paciente de demostración'} · Nacimiento: {context.birthDate || 'Sin registrar'}</p>
    {document === 'anthropometry' ? <><h3>Mediciones declaradas</h3>{unavailable ? <p>Mediciones no realizadas o no disponibles.</p> : <dl>{measurements.map(field => <div key={field.id}><dt>{field.label}</dt><dd>{String(context.measurements[field.id] ?? '') || 'Sin registrar'} {context.measurements[field.id] ? field.unit : ''}</dd></div>)}<div><dt>Pliegue supraespinal</dt><dd>{String(context.measurements.supraspinale ?? '') || 'Sin registrar'} {context.measurements.supraspinale ? 'mm' : ''}</dd></div></dl>}
      <dl>{(['bmi', 'waistHip', 'waistHeight', 'endomorphy', 'mesomorphy', 'ectomorphy'] as const).map((key, index) => <div key={key}><dt>{['IMC numérico', 'Índice cintura/cadera', 'Índice cintura/talla', 'Endomorfia', 'Mesomorfia', 'Ectomorfia'][index]}</dt><dd>{results[key].value?.toLocaleString('es-MX', { maximumFractionDigits: 2 }) ?? 'Sin resultado'}</dd></div>)}</dl>
      <FormulaReview data={data} results={calculateFormulas(data, context).filter(row => ['fat', 'fatKg', 'density', 'bone', 'residual', 'muscle', 'bmi'].includes(row.id))} /></> : <><RecallReview data={context.recall} /><HabitsReview data={context.habits} weight={unavailable ? undefined : context.measurements.weight} /><FormulaReview data={data} results={calculateFormulas(data, context).filter(row => ['bmr', 'exercise', 'stress', 'expenditure', 'consumption', 'balance'].includes(row.id))} /><p>No se ha elaborado un menú, distribución de equivalentes ni plan alimentario. El R24 describe consumo declarado, no una prescripción.</p></>}
  </article>
}
