import { useFormApi, useFormStateSelector, type ArrayFieldApi } from 'informed'
import { createRef, useState } from 'react'
import { recallIsInactive, recallMeals, reviewRecall, type RecallMealId } from '../DietaryRecall/recallModel'
import { devRecallPreparation } from '../DevFormTools/devFormExamples'

export function useRecallFields(onDraftChange?: () => void) {
  const api = useFormApi()
  const [arrayRefs] = useState(() => Object.fromEntries(recallMeals.map(meal => [meal.id, createRef<ArrayFieldApi>()])) as Record<RecallMealId, { current: ArrayFieldApi | null }>)
  const snapshot = useFormStateSelector(state => JSON.stringify(state.values.recall ?? null))
  const value: unknown = JSON.parse(snapshot)
  const fillDevRows = () => {
    if (!import.meta.env.DEV || api.getValue('recall.availability') !== 'captured') return 0
    let count = 0
    for (const { id } of recallMeals) {
      const rows = api.getValue(`recall.meals.${id}.preparations`)
      if (api.getValue(`recall.meals.${id}.status`) === 'captured' && (rows == null || (Array.isArray(rows) && rows.length === 0)) && arrayRefs[id].current) {
        arrayRefs[id].current.addWithInitialValue(devRecallPreparation(id)); count++
      }
    }
    if (count) onDraftChange?.()
    return count
  }
  return { inactive: recallIsInactive(value), review: reviewRecall(value), arrayRefs, fillDevRows }
}
