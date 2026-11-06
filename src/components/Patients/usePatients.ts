import { useEffect, useRef, useState } from 'react'
import type { FormApi, FormState } from 'informed'
import { demoPatients } from './demoPatients'
import type { ListPreview, PatientOrder, PatientStatus } from './types'
import { useNavigate } from 'react-router-dom'

const pageSize = 5
const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es').trim()

export function usePatients() {
  const navigate = useNavigate()
  useEffect(() => { document.title = 'Pacientes · Nutriline' }, [])
  const formApi = useRef<FormApi | null>(null)
  const [query, setQuery] = useState('')
  const [order, setOrder] = useState<PatientOrder>('recent')
  const [preview, setPreview] = useState<ListPreview>('ready')
  const [status, setStatus] = useState<PatientStatus>('active')
  const [page, setPage] = useState(1)
  const source = preview === 'empty' ? [] : demoPatients
  const counts = {
    active: source.filter(patient => patient.status === 'active').length,
    archived: source.filter(patient => patient.status === 'archived').length,
  }
  const term = normalize(query)
  const digits = query.replace(/\D/g, '')
  const filtered = source.filter(patient => patient.status === status && (
    !term || normalize(`${patient.name} ${patient.email} ${patient.phone}`).includes(term) ||
    (digits.length > 0 && /^[+\d\s()-]+$/.test(query) && patient.phone.replace(/\D/g, '').includes(digits))
  )).sort((a, b) => {
    if (order === 'name') return a.name.localeCompare(b.name, 'es')
    if (order === 'visit') return (b.lastVisit ?? '').localeCompare(a.lastVisit ?? '') || a.name.localeCompare(b.name, 'es')
    return b.registeredAt.localeCompare(a.registeredAt)
  })
  const total = filtered.length
  const pageCount = Math.max(1, Math.ceil(total / pageSize))
  const currentPage = Math.min(page, pageCount)
  const from = total ? (currentPage - 1) * pageSize + 1 : 0
  const to = Math.min(currentPage * pageSize, total)
  const patients = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const handleFormChange = ({ values }: FormState) => {
    setQuery(typeof values.query === 'string' ? values.query : '')
    setOrder(values.order === 'name' || values.order === 'visit' ? values.order : 'recent')
    setPreview(values.preview === 'loading' || values.preview === 'empty' || values.preview === 'error' ? values.preview : 'ready')
    setPage(1)
  }
  const changeStatus = (next: PatientStatus) => { setStatus(next); setPage(1) }
  const clearSearch = () => { formApi.current?.setValue('query', ''); setPage(1) }
  const resetPreview = () => formApi.current?.setValue('preview', 'ready')
  const openRegistration = () => navigate('/dashboard/pacientes/nuevo')

  return { formApi, query, status, preview, counts, totalRegistered: source.length,
    patients, total, currentPage, pageCount, from, to, setPage, handleFormChange,
    changeStatus, clearSearch, resetPreview, openRegistration }
}
