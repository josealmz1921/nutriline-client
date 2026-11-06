import { useCallback, useEffect, useRef, useState } from 'react'
import type { FormState } from 'informed'
import { useParams } from 'react-router-dom'
import { demoPatientRecords } from '../PatientRecord/demoPatientRecords'
import { editableFields, normalizePatientEditingValues, patientEditingValues, type PatientEditingValues } from './patientEditingValues'

export function usePatientEditing() {
  const { patientId } = useParams<{ patientId: string }>()
  const patient = demoPatientRecords.find(item => item.id === patientId)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const [review, setReview] = useState<{ patientId: string; values: PatientEditingValues } | null>(null)
  const [unchangedPatientId, setUnchangedPatientId] = useState<string | null>(null)
  useEffect(() => {
    document.title = `${patient ? `Editar paciente · ${patient.name}` : 'Paciente no encontrado'} · Nutriline`
    headingRef.current?.focus()
  }, [patient])
  const initialValues = patient ? patientEditingValues(patient) : undefined
  const handleSubmit = ({ values }: FormState) => {
    if (!patient || !initialValues) return
    const proposed = normalizePatientEditingValues(values)
    const original = normalizePatientEditingValues({ ...initialValues })
    if (!editableFields.some(({ key }) => original[key] !== proposed[key])) {
      setUnchangedPatientId(patient.id)
      return
    }
    setUnchangedPatientId(null)
    setReview({ patientId: patient.id, values: proposed })
  }
  const closeReview = useCallback(() => setReview(null), [])
  const clearUnchanged = useCallback(() => setUnchangedPatientId(null), [])
  return { patient, headingRef, initialValues, handleSubmit, closeReview, clearUnchanged,
    today: new Date().toISOString().slice(0, 10),
    unchanged: Boolean(patientId && unchangedPatientId === patientId),
    review: review && review.patientId === patientId ? review.values : null }
}
