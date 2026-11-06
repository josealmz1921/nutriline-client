import { useState } from 'react'
import { useArrayFieldItemApi, useArrayFieldItemState } from 'informed'
import { recallCatalog } from '../DietaryRecall/recallCatalog'

export function useRecallFood(onDraftChange?: () => void) {
  const api = useArrayFieldItemApi()
  const { values } = useArrayFieldItemState()
  const [confirming, setConfirming] = useState(false)
  const reference = recallCatalog.find(food => food.id === values?.catalogId)
  const chooseFood = (id: string) => {
    const food = recallCatalog.find(item => item.id === id)
    if (food) { api.setValue('name', food.name); api.setValue('unit', food.unit) }
  }
  return { reference, chooseFood, confirming, requestRemoval: () => setConfirming(true), cancelRemoval: () => setConfirming(false), remove: () => { api.remove(); onDraftChange?.() } }
}
