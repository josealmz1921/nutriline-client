import { asRecord } from '../DietaryRecall/recallModel'
import { ageAtDate, formulasInactive, localCalendarDate } from './formulaModel'

export function validateFormulaDate(value: unknown, values: Record<string, unknown>) {
  if (formulasInactive(values.formulas)) return
  const text = String(value ?? '')
  if (!text && asRecord(values.formulas).availability !== 'captured') return
  if (ageAtDate(text, text) === null || text > localCalendarDate()) return 'Indica una fecha válida, no futura.'
}
export function validateFormulaText(value: unknown, values: Record<string, unknown>) {
  if (!formulasInactive(values.formulas) && String(value ?? '').length > 2000) return 'Usa hasta 2000 caracteres.'
}
export function validateFormulas(values: Record<string, unknown>, required = false) {
  const data = asRecord(values.formulas)
  if (formulasInactive(data)) return {}
  if (!required && Object.values(data).every(value => value == null || value === '')) return {}
  if (data.availability !== 'captured') return { formulas: { availability: 'Revisa los resultados o declara la revisión no realizada/no disponible.' } }
  return {}
}
