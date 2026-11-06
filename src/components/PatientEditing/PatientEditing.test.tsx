import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import PatientEditing from './PatientEditing'
import { demoPatientRecords } from '../PatientRecord/demoPatientRecords'

afterEach(cleanup)
const inputValue = (label: string) => (screen.getByLabelText(label) as HTMLInputElement).value
function renderEditing(id = 'DEMO-001') {
  return render(<MemoryRouter initialEntries={[`/dashboard/pacientes/${id}/editar`]}><Routes><Route path="/dashboard/pacientes/:patientId/editar" element={<PatientEditing />} /></Routes></MemoryRouter>)
}

describe('Edición de paciente de demostración', () => {
  it('precarga exactamente los cinco campos editables del paciente', () => {
    renderEditing()
    expect(inputValue('Nombre completo')).toBe('Mariana Solís Peña')
    expect(inputValue('Fecha de nacimiento')).toBe('1994-08-14')
    expect(inputValue('Correo electrónico (opcional)')).toBe('mariana.solis@example.com')
    expect(inputValue('Teléfono (opcional)')).toBe('+52 55 0000 0001')
    expect(inputValue('Ocupación (opcional)')).toBe('Diseñadora gráfica')
    expect(document.title).toBe('Editar paciente · Mariana Solís Peña · Nutriline')
    expect(screen.getByRole('link', { name: 'Cancelar' }).getAttribute('href')).toBe('/dashboard/pacientes/DEMO-001')
  })

  it('informa cuando no hay cambios, incluso si solo cambian espacios o mayúsculas del correo', async () => {
    const user = userEvent.setup()
    renderEditing()
    fireEvent.change(screen.getByLabelText('Correo electrónico (opcional)'), { target: { value: 'MARIANA.SOLIS@EXAMPLE.COM' } })
    await user.click(screen.getByRole('button', { name: 'Revisar cambios' }))
    expect(await screen.findByRole('status')).toBeTruthy()
    expect(screen.queryByRole('dialog')).toBeNull()
    await user.type(screen.getByLabelText('Ocupación (opcional)'), ' de prueba')
    expect(screen.queryByRole('status')).toBeNull()
  })

  it('compara valores actuales y propuestos sin mutar los fixtures y conserva lo escrito', async () => {
    const user = userEvent.setup()
    renderEditing()
    await user.clear(screen.getByLabelText('Ocupación (opcional)'))
    await user.clear(screen.getByLabelText('Correo electrónico (opcional)'))
    await user.type(screen.getByLabelText('Correo electrónico (opcional)'), 'NUEVO@EXAMPLE.COM')
    await user.click(screen.getByRole('button', { name: 'Revisar cambios' }))
    const dialog = await screen.findByRole('dialog', { name: 'Revisar cambios del paciente' })
    expect(within(dialog).getByText('mariana.solis@example.com')).toBeTruthy()
    expect(within(dialog).getByText('nuevo@example.com')).toBeTruthy()
    expect(within(dialog).getByText('Diseñadora gráfica')).toBeTruthy()
    expect(within(dialog).getByText('Sin especificar')).toBeTruthy()
    expect(within(dialog).getAllByText('Cambio propuesto')).toHaveLength(2)
    expect(dialog.textContent).toContain('No se ha guardado ni enviado información')
    expect(within(dialog).queryByRole('button', { name: /guardar/i })).toBeNull()
    expect(demoPatientRecords[0].email).toBe('mariana.solis@example.com')
    await user.click(within(dialog).getByRole('button', { name: 'Volver al formulario' }))
    expect(inputValue('Correo electrónico (opcional)')).toBe('NUEVO@EXAMPLE.COM')
    expect(inputValue('Ocupación (opcional)')).toBe('')
    await user.click(screen.getByRole('button', { name: 'Revisar cambios' }))
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(inputValue('Correo electrónico (opcional)')).toBe('NUEVO@EXAMPLE.COM')
  })

  it('permite vaciar todos los datos opcionales y conserva la fecha sin zona horaria', async () => {
    const user = userEvent.setup()
    renderEditing()
    for (const label of ['Correo electrónico (opcional)', 'Teléfono (opcional)', 'Ocupación (opcional)']) await user.clear(screen.getByLabelText(label))
    fireEvent.change(screen.getByLabelText('Fecha de nacimiento'), { target: { value: '2000-02-29' } })
    await user.click(screen.getByRole('button', { name: 'Revisar cambios' }))
    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getAllByText('Sin especificar')).toHaveLength(3)
    expect(within(dialog).getByText('2000-02-29')).toBeTruthy()
  })

  it('valida nombre, nacimiento y contacto antes de revisar', async () => {
    const user = userEvent.setup()
    renderEditing()
    await user.clear(screen.getByLabelText('Nombre completo'))
    fireEvent.change(screen.getByLabelText('Fecha de nacimiento'), { target: { value: '2999-01-01' } })
    fireEvent.change(screen.getByLabelText('Correo electrónico (opcional)'), { target: { value: 'incorrecto' } })
    await user.click(screen.getByRole('button', { name: 'Revisar cambios' }))
    expect(await screen.findByText('Ingresa el nombre completo.')).toBeTruthy()
    expect(screen.getByText('La fecha debe estar entre el año 1000 y hoy.')).toBeTruthy()
    expect(screen.getByText(/Ingresa un correo válido/)).toBeTruthy()
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('permite revisar datos de archivados sin reactivarlos', () => {
    renderEditing('DEMO-011')
    expect(screen.getByText(/Revisar sus datos no lo reactiva/)).toBeTruthy()
    expect(inputValue('Nombre completo')).toBe('Renata Molina Cruz')
    expect(screen.getByRole('button', { name: 'Revisar cambios' })).toBeTruthy()
  })

  it('maneja un identificador desconocido sin ofrecer un formulario', () => {
    renderEditing('desconocido')
    expect(screen.getByRole('heading', { name: 'Paciente no encontrado' })).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Revisar cambios' })).toBeNull()
  })
})
