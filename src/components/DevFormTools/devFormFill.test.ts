import { afterEach, describe, expect, it, vi } from 'vitest'
import { fillDevEmptyFields, isDevEmpty } from './devFormFill'
import { devFormExamples } from './devFormExamples'

afterEach(() => vi.unstubAllEnvs())
const apiFor = (initial: Record<string, unknown> = {}) => {
  const values = { ...initial }
  return { values, getValue: (name: string) => values[name], setValue: vi.fn((name: string, value: unknown) => { values[name] = value }) }
}

describe('Autorrelleno seguro de desarrollo', () => {
  it('solo completa vacíos, preserva cero, false, selecciones y valores inválidos capturados', () => {
    const api = apiFor({ fullName: 'Nombre ficticio capturado', email: 'correo-inválido', phone: '   ', gender: 'Mujer' })
    expect(fillDevEmptyFields(api, 'patient')).toBeGreaterThan(0)
    expect(api.values.fullName).toBe('Nombre ficticio capturado')
    expect(api.values.email).toBe('correo-inválido')
    expect(api.values.gender).toBe('Mujer')
    expect(api.values.phone).toBe('+52 55 0000 0000')
    api.setValue.mockClear()
    expect(fillDevEmptyFields(api, 'patient')).toBe(0)
    expect(api.setValue).not.toHaveBeenCalled()
    expect(isDevEmpty(0)).toBe(false)
    expect(isDevEmpty(false)).toBe(false)
    expect(isDevEmpty([])).toBe(false)
    expect(isDevEmpty({})).toBe(false)
  })
  it('respeta declaraciones de ausencia en cada módulo', () => {
    for (const [profile, field] of [['anthropometry', 'measurementAvailability'], ['biochemistry', 'biochemistry.availability'], ['recall', 'recall.availability'], ['habits', 'habits.availability'], ['reports', 'formulas.availability']] as const) {
      for (const availability of ['notPerformed', 'unavailable']) {
        const api = apiFor({ [field]: availability })
        expect(fillDevEmptyFields(api, profile)).toBe(0)
        expect(api.setValue).not.toHaveBeenCalled()
      }
    }
  })
  it('no completa unidades ni valores de una determinación parcialmente capturada', () => {
    const api = apiFor({ 'biochemistry.results.glucose.value': '5.5', 'biochemistry.results.albumin.unit': 'Unidad capturada' })
    fillDevEmptyFields(api, 'biochemistry')
    expect(api.values['biochemistry.results.glucose.value']).toBe('5.5')
    expect(api.values['biochemistry.results.glucose.unit']).toBeUndefined()
    expect(api.values['biochemistry.results.albumin.value']).toBeUndefined()
    expect(api.values['biochemistry.results.albumin.unit']).toBe('Unidad capturada')
  })
  it('genera fechas locales no futuras incluso alrededor del cambio de día', () => {
    const now = new Date('2026-11-06T00:15:00-06:00')
    const examples = devFormExamples('consultation', now)
    expect(examples.occurredAt).toBe('2026-11-05T23:15')
    expect(examples.measuredAt).toBe('2026-11-05T22:45')
    expect(devFormExamples('reports', now)['formulas.referenceDate']).toBe('2026-11-06')
  })
  it('no modifica nada si la aplicación no está en desarrollo', () => {
    vi.stubEnv('DEV', false)
    const api = apiFor()
    expect(fillDevEmptyFields(api, 'patient')).toBe(0)
    expect(api.setValue).not.toHaveBeenCalled()
  })
})
