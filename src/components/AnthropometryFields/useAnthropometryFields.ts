import { useFormState } from 'informed'
import { calculateAnthropometry, positiveDecimal } from '../Anthropometry/anthropometryCalculations'
import { measurements } from '../Anthropometry/measurements'

export function useAnthropometryFields() {
  const { values } = useFormState()
  const unavailable = ['notPerformed', 'unavailable'].includes(String(values.measurementAvailability))
  const results = calculateAnthropometry(unavailable ? {} : values)
  const captured = measurements.filter(field => positiveDecimal(values[field.id]) !== null)
  const point = results.point
  // Escala simétrica adaptativa: nunca oculta puntos fuera de la ventana inicial.
  const extent = Math.max(10, Math.ceil(Math.max(Math.abs(point?.x ?? 0), Math.abs(point?.y ?? 0)) / 5) * 5)
  return { results, unavailable, captured: captured.length, extent,
    plotPoint: point ? { x: 200 + point.x / extent * 150, y: 200 - point.y / extent * 150 } : null }
}
