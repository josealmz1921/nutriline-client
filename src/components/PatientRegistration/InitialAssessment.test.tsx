import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import PatientRegistration from './PatientRegistration'
import { assessmentSections, symptoms } from './assessmentSections'
import { legacyNationalities } from './legacyNationalities'
import { validateInitialReason, validatePhoto } from '../InitialAssessmentFields/initialAssessmentValidation'
import { continueToAnthropometry } from './assessmentTestHelpers'

afterEach(cleanup)
const renderAssessment = () => render(<MemoryRouter><PatientRegistration /></MemoryRouter>)
function fillRequired() {
  fireEvent.change(screen.getByLabelText('Nombre completo'), { target: { value: 'Paciente ficticio' } })
  fireEvent.change(screen.getByLabelText('Fecha de nacimiento'), { target: { value: '1992-05-15' } })
}

describe('Datos iniciales y estructura de evaluación', () => {
  it('conserva los campos de la ficha original y los 18 signos/síntomas, sin cronómetro', () => {
    renderAssessment()
    expect(screen.getByLabelText('Fotografía (opcional)')).toBeTruthy()
    expect(screen.getByRole('combobox', { name: 'Género (como en el registro original)' })).toBeTruthy()
    expect(screen.getByRole('combobox', { name: 'Nacionalidad' })).toBeTruthy()
    expect(screen.getByLabelText('Motivo de consulta')).toBeTruthy()
    expect(screen.getAllByRole('checkbox')).toHaveLength(18)
    for (const symptom of symptoms) expect(screen.getByRole('checkbox', { name: symptom.label })).toBeTruthy()
    expect((screen.getByRole('button', { name: 'Programar consulta · Próximamente' }) as HTMLButtonElement).disabled).toBe(true)
    expect(screen.queryByText(/tiempo transcurrido/i)).toBeNull()
    expect(screen.queryByRole('button', { name: 'Finalizar' })).toBeNull()
  })

  it('muestra los seis módulos sin fingir que los pendientes permiten capturar o calcular', async () => {
    const user = userEvent.setup()
    renderAssessment()
    fillRequired()
    await user.type(screen.getByLabelText('Motivo de consulta'), 'Motivo ficticio')
    await user.click(screen.getByRole('checkbox', { name: 'Náuseas' }))
    const nav = screen.getByRole('navigation', { name: 'Secciones de la evaluación inicial' })
    expect(within(nav).getAllByRole('button')).toHaveLength(6)
    for (const section of assessmentSections.slice(3)) {
      const button = within(nav).getByRole('button', { name: new RegExp(section.label) }) as HTMLButtonElement
      expect(button.disabled).toBe(true)
      await user.click(button)
      expect(screen.getByRole('heading', { level: 2, name: 'Datos del paciente' })).toBeTruthy()
    }
    expect((screen.getByLabelText('Nombre completo') as HTMLInputElement).value).toBe('Paciente ficticio')
    expect((screen.getByLabelText('Motivo de consulta') as HTMLTextAreaElement).value).toBe('Motivo ficticio')
    expect((screen.getByRole('checkbox', { name: 'Náuseas' }) as HTMLInputElement).checked).toBe(true)
  })

  it('busca nacionalidades sin acentos y conserva la selección al cambiar la búsqueda y sección', async () => {
    const user = userEvent.setup()
    renderAssessment()
    await user.type(screen.getByLabelText('Buscar nacionalidad'), 'mexico')
    await user.click(screen.getByRole('combobox', { name: 'Nacionalidad' }))
    await user.click(screen.getByRole('option', { name: 'México' }))
    await user.clear(screen.getByLabelText('Buscar nacionalidad'))
    await user.type(screen.getByLabelText('Buscar nacionalidad'), 'argentina')
    expect(screen.getByRole('combobox', { name: 'Nacionalidad' }).textContent).toContain('México')
    await continueToAnthropometry(user)
    await user.click(screen.getByRole('button', { name: /Datos del paciente/ }))
    expect(screen.getByRole('combobox', { name: 'Nacionalidad' }).textContent).toContain('México')
  })

  it('incluye género, nacionalidad, motivo y síntomas en la revisión, sin inferir ausencia', async () => {
    const user = userEvent.setup()
    renderAssessment()
    fillRequired()
    await user.click(screen.getByRole('combobox', { name: 'Género (como en el registro original)' }))
    await user.click(screen.getByRole('option', { name: 'Mujer' }))
    await user.type(screen.getByLabelText('Buscar nacionalidad'), 'MX')
    await user.click(screen.getByRole('combobox', { name: 'Nacionalidad' }))
    await user.click(screen.getByRole('option', { name: 'México' }))
    await user.type(screen.getByLabelText('Motivo de consulta'), '  Evaluación ficticia  ')
    await user.click(screen.getByRole('checkbox', { name: 'Pérdida de peso' }))
    await user.click(screen.getByRole('checkbox', { name: 'Otros' }))
    await user.click(screen.getByRole('button', { name: 'Revisar datos' }))
    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByText('Mujer')).toBeTruthy()
    expect(within(dialog).getByText('México')).toBeTruthy()
    expect(within(dialog).getByText('Evaluación ficticia')).toBeTruthy()
    expect(within(dialog).getByText('Pérdida de peso, Otros')).toBeTruthy()
    expect(dialog.textContent).toContain('La evaluación completa sigue pendiente')
    await user.click(within(dialog).getByRole('button', { name: 'Volver al formulario' }))
    await user.click(screen.getByRole('checkbox', { name: 'Pérdida de peso' }))
    await user.click(screen.getByRole('checkbox', { name: 'Otros' }))
    await user.click(screen.getByRole('button', { name: 'Revisar datos' }))
    expect(await screen.findByText('No registrados (no confirma ausencia)')).toBeTruthy()
  })

  it('previsualiza la foto local, la conserva al navegar y permite quitarla', async () => {
    const user = userEvent.setup()
    renderAssessment()
    fillRequired()
    const photo = new File(['image'], 'paciente-ficticio.png', { type: 'image/png' })
    await user.upload(screen.getByLabelText('Fotografía (opcional)'), photo)
    expect(await screen.findByAltText('Vista previa de la fotografía del paciente')).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Continuar' }))
    await user.click(screen.getByRole('button', { name: /Datos del paciente/ }))
    expect(screen.getByAltText('Vista previa de la fotografía del paciente')).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Revisar datos' }))
    expect(within(await screen.findByRole('dialog')).getByText('paciente-ficticio.png')).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Volver al formulario' }))
    await user.click(screen.getByRole('button', { name: 'Quitar archivo' }))
    expect(screen.queryByAltText('Vista previa de la fotografía del paciente')).toBeNull()
    expect((screen.getByLabelText('Fotografía (opcional)') as HTMLInputElement).value).toBe('')
  })

  it('rechaza archivos incompatibles y enfoca el campo inválido sin abrir revisión', async () => {
    const user = userEvent.setup({ applyAccept: false })
    renderAssessment()
    fillRequired()
    await user.upload(screen.getByLabelText('Fotografía (opcional)'), new File(['svg'], 'no.svg', { type: 'image/svg+xml' }))
    await screen.findByText('Selecciona una imagen JPG, PNG o WebP.')
    await user.click(screen.getByRole('button', { name: 'Revisar datos' }))
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(document.activeElement).toBe(screen.getByLabelText('Fotografía (opcional)'))
    expect(screen.queryByAltText('Vista previa de la fotografía del paciente')).toBeNull()
  })
})

describe('Inventario de campos del original', () => {
  it('preserva las 234 nacionalidades, incluidos códigos históricos', () => {
    expect(legacyNationalities).toHaveLength(234)
    expect(new Set(legacyNationalities.map(option => option.value)).size).toBe(234)
    expect(legacyNationalities).toContainEqual({ value: 'MX', label: 'México' })
    expect(legacyNationalities).toContainEqual({ value: 'YU', label: 'Yugoslavia' })
    expect(legacyNationalities).toContainEqual({ value: 'AN', label: 'Antillas Holandesas' })
  })
  it('conserva las 38 medidas en cinco grupos y los 18 síntomas', () => {
    const anthropometry = assessmentSections[1]
    expect(anthropometry.groups.slice(1, 6).reduce((total, group) => total + group.fields.length, 0)).toBe(38)
    expect(symptoms).toHaveLength(18)
  })
  it('valida límites técnicos sin introducir cálculos o valores clínicos', () => {
    expect(validateInitialReason('a'.repeat(501))).toBeTruthy()
    expect(validateInitialReason('')).toBeUndefined()
    expect(validatePhoto(undefined)).toBeUndefined()
    expect(validatePhoto({ name: 'test.png', type: 'image/png', base64: 'data:', size: 5 * 1024 * 1024 + 1 })).toContain('5 MB')
  })
})
