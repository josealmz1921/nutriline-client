import type { PatientRecordPreview, ConsultationPreview } from '../PatientRecord/types'

export interface ConsultationEntry {
  patient: PatientRecordPreview
  consultation: ConsultationPreview
}
export interface ConsultationFilters {
  query: string
  status: 'all' | 'active' | 'archived'
  order: 'recent' | 'oldest' | 'patient'
  fromDate: string
  toDate: string
}

const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es').trim()
const dateParts = new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'America/Mexico_City' })

export function consultationDate(instant: string) {
  const parts = dateParts.formatToParts(new Date(instant))
  return ['year', 'month', 'day'].map(type => parts.find(part => part.type === type)?.value).join('-')
}

export function flattenConsultations(patients: readonly PatientRecordPreview[]): ConsultationEntry[] {
  return patients.flatMap(patient => patient.consultations.map(consultation => ({ patient, consultation })))
}

export function filterConsultations(entries: readonly ConsultationEntry[], filters: ConsultationFilters) {
  const term = normalize(filters.query)
  return entries.filter(({ patient, consultation }) => {
    const date = consultationDate(consultation.occurredAt)
    return (filters.status === 'all' || patient.status === filters.status) &&
      (!term || normalize(`${patient.name} ${patient.id} ${consultation.id} ${consultation.reason}`).includes(term)) &&
      (!filters.fromDate || date >= filters.fromDate) && (!filters.toDate || date <= filters.toDate)
  }).sort((a, b) => {
    const chronological = Date.parse(b.consultation.occurredAt) - Date.parse(a.consultation.occurredAt)
    if (filters.order === 'patient') return a.patient.name.localeCompare(b.patient.name, 'es') || chronological || a.consultation.id.localeCompare(b.consultation.id)
    return (filters.order === 'oldest' ? -chronological : chronological) || a.consultation.id.localeCompare(b.consultation.id)
  })
}
