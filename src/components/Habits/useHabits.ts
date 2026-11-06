import { useRef, useState } from 'react'
import type { FormApi, FormState } from 'informed'
import { reviewHabits, type HabitsData } from './habitsModel'

export function useHabits(onComplete: (data: HabitsData) => void) {
  const formApiRef = useRef<FormApi | null>(null)
  const continueRequested = useRef(false)
  const [review, setReview] = useState<HabitsData | null>(null)
  const handleSubmit = ({ values }: FormState) => {
    const data = reviewHabits(values.habits)
    if (continueRequested.current) { continueRequested.current = false; onComplete(data) } else setReview(data)
  }
  return { formApiRef, handleSubmit, review, closeReview: () => setReview(null), submitFailed: () => { continueRequested.current = false },
    continueStep: () => { continueRequested.current = true; formApiRef.current?.submitForm() } }
}
