import { describe, expect, it } from 'vitest'
import { calculateFormulas, durninDensity } from './formulaCalculations'
import { ageAtDate, reviewFormulas, type FormulaContext } from './formulaModel'
import { reviewRecall } from '../DietaryRecall/recallModel'
import { reviewHabits } from '../Habits/habitsModel'

const context = (): FormulaContext => ({ birthDate: '1996-11-06', measurements: { weight: '70', height: '170', waist: '80', wristBreadth: '5', femur: '9', biceps: '18', triceps: '20', subscapular: '22', suprailiac: '32' }, recall: reviewRecall(undefined), habits: reviewHabits(undefined) })
const selected = () => reviewFormulas({ availability: 'captured', referenceDate: '2026-11-06', sex: 'male', population: 'generalAdult', metabolicAuthor: 'mifflin', exercise: '1.2', stress: 'none', fatAuthor: 'deurenberg', densityAuthor: 'durnin', boneAuthor: 'rocha', residualAuthor: 'wurch', muscleAuthor: 'remainder' })
const value = (id: string, data = selected(), input = context()) => calculateFormulas(data, input).find(row => row.id === id)!.value

describe('Fechas calendario para las ecuaciones', () => {
  it('calcula años cumplidos sin convertir nacimiento a zona horaria', () => {
    expect(ageAtDate('1996-11-06', '2026-11-05')).toBe(29)
    expect(ageAtDate('1996-11-06', '2026-11-06')).toBe(30)
    expect(ageAtDate('2000-02-29', '2026-02-28')).toBe(25)
    expect(ageAtDate('2000-02-29', '2026-03-01')).toBe(26)
    expect(ageAtDate('2026-02-30', '2026-11-06')).toBeNull()
    expect(ageAtDate('2027-11-06', '2026-11-06')).toBeNull()
  })
})

describe('Metabolismo y diferencia de energía sin ceros fabricados', () => {
  it('usa coeficientes simétricos Mifflin y versión Harris original', () => {
    expect(value('bmr')).toBe(1617.5)
    expect(value('bmr', { ...selected(), sex: 'female' })).toBe(1451.5)
    expect(value('bmr', { ...selected(), metabolicAuthor: 'harris' })).toBeCloseTo(1676.973)
    expect(value('bmr', { ...selected(), metabolicAuthor: 'harris', sex: 'female' })).toBeCloseTo(1498.726)
    expect(value('expenditure')).toBeCloseTo(1941)
    expect(value('exercise')).toBeCloseTo(323.5)
    expect(value('stress')).toBe(0)
    expect(value('consumption')).toBeNull()
    expect(value('balance')).toBeNull()
  })
  it('aplica Schofield por edad sin huecos, y no trata IOM como TMB', () => {
    expect(value('bmr', { ...selected(), metabolicAuthor: 'schofield' })).toBeCloseTo(11.472 * 70 + 873.1)
    expect(value('bmr', { ...selected(), metabolicAuthor: 'fao' })).toBeCloseTo(11.472 * 70 + 873.1)
    expect(value('bmr', { ...selected(), metabolicAuthor: 'schofield', referenceDate: '2026-11-05' })).toBeCloseTo(15.057 * 70 + 692.2)
    for (const author of ['iom', 'valencia']) expect(value('bmr', { ...selected(), metabolicAuthor: author })).toBeNull()
    expect(value('expenditure', { ...selected(), stress: 'legacy-1' })).toBeNull()
    expect(value('expenditure', { ...selected(), exercise: 'mets' })).toBeNull()
  })
  it('no aplica ecuaciones sin población, sexo, datos o fuera de alcance', () => {
    for (const patch of [{ sex: '' }, { population: 'other' }, { referenceDate: '' }, { availability: 'unavailable' }, { referenceDate: '2010-11-06' }]) expect(value('bmr', { ...selected(), ...patch })).toBeNull()
    expect(value('bmr', selected(), { ...context(), measurements: { weight: '70' } })).toBeNull()
    expect(value('bmr', selected(), { ...context(), measurements: { ...context().measurements, measurementAvailability: 'unavailable' } })).toBeNull()
    expect(value('bmi', selected(), { ...context(), measurements: { weight: '0', height: '170' } })).toBeNull()
    expect(calculateFormulas({ ...selected(), availability: 'notPerformed' }, context()).every(row => row.value === null)).toBe(true)
  })
  it('separa consumo total de diferencia y conserva el signo correcto', () => {
    const input = context()
    input.recall = reviewRecall({ availability: 'captured', meals: Object.fromEntries(['breakfast', 'firstSnack', 'lunch', 'secondSnack', 'dinner'].map(id => [id, { status: 'notConsumed' }])) })
    expect(value('consumption', selected(), input)).toBe(0)
    expect(value('balance', selected(), input)).toBeCloseTo(-1941)
    input.recall.meals.breakfast = { status: 'captured', preparations: [{ name: 'Ficticio', foods: [{ name: 'Manzana', quantity: '100', unit: 'pieza', catalogId: '1231' }] }] }
    expect(value('consumption', selected(), input)).toBe(5500)
    expect(value('balance', selected(), input)).toBeCloseTo(3559)
    input.recall.meals.dinner.status = 'unavailable'
    expect(value('consumption', selected(), input)).toBeNull()
    expect(value('balance', selected(), input)).toBeNull()
  })
})

describe('Composición corporal con unidades y protocolos explícitos', () => {
  it('usa log10, tabla por edad y Siri; reproduce el ejemplo de mujer de 30 años', () => {
    const density = durninDensity(30, 'female', [18, 20, 22, 32])!
    expect(density).toBeCloseTo(1.018186, 5)
    expect((4.95 / density - 4.5) * 100).toBeCloseTo(36.16, 1)
    expect(durninDensity(73, 'male', [10, 10, 10, 10])).toBeNull()
    expect(durninDensity(30, '', [10, 10, 10, 10])).toBeNull()
    expect(durninDensity(30, 'male', [10, 0, 10, 10])).toBeNull()
    for (const age of [19, 20, 29, 30, 39, 40, 49, 50, 72]) expect(durninDensity(age, 'female', [10, 10, 10, 10])).not.toBeNull()
  })
  it('convierte porcentaje a kg, longitudes a metros y no resta porcentaje al peso', () => {
    const data = selected(), input = context()
    const fat = 1.2 * (70 / 1.7 ** 2) + .23 * 30 - 10.8 - 5.4
    const fatKg = fat * 70 / 100
    const bone = 3.02 * (1.7 ** 2 * .05 * .09 * 400) ** .712
    expect(value('fat', data, input)).toBeCloseTo(fat)
    expect(value('fatKg', data, input)).toBeCloseTo(fatKg)
    expect(value('bone', data, input)).toBeCloseTo(bone)
    expect(value('residual', data, input)).toBeCloseTo(16.87)
    expect(value('muscle', data, input)).toBeCloseTo(70 - fatKg - bone - 16.87)
    expect(value('muscle', { ...data, fatAuthor: '' }, input)).toBeNull()
    expect(value('fat', { ...data, fatAuthor: 'garrow' }, input)).toBeNull()
    expect(value('fat', { ...data, fatAuthor: 'lean' }, input)).toBeCloseTo(.567 * 80 + .101 * 30 - 31.8)
  })
})
