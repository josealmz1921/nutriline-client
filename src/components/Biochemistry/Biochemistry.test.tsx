import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import PatientRegistration from '../PatientRegistration'
import { biochemicalDeterminations } from './biochemistryModel'
import { continueToBiochemistry } from '../PatientRegistration/assessmentTestHelpers'

afterEach(cleanup)
const renderAssessment = () => render(<MemoryRouter><PatientRegistration /></MemoryRouter>)

describe('Bioquímica en evaluación inicial', () => {
  it('ofrece diez determinaciones completas sin rangos precargados ni resultados inventados', async () => {
    const user = userEvent.setup()
    renderAssessment()
    await continueToBiochemistry(user)
    for (const field of biochemicalDeterminations) {
      for (const prefix of ['Valor', 'Unidad', 'Referencia del laboratorio', 'Resultado / interpretación manual']) {
        expect((screen.getByLabelText(`${prefix} · ${field.label}`) as HTMLInputElement).value).toBe('')
      }
    }
    expect(screen.queryByText('70 a 110 mg/dl')).toBeNull()
    await user.click(screen.getByRole('combobox', { name: 'Disponibilidad del estudio' }))
    await user.click(screen.getByRole('option', { name: 'Estudio no realizado' }))
    await user.click(screen.getByRole('button', { name: 'Revisar bioquímica' }))
    const dialog = await screen.findByRole('dialog', { name: 'Revisar bioquímica' })
    expect(within(dialog).getByText(/Sin determinaciones registradas/)).toBeTruthy()
    expect(within(dialog).queryByRole('button', { name: /guardar/i })).toBeNull()
  })

  it('conserva todos los campos al navegar y al cerrar la revisión, sin modificar Datos del paciente', async () => {
    const user = userEvent.setup()
    renderAssessment()
    fireEvent.change(screen.getByLabelText('Nombre completo'), { target: { value: 'Paciente ficticio' } })
    await continueToBiochemistry(user)
    fireEvent.change(screen.getByLabelText('Fecha de toma de muestra (opcional)'), { target: { value: '2026-11-05' } })
    fireEvent.change(screen.getByLabelText('Laboratorio (opcional)'), { target: { value: 'Laboratorio ficticio' } })
    for (const field of biochemicalDeterminations) {
      fireEvent.change(screen.getByLabelText(`Valor · ${field.label}`), { target: { value: '12,50' } })
      fireEvent.change(screen.getByLabelText(`Unidad · ${field.label}`), { target: { value: 'mg/dL' } })
      fireEvent.change(screen.getByLabelText(`Referencia del laboratorio · ${field.label}`), { target: { value: 'Según informe ficticio' } })
      fireEvent.change(screen.getByLabelText(`Resultado / interpretación manual · ${field.label}`), { target: { value: 'Nota ficticia' } })
    }
    await user.click(screen.getByRole('button', { name: /Antropometría/ }))
    await user.click(screen.getByRole('button', { name: /Bioquímica/ }))
    await user.click(screen.getByRole('button', { name: 'Revisar bioquímica' }))
    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByText('2026-11-05')).toBeTruthy()
    expect(within(dialog).getByText('Laboratorio ficticio')).toBeTruthy()
    expect(within(dialog).getByText(/10 de 10 determinaciones/)).toBeTruthy()
    expect(within(dialog).getAllByText('12.50')).toHaveLength(10)
    await user.click(within(dialog).getByRole('button', { name: 'Volver a bioquímica' }))
    for (const field of biochemicalDeterminations) {
      expect((screen.getByLabelText(`Valor · ${field.label}`) as HTMLInputElement).value).toBe('12,50')
      expect((screen.getByLabelText(`Unidad · ${field.label}`) as HTMLInputElement).value).toBe('mg/dL')
      expect((screen.getByLabelText(`Referencia del laboratorio · ${field.label}`) as HTMLInputElement).value).toBe('Según informe ficticio')
      expect((screen.getByLabelText(`Resultado / interpretación manual · ${field.label}`) as HTMLInputElement).value).toBe('Nota ficticia')
    }
    await user.click(screen.getByRole('button', { name: /Datos del paciente/ }))
    expect((screen.getByLabelText('Nombre completo') as HTMLInputElement).value).toBe('Paciente ficticio')
  })

  it('bloquea valores inválidos y requiere unidad para cero explícito, sin abrir revisión', async () => {
    const user = userEvent.setup()
    renderAssessment()
    await continueToBiochemistry(user)
    fireEvent.change(screen.getByLabelText('Valor · Glucosa en plasma'), { target: { value: '-5' } })
    await user.click(screen.getByRole('button', { name: 'Revisar bioquímica' }))
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(document.activeElement).toBe(screen.getByLabelText('Valor · Glucosa en plasma'))
    fireEvent.change(screen.getByLabelText('Valor · Glucosa en plasma'), { target: { value: '0' } })
    await user.click(screen.getByRole('button', { name: 'Revisar bioquímica' }))
    expect(await screen.findByText('Indica la unidad del informe para este valor.')).toBeTruthy()
    expect(document.activeElement).toBe(screen.getByLabelText('Unidad · Glucosa en plasma'))
    fireEvent.change(screen.getByLabelText('Unidad · Glucosa en plasma'), { target: { value: 'mg/dL' } })
    await user.click(screen.getByRole('button', { name: 'Revisar bioquímica' }))
    expect(within(await screen.findByRole('dialog')).getByText('0')).toBeTruthy()
  })
})
