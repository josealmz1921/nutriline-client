import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import PatientRegistration from '../PatientRegistration'
import ConsultationRegistration from '../ConsultationRegistration'
import { consultationToRecall, consultationSkipHabits, consultationReview } from '../ConsultationRegistration/consultationTestHelpers'
import { continueToRecall } from '../PatientRegistration/assessmentTestHelpers'
import { startRecallMeal } from './recallTestHelpers'

afterEach(cleanup)
const progress = () => (screen.getByRole('progressbar', { name: 'Secciones completadas' }) as HTMLProgressElement).value
const fillManualFood = () => {
  fireEvent.change(screen.getByLabelText('Nombre de preparación · Desayuno · Preparación 1'), { target: { value: 'Preparación ficticia' } })
  fireEvent.change(screen.getByLabelText('Alimento · Desayuno · Preparación 1 · Alimento 1'), { target: { value: 'Alimento ficticio' } })
  fireEvent.change(screen.getByLabelText('Cantidad · Desayuno · Preparación 1 · Alimento 1'), { target: { value: '1,5' } })
  fireEvent.change(screen.getByLabelText('Unidad · Desayuno · Preparación 1 · Alimento 1'), { target: { value: 'taza' } })
}

describe('R24 compartido entre evaluación y consulta', () => {
  it('se integra como paso 4, conserva valores al volver y revoca su confirmación al editar', async () => {
    const user = userEvent.setup()
    render(<MemoryRouter><PatientRegistration /></MemoryRouter>)
    await continueToRecall(user)
    expect(screen.getByRole('heading', { level: 2, name: 'Recordatorio de 24 horas' })).toBeTruthy()
    expect(progress()).toBe(3)
    await startRecallMeal(user)
    fillManualFood()
    await user.click(screen.getByRole('button', { name: 'Completar R24' }))
    expect(progress()).toBe(4)
    expect(screen.getByRole('heading', { name: 'Hábitos', level: 2 })).toBeTruthy()
    const nav = screen.getByRole('navigation', { name: 'Secciones de la evaluación inicial' })
    await user.click(within(nav).getByRole('button', { name: /Bioquímica/ }))
    await user.click(within(nav).getByRole('button', { name: /Recordatorio de 24 horas/ }))
    expect((screen.getByLabelText('Cantidad · Desayuno · Preparación 1 · Alimento 1') as HTMLInputElement).value).toBe('1,5')
    fireEvent.change(screen.getByLabelText('Cantidad · Desayuno · Preparación 1 · Alimento 1'), { target: { value: '2' } })
    expect(progress()).toBe(3)
    expect((within(nav).getByRole('button', { name: /Hábitos/ }) as HTMLButtonElement).disabled).toBe(true)
    await user.click(screen.getByRole('button', { name: 'Completar R24' }))
    expect(progress()).toBe(4)
    await user.click(within(nav).getByRole('button', { name: /Recordatorio de 24 horas/ }))
    await user.click(screen.getByRole('button', { name: 'Quitar preparación · Desayuno · Preparación 1' }))
    await user.click(screen.getByRole('button', { name: 'Confirmar eliminación de preparación' }))
    expect(progress()).toBe(3)
    await user.click(screen.getByRole('button', { name: 'Completar R24' }))
    expect(progress()).toBe(3)
  })

  it('incluye el mismo recordatorio en revisión de consulta, sin formulario anidado ni datos de otro paciente', async () => {
    const user = userEvent.setup()
    const { container, unmount } = render(<MemoryRouter initialEntries={['/dashboard/pacientes/DEMO-001/consultas/nueva']}><Routes><Route path="/dashboard/pacientes/:patientId/consultas/nueva" element={<ConsultationRegistration />} /></Routes></MemoryRouter>)
    await consultationToRecall(user)
    expect(container.querySelectorAll('form form')).toHaveLength(0)
    await startRecallMeal(user)
    await user.click(screen.getByRole('button', { name: 'Completar R24' }))
    expect(screen.queryByRole('dialog')).toBeNull()
    fillManualFood()
    await user.click(screen.getByRole('button', { name: 'Completar R24' }))
    await consultationSkipHabits(user)
    await consultationReview(user)
    const dialog = await screen.findByRole('dialog')
    expect(dialog.textContent).toContain('Alimento ficticio · 1.5 taza')
    expect(dialog.textContent).toContain('Sin nutrientes calculados')
    expect(dialog.textContent).toContain('no se ha guardado ni enviado')
    await user.click(within(dialog).getByRole('button', { name: 'Volver al formulario' }))
    expect((screen.getByLabelText('Alimento · Desayuno · Preparación 1 · Alimento 1') as HTMLInputElement).value).toBe('Alimento ficticio')
    unmount()
    render(<MemoryRouter initialEntries={['/dashboard/pacientes/DEMO-002/consultas/nueva']}><Routes><Route path="/dashboard/pacientes/:patientId/consultas/nueva" element={<ConsultationRegistration />} /></Routes></MemoryRouter>)
    expect(screen.queryByLabelText('Alimento · Desayuno · Preparación 1 · Alimento 1')).toBeNull()
  })
})
