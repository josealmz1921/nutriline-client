import { useState } from 'react'
import { useArrayFieldItemApi } from 'informed'

export function useHabitActivity(onDraftChange?: () => void) {
  const { remove } = useArrayFieldItemApi()
  const [confirming, setConfirming] = useState(false)
  return { confirming, remove: () => { remove(); onDraftChange?.() }, requestRemoval: () => setConfirming(true), cancelRemoval: () => setConfirming(false) }
}
