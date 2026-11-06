import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Link, MemoryRouter, Route, Routes } from 'react-router-dom'
import ConsultationRegistration from './ConsultationRegistration'
import { validateConsultationTime, validateMeasurement, validateNotes, validateReason } from './consultationValidation'
import { consultationToAnthropometry, consultationToBiochemistry, consultationToRecall, consultationSkipRecall, consultationSkipHabits, consultationReview } from './consultationTestHelpers'
import { selectRecallOption as selectOption } from '../DietaryRecall/recallTestHelpers'
import { measurements } from '../Anthropometry/measurements'

const progress = () => (screen.getByRole('progressbar', { name: 'Secciones completadas' }) as HTMLProgressElement).value
async function fillCurrent(user: ReturnType<typeof userEvent.setup>) { await user.click(screen.getByRole('button', { name: 'Rellenar campos vacíos' })) }
async function completeWithExamples(user: ReturnType<typeof userEvent.setup>) {
  for (const action of ['Continuar', 'Continuar', 'Completar sección', 'Completar R24', 'Continuar', 'Revisar consulta']) {
    await fillCurrent(user)
    await user.click(screen.getByRole('button', { name: action }))
  }
}

afterEach(cleanup)
function renderForm(id = 'DEMO-001') {
  return render(<MemoryRouter initialEntries={[`/dashboard/pacientes/${id}/consultas/nueva`]}><Routes><Route path="/dashboard/pacientes/:patientId/consultas/nueva" element={<ConsultationRegistration />} /></Routes></MemoryRouter>)
}

describe('Nueva consulta de demostración', () => {
  it('exige horarios, motivo, peso y talla en español', async () => {
    const user = userEvent.setup()
    renderForm()
    await user.click(screen.getByRole('button', { name: 'Continuar' }))
    expect(await screen.findByText('Selecciona la fecha y hora de consulta.')).toBeTruthy()
    expect(screen.getByText('Selecciona la fecha y hora de mediciones.')).toBeTruthy()
    expect(screen.getByText('Ingresa el motivo de consulta.')).toBeTruthy()
    await consultationToAnthropometry(user)
    await user.click(screen.getByRole('button', { name: 'Continuar' }))
    expect(screen.getAllByText('Ingresa esta medida esencial.')).toHaveLength(2)
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('revisa sin guardar y conserva el formulario al regresar', async () => {
    const user = userEvent.setup()
    renderForm()
    await user.click(screen.getByLabelText('Fiebre'))
    await consultationToRecall(user)
    await consultationSkipRecall(user)
    await consultationSkipHabits(user)
    await consultationReview(user)
    const dialog = await screen.findByRole('dialog')
    expect(dialog.textContent).toContain('no se ha guardado ni enviado')
    expect(dialog.textContent).toContain('23.02')
    expect(within(dialog).getByText('Consulta ficticia')).toBeTruthy()
    expect(within(dialog).getByText('Fiebre')).toBeTruthy()
    expect(within(dialog).getByText('Sin notas registradas.')).toBeTruthy()
    expect(within(dialog).getByRole('link', { name: 'Volver al expediente sin guardar' }).getAttribute('href')).toBe('/dashboard/pacientes/DEMO-001')
    await user.click(within(dialog).getByRole('button', { name: 'Volver al formulario' }))
    expect((screen.getByLabelText('Peso (kg)') as HTMLInputElement).value).toBe('64.2')
    expect((screen.getByLabelText('Motivo de consulta') as HTMLTextAreaElement).value).toBe('Consulta ficticia')
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('bloquea pacientes archivados incluso por URL directa', () => {
    renderForm('DEMO-011')
    expect(screen.getByRole('heading', { name: 'Paciente archivado' })).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Revisar consulta' })).toBeNull()
    expect(screen.queryByLabelText('Valor · Glucosa en plasma')).toBeNull()
    expect(screen.getByRole('link', { name: 'Volver al expediente' }).getAttribute('href')).toBe('/dashboard/pacientes/DEMO-011')
  })

  it('maneja un paciente inexistente', () => {
    renderForm('inexistente')
    expect(screen.getByRole('heading', { name: 'Paciente no encontrado' })).toBeTruthy()
    expect(screen.queryByLabelText('Peso (kg)')).toBeNull()
  })

  it('reinicia borradores y progreso al cambiar de paciente dentro de la misma ruta', async () => {
    const user = userEvent.setup()
    render(<MemoryRouter initialEntries={['/dashboard/pacientes/DEMO-001/consultas/nueva']}><Link to="/dashboard/pacientes/DEMO-002/consultas/nueva">Cambiar paciente de prueba</Link><Routes><Route path="/dashboard/pacientes/:patientId/consultas/nueva" element={<ConsultationRegistration />} /></Routes></MemoryRouter>)
    await consultationToAnthropometry(user)
    fireEvent.change(screen.getByLabelText('Peso (kg)'), { target: { value: '85' } })
    expect(progress()).toBe(1)
    await user.click(screen.getByRole('link', { name: 'Cambiar paciente de prueba' }))
    expect(progress()).toBe(0)
    expect((screen.getByLabelText('Motivo de consulta') as HTMLTextAreaElement).value).toBe('')
    expect((screen.getByLabelText('Peso (kg)') as HTMLInputElement).value).toBe('')
    expect(screen.getByRole('heading', { name: 'Datos de consulta' })).toBeTruthy()
  })

  it('comparte las 38 medidas, conserva borradores y permite declarar mediciones ausentes sin inventar resultados', async () => {
    const user = userEvent.setup()
    renderForm()
    await consultationToAnthropometry(user)
    expect(screen.getByRole('navigation', { name: 'Secciones de la consulta' })).toBeTruthy()
    for (const field of measurements) expect(document.getElementById(field.id)).toBeTruthy()
    expect((screen.getByLabelText('Tríceps (mm)') as HTMLInputElement).value).toBe('')
    fireEvent.change(screen.getByLabelText('Peso (kg)'), { target: { value: '75' } })
    await selectOption(user, 'Disponibilidad de mediciones', 'Mediciones no realizadas')
    await user.click(screen.getByRole('button', { name: 'Continuar' }))
    await selectOption(user, 'Disponibilidad del estudio', 'Estudio no realizado')
    await user.click(screen.getByRole('button', { name: 'Completar sección' }))
    await consultationSkipRecall(user)
    await consultationSkipHabits(user)
    await fillCurrent(user)
    await user.click(screen.getByRole('button', { name: 'Ver reporte de antropometría' }))
    let dialog = screen.getByRole('dialog')
    expect(dialog.textContent).toContain('Mediciones no realizadas o no disponibles')
    expect(dialog.textContent).toContain('Sin resultado')
    expect(dialog.textContent).not.toContain('75 kg')
    await user.click(within(dialog).getByRole('button', { name: 'Volver a fórmulas' }))
    await user.click(screen.getByRole('button', { name: 'Revisar consulta' }))
    dialog = screen.getByRole('dialog')
    expect(dialog.textContent).toContain('Mediciones no realizadas o no disponibles')
    expect(progress()).toBe(6)
    await user.click(within(dialog).getByRole('button', { name: 'Volver al formulario' }))
    const nav = screen.getByRole('navigation', { name: 'Secciones de la consulta' })
    await user.click(within(nav).getByRole('button', { name: /Antropometría/ }))
    expect(progress()).toBe(6)
    await selectOption(user, 'Disponibilidad de mediciones', 'Capturar mediciones')
    expect((screen.getByLabelText('Peso (kg)') as HTMLInputElement).value).toBe('75')
    expect(progress()).toBe(1)
  }, 25000)

  it('invalida confirmaciones dependientes y refresca los reportes sin perder R24, hábitos ni fórmulas', async () => {
    const user = userEvent.setup()
    renderForm()
    await completeWithExamples(user)
    expect(progress()).toBe(6)
    expect(screen.getByRole('dialog').textContent).toContain('Bíceps')
    await user.click(screen.getByRole('button', { name: 'Volver al formulario' }))
    const nav = screen.getByRole('navigation', { name: 'Secciones de la consulta' })
    await user.click(within(nav).getByRole('button', { name: /Antropometría/ }))
    fireEvent.change(screen.getByLabelText('Peso (kg)'), { target: { value: '80' } })
    expect(progress()).toBe(1)
    expect((within(nav).getByRole('button', { name: /Fórmulas y revisión/ }) as HTMLButtonElement).disabled).toBe(true)
    for (const action of ['Continuar', 'Completar sección', 'Completar R24', 'Continuar']) await user.click(screen.getByRole('button', { name: action }))
    expect((screen.getByLabelText('Actividad · 1') as HTMLInputElement).value).toBe('Yoga Hatha')
    await user.click(screen.getByRole('button', { name: 'Ver reporte de antropometría' }))
    const dialog = screen.getByRole('dialog')
    expect(dialog.textContent).toContain('80 kg')
    expect(dialog.textContent).not.toContain('70 kg')
    await user.click(within(dialog).getByRole('button', { name: 'Volver a fórmulas' }))
    await user.click(screen.getByRole('button', { name: 'Revisar consulta' }))
    expect(progress()).toBe(6)
    expect(document.querySelectorAll('form form')).toHaveLength(0)
    const ids = [...document.querySelectorAll('[id]')].map(element => element.id)
    expect(new Set(ids).size).toBe(ids.length)
  }, 25000)

  it('reutiliza Bioquímica en cada consulta y la incluye en su revisión sin guardado', async () => {
    const user = userEvent.setup()
    const { unmount } = renderForm()
    await consultationToBiochemistry(user)
    await user.click(screen.getByRole('combobox', { name: 'Disponibilidad del estudio' }))
    await user.click(screen.getByRole('option', { name: 'Capturar resultados' }))
    fireEvent.change(screen.getByLabelText('Valor · Glucosa en plasma'), { target: { value: '95,50' } })
    await user.click(screen.getByRole('button', { name: 'Completar sección' }))
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(document.activeElement).toBe(screen.getByLabelText('Unidad · Glucosa en plasma'))
    fireEvent.change(screen.getByLabelText('Unidad · Glucosa en plasma'), { target: { value: 'mg/dL' } })
    fireEvent.change(screen.getByLabelText('Referencia del laboratorio · Glucosa en plasma'), { target: { value: '70–100, informe ficticio' } })
    fireEvent.change(screen.getByLabelText('Resultado / interpretación manual · Glucosa en plasma'), { target: { value: 'Revisado manualmente' } })
    await user.click(screen.getByRole('button', { name: 'Completar sección' }))
    await consultationSkipRecall(user)
    await consultationSkipHabits(user)
    await consultationReview(user)
    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByText('95.50')).toBeTruthy()
    expect(within(dialog).getByText('mg/dL')).toBeTruthy()
    expect(within(dialog).getByText('70–100, informe ficticio')).toBeTruthy()
    expect(within(dialog).getByText('Revisado manualmente')).toBeTruthy()
    await user.click(within(dialog).getByRole('button', { name: 'Volver al formulario' }))
    expect((screen.getByLabelText('Valor · Glucosa en plasma') as HTMLInputElement).value).toBe('95,50')
    unmount()
    renderForm('DEMO-002')
    expect((screen.getByLabelText('Valor · Glucosa en plasma') as HTMLInputElement).value).toBe('')
  })
})

describe('Validación compatible con consultas del backend', () => {
  it('valida medidas sin sustituir las opcionales por cero', () => {
    for (const value of ['', '0.001', '64.200', '99999.999']) expect(validateMeasurement(value)).toBeUndefined()
    for (const value of ['0', '-1', '1e3', '64,2', '1.1234', '100000', 'NaN', '01']) expect(validateMeasurement(value)).toBeTruthy()
  })
  it('valida textos y fechas imposibles', () => {
    expect(validateReason('   ')).toBeTruthy()
    expect(validateReason('a'.repeat(501))).toBeTruthy()
    expect(validateNotes('a'.repeat(10001))).toBeTruthy()
    expect(validateNotes('')).toBeUndefined()
    expect(validateConsultationTime('2026-02-30T10:00')).toBeTruthy()
    expect(validateConsultationTime('0999-01-01T10:00')).toBeTruthy()
    expect(validateConsultationTime('2026-11-05T10:00')).toBeUndefined()
  })
})
