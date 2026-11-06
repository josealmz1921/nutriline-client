import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import PatientRecord from './PatientRecord'

afterEach(cleanup)

function renderRecord(id: string) {
  return render(<MemoryRouter initialEntries={[`/dashboard/pacientes/${id}`]}><Routes><Route path="/dashboard/pacientes/:patientId" element={<PatientRecord />} /></Routes></MemoryRouter>)
}

describe('Expediente de demostración', () => {
  it('presenta datos personales y el detalle más reciente sin clasificar el IMC', () => {
    renderRecord('DEMO-001')
    expect(screen.getByRole('heading', { name: 'Mariana Solís Peña' })).toBeTruthy()
    expect(document.title).toBe('Expediente de Mariana Solís Peña · Nutriline')
    expect(screen.getByText('Diseñadora gráfica')).toBeTruthy()
    expect(screen.getByText('mariana.solis@example.com')).toBeTruthy()
    const detail = screen.getByRole('region', { name: 'Detalle de consulta' })
    expect(within(detail).getByText('DEMO-C003')).toBeTruthy()
    expect(within(detail).getByText('23.02')).toBeTruthy()
    expect(within(detail).getByText('kg/m²')).toBeTruthy()
    expect(within(detail).getAllByText('No registrada')).toHaveLength(2)
    expect(screen.queryByText(/sobrepeso|obesidad|peso normal/i)).toBeNull()
  })

  it('distingue consultas del mismo día por hora y conserva mediciones de cada registro', async () => {
    const user = userEvent.setup()
    renderRecord('DEMO-001')
    const list = screen.getByRole('list', { name: 'Consultas del paciente' })
    const buttons = within(list).getAllByRole('button')
    expect(buttons[0].textContent).toContain('11:30')
    expect(buttons[1].textContent).toContain('08:30')
    await user.click(screen.getByRole('button', { name: /Ver consulta:.*08:30/ }))
    const detail = screen.getByRole('region', { name: 'Detalle de consulta' })
    expect(within(detail).getByText('DEMO-C002')).toBeTruthy()
    expect(within(detail).getByText('64.30')).toBeTruthy()
    expect(within(detail).getByText('74.0')).toBeTruthy()
    expect(within(detail).getByText('98.0')).toBeTruthy()
    expect(within(detail).getByText('Sin notas registradas.')).toBeTruthy()
    expect(screen.getByRole('button', { name: /Ver consulta:.*08:30/ }).getAttribute('aria-pressed')).toBe('true')
  })

  it('pagina el historial y selecciona un detalle perteneciente a la página visible', async () => {
    const user = userEvent.setup()
    renderRecord('DEMO-001')
    await user.click(screen.getByRole('button', { name: 'Consultas siguientes' }))
    expect(screen.getByText('Página 2 de 2')).toBeTruthy()
    expect(within(screen.getByRole('region', { name: 'Detalle de consulta' })).getByText('DEMO-C001')).toBeTruthy()
    expect((screen.getByRole('button', { name: 'Consultas siguientes' }) as HTMLButtonElement).disabled).toBe(true)
    await user.click(screen.getByRole('button', { name: 'Consultas anteriores' }))
    expect(screen.getByText('Página 1 de 2')).toBeTruthy()
    expect(within(screen.getByRole('region', { name: 'Detalle de consulta' })).getByText('DEMO-C003')).toBeTruthy()
  })

  it('mantiene visible el historial de un archivado y bloquea nuevas consultas', () => {
    renderRecord('DEMO-011')
    expect(screen.getByRole('heading', { name: 'Renata Molina Cruz' })).toBeTruthy()
    expect(screen.getByText('Archivado')).toBeTruthy()
    expect((screen.getByRole('button', { name: 'Nueva consulta' }) as HTMLButtonElement).disabled).toBe(true)
    expect(screen.getByText(/el historial se conserva visible/)).toBeTruthy()
    expect(screen.getByRole('region', { name: 'Detalle de consulta' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Reactivar paciente' })).toBeTruthy()
  })

  it('presenta historial vacío y ocupación sin especificar sin inventar mediciones', () => {
    renderRecord('DEMO-006')
    expect(screen.getByRole('heading', { name: 'Aún no hay consultas' })).toBeTruthy()
    expect(screen.getByText('Sin especificar')).toBeTruthy()
    expect(screen.queryByRole('region', { name: 'Detalle de consulta' })).toBeNull()
    expect(screen.queryByText('IMC numérico')).toBeNull()
  })

  it('informa de acciones pendientes sin modificar ni archivar el paciente', async () => {
    const user = userEvent.setup()
    renderRecord('DEMO-001')
    await user.click(screen.getByRole('button', { name: 'Archivar paciente' }))
    expect(screen.getByRole('dialog').textContent).toContain('no modifica el listado')
    await user.click(screen.getByRole('button', { name: 'Entendido' }))
    expect(screen.getByText('Activo')).toBeTruthy()
  })

  it('muestra un estado de paciente no encontrado para un ID desconocido', () => {
    renderRecord('desconocido')
    expect(screen.getByRole('heading', { name: 'Paciente no encontrado' })).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Nueva consulta' })).toBeNull()
    expect(screen.getByRole('link', { name: 'Volver a pacientes' }).getAttribute('href')).toBe('/dashboard/pacientes')
  })
})
