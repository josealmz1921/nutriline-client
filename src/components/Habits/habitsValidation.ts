import { asRecord, cleanRecallText } from '../DietaryRecall/recallModel'
import { positiveDecimal } from '../Anthropometry/anthropometryCalculations'
import { activitiesInactive, activityMinutes, habitNumbers, habitsInactive, reviewHabits } from './habitsModel'

export const validateHabitText = (value: unknown, values: Record<string, unknown>) => {
  if (!habitsInactive(values.habits) && String(value ?? '').length > 2000) return 'Usa hasta 2000 caracteres.'
}
export function validateHabitNumber(id: string) {
  return (value: unknown, values: Record<string, unknown>) => {
    if (habitsInactive(values.habits) || value == null || value === '') return
    const field = habitNumbers.find(item => item.id === id)!
    const text = String(value).trim().replace(',', '.')
    const n = /^\d+(?:\.\d+)?$/.test(text) ? Number(text) : NaN
    if (!Number.isFinite(n) || n < 0 || n > field.max || (field.integer && !Number.isInteger(n))) return `Usa un número ${field.integer ? 'entero ' : ''}entre 0 y ${field.max}. Límite técnico, no recomendación.`
  }
}
export function validateActivity(kind: 'name' | 'duration' | 'unit' | 'met' | 'source') {
  return (value: unknown, values: Record<string, unknown>) => {
    if (activitiesInactive(values.habits)) return
    const text = cleanRecallText(value)
    if (kind === 'met') return text && (positiveDecimal(text) === null || positiveDecimal(text)! > 100) ? 'Usa un MET positivo hasta 100 o deja vacío si no se conoce.' : undefined
    if (kind === 'duration') return positiveDecimal(text) === null || positiveDecimal(text)! > 1440 ? 'Ingresa una duración positiva (máximo técnico 1440).' : undefined
    if (kind === 'unit') return !['minutes', 'hours'].includes(text) ? 'Selecciona minutos u horas.' : undefined
    if (kind === 'name' && !text) return 'Indica la actividad.'
    if (text.length > 300) return 'Usa hasta 300 caracteres.'
  }
}
export function validateHabits(values: Record<string, unknown>, required = false) {
  const draft = asRecord(values.habits)
  if (habitsInactive(draft)) return {}
  const touched = Object.values(draft).some(value => value !== '' && value != null && (!Array.isArray(value) || value.length))
  if (!required && !touched) return {}
  if (draft.availability !== 'captured') return { habits: { availability: 'Captura la entrevista o declara que no se realizó/no está disponible.' } }
  const data = reviewHabits(draft)
  const errors: Record<string, unknown> = {}
  if (!['captured', 'none', 'unavailable'].includes(data.activityStatus)) errors.activityStatus = 'Declara actividad, ninguna actividad o información no disponible.'
  if (data.activityStatus === 'captured' && !data.activities.length) errors.activityStatus = 'Agrega al menos una actividad o corrige el estado.'
  if (data.activities.reduce((sum, activity) => sum + (activityMinutes(activity) ?? 0), 0) > 1440) errors.activityStatus = 'La duración conjunta supera las 24 horas del día. Revisa duración y unidad.'
  if (!data.preferred && !data.disliked && !habitNumbers.some(field => data[field.id] !== '') && data.activityStatus === 'unavailable') errors.availability = 'Captura algún dato de la entrevista o declara Hábitos no disponibles.'
  return Object.keys(errors).length ? { habits: errors } : {}
}
