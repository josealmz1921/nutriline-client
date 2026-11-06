import { useRef, useState } from 'react'
import { useFieldState, useFormApi, useFormStateSelector, type ArrayFieldApi } from 'informed'
import { activityCatalog } from '../Habits/activityCatalog'
import { activitiesInactive, habitsInactive, reviewHabits, type HabitActivity } from '../Habits/habitsModel'
import { devHabitActivity } from '../DevFormTools/devFormExamples'

export function useHabitsFields(onDraftChange?: () => void) {
  const api = useFormApi()
  const activitiesApiRef = useRef<ArrayFieldApi | null>(null)
  // Informed muta objetos anidados: entregar una instantánea inmutable también
  // evita que React Compiler reutilice derivados de una referencia ya modificada.
  const snapshot = useFormStateSelector(state => JSON.stringify(state.values.habits ?? null))
  const value: unknown = JSON.parse(snapshot)
  const { value: consultationWeight } = useFieldState('weightKg')
  const [search, setSearch] = useState('')
  const addActivity = (add: ArrayFieldApi['addWithInitialValue'], activity: HabitActivity) => { add(activity); onDraftChange?.() }
  const fillDevRows = () => {
    if (!import.meta.env.DEV || api.getValue('habits.availability') !== 'captured' || api.getValue('habits.activityStatus') !== 'captured') return 0
    const rows = api.getValue('habits.activities')
    if ((rows == null || (Array.isArray(rows) && rows.length === 0)) && activitiesApiRef.current) {
      addActivity(activitiesApiRef.current.addWithInitialValue, devHabitActivity()); return 1
    }
    return 0
  }
  return { activitiesApiRef, addActivity, fillDevRows, consultationWeight, inactive: habitsInactive(value), activitiesHidden: activitiesInactive(value), data: reviewHabits(value), search, setSearch,
    matches: activityCatalog.filter(item => item.name.toLocaleLowerCase('es').includes(search.toLocaleLowerCase('es'))) }
}
