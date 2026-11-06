import { afterEach, expect, it } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import ConsultationRecord from './ConsultationRecord'

afterEach(cleanup)
function renderRecord(id: string) {
  render(<MemoryRouter initialEntries={[`/dashboard/consultas/${id}`]}><Routes><Route path="/dashboard/consultas/:consultationId" element={<ConsultationRecord />} /></Routes></MemoryRouter>)
}

it('abre una consulta concreta con sus mediciones, no la última del paciente', () => {
  renderRecord('DEMO-C002')
  expect(screen.getByRole('heading', { level: 1, name: 'Consulta DEMO-C002' })).toBeTruthy()
  expect(screen.getByText('64.30')).toBeTruthy()
  expect(screen.getByText('74.0')).toBeTruthy()
  expect(screen.getByText('Sin notas registradas.')).toBeTruthy()
  expect(screen.getByRole('link', { name: 'Ver expediente' }).getAttribute('href')).toBe('/dashboard/pacientes/DEMO-001')
  expect(screen.getByRole('link', { name: 'Volver a consultas' }).getAttribute('href')).toBe('/dashboard/consultas')
  expect(document.title).toBe('Consulta DEMO-C002 · Nutriline')
})

it('conserva acceso al historial de pacientes archivados sin permitir crear consultas', () => {
  renderRecord('DEMO-011-C001')
  expect(screen.getByText(/El paciente está archivado/)).toBeTruthy()
  expect(screen.getByRole('region', { name: 'Detalle de consulta' })).toBeTruthy()
  expect(screen.queryByRole('button', { name: 'Nueva consulta' })).toBeNull()
})

it('muestra consulta no encontrada para un identificador desconocido', () => {
  renderRecord('no-existe')
  expect(screen.getByRole('heading', { name: 'Consulta no encontrada' })).toBeTruthy()
  expect(screen.queryByRole('region', { name: 'Detalle de consulta' })).toBeNull()
})
