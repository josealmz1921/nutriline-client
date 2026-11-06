import { asRecord, cleanRecallText } from '../DietaryRecall/recallModel'
import { positiveDecimal } from '../Anthropometry/anthropometryCalculations'

export const habitNumbers = [
  { id: 'mealsPerDay', label: 'Comidas por día', max: 100, integer: true, legacy: 'numComidas' },
  { id: 'minutesPerMeal', label: 'Tiempo por comida (minutos)', max: 1440, integer: false, legacy: 'timeComida' },
  { id: 'waterGlasses', label: 'Vasos de agua por día', max: 1000, integer: false, legacy: 'vasosApD' },
  { id: 'sleepHours', label: 'Horas de sueño por día', max: 24, integer: false, legacy: 'HorasSueno' },
] as const
export const activityLevels = [
  { value: '', label: 'Sin especificar' }, { value: 'sedentary', label: 'Poco o ningún ejercicio' },
  { value: 'light', label: 'Ejercicio ligero' }, { value: 'moderate', label: 'Ejercicio moderado' },
  { value: 'strong', label: 'Ejercicio fuerte' }, { value: 'veryStrong', label: 'Ejercicio muy fuerte' },
] as const
export interface HabitActivity { name: string; duration: string; unit: string; met: string; source: string }
export interface HabitsData {
  availability: string; preferred: string; disliked: string; mealsPerDay: string; minutesPerMeal: string
  waterGlasses: string; sleepHours: string; activityStatus: string; activityLevel: string; activities: HabitActivity[]
}
export const habitsInactive = (value: unknown) => ['notPerformed', 'unavailable'].includes(String(asRecord(value).availability))
export const activitiesInactive = (value: unknown) => habitsInactive(value) || asRecord(value).activityStatus !== 'captured'
export function reviewHabits(value: unknown): HabitsData {
  const draft = asRecord(value)
  const active = draft.availability === 'captured'
  const text = (key: string) => active ? cleanRecallText(draft[key]) : ''
  return { availability: cleanRecallText(draft.availability), preferred: text('preferred'), disliked: text('disliked'),
    mealsPerDay: text('mealsPerDay'), minutesPerMeal: text('minutesPerMeal'), waterGlasses: text('waterGlasses'), sleepHours: text('sleepHours'),
    activityStatus: text('activityStatus'), activityLevel: text('activityLevel'),
    activities: active && !activitiesInactive(draft) && Array.isArray(draft.activities) ? draft.activities.map(item => {
      const row = asRecord(item)
      return Object.fromEntries(['name', 'duration', 'unit', 'met', 'source'].map(key => [key, cleanRecallText(row[key])])) as unknown as HabitActivity
    }) : [],
  }
}
export function activityMinutes(activity: HabitActivity) {
  const duration = positiveDecimal(activity.duration)
  return duration !== null && ['minutes', 'hours'].includes(activity.unit) ? duration * (activity.unit === 'hours' ? 60 : 1) : null
}
export function calculateActivities(data: HabitsData, weight: unknown) {
  const rows = data.activities.map(activity => {
    const minutes = activityMinutes(activity)
    const met = positiveDecimal(activity.met)
    const metMinutes = minutes !== null && met !== null && activity.source ? minutes * met : null
    const kg = positiveDecimal(weight)
    const kcal = metMinutes !== null && kg !== null ? metMinutes * 0.0175 * kg : null
    return { ...activity, minutes, metMinutes, kcal: kcal !== null && Number.isFinite(kcal) ? kcal : null }
  })
  const active = data.availability === 'captured'
  const none = active && data.activityStatus === 'none'
  const complete = active && data.activityStatus === 'captured' && rows.length > 0 && rows.every(row => row.metMinutes !== null) && rows.reduce((sum, row) => sum + (row.minutes ?? 0), 0) <= 1440
  return { rows,
    metMinutes: none ? 0 : complete ? rows.reduce((sum, row) => sum + row.metMinutes!, 0) : null,
    kcal: none ? 0 : complete && rows.every(row => row.kcal !== null) ? rows.reduce((sum, row) => sum + row.kcal!, 0) : null,
  }
}
