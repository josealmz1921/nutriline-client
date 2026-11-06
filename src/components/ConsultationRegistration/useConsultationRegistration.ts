import { useParams } from 'react-router-dom'

export function useConsultationRegistration() {
  return useParams<{ patientId: string }>()
}
