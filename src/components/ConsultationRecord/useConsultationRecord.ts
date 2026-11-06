import { useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { demoPatientRecords } from '../PatientRecord/demoPatientRecords'
import { flattenConsultations } from '../Consultations/consultationDirectory'

const entries = flattenConsultations(demoPatientRecords)

export function useConsultationRecord() {
  const { consultationId } = useParams<{ consultationId: string }>()
  const entry = entries.find(item => item.consultation.id === consultationId)
  const headingRef = useRef<HTMLHeadingElement>(null)
  useEffect(() => {
    document.title = `${entry ? `Consulta ${entry.consultation.id}` : 'Consulta no encontrada'} · Nutriline`
    headingRef.current?.focus()
  }, [entry])
  return { entry, headingRef }
}
