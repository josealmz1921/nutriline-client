import { Form } from 'informed'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import PatientRegistration from '../PatientRegistration'
import ConsultationRegistration from '../ConsultationRegistration'
import DietaryRecall from '../DietaryRecall'
import DevFormTools from './DevFormTools'
import { selectRecallOption as selectOption } from '../DietaryRecall/recallTestHelpers'

afterEach(() => { cleanup(); vi.unstubAllEnvs() })
const progress = () => (screen.getByRole('progressbar', { name: 'Secciones completadas' }) as HTMLProgressElement).value
const fill = async (user: ReturnType<typeof userEvent.setup>) => user.click(screen.getByRole('button', { name: 'Rellenar campos vacíos' }))

describe('Herramientas de desarrollo en formularios Informed', () => {
  it('recorre los seis pasos con ejemplos válidos sin confirmar ni avanzar automáticamente', async () => {
    const user = userEvent.setup()
    render(<MemoryRouter><PatientRegistration /></MemoryRouter>)
    fireEvent.change(screen.getByLabelText('Nombre completo'), { target: { value: 'Nombre ficticio conservado' } })
    await fill(user)
    expect((screen.getByLabelText('Nombre completo') as HTMLInputElement).value).toBe('Nombre ficticio conservado')
    expect(progress()).toBe(0)
    expect(screen.queryByRole('dialog')).toBeNull()
    await user.click(screen.getByRole('button', { name: 'Continuar' }))
    expect(progress()).toBe(1)
    await fill(user)
    expect((screen.getByLabelText('Peso (kg)') as HTMLInputElement).value).toBe('70')
    expect(progress()).toBe(1)
    await user.click(screen.getByRole('button', { name: 'Continuar' }))
    await fill(user)
    expect((screen.getByLabelText('Valor · Glucosa en plasma') as HTMLInputElement).value).toBe('92')
    expect(progress()).toBe(2)
    await user.click(screen.getByRole('button', { name: 'Completar sección' }))
    await fill(user)
    expect(progress()).toBe(3)
    expect((screen.getByLabelText('Alimento · Desayuno · Preparación 1 · Alimento 1') as HTMLInputElement).value).toBe('Leche descremada')
    expect((screen.getByLabelText('Cantidad · Comida · Preparación 1 · Alimento 1') as HTMLInputElement).value).toBe('0.5')
    await fill(user)
    expect(screen.queryByLabelText('Nombre de preparación · Desayuno · Preparación 2')).toBeNull()
    await user.click(screen.getByRole('button', { name: 'Completar R24' }))
    expect(progress()).toBe(4)
    await fill(user)
    expect((screen.getByLabelText('Actividad · 1') as HTMLInputElement).value).toBe('Yoga Hatha')
    await fill(user)
    expect(screen.queryByLabelText('Actividad · 2')).toBeNull()
    await user.click(screen.getByRole('button', { name: 'Continuar' }))
    expect(progress()).toBe(5)
    await fill(user)
    expect(progress()).toBe(5)
    expect(screen.getByRole('combobox', { name: 'Autor de metabolismo basal / reposo' }).textContent).toContain('Mifflin')
    await user.click(screen.getByRole('button', { name: 'Confirmar revisión (sin guardar)' }))
    expect(progress()).toBe(6)
    const nav = screen.getByRole('navigation', { name: 'Secciones de la evaluación inicial' })
    await user.click(within(nav).getByRole('button', { name: /Antropometría/ }))
    fireEvent.change(screen.getByLabelText('Peso (kg)'), { target: { value: '' } })
    expect(progress()).toBe(1)
    await fill(user)
    expect(progress()).toBe(1)
    expect((within(nav).getByRole('button', { name: /Bioquímica/ }) as HTMLButtonElement).disabled).toBe(true)
  }, 25000)

  it('respeta tiempos sin consumo, filas existentes y ausencia global del R24', async () => {
    const user = userEvent.setup(), complete = vi.fn()
    render(<DietaryRecall onComplete={complete} />)
    await selectOption(user, 'Disponibilidad del recordatorio', 'Capturar recordatorio')
    await selectOption(user, 'Estado · Desayuno', 'No hubo consumo')
    await selectOption(user, 'Estado · Comida', 'Hubo consumo · Capturar')
    await user.click(screen.getByRole('button', { name: 'Agregar preparación · Comida' }))
    fireEvent.change(screen.getByLabelText('Nombre de preparación · Comida · Preparación 1'), { target: { value: 'Fila ficticia conservada' } })
    await fill(user)
    expect(screen.queryByLabelText('Nombre de preparación · Desayuno · Preparación 1')).toBeNull()
    expect(screen.queryByLabelText('Alimento · Comida · Preparación 1 · Alimento 1')).toBeNull()
    expect((screen.getByLabelText('Nombre de preparación · Comida · Preparación 1') as HTMLInputElement).value).toBe('Fila ficticia conservada')
    await user.click(screen.getByRole('button', { name: 'Completar R24' }))
    expect(complete).not.toHaveBeenCalled()
    await selectOption(user, 'Disponibilidad del recordatorio', 'Recordatorio no disponible')
    await fill(user)
    expect(within(screen.getByRole('region', { name: 'Herramientas de desarrollo · R24' })).getByRole('status').textContent).toContain('Sin cambios')
    await user.click(screen.getByRole('button', { name: 'Completar R24' }))
    expect(complete).toHaveBeenCalledOnce()
  }, 15000)

  it('rellena consulta por módulos sin formulario anidado, sobrescritura ni revisión automática', async () => {
    const user = userEvent.setup()
    render(<MemoryRouter initialEntries={['/dashboard/pacientes/DEMO-001/consultas/nueva']}><Routes><Route path="/dashboard/pacientes/:patientId/consultas/nueva" element={<ConsultationRegistration />} /></Routes></MemoryRouter>)
    fireEvent.change(screen.getByLabelText('Peso (kg)'), { target: { value: '72' } })
    for (const [label, action] of [['Datos de consulta', 'Continuar'], ['Antropometría', 'Continuar'], ['Bioquímica', 'Completar sección'], ['R24', 'Completar R24'], ['Hábitos', 'Continuar'], ['Fórmulas', 'Revisar consulta']]) {
      const tools = screen.getByRole('region', { name: `Herramientas de desarrollo · ${label}` })
      await user.click(within(tools).getByRole('button', { name: 'Rellenar campos vacíos' }))
      expect(screen.queryByRole('dialog')).toBeNull()
      await user.click(screen.getByRole('button', { name: action }))
    }
    expect(document.querySelectorAll('form form')).toHaveLength(0)
    expect((screen.getByLabelText('Peso (kg)') as HTMLInputElement).value).toBe('72')
    const dialog = await screen.findByRole('dialog')
    expect(dialog.textContent).toContain('Consulta ficticia de desarrollo')
    expect(dialog.textContent).toContain('Preparación ficticia de desarrollo')
    expect(dialog.textContent).toContain('Yoga Hatha')
    expect(dialog.textContent).toContain('no se ha guardado ni enviado')
  }, 15000)

  it('no muestra la herramienta fuera de desarrollo', () => {
    vi.stubEnv('DEV', false)
    render(<Form><DevFormTools profile="patient" /></Form>)
    expect(screen.queryByText('Modo desarrollo')).toBeNull()
    expect(screen.queryByRole('button', { name: 'Rellenar campos vacíos' })).toBeNull()
  })
})
