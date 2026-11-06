import type { Calculation } from '../Anthropometry/anthropometryCalculations'
import styles from './AnthropometryCalculation.module.css'

interface Props { title: string; result: Calculation; formula: string; unit?: string }

export default function AnthropometryCalculation({ title, result, formula, unit = '' }: Props) {
  return <section className={styles.result} aria-label={title}>
    <h4>{title}</h4><p className={styles.value}>{result.value === null ? 'Sin resultado' : `${result.value.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}${unit ? ` ${unit}` : ''}`}</p>
    {result.missing.length > 0 && <p>Falta completar o corregir: {result.missing.join(', ')}.</p>}
    {result.error && <p role="status">{result.error}</p>}
    <p className={styles.formula}>{formula}</p>
  </section>
}
