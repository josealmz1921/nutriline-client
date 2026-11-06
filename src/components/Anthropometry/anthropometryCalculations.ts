export type MeasurementValues = Record<string, unknown>
export interface Calculation { value: number | null; missing: string[]; error?: string }

// No parseFloat: rechaza sufijos, notación exponencial y entradas parciales.
export function positiveDecimal(value: unknown): number | null {
  if (typeof value !== 'string' && typeof value !== 'number') return null
  const text = String(value).trim().replace(',', '.')
  if (!/^\d+(?:\.\d+)?$/.test(text)) return null
  const number = Number(text)
  return Number.isFinite(number) && number > 0 ? number : null
}

export function validateMeasurement(value: unknown) {
  if (value == null || value === '') return
  if (positiveDecimal(value) === null) return 'Ingresa un número mayor que cero, sin unidades (ej. 12.5).'
}

const labels: Record<string, string> = {
  height: 'Talla (cm)', weight: 'Peso (kg)', waist: 'Cintura (cm)', hip: 'Cadera (cm)',
  triceps: 'Tríceps (mm)', subscapular: 'Subescapular (mm)', supraspinale: 'Supraespinal (mm)',
  humerus: 'Diámetro de húmero (cm)', femur: 'Diámetro de fémur (cm)',
  flexedArm: 'Brazo contraído (cm)', calfGirth: 'Perímetro de pierna (cm)', calfFold: 'Pierna medial (mm)',
}

function calculate(values: MeasurementValues, keys: string[], formula: (...numbers: number[]) => number): Calculation {
  const missing = keys.filter(key => positiveDecimal(values[key]) === null).map(key => labels[key])
  if (missing.length) return { value: null, missing }
  const result = formula(...keys.map(key => positiveDecimal(values[key])!))
  return Number.isFinite(result) ? { value: result, missing: [] } : { value: null, missing: [], error: 'Resultado fuera del rango numérico. Revisa las medidas.' }
}

export function ectomorphyFromRatio(ratio: number) {
  if (ratio >= 40.75) return 0.732 * ratio - 28.58
  if (ratio > 38.25) return 0.463 * ratio - 17.63
  return 0.1
}

const componentRating = (value: number) => Number.isFinite(value) && value <= 0 ? 0.1 : value

export function calculateAnthropometry(values: MeasurementValues) {
  const bmi = calculate(values, ['weight', 'height'], (weight, height) => weight / (height / 100) ** 2)
  const waistHip = calculate(values, ['waist', 'hip'], (waist, hip) => waist / hip)
  const waistHeight = calculate(values, ['waist', 'height'], (waist, height) => waist / height)
  const endomorphy = calculate(values, ['height', 'triceps', 'subscapular', 'supraspinale'], (height, triceps, subscapular, supraspinale) => {
    const x = (triceps + subscapular + supraspinale) * 170.18 / height
    return componentRating(-0.7182 + 0.1451 * x - 0.00068 * x ** 2 + 0.0000014 * x ** 3)
  })
  const mesomorphy = calculate(values, ['height', 'humerus', 'femur', 'flexedArm', 'triceps', 'calfGirth', 'calfFold'], (height, humerus, femur, arm, triceps, calf, calfFold) => {
    const correctedArm = arm - triceps / 10
    const correctedCalf = calf - calfFold / 10
    if (correctedArm <= 0 || correctedCalf <= 0) return NaN
    return componentRating(0.858 * humerus + 0.601 * femur + 0.188 * correctedArm + 0.161 * correctedCalf - 0.131 * height + 4.5)
  })
  if (mesomorphy.error) mesomorphy.error = 'Revisa unidades y medidas: los perímetros corregidos deben ser positivos y el resultado finito.'
  const ectomorphy = calculate(values, ['height', 'weight'], (height, weight) => ectomorphyFromRatio(height / Math.cbrt(weight)))
  const components = [endomorphy, mesomorphy, ectomorphy]
  const point = components.every(component => component.value !== null) ? {
    x: ectomorphy.value! - endomorphy.value!,
    y: 2 * mesomorphy.value! - endomorphy.value! - ectomorphy.value!,
  } : null
  return { bmi, waistHip, waistHeight, endomorphy, mesomorphy, ectomorphy, point }
}
