import type { PatientRecordPreview } from '../PatientRecord/types'

export function workspaceOverview(patients: readonly PatientRecordPreview[]) {
  const active = patients.filter(patient => patient.status === 'active')
  const recentActivity = patients.flatMap(patient => {
    const latest = [...patient.consultations].sort((a, b) => Date.parse(b.occurredAt) - Date.parse(a.occurredAt) || b.id.localeCompare(a.id))[0]
    return latest ? [{ patient, consultation: latest }] : []
  }).sort((a, b) => Date.parse(b.consultation.occurredAt) - Date.parse(a.consultation.occurredAt) || a.patient.id.localeCompare(b.patient.id)).slice(0, 4)
  return {
    totalPatients: patients.length,
    activePatients: active.length,
    archivedPatients: patients.length - active.length,
    consultations: patients.reduce((total, patient) => total + patient.consultations.length, 0),
    withoutConsultations: active.filter(patient => patient.consultations.length === 0).length,
    recentActivity,
  }
}
