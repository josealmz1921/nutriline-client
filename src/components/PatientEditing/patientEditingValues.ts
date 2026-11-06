import type { PatientRecordPreview } from '../PatientRecord/types'

export interface PatientEditingValues {
  fullName: string
  birthDate: string
  occupation: string | null
  email: string | null
  phone: string | null
}

export const editableFields = [
  { key: 'fullName', label: 'Nombre completo' },
  { key: 'birthDate', label: 'Fecha de nacimiento' },
  { key: 'occupation', label: 'Ocupación' },
  { key: 'email', label: 'Correo electrónico' },
  { key: 'phone', label: 'Teléfono' },
] as const

export function patientEditingValues(patient: PatientRecordPreview): PatientEditingValues {
  return { fullName: patient.name, birthDate: patient.birthDate, occupation: patient.occupation, email: patient.email || null, phone: patient.phone || null }
}

export function normalizePatientEditingValues(values: Record<string, unknown>): PatientEditingValues {
  const optional = (key: string) => String(values[key] ?? '').trim() || null
  return { fullName: String(values.fullName ?? '').trim(), birthDate: String(values.birthDate ?? ''),
    occupation: optional('occupation'), email: optional('email')?.toLowerCase() ?? null, phone: optional('phone') }
}
