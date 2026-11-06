import { useRef } from 'react'
import type { FormApi, FormState } from 'informed'
import { symptoms } from '../PatientRegistration/assessmentSections'

export interface ConsultationInformationData { occurredAt: string; measuredAt: string; reason: string; notes: string; symptoms: string[] }
export function useConsultationInformation(onComplete: (data: ConsultationInformationData) => void) {
  const formApiRef = useRef<FormApi | null>(null)
  const handleSubmit = ({ values }: FormState) => onComplete({
    occurredAt: String(values.occurredAt), measuredAt: String(values.measuredAt), reason: String(values.reason).trim(),
    notes: String(values.notes ?? '').trim(), symptoms: symptoms.filter(item => (values.symptoms as Record<string, unknown> | undefined)?.[item.id] === true).map(item => item.label),
  })
  return { formApiRef, handleSubmit, continueStep: () => formApiRef.current?.submitForm(), timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone }
}
