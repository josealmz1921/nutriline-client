import { describe, expect, it } from 'vitest'
import { calculateAnthropometry, ectomorphyFromRatio, positiveDecimal, validateMeasurement } from './anthropometryCalculations'
import { measurements } from './measurements'

describe('Lectura de mediciones', () => {
  it('admite coma y punto, pero no valores ausentes, unidades, cero ni valores no finitos', () => {
    expect(positiveDecimal(' 12,5 ')).toBe(12.5)
    expect(positiveDecimal(12.5)).toBe(12.5)
    for (const value of ['', ' ', null, undefined, 0, -1, NaN, Infinity, '12kg', '1e3', '1.2.3', '12,5.1']) expect(positiveDecimal(value)).toBeNull()
    expect(validateMeasurement('')).toBeUndefined()
    expect(validateMeasurement('12,5')).toBeUndefined()
    expect(validateMeasurement('0')).toBeTruthy()
  })
  it('conserva las 38 medidas y códigos originales sin colisionar', () => {
    expect(measurements).toHaveLength(38)
    expect(new Set(measurements.map(field => field.id)).size).toBe(38)
    expect(new Set(measurements.map(field => field.legacy)).size).toBe(38)
    expect(measurements.find(field => field.id === 'weight')?.unit).toBe('kg')
    expect(measurements.find(field => field.id === 'triceps')?.unit).toBe('mm')
  })
})

describe('Cálculos antropométricos sin sustitución de ausentes', () => {
  it('declara dependencias específicas y no dibuja el origen cuando no hay medidas', () => {
    const result = calculateAnthropometry({})
    expect(result.bmi.value).toBeNull()
    expect(result.bmi.missing).toEqual(['Peso (kg)', 'Talla (cm)'])
    expect(result.point).toBeNull()
    expect(result.endomorphy.value).toBeNull()
    expect(result.ectomorphy.value).toBeNull()
  })
  it('calcula IMC e índices convirtiendo centímetros a metros solo donde corresponde', () => {
    const result = calculateAnthropometry({ weight: '72', height: '180', waist: '80', hip: '100' })
    expect(result.bmi.value).toBeCloseTo(22.22222222)
    expect(result.waistHip.value).toBe(0.8)
    expect(result.waistHeight.value).toBeCloseTo(0.44444444)
    expect(result.ectomorphy.value).not.toBeNull()
    expect(result.endomorphy.value).toBeNull()
    expect(result.point).toBeNull()
  })
  it('retira resultados al borrar o invalidar una dependencia sin afectar otros cálculos', () => {
    for (const weight of ['', '0', '-5', 'NaN', 'Infinity', '70kg']) {
      const result = calculateAnthropometry({ weight, height: '180', waist: '80', hip: '100' })
      expect(result.bmi.value).toBeNull()
      expect(result.ectomorphy.value).toBeNull()
      expect(result.waistHip.value).toBe(0.8)
    }
  })
  it('cubre exactamente los límites de las tres ecuaciones de ectomorfia', () => {
    expect(ectomorphyFromRatio(38.25)).toBe(0.1)
    expect(ectomorphyFromRatio(38.26)).toBeCloseTo(0.463 * 38.26 - 17.63)
    expect(ectomorphyFromRatio(40.74)).toBeCloseTo(0.463 * 40.74 - 17.63)
    expect(ectomorphyFromRatio(40.75)).toBeCloseTo(0.732 * 40.75 - 28.58)
  })
  it('reproduce el ejemplo B-188 del manual a una cifra decimal y deriva las coordenadas sin redondeo previo', () => {
    const result = calculateAnthropometry({ height: 170.7, weight: 52.6, triceps: 15, subscapular: 8.8, supraspinale: 6,
      humerus: 6.1, femur: 8.7, flexedArm: 24.9, calfGirth: 33.1, calfFold: 12.4 })
    expect(result.endomorphy.value!.toFixed(1)).toBe('3.0')
    expect(result.mesomorphy.value!.toFixed(1)).toBe('2.1')
    expect(result.ectomorphy.value!.toFixed(1)).toBe('4.8')
    expect(result.point!.x).toBe(result.ectomorphy.value! - result.endomorphy.value!)
    expect(result.point!.y).toBe(2 * result.mesomorphy.value! - result.endomorphy.value! - result.ectomorphy.value!)
  })
  it('no sustituye el supraespinal por suprailíaco ni el brazo contraído por el relajado', () => {
    const result = calculateAnthropometry({ height: 170, triceps: 10, subscapular: 10, suprailiac: 10,
      humerus: 7, femur: 9, relaxedArm: 30, calfGirth: 35, calfFold: 10 })
    expect(result.endomorphy.missing).toEqual(['Supraespinal (mm)'])
    expect(result.mesomorphy.missing).toEqual(['Brazo contraído (cm)'])
  })
  it('rechaza perímetros corregidos no positivos y evita resultados no finitos', () => {
    const result = calculateAnthropometry({ height: 170, humerus: 7, femur: 9, flexedArm: 1, triceps: 10, calfGirth: 35, calfFold: 10 })
    expect(result.mesomorphy.value).toBeNull()
    expect(result.mesomorphy.error).toContain('perímetros corregidos')
    expect(calculateAnthropometry({ weight: '1' + '0'.repeat(308), height: '0.' + '0'.repeat(200) + '1' }).bmi.value).toBeNull()
  })
})
