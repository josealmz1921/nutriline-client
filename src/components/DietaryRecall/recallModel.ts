export const recallMeals = [
  { id: 'breakfast', label: 'Desayuno' }, { id: 'firstSnack', label: 'Primera colación' },
  { id: 'lunch', label: 'Comida' }, { id: 'secondSnack', label: 'Segunda colación' }, { id: 'dinner', label: 'Cena' },
] as const
export type RecallMealId = typeof recallMeals[number]['id']
export type RecallAvailability = 'captured' | 'notPerformed' | 'unavailable'
export type MealStatus = 'pending' | 'captured' | 'notConsumed' | 'unavailable'
export interface RecallFood { name: string; quantity: string; unit: string; catalogId: string }
export interface RecallPreparation { name: string; foods: RecallFood[] }
export interface RecallMeal { status: MealStatus; preparations: RecallPreparation[] }
export interface RecallData { availability: RecallAvailability | null; meals: Record<RecallMealId, RecallMeal> }

export const asRecord = (value: unknown): Record<string, unknown> => typeof value === 'object' && value !== null ? value as Record<string, unknown> : {}
export const cleanRecallText = (value: unknown) => typeof value === 'string' ? value.trim() : ''
export const recallIsInactive = (value: unknown) => ['notPerformed', 'unavailable'].includes(String(asRecord(value).availability))
export function mealIsInactive(value: unknown, mealId: RecallMealId) {
  const draft = asRecord(value)
  const meal = asRecord(asRecord(draft.meals)[mealId])
  return recallIsInactive(draft) || meal.status !== 'captured'
}

// Copia de revisión independiente del formulario; no es aún un contrato de API.
export function reviewRecall(value: unknown): RecallData {
  const draft = asRecord(value)
  const availability = ['captured', 'notPerformed', 'unavailable'].includes(String(draft.availability)) ? draft.availability as RecallAvailability : null
  const sourceMeals = asRecord(draft.meals)
  const meals = Object.fromEntries(recallMeals.map(({ id }) => {
    const meal = asRecord(sourceMeals[id])
    const status = !recallIsInactive(draft) && ['captured', 'notConsumed', 'unavailable'].includes(String(meal.status)) ? meal.status as MealStatus : 'pending'
    const preparations = status === 'captured' && Array.isArray(meal.preparations) ? meal.preparations.map(item => {
      const preparation = asRecord(item)
      return { name: cleanRecallText(preparation.name), foods: Array.isArray(preparation.foods) ? preparation.foods.map(item => {
        const food = asRecord(item)
        return { name: cleanRecallText(food.name), quantity: cleanRecallText(food.quantity).replace(',', '.'), unit: cleanRecallText(food.unit), catalogId: cleanRecallText(food.catalogId) || 'manual' }
      }) : [] }
    }) : []
    return [id, { status, preparations }]
  })) as Record<RecallMealId, RecallMeal>
  return { availability, meals }
}
