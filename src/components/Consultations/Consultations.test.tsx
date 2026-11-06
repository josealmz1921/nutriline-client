import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import Consultations from './Consultations'
import { consultationDate, filterConsultations, flattenConsultations, type ConsultationFilters } from './consultationDirectory'
import { demoPatientRecords } from '../PatientRecord/demoPatientRecords'

afterEach(cleanup)
const renderConsultations = () => render(<MemoryRouter><Consultations /></MemoryRouter>)
const defaultFilters: ConsultationFilters = { query: '', status: 'all', order: 'recent', fromDate: '', toDate: '' }

describe('Historial general de consultas', () => {
  it('pagina los registros por instante y conserva consultas del mismo día', async () => {
    const user = userEvent.setup()
    renderConsultations()
    expect(document.title).toBe('Consultas · Nutriline')
    const table = screen.getByRole('table', { name: 'Historial general de consultas' })
    expect(within(table).getAllByRole('row')).toHaveLength(6)
    expect(within(table).getAllByText('Mariana Solís Peña')).toHaveLength(3)
    expect(within(table).getByText(/11:30/)).toBeTruthy()
    expect(screen.getByText('1–5 de 12 consultas')).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Página siguiente' }))
    expect(screen.getByText('6–10 de 12 consultas')).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Página siguiente' }))
    expect(screen.getByText('11–12 de 12 consultas')).toBeTruthy()
    expect((screen.getByRole('button', { name: 'Página siguiente' }) as HTMLButtonElement).disabled).toBe(true)
  })

  it('busca sin acentos, por motivo e identificador y reinicia la página', async () => {
    const user = userEvent.setup()
    renderConsultations()
    await user.click(screen.getByRole('button', { name: 'Página siguiente' }))
    await user.type(screen.getByLabelText('Buscar consultas'), 'sofia')
    expect(await screen.findByText('Sofía Valenzuela Duque')).toBeTruthy()
    expect(screen.getByText('Página 1 de 1')).toBeTruthy()
    await user.clear(screen.getByLabelText('Buscar consultas'))
    await user.type(screen.getByLabelText('Buscar consultas'), 'Registro de mediciones')
    expect(await screen.findByText('DEMO-C002')).toBeTruthy()
    await user.clear(screen.getByLabelText('Buscar consultas'))
    await user.type(screen.getByLabelText('Buscar consultas'), 'DEMO-C001')
    expect(await screen.findByRole('link', { name: 'Ver consulta DEMO-C001 de Mariana Solís Peña' })).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Limpiar búsqueda' }))
    expect(await screen.findByText('1–5 de 12 consultas')).toBeTruthy()
  })

  it('filtra pacientes archivados sin ocultar su historial', async () => {
    const user = userEvent.setup()
    renderConsultations()
    await user.click(screen.getByRole('combobox', { name: 'Estado del paciente' }))
    await user.click(screen.getByRole('option', { name: 'Pacientes archivados' }))
    expect(await screen.findByText('Renata Molina Cruz')).toBeTruthy()
    expect(screen.getByText('Emilio Paredes Gil')).toBeTruthy()
    expect(screen.getByText('1–2 de 2 consultas')).toBeTruthy()
    expect(screen.queryByText('Mariana Solís Peña')).toBeNull()
  })

  it('filtra días inclusivos y explica un intervalo invertido', async () => {
    const user = userEvent.setup()
    renderConsultations()
    fireEvent.change(screen.getByLabelText('Desde'), { target: { value: '2026-11-05' } })
    fireEvent.change(screen.getByLabelText('Hasta'), { target: { value: '2026-11-05' } })
    expect(await screen.findByText('1–3 de 3 consultas')).toBeTruthy()
    fireEvent.change(screen.getByLabelText('Desde'), { target: { value: '2026-11-06' } })
    expect(await screen.findByRole('alert')).toBeTruthy()
    expect(screen.queryByRole('table')).toBeNull()
    await user.click(screen.getAllByRole('button', { name: 'Restablecer filtros' })[0])
    expect(await screen.findByText('1–5 de 12 consultas')).toBeTruthy()
    expect((screen.getByLabelText('Desde') as HTMLInputElement).value).toBe('')
  })

  it('ordena por antigüedad y muestra un estado sin coincidencias', async () => {
    const user = userEvent.setup()
    renderConsultations()
    await user.click(screen.getByRole('combobox', { name: 'Ordenar por' }))
    await user.click(screen.getByRole('option', { name: 'Más antiguas' }))
    const rows = within(screen.getByRole('table')).getAllByRole('row')
    expect(rows[1].textContent).toContain('Emilio Paredes Gil')
    await user.type(screen.getByLabelText('Buscar consultas'), 'sin coincidencias')
    expect(await screen.findByRole('heading', { name: 'No encontramos consultas' })).toBeTruthy()
    expect(screen.queryByRole('table')).toBeNull()
  })

  it('permite explorar estados simulados de carga, vacío y error', async () => {
    const user = userEvent.setup()
    renderConsultations()
    await user.click(screen.getByText('Previsualizar estados de la lista'))
    const choose = async (label: string) => {
      await user.click(screen.getByRole('combobox', { name: 'Estado de la interfaz' }))
      await user.click(screen.getByRole('option', { name: label }))
    }
    await choose('Cargando')
    expect(await screen.findByRole('heading', { name: 'Cargando consultas…' })).toBeTruthy()
    await choose('Sin consultas')
    expect(await screen.findByRole('heading', { name: 'Aún no hay consultas' })).toBeTruthy()
    await choose('Error de carga')
    expect(screen.getByRole('alert').textContent).toContain('error simulado')
    await user.click(screen.getByRole('button', { name: 'Restablecer vista' }))
    expect(await screen.findByRole('table')).toBeTruthy()
  })

  it('pide elegir un paciente activo sin ofrecer archivados para consultas nuevas', async () => {
    const user = userEvent.setup()
    renderConsultations()
    await user.click(screen.getByRole('button', { name: 'Nueva consulta' }))
    const dialog = screen.getByRole('dialog', { name: 'Elegir paciente para nueva consulta' })
    await user.click(within(dialog).getByRole('button', { name: 'Continuar al formulario' }))
    expect(await within(dialog).findByText('Selecciona un paciente activo.')).toBeTruthy()
    expect(document.activeElement).toBe(within(dialog).getByRole('combobox', { name: 'Paciente' }))
    await user.click(within(dialog).getByRole('combobox', { name: 'Paciente' }))
    expect(screen.getAllByRole('option')).toHaveLength(10)
    expect(screen.queryByRole('option', { name: /Renata/ })).toBeNull()
    await user.keyboard('{Escape}')
    expect(screen.getByRole('dialog')).toBeTruthy()
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).toBeNull()
  })
})

describe('Filtros del historial', () => {
  it('usa el día de Ciudad de México en los límites de fecha, no el día UTC', () => {
    expect(consultationDate('2026-11-06T01:30:00Z')).toBe('2026-11-05')
    const entries = flattenConsultations([{ ...demoPatientRecords[0], consultations: [{ ...demoPatientRecords[0].consultations[0], occurredAt: '2026-11-06T01:30:00Z' }] }])
    expect(filterConsultations(entries, { ...defaultFilters, fromDate: '2026-11-05', toDate: '2026-11-05' })).toHaveLength(1)
    expect(filterConsultations(entries, { ...defaultFilters, fromDate: '2026-11-06' })).toHaveLength(0)
  })

  it('no muta los fixtures y conserva el orden por paciente con desempate temporal', () => {
    const before = JSON.stringify(demoPatientRecords)
    const entries = flattenConsultations(demoPatientRecords)
    expect(entries).toHaveLength(12)
    expect(filterConsultations(entries, { ...defaultFilters, status: 'active' })).toHaveLength(10)
    const mariana = filterConsultations(entries, { ...defaultFilters, query: 'mariana', order: 'patient' })
    expect(mariana.map(entry => entry.consultation.id)).toEqual(['DEMO-C003', 'DEMO-C002', 'DEMO-C001'])
    expect(JSON.stringify(demoPatientRecords)).toBe(before)
  })
})
