import { describe, expect, it } from 'vitest'
import { recallMeals, reviewRecall } from './recallModel'
import { recallCatalog } from './recallCatalog'
import { recallNutrients } from './recallNutrients'
import { calculateRecall, foodReference, recallQuantity } from './recallCalculations'
import { recallFieldValidation, validateRecall } from './recallValidation'

const day = () => ({ availability: 'captured', meals: Object.fromEntries(recallMeals.map(meal => [meal.id, { status: 'notConsumed', preparations: [] as unknown[] }])) })

describe('Modelo R24 y trazabilidad', () => {
  it('mantiene cinco tiempos y 24 columnas originales sin fusionar las dos de azúcar', () => {
    expect(recallMeals).toHaveLength(5)
    expect(recallNutrients).toHaveLength(24)
    expect(new Set(recallNutrients.map(item => item.id)).size).toBe(24)
    expect(recallNutrients.find(item => item.id === 'azucar')?.additive).toBe(false)
    expect(recallNutrients.find(item => item.id === 'indiceglicemico')?.additive).toBe(false)
    expect(recallCatalog).toHaveLength(6)
    expect(recallCatalog.find(item => item.id === '138')).toMatchObject({ quantity: 0.25, unit: 'taza', nutrients: { energiaKcal: 60 } })
  })
  it('crea una revisión independiente y excluye borradores si se declara ausencia', () => {
    const draft = day()
    draft.meals.breakfast = { status: 'captured', preparations: [{ name: ' Plato ficticio ', foods: [{ name: 'Manzana', quantity: '2,5', unit: 'pieza', catalogId: '1231' }] }] }
    const before = JSON.stringify(draft)
    const reviewed = reviewRecall(draft)
    expect(reviewed.meals.breakfast.preparations[0].foods[0].quantity).toBe('2.5')
    expect(JSON.stringify(draft)).toBe(before)
    const inactive = reviewRecall({ ...draft, availability: 'notPerformed' })
    expect(inactive.meals.breakfast.preparations).toEqual([])
    expect(calculateRecall(inactive).every(item => item.value === null && item.subtotal === null)).toBe(true)
  })
})

describe('Cálculos de referencia, sin equivalencias inventadas', () => {
  it('escala por la cantidad original (no asume que todos los alimentos son por 100 g)', () => {
    const draft = day()
    draft.meals.breakfast = { status: 'captured', preparations: [{ name: 'Ejemplo', foods: [
      { name: 'Manzana', quantity: '2', unit: 'pieza', catalogId: '1231' },
      { name: 'Arroz cocido', quantity: '0.5', unit: 'taza', catalogId: '138' },
    ] }] }
    const totals = calculateRecall(reviewRecall(draft))
    expect(totals.find(item => item.id === 'energiaKcal')?.value).toBe(230)
    expect(totals.find(item => item.id === 'proteinag')?.value).toBeCloseTo(2.8)
    expect(totals.find(item => item.id === 'indiceglicemico')?.value).toBeNull()
    expect(totals.find(item => item.id === 'azucar')?.value).toBeNull()
  })
  it('separa subtotal conocido de total cuando hay alimentos manuales o tiempos desconocidos', () => {
    const draft = day()
    draft.meals.breakfast = { status: 'captured', preparations: [{ name: 'Ejemplo', foods: [
      { name: 'Manzana', quantity: '1', unit: 'pieza', catalogId: '1231' },
      { name: 'Alimento ficticio', quantity: '1', unit: 'taza', catalogId: 'manual' },
    ] }] }
    let energy = calculateRecall(reviewRecall(draft)).find(item => item.id === 'energiaKcal')!
    expect(energy.value).toBeNull()
    expect(energy.subtotal).toBe(55)
    expect(energy.count).toBe(1)
    draft.meals.dinner.status = 'unavailable'
    energy = calculateRecall(reviewRecall(draft)).find(item => item.id === 'energiaKcal')!
    expect(energy.value).toBeNull()
    expect(energy.unknownMeals).toBe(1)
    expect(calculateRecall(reviewRecall(undefined)).every(item => item.value === null)).toBe(true)
  })
  it('no convierte unidades ni usa el nutriente de otro alimento al editar el nombre', () => {
    const food = { name: 'Manzana', quantity: '1', unit: 'g', catalogId: '1231' }
    expect(foodReference(food)).toBeNull()
    expect(foodReference({ ...food, name: 'Manzana con azúcar', unit: 'pieza' })).toBeNull()
    expect(foodReference({ ...food, unit: 'pieza' })?.factor).toBe(1)
    expect(foodReference({ ...food, unit: 'pieza', quantity: '0' })).toBeNull()
  })
})

describe('Validaciones de captura R24', () => {
  it('acepta cantidades decimales positivas y rechaza notación parcial, cero y unidades escritas', () => {
    expect(recallQuantity('0,25')).toBe(0.25)
    for (const value of ['', '0', '-1', '1/2', '1e3', '12g', '1.2.3', 'NaN', '9'.repeat(13)]) expect(recallQuantity(value)).toBeNull()
  })
  it('distingue opcional intacto de captura incompleta y exige declarar los cinco tiempos', () => {
    expect(validateRecall({})).toEqual({})
    expect(validateRecall({}, true)).toHaveProperty('recall.availability')
    expect(validateRecall({ recall: { availability: 'notPerformed' } }, true)).toEqual({})
    expect(validateRecall({ recall: { availability: 'captured' } }, true)).toHaveProperty('recall.meals.dinner.status')
    const draft = day()
    expect(validateRecall({ recall: draft }, true)).toEqual({})
    draft.meals.breakfast = { status: 'captured', preparations: [{ name: 'Ejemplo', foods: [] }] }
    expect(validateRecall({ recall: draft }, true)).toHaveProperty('recall.meals.breakfast.status')
    expect(recallFieldValidation('breakfast', 'quantity')('', { recall: draft })).toBeTruthy()
    expect(recallFieldValidation('breakfast', 'quantity')('-4', { recall: { ...draft, availability: 'unavailable' } })).toBeUndefined()
  })
})
