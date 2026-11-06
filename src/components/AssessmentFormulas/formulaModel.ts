import { asRecord, cleanRecallText, reviewRecall, type RecallData } from '../DietaryRecall/recallModel'
import { reviewHabits, type HabitsData } from '../Habits/habitsModel'
import type { BiochemistryData } from '../Biochemistry/biochemistryModel'

export interface FormulaContext {
  name?: string; birthDate: string; measurements: Record<string, unknown>; recall: RecallData; habits: HabitsData
  biochemistry?: BiochemistryData
  evaluation?: { reason: string; symptoms: string[]; notes?: string; occurredAt?: string; measuredAt?: string; timeZone?: string }
}
export const formulaFields = ['availability', 'referenceDate', 'sex', 'population', 'metabolicAuthor', 'exercise', 'stress', 'fatAuthor', 'densityAuthor', 'boneAuthor', 'residualAuthor', 'muscleAuthor', 'fatInterpretation', 'bmiInterpretation'] as const
export type FormulaData = Record<typeof formulaFields[number], string>
export const formulasInactive = (value: unknown) => ['notPerformed', 'unavailable'].includes(String(asRecord(value).availability))
export function reviewFormulas(value: unknown): FormulaData {
  const draft = asRecord(value)
  return Object.fromEntries(formulaFields.map(key => [key, key === 'availability' || !formulasInactive(draft) ? cleanRecallText(draft[key]) : ''])) as FormulaData
}
export function consultationFormulaContext(values: Record<string, unknown>, birthDate: string): FormulaContext {
  return { birthDate, measurements: { weight: values.weightKg, height: values.heightCm, waist: values.waistCm, hip: values.hipCm }, recall: reviewRecall(values.recall), habits: reviewHabits(values.habits) }
}
export function ageAtDate(birthDate: string, date: string): number | null {
  const valid = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T12:00:00Z`)) && new Date(`${value}T12:00:00Z`).toISOString().slice(0, 10) === value
  if (!valid(birthDate) || !valid(date) || date < birthDate) return null
  return Number(date.slice(0, 4)) - Number(birthDate.slice(0, 4)) - (date.slice(5) < birthDate.slice(5) ? 1 : 0)
}
export const localCalendarDate = () => { const date = new Date(); return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}` }
