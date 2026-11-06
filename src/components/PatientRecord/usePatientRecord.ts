import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { demoPatientRecords } from './demoPatientRecords'

export function usePatientRecord() {
  const navigate = useNavigate()
  const { patientId } = useParams<{ patientId: string }>()
  const patient = demoPatientRecords.find(item => item.id === patientId)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const [pending, setPending] = useState<{ patientId: string; message: string } | null>(null)
  useEffect(() => {
    document.title = `${patient ? `Expediente de ${patient.name}` : 'Paciente no encontrado'} · Nutriline`
    headingRef.current?.focus()
  }, [patient])
  const showPending = (message: string) => { if (patientId) setPending({ patientId, message }) }
  const closePending = useCallback(() => setPending(null), [])
  return {
    patient, headingRef, pendingMessage: pending && pending.patientId === patientId ? pending.message : null, closePending,
    openEdit: () => { if (patient) navigate(`/dashboard/pacientes/${patient.id}/editar`) },
    previewArchive: () => showPending('La acción de archivar o reactivar se incorporará después. Esta vista conserva el estado ficticio del paciente y no modifica el listado.'),
    openConsultation: () => { if (patient?.status === 'active') navigate(`/dashboard/pacientes/${patient.id}/consultas/nueva`) },
  }
}
