import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import PatientRegistration from './PatientRegistration'
import { validateBirthDate, validateEmail, validateFullName, validateOccupation, validatePhone } from './registrationValidation'

afterEach(cleanup)

const renderRegistration = () => render(<MemoryRouter><PatientRegistration /></MemoryRouter>)

describe('Registro de paciente de demostración', () => {
  it('exige nombre y nacimiento con mensajes en español', async () => {
    const user = userEvent.setup()
    renderRegistration()
    await user.click(screen.getByRole('button', { name: 'Revisar datos' }))
    expect(await screen.findByText('Ingresa el nombre completo.')).toBeTruthy()
    expect(screen.getByText('Selecciona la fecha de nacimiento.')).toBeTruthy()
    expect(screen.getByLabelText('Nombre completo').getAttribute('aria-invalid')).toBe('true')
    expect(screen.getByLabelText('Fecha de nacimiento').getAttribute('aria-invalid')).toBe('true')
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('revisa solo los campos obligatorios y conserva la fecha sin zona horaria', async () => {
    const user = userEvent.setup()
    renderRegistration()
    await user.type(screen.getByLabelText('Nombre completo'), '  Paciente de Prueba  ')
    fireEvent.change(screen.getByLabelText('Fecha de nacimiento'), { target: { value: '1992-05-15' } })
    await user.click(screen.getByRole('button', { name: 'Revisar datos' }))
    const dialog = await screen.findByRole('dialog', { name: 'Revisar datos del paciente' })
    expect(within(dialog).getByText('Paciente de Prueba')).toBeTruthy()
    expect(within(dialog).getByText('1992-05-15').getAttribute('datetime')).toBe('1992-05-15')
    expect(within(dialog).getAllByText('Sin especificar')).toHaveLength(6)
    expect(dialog.textContent).toContain('No se ha guardado ni enviado información')
    await user.click(screen.getByRole('button', { name: 'Volver al formulario' }))
    expect((screen.getByLabelText('Nombre completo') as HTMLInputElement).value).toBe('  Paciente de Prueba  ')
  })

  it('revisa y normaliza contacto sin guardar datos ni mostrar un registro exitoso', async () => {
    const user = userEvent.setup()
    renderRegistration()
    await user.type(screen.getByLabelText('Nombre completo'), 'Paciente Ficticio')
    fireEvent.change(screen.getByLabelText('Fecha de nacimiento'), { target: { value: '2000-02-29' } })
    await user.type(screen.getByLabelText('Correo electrónico (opcional)'), 'DEMO@EXAMPLE.COM')
    await user.type(screen.getByLabelText('Teléfono (opcional)'), '+52 55 0000 0100')
    await user.type(screen.getByLabelText('Ocupación (opcional)'), '  Docente  ')
    await user.click(screen.getByRole('button', { name: 'Revisar datos' }))
    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByText('demo@example.com')).toBeTruthy()
    expect(within(dialog).getByText('Docente')).toBeTruthy()
    expect(within(dialog).getByText('+52 55 0000 0100')).toBeTruthy()
    expect(within(dialog).queryByRole('button', { name: /guardar/i })).toBeNull()
  })

  it('rechaza una fecha futura y un correo inválido', async () => {
    const user = userEvent.setup()
    renderRegistration()
    await user.type(screen.getByLabelText('Nombre completo'), 'Paciente Ficticio')
    fireEvent.change(screen.getByLabelText('Fecha de nacimiento'), { target: { value: '2999-01-01' } })
    await user.type(screen.getByLabelText('Correo electrónico (opcional)'), 'correo-invalido')
    await user.click(screen.getByRole('button', { name: 'Revisar datos' }))
    await screen.findByText('La fecha debe estar entre el año 1000 y hoy.')
    expect(screen.getByText(/Ingresa un correo válido/)).toBeTruthy()
    expect(screen.queryByRole('dialog')).toBeNull()
  })
})

describe('Validación local de los campos del registro', () => {
  it('valida calendario y límites, sin rollover de fecha ni clasificaciones clínicas', () => {
    expect(validateBirthDate('2000-02-29')).toBeUndefined()
    expect(validateBirthDate('2001-02-29')).toBe('Ingresa una fecha válida.')
    expect(validateBirthDate('2026-04-31')).toBe('Ingresa una fecha válida.')
    expect(validateBirthDate('0999-01-01')).toContain('año 1000')
    expect(validateBirthDate(new Date().toISOString().slice(0, 10))).toBeUndefined()
  })
  it('no obliga a aportar contacto y comprueba longitudes', () => {
    expect(validateFullName('   ')).toBe('Ingresa el nombre completo.')
    expect(validateFullName('a'.repeat(151))).toContain('150')
    expect(validateEmail('')).toBeUndefined()
    expect(validateEmail(undefined)).toBeUndefined()
    expect(validateEmail('nombre@example.com')).toBeUndefined()
    expect(validatePhone('a'.repeat(33))).toContain('32')
    expect(validateOccupation('a'.repeat(151))).toContain('150')
  })
})
