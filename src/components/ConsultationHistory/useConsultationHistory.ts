import { useState } from 'react'
import type { ConsultationPreview } from '../PatientRecord/types'

const pageSize = 2

export function useConsultationHistory(consultations: readonly ConsultationPreview[]) {
  const [page, setPage] = useState(1)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const sorted = [...consultations].sort((a, b) => Date.parse(b.occurredAt) - Date.parse(a.occurredAt) || b.id.localeCompare(a.id))
  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize))
  const currentPage = Math.min(page, pageCount)
  const visible = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  const selected = visible.find(consultation => consultation.id === selectedId) ?? visible[0]
  return {
    visible, selected, currentPage, pageCount, total: sorted.length,
    from: sorted.length ? (currentPage - 1) * pageSize + 1 : 0,
    to: Math.min(currentPage * pageSize, sorted.length),
    selectConsultation: setSelectedId,
    previousPage: () => setPage(Math.max(1, currentPage - 1)),
    nextPage: () => setPage(Math.min(pageCount, currentPage + 1)),
  }
}
