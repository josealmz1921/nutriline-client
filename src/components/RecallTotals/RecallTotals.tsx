import { calculateRecall } from '../DietaryRecall/recallCalculations'
import type { RecallData } from '../DietaryRecall/recallModel'
import styles from './RecallTotals.module.css'

const format = (value: number) => value.toLocaleString('es-MX', { maximumFractionDigits: 2 })

export default function RecallTotals({ data }: { data: RecallData }) {
  const totals = calculateRecall(data)
  return <section className={styles.root} aria-label="Nutrientes del recordatorio">
    <h3>Nutrientes · Referencia histórica</h3><p>Valores del catálogo antiguo, sin validación clínica. Cantidad capturada / cantidad de referencia × nutriente. Solo misma unidad y mismo alimento; no se convierten tazas, piezas ni gramos.</p>
    <p>Un subtotal no es el total del día. Los alimentos libres, tiempos sin información o datos faltantes impiden obtener un total completo; no se sustituyen por cero.</p>
    <dl>{totals.map(nutrient => <div key={nutrient.id}>
      <dt>{nutrient.label}{nutrient.unit && ` (${nutrient.unit})`}</dt>
      <dd>{!nutrient.additive ? 'Pendiente de verificar unidad o método; no se suma.' : nutrient.value !== null ? <><strong>{format(nutrient.value)}</strong> · Total de los tiempos declarados</> : nutrient.subtotal !== null ? <><strong>{format(nutrient.subtotal)}</strong> · Subtotal conocido, no total diario</> : 'Sin total calculable'}</dd>
      {nutrient.additive && data.availability === 'captured' && <dd className={styles.coverage}>{nutrient.count}/{nutrient.foodCount} alimentos con aporte conocido · {nutrient.unknownMeals} tiempos sin información completa</dd>}
    </div>)}</dl>
  </section>
}
