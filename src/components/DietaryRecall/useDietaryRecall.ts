import { useCallback, useRef, useState } from 'react'
import type { FormApi, FormState } from 'informed'
import { reviewRecall, type RecallData } from './recallModel'

export function useDietaryRecall(onComplete?: (data: RecallData) => void) {
  const formApiRef = useRef<FormApi | null>(null)
  const continueRequested = useRef(false)
  const [review, setReview] = useState<RecallData | null>(null)
  const handleSubmit = ({ values }: FormState) => {
    if (continueRequested.current) { continueRequested.current = false; onComplete?.(reviewRecall(values.recall)); return }
    setReview(reviewRecall(values.recall))
  }
  const continueStep = () => { continueRequested.current = true; formApiRef.current?.submitForm() }
  const submitFailed = () => { continueRequested.current = false }
  const closeReview = useCallback(() => setReview(null), [])
  return { formApiRef, handleSubmit, continueStep, submitFailed, closeReview, review }
}
