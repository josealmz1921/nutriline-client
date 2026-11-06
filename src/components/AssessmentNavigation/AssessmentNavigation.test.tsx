import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AssessmentNavigation from './AssessmentNavigation'

afterEach(cleanup)
const steps = [
  { id: 'patient', label: 'Datos del paciente', available: true },
  { id: 'anthropometry', label: 'Antropometría', available: true },
  { id: 'biochemistry', label: 'Bioquímica', available: true },
  { id: 'recall', label: 'Recordatorio de 24 horas', available: false },
  { id: 'habits', label: 'Hábitos', available: false },
  { id: 'reports', label: 'Fórmulas y reportes', available: false },
] as const

describe('Indicador compacto de pasos', () => {
  it('distingue círculos completados, actual y futuros manteniendo el progreso real', () => {
    const { container } = render(<AssessmentNavigation steps={steps} current="biochemistry" completed={['patient', 'anthropometry']} onSelect={vi.fn()} />)
    expect(screen.getByRole('button', { name: /Datos del paciente/ }).getAttribute('data-completed')).toBe('true')
    expect(screen.getByRole('button', { name: /Antropometría/ }).getAttribute('data-completed')).toBe('true')
    expect(screen.getByRole('button', { name: /Bioquímica/ }).getAttribute('aria-current')).toBe('step')
    expect((screen.getByRole('button', { name: /Recordatorio de 24 horas/ }) as HTMLButtonElement).disabled).toBe(true)
    expect(container.querySelectorAll('li[data-connected="true"]')).toHaveLength(2)
    expect((screen.getByRole('progressbar', { name: 'Secciones completadas' }) as HTMLProgressElement).value).toBe(2)
    expect(container.textContent).toContain('33%')
  })

  it('permite volver a un paso completado desde los círculos sin alterar reglas de avance', async () => {
    const user = userEvent.setup()
    const selectStep = vi.fn()
    render(<AssessmentNavigation steps={steps} current="anthropometry" completed={['patient']} onSelect={selectStep} />)
    await user.click(screen.getByRole('button', { name: /Datos del paciente/ }))
    expect(selectStep).toHaveBeenCalledWith('patient')
    selectStep.mockClear()
    await user.click(screen.getByRole('button', { name: /Bioquímica/ }))
    expect(selectStep).not.toHaveBeenCalled()
  })

  it('protege también el selector móvil de saltos a secciones bloqueadas o no desarrolladas', () => {
    const selectStep = vi.fn()
    render(<AssessmentNavigation steps={steps} current="anthropometry" completed={['patient']} onSelect={selectStep} />)
    const selector = screen.getByLabelText('Ir a una sección de la evaluación')
    fireEvent.change(selector, { target: { value: 'patient' } })
    expect(selectStep).toHaveBeenCalledWith('patient')
    selectStep.mockClear()
    for (const value of ['biochemistry', 'recall', 'habits', 'reports']) fireEvent.change(selector, { target: { value } })
    expect(selectStep).not.toHaveBeenCalled()
  })
})
