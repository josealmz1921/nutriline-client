export const consultationSteps = [
  { id: 'information', label: 'Datos de consulta', available: true },
  { id: 'anthropometry', label: 'Antropometría', available: true },
  { id: 'biochemistry', label: 'Bioquímica', available: true },
  { id: 'recall', label: 'Recordatorio de 24 horas', available: true },
  { id: 'habits', label: 'Hábitos', available: true },
  { id: 'reports', label: 'Fórmulas y revisión', available: true },
] as const
export type ConsultationStep = typeof consultationSteps[number]['id']
