import { useCallback, useEffect, useRef, useState } from 'react'
import type { FormApi, FormState } from 'informed'
import { useNavigate } from 'react-router-dom'
import { demoPatientRecords } from '../PatientRecord/demoPatientRecords'
import { filterConsultations, flattenConsultations, type ConsultationFilters } from './consultationDirectory'

export const initialFilters: ConsultationFilters = { query: '', status: 'all', order: 'recent', fromDate: '', toDate: '' }
const pageSize = 5
const entries = flattenConsultations(demoPatientRecords)
const activePatients = demoPatientRecords.filter(patient => patient.status === 'active')

export function useConsultations() {
  const navigate = useNavigate()
  const headingRef = useRef<HTMLHeadingElement>(null)
  const formApi = useRef<FormApi | null>(null)
  const [filters, setFilters] = useState<ConsultationFilters>(initialFilters)
  const [preview, setPreview] = useState('ready')
  const [page, setPage] = useState(1)
  const [choosingPatient, setChoosingPatient] = useState(false)
  useEffect(() => { document.title = 'Consultas · Nutriline'; headingRef.current?.focus() }, [])
  const invalidRange = Boolean(filters.fromDate && filters.toDate && filters.fromDate > filters.toDate)
  const source = preview === 'empty' ? [] : entries
  const filtered = invalidRange ? [] : filterConsultations(source, filters)
  const total = filtered.length
  const pageCount = Math.max(1, Math.ceil(total / pageSize))
  const currentPage = Math.min(page, pageCount)
  const handleFormChange = ({ values }: FormState) => {
    setFilters({ query: String(values.query ?? ''),
      status: values.status === 'active' || values.status === 'archived' ? values.status : 'all',
      order: values.order === 'oldest' || values.order === 'patient' ? values.order : 'recent',
      fromDate: String(values.fromDate ?? ''), toDate: String(values.toDate ?? '') })
    setPreview(['loading', 'empty', 'error'].includes(String(values.preview)) ? String(values.preview) : 'ready')
    setPage(1)
  }
  const resetFilters = () => { formApi.current?.reset(); setPage(1) }
  const closePatientChoice = useCallback(() => setChoosingPatient(false), [])
  const openNewConsultation = ({ values }: FormState) => {
    const patient = activePatients.find(item => item.id === values.patientId)
    if (patient) navigate(`/dashboard/pacientes/${patient.id}/consultas/nueva`)
  }
  return {
    headingRef, formApi, filters, preview, invalidRange, total, currentPage, pageCount, setPage, handleFormChange, resetFilters,
    entries: filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    from: total ? (currentPage - 1) * pageSize + 1 : 0, to: Math.min(currentPage * pageSize, total),
    registeredCount: entries.length, patientCount: new Set(entries.map(entry => entry.patient.id)).size,
    archivedCount: entries.filter(entry => entry.patient.status === 'archived').length,
    hasFilters: Boolean(filters.query.trim() || filters.status !== 'all' || filters.fromDate || filters.toDate),
    clearQuery: () => formApi.current?.setValue('query', ''),
    resetPreview: () => formApi.current?.setValue('preview', 'ready'),
    choosingPatient, showPatientChoice: () => setChoosingPatient(true), closePatientChoice, openNewConsultation,
    patientOptions: activePatients.map(patient => ({ value: patient.id, label: `${patient.name} · ${patient.id}` })),
  }
}
