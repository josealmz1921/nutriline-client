import { useCallback, useRef, useState } from 'react'
import type { FormApi, FormState } from 'informed'
import { reviewBiochemistry, type BiochemistryData } from './biochemistryModel'

export function useBiochemistry(onComplete?: (data: BiochemistryData) => void) {
  const formApiRef = useRef<FormApi | null>(null)
  const continueRequested = useRef(false)
  const [review, setReview] = useState<BiochemistryData | null>(null)
  const handleSubmit = ({ values }: FormState) => {
    if (continueRequested.current) { continueRequested.current = false; onComplete?.(reviewBiochemistry(values.biochemistry)); return }
    setReview(reviewBiochemistry(values.biochemistry))
  }
  const continueStep = () => { continueRequested.current = true; formApiRef.current?.submitForm() }
  const submitFailed = () => { continueRequested.current = false }
  const closeReview = useCallback(() => setReview(null), [])
  return { review, handleSubmit, closeReview, formApiRef, continueStep, submitFailed }
}
