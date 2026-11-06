import { asRecord, cleanRecallText, mealIsInactive, recallIsInactive, recallMeals, type RecallMealId } from './recallModel'
import { recallQuantity } from './recallCalculations'

export function recallFieldValidation(meal: RecallMealId, kind: 'text' | 'quantity', limit = 150) {
  return (value: unknown, values: Record<string, unknown>) => {
    if (mealIsInactive(values.recall, meal)) return
    if (kind === 'quantity') return recallQuantity(value) === null ? 'Ingresa una cantidad mayor que cero, con punto o coma decimal.' : undefined
    if (!cleanRecallText(value)) return 'Completa este dato del recordatorio.'
    if (typeof value !== 'string' || value.length > limit) return `Usa hasta ${limit} caracteres.`
  }
}

export function validateRecall(values: Record<string, unknown>, required = false) {
  const draft = asRecord(values.recall)
  if (recallIsInactive(draft)) return {}
  const meals = asRecord(draft.meals)
  const hasDraft = Object.keys(meals).some(id => {
    const meal = asRecord(meals[id])
    return (meal.status && meal.status !== 'pending') || (Array.isArray(meal.preparations) && meal.preparations.length > 0)
  })
  if (!required && !draft.availability && !hasDraft) return {}
  if (draft.availability !== 'captured') return { recall: { availability: 'Captura el recordatorio o indica que no se realizó/no está disponible.' } }
  const errors: Record<string, unknown> = {}
  for (const { id } of recallMeals) {
    const meal = asRecord(meals[id])
    if (!['captured', 'notConsumed', 'unavailable'].includes(String(meal.status))) errors[id] = { status: 'Indica si hubo consumo, no hubo consumo o no hay información.' }
    else if (meal.status === 'captured' && (!Array.isArray(meal.preparations) || meal.preparations.length === 0)) errors[id] = { status: 'Agrega al menos una preparación con alimentos, o corrige el estado de este tiempo.' }
    else if (meal.status === 'captured' && Array.isArray(meal.preparations) && meal.preparations.some(item => {
      const preparation = asRecord(item)
      return !Array.isArray(preparation.foods) || preparation.foods.length === 0
    })) errors[id] = { status: 'Cada preparación necesita al menos un alimento.' }
  }
  return Object.keys(errors).length ? { recall: { meals: errors } } : {}
}
