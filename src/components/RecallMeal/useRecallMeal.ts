import { useFieldState, type ArrayFieldApi } from 'informed'
import type { RecallMealId } from '../DietaryRecall/recallModel'

export function useRecallMeal(id: RecallMealId, onDraftChange?: () => void) {
  const { value } = useFieldState(`recall.meals.${id}.status`)
  const addPreparation = (add: ArrayFieldApi['addWithInitialValue']) => { add({ name: '', foods: [] }); onDraftChange?.() }
  return { captured: value === 'captured', addPreparation }
}
