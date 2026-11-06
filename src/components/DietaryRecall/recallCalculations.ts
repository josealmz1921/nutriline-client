import { recallCatalog } from './recallCatalog'
import { recallMeals, type RecallData, type RecallFood } from './recallModel'
import { recallNutrients } from './recallNutrients'

export function recallQuantity(value: unknown): number | null {
  if (typeof value !== 'string' || value.length > 12 || !/^\d+(?:[.,]\d+)?$/.test(value.trim())) return null
  const number = Number(value.trim().replace(',', '.'))
  return Number.isFinite(number) && number > 0 ? number : null
}

export function foodReference(food: RecallFood) {
  const reference = recallCatalog.find(item => item.id === food.catalogId)
  const quantity = recallQuantity(food.quantity)
  if (!reference || quantity === null || food.name.trim() !== reference.name || food.unit.trim() !== reference.unit) return null
  return { reference, factor: quantity / reference.quantity }
}

export function calculateRecall(data: RecallData) {
  const meals = recallMeals.map(meal => data.meals[meal.id])
  const foods = meals.flatMap(meal => meal.status === 'captured' ? meal.preparations.flatMap(preparation => preparation.foods) : [])
  const unknownMeals = meals.filter(meal => ['pending', 'unavailable'].includes(meal.status) || (meal.status === 'captured' && (!meal.preparations.length || meal.preparations.some(prep => !prep.foods.length)))).length
  const references = foods.map(foodReference)
  const active = data.availability === 'captured'
  return recallNutrients.map(nutrient => {
    const contributions = references.map(item => {
      const value = item?.reference.nutrients[nutrient.id]
      const result = item && value != null ? value * item.factor : null
      return result !== null && Number.isFinite(result) ? result : null
    })
    const count = contributions.filter(value => value !== null).length
    const sum = contributions.reduce<number>((total, value) => total + (value ?? 0), 0)
    const subtotal = active && nutrient.additive && Number.isFinite(sum) && (count > 0 || (unknownMeals === 0 && foods.length === 0)) ? sum : null
    const complete = active && nutrient.additive && unknownMeals === 0 && count === foods.length && subtotal !== null
    return { ...nutrient, subtotal, value: complete ? subtotal : null, count, foodCount: foods.length, unknownMeals }
  })
}
