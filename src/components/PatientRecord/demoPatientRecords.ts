import { demoPatients } from '../Patients/demoPatients'
import type { ConsultationPreview, PatientRecordPreview } from './types'

// Fechas y ocupaciones sintéticas. Las edades del directorio son ejemplos al 05/11/2026.
const personalDetails: Record<string, { birthDate: string; occupation: string | null }> = {
  'DEMO-001': { birthDate: '1994-08-14', occupation: 'Diseñadora gráfica' },
  'DEMO-002': { birthDate: '1981-03-12', occupation: 'Docente' },
  'DEMO-003': { birthDate: '1998-06-20', occupation: 'Arquitecta' },
  'DEMO-004': { birthDate: '1975-01-18', occupation: 'Comerciante' },
  'DEMO-005': { birthDate: '1990-05-09', occupation: 'Ingeniera' },
  'DEMO-006': { birthDate: '2002-09-11', occupation: null },
  'DEMO-007': { birthDate: '1987-04-22', occupation: 'Docente' },
  'DEMO-008': { birthDate: '1983-02-16', occupation: 'Diseñador' },
  'DEMO-009': { birthDate: '1996-07-30', occupation: 'Comerciante' },
  'DEMO-010': { birthDate: '1979-03-03', occupation: null },
  'DEMO-011': { birthDate: '1992-09-17', occupation: 'Arquitecta' },
  'DEMO-012': { birthDate: '1970-06-24', occupation: 'Docente' },
  'DEMO-013': { birthDate: '1997-02-08', occupation: null },
}

function makeConsultation(id: string, occurredAt: string, reason: string, weightKg = '64.200', notes: string | null = 'Nota de demostración: revisión de hábitos y horarios de alimentación. No corresponde a una consulta real.'): ConsultationPreview {
  // Cálculo exclusivo de fixtures. Al conectar la API se usará el IMC del servidor.
  return { id, occurredAt, reason, notes, weightKg, heightCm: '167.000', waistCm: null, hipCm: null,
    bmi: (Number(weightKg) / (1.67 ** 2)).toFixed(2) }
}

export const demoPatientRecords: readonly PatientRecordPreview[] = demoPatients.map(patient => ({
  ...patient,
  ...personalDetails[patient.id],
  consultations: !patient.lastVisit ? [] : patient.id === 'DEMO-001' ? [
    makeConsultation('DEMO-C003', `${patient.lastVisit}T17:30:00Z`, 'Seguimiento nutricional'),
    { ...makeConsultation('DEMO-C002', `${patient.lastVisit}T14:30:00Z`, 'Registro de mediciones', '64.300', null), waistCm: '74.000', hipCm: '98.000' },
    makeConsultation('DEMO-C001', `${patient.lastVisit}T13:30:00Z`, 'Consulta inicial', '64.500'),
  ] : [makeConsultation(`${patient.id}-C001`, `${patient.lastVisit}T16:00:00Z`, 'Consulta de demostración')],
}))
