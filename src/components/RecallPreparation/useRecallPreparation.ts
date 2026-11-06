import { useState } from 'react'
import { useArrayFieldItemApi, type ArrayFieldApi } from 'informed'

export function useRecallPreparation(onDraftChange?: () => void) {
  const { remove } = useArrayFieldItemApi()
  const [confirming, setConfirming] = useState(false)
  const addFood = (add: ArrayFieldApi['addWithInitialValue']) => { add({ catalogId: 'manual', name: '', quantity: '', unit: '' }); onDraftChange?.() }
  return { confirming, addFood, remove: () => { remove(); onDraftChange?.() }, requestRemoval: () => setConfirming(true), cancelRemoval: () => setConfirming(false) }
}
