import type { FormulaResult } from '../AssessmentFormulas/formulaCalculations'
import type { FormulaData } from '../AssessmentFormulas/formulaModel'
import styles from './FormulaReview.module.css'

export default function FormulaReview({ data, results }: { data: FormulaData; results: FormulaResult[] }) {
  return <section className={styles.root} aria-label="Resultados de fórmulas"><h3>Resultados y dependencias</h3>
    {data.availability !== 'captured' ? <p>{data.availability === 'notPerformed' ? 'Revisión de fórmulas no realizada.' : data.availability === 'unavailable' ? 'Fórmulas no disponibles.' : 'Fórmulas sin revisar.'} Sin información no equivale a cero.</p> : <>
      <p>Fecha de referencia: {data.referenceDate || 'Sin registrar'} · Estimaciones para revisión profesional, no diagnósticos ni prescripción. Métodos sin datos, no aplicables o pendientes permanecen sin resultado.</p>
      <dl>{results.map(row => <div key={row.id}><dt>{row.label}</dt><dd>{row.value === null ? 'Sin resultado' : <strong>{row.value.toLocaleString('es-MX', { maximumFractionDigits: row.id === 'density' ? 4 : 2 })} {row.unit}</strong>}</dd><dd>{row.detail}</dd></div>)}</dl>
      <section className={styles.interpretations}><h4>Interpretaciones del profesional</h4><p>Grasa: {data.fatInterpretation || 'Sin interpretación registrada'}</p><p>IMC: {data.bmiInterpretation || 'Sin interpretación registrada'}</p></section>
    </>}
  </section>
}
