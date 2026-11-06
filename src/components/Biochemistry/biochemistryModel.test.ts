import { describe, expect, it } from 'vitest'
import { biochemicalDeterminations, reviewBiochemistry } from './biochemistryModel'
import { validateLabDate, validateLabText, validateLabUnit, validateLabValue } from './biochemistryValidation'

describe('Modelo reutilizable de bioquímica', () => {
  it('conserva las diez determinaciones, nombres de valor/resultado y referencias históricas', () => {
    expect(biochemicalDeterminations).toHaveLength(10)
    expect(new Set(biochemicalDeterminations.map(field => field.id)).size).toBe(10)
    expect(new Set(biochemicalDeterminations.map(field => field.legacyValue)).size).toBe(10)
    expect(new Set(biochemicalDeterminations.map(field => field.legacyResult)).size).toBe(10)
    expect(biochemicalDeterminations[0]).toMatchObject({ legacyValue: 'glucosaPlas', legacyResult: 'glucosaPlasR' })
    expect(biochemicalDeterminations[4].legacyReference).toBe('15 a 200 μg/dl')
  })
  it('deja ausentes como ausentes y no precarga unidad, rangos ni interpretación', () => {
    expect(reviewBiochemistry(undefined)).toEqual({ collectedOn: null, laboratory: null, results: {} })
    expect(reviewBiochemistry({ results: { glucose: { value: '', unit: ' ', reference: '', interpretation: '' } } }).results).toEqual({})
  })
  it('normaliza una copia sin conversión de unidades, fechas o interpretación automática', () => {
    const original = { collectedOn: '2026-11-05', laboratory: ' Lab ficticio ', results: { glucose: { value: ' 95,50 ', unit: ' mg/dL ', reference: ' 70–100 ', interpretation: ' Nota manual ' } } }
    const before = JSON.stringify(original)
    const review = reviewBiochemistry(original)
    expect(review).toEqual({ collectedOn: '2026-11-05', laboratory: 'Lab ficticio', results: { glucose: { value: '95.50', unit: 'mg/dL', reference: '70–100', interpretation: 'Nota manual' } } })
    expect(JSON.stringify(original)).toBe(before)
    original.results.glucose.interpretation = 'Otra nota'
    expect(review.results.glucose?.interpretation).toBe('Nota manual')
  })
  it('conserva un cero explícito y notas sin valor, sin inventar otros resultados', () => {
    const review = reviewBiochemistry({ results: { glucose: { value: '0', unit: 'mg/dL' }, albumin: { interpretation: 'Pendiente de transcribir' } } })
    expect(review.results.glucose?.value).toBe('0')
    expect(review.results.glucose?.interpretation).toBeNull()
    expect(review.results.albumin?.value).toBeNull()
    expect(review.results.albumin?.interpretation).toBe('Pendiente de transcribir')
    expect(review.results.urea).toBeUndefined()
  })
})

describe('Validación técnica de resultados de laboratorio', () => {
  it('acepta ausencia, cero explícito y decimales; rechaza negativos, sufijos y valores parciales', () => {
    for (const value of [undefined, '', '0', '0.01', '12,50', ' 95.5 ']) expect(validateLabValue(value)).toBeUndefined()
    for (const value of [' ', '-1', 'NaN', 'Infinity', '1e3', '95mg/dL', '1,2.3', '<5', '1'.repeat(25)]) expect(validateLabValue(value)).toBeTruthy()
  })
  it('exige unidad solo para un valor capturado sin imponer unidades del sistema antiguo', () => {
    const values = { biochemistry: { results: { glucose: { value: '0' } } } }
    expect(validateLabUnit('', values, 'glucose')).toContain('unidad del informe')
    expect(validateLabUnit('mmol/L', values, 'glucose')).toBeUndefined()
    expect(validateLabUnit('', values, 'albumin')).toBeUndefined()
    expect(validateLabText(40)('x'.repeat(41))).toBeTruthy()
    expect(validateLabText(500)('x'.repeat(500))).toBeUndefined()
  })
  it('revisa fechas de calendario sin convertir el día de muestra a un instante', () => {
    for (const value of [undefined, '', '2024-02-29', '2026-11-05']) expect(validateLabDate(value)).toBeUndefined()
    for (const value of ['2026-02-29', '2026-04-31', '0999-01-01', '2026-13-01', '2026-11-05T00:00:00Z']) expect(validateLabDate(value)).toBeTruthy()
  })
})
