import { useRef } from 'react'
import type { FormApi, FormState } from 'informed'

export function useAnthropometry(onComplete?: (values: Record<string, unknown>) => void) {
  const formApiRef = useRef<FormApi | null>(null)
  const continueStep = () => formApiRef.current?.submitForm()
  const handleSubmit = ({ values }: FormState) => onComplete?.({ ...values })
  return { formApiRef, continueStep, handleSubmit }
}
