import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import PatientRegistration from '../PatientRegistration'
import { measurements } from './measurements'
import { continueToAnthropometry } from '../PatientRegistration/assessmentTestHelpers'

afterEach(cleanup)

describe('Captura y cálculo de Antropometría', () => {
  it('mantiene las 38 medidas, sus unidades y la medición adicional específica', async () => {
    const user = userEvent.setup()
    render(<MemoryRouter><PatientRegistration /></MemoryRouter>)
    await continueToAnthropometry(user)
    expect(screen.getAllByRole('textbox')).toHaveLength(39)
    expect(screen.getByRole('combobox', { name: 'Estado de medición' })).toBeTruthy()
    expect(screen.getByLabelText('Supraespinal (mm)')).toBeTruthy()
    for (const field of measurements) expect(document.getElementById(field.id)).toBeTruthy()
    expect(screen.queryByRole('img', { name: /Somatotipo:/ })).toBeNull()
    for (const [index, field] of measurements.entries()) fireEvent.change(document.getElementById(field.id)!, { target: { value: String(index + 1) } })
    expect(screen.getByText(/38 de 38 medidas originales capturadas/)).toBeTruthy()
    await user.click(screen.getByRole('button', { name: /Datos del paciente/ }))
    await user.click(screen.getByRole('button', { name: /Antropometría/ }))
    for (const [index, field] of measurements.entries()) expect((document.getElementById(field.id) as HTMLInputElement).value).toBe(String(index + 1))
  })

  it('calcula en vivo, elimina el resultado al borrar una dependencia y conserva los valores al navegar', async () => {
    const user = userEvent.setup()
    render(<MemoryRouter><PatientRegistration /></MemoryRouter>)
    await user.type(screen.getByLabelText('Nombre completo'), 'Paciente ficticio')
    await continueToAnthropometry(user)
    fireEvent.change(screen.getByLabelText('Talla (cm)'), { target: { value: '180' } })
    fireEvent.change(screen.getByLabelText('Peso (kg)'), { target: { value: '72' } })
    expect(within(screen.getByRole('region', { name: 'IMC' })).getByText('22.22 kg/m²')).toBeTruthy()
    await user.click(screen.getByRole('combobox', { name: 'Estado de medición' }))
    await user.click(screen.getByRole('option', { name: 'Ayunas' }))
    await user.click(screen.getByRole('button', { name: 'Continuar' }))
    await user.click(screen.getByRole('button', { name: /Datos del paciente/ }))
    expect((screen.getByLabelText('Nombre completo') as HTMLInputElement).value).toBe('Paciente ficticio')
    await user.click(screen.getByRole('button', { name: /Antropometría/ }))
    expect((screen.getByLabelText('Talla (cm)') as HTMLInputElement).value).toBe('180')
    expect(screen.getByRole('combobox', { name: 'Estado de medición' }).textContent).toContain('Ayunas')
    expect(within(screen.getByRole('region', { name: 'IMC' })).getByText('22.22 kg/m²')).toBeTruthy()
    fireEvent.change(screen.getByLabelText('Peso (kg)'), { target: { value: '' } })
    expect(within(screen.getByRole('region', { name: 'IMC' })).getByText('Sin resultado')).toBeTruthy()
  })

  it('dibuja solo con todas las dependencias y retira el punto si una deja de ser válida', async () => {
    const user = userEvent.setup()
    render(<MemoryRouter><PatientRegistration /></MemoryRouter>)
    await continueToAnthropometry(user)
    const fixture = { height: '170.7', weight: '52.6', triceps: '15', subscapular: '8.8', supraspinale: '6', humerus: '6.1', femur: '8.7', flexedArm: '24.9', calfGirth: '33.1', calfFold: '12.4' }
    for (const [id, value] of Object.entries(fixture)) fireEvent.change(document.getElementById(id)!, { target: { value } })
    expect(screen.getByRole('img', { name: /Somatotipo:/ })).toBeTruthy()
    fireEvent.change(screen.getByLabelText('Supraespinal (mm)'), { target: { value: '10mm' } })
    expect(screen.queryByRole('img', { name: /Somatotipo:/ })).toBeNull()
    expect(within(screen.getByRole('region', { name: 'Endomorfia' })).getByText(/Falta completar o corregir: Supraespinal/)).toBeTruthy()
  })
})
