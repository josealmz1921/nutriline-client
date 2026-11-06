import type { PatientPreview } from '../Patients/types'

export interface ConsultationPreview {
  id: string
  occurredAt: string
  reason: string
  notes: string | null
  weightKg: string
  heightCm: string
  waistCm: string | null
  hipCm: string | null
  bmi: string
}

export interface PatientRecordPreview extends PatientPreview {
  birthDate: string
  occupation: string | null
  consultations: readonly ConsultationPreview[]
}
