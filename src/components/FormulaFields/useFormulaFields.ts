import { useFieldState, useFormStateSelector } from 'informed'
import { consultationFormulaContext, formulasInactive, reviewFormulas, type FormulaContext } from '../AssessmentFormulas/formulaModel'
import { calculateFormulas } from '../AssessmentFormulas/formulaCalculations'

export function useFormulaFields(context?: FormulaContext, birthDate = '') {
  const snapshot = useFormStateSelector(state => JSON.stringify(state.values.formulas ?? null))
  const value: unknown = JSON.parse(snapshot)
  const { value: weightKg } = useFieldState('weightKg')
  const { value: heightCm } = useFieldState('heightCm')
  const { value: waistCm } = useFieldState('waistCm')
  const { value: hipCm } = useFieldState('hipCm')
  const recallSnapshot = useFormStateSelector(state => JSON.stringify(state.values.recall ?? null))
  const habitsSnapshot = useFormStateSelector(state => JSON.stringify(state.values.habits ?? null))
  const recall: unknown = JSON.parse(recallSnapshot)
  const habits: unknown = JSON.parse(habitsSnapshot)
  const data = reviewFormulas(value)
  const resolvedContext = context ?? consultationFormulaContext({ weightKg, heightCm, waistCm, hipCm, recall, habits }, birthDate)
  return { inactive: formulasInactive(value), data, results: calculateFormulas(data, resolvedContext) }
}
