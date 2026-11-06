import { recallNutrients, type RecallNutrientId } from './recallNutrients'

export interface RecallCatalogFood {
  id: string; name: string; quantity: number; unit: string
  nutrients: Record<RecallNutrientId, number | null>
}

// Subconjunto EXACTO de nutrilinedb.sql, tabla alimentos, columnas energiaKcal…Eanol.
// No es el catálogo completo ni datos clínicamente validados. No usar en producción.
const source = [
  { id: '1231', name: 'Manzana', quantity: 1, unit: 'pieza', values: [55,231,0.3,0.2,14.7,2.6,5.4,6.2,3.1,0.2,0,0,0,122.4,11,0,38,5.6,0,0,0,0,0,0] },
  { id: '2067', name: 'Tortilla de maíz', quantity: 1, unit: 'pieza', values: [64,268,1.4,0.5,13.6,0.6,0,0,0,0,58.8,0.8,0,0,0,0,52,15.6,0,0,0,0,0,0] },
  { id: '138', name: 'Arroz cocido', quantity: 0.25, unit: 'taza', values: [60,252,1.1,0.1,13.3,0.1,0,0,26,0,1.4,0.7,0,0,0,0,64,29.8,0,0,0,0,0,0] },
  { id: '1094', name: 'Leche descremada', quantity: 1, unit: 'taza', values: [86,359,8.4,0.4,11.9,0,149,0,0,0,302,0,126,0,0,0,0,0,4,0,0,0,0,0] },
  { id: '18', name: 'Aceite de oliva', quantity: 1, unit: 'cucharadita', values: [44,185,0,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0.7,3.7,0.4,0] },
  { id: '1748', name: 'Plátano', quantity: 0.5, unit: 'pieza', values: [48,202,0.6,0.2,12.4,1.4,4.3,4.8,10.5,0.2,0,0,0,215.2,6.7,0,52,6.5,0,0,0,0,0,0] },
]

export const recallCatalog: readonly RecallCatalogFood[] = source.map(food => ({
  id: food.id, name: food.name, quantity: food.quantity, unit: food.unit,
  nutrients: Object.fromEntries(recallNutrients.map((nutrient, index) => [nutrient.id, food.values[index] ?? null])) as RecallCatalogFood['nutrients'],
}))
