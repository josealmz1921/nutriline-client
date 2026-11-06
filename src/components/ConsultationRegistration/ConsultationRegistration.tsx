import ConsultationWizard from '../ConsultationWizard'
import { useConsultationRegistration } from './useConsultationRegistration'

export default function ConsultationRegistration() {
  const { patientId } = useConsultationRegistration()
  // Cambiar de paciente reinicia todos los formularios y las confirmaciones.
  return <ConsultationWizard key={patientId} />
}
