import { describe, expect, it } from 'vitest'
import { calculateActivities, reviewHabits } from './habitsModel'
import { validateActivity, validateHabitNumber, validateHabits } from './habitsValidation'

describe('Hábitos, disponibilidad y actividades por día', () => {
  it('normaliza sin borrar el borrador y distingue ausente de cero declarado', () => {
    const draft = { availability: 'captured', preferred: ' Ficticio ', waterGlasses: '0', activityStatus: 'captured', activities: [{ name: 'Yoga', duration: '30', unit: 'minutes', met: '2.5', source: 'Referencia ficticia' }] }
    expect(reviewHabits(draft).preferred).toBe('Ficticio')
    expect(reviewHabits(draft).waterGlasses).toBe('0')
    const inactive = reviewHabits({ ...draft, availability: 'unavailable' })
    expect(inactive.activities).toEqual([])
    expect(inactive.waterGlasses).toBe('')
    expect(draft.activities).toHaveLength(1)
    expect(calculateActivities(inactive, '70').kcal).toBeNull()
    expect(calculateActivities(reviewHabits({ availability: 'captured', activityStatus: 'none' }), undefined).kcal).toBe(0)
    expect(calculateActivities(reviewHabits({ availability: 'captured', activityStatus: 'unavailable' }), '70').kcal).toBeNull()
  })
  it('calcula por fila y convierte horas, sin multiplicar cada fila por la suma de MET', () => {
    const data = reviewHabits({ availability: 'captured', activityStatus: 'captured', activities: [
      { name: 'A', duration: '30', unit: 'minutes', met: '2', source: 'Fuente A' },
      { name: 'B', duration: '1', unit: 'hours', met: '4', source: 'Fuente B' },
    ] })
    const result = calculateActivities(data, '70')
    expect(result.rows[0].kcal).toBeCloseTo(73.5)
    expect(result.rows[1].kcal).toBeCloseTo(294)
    expect(result.metMinutes).toBe(300)
    expect(result.kcal).toBeCloseTo(367.5)
    expect(calculateActivities(data, undefined).kcal).toBeNull()
    expect(calculateActivities(data, undefined).metMinutes).toBe(300)
    data.activities[1].source = ''
    expect(calculateActivities(data, '70').kcal).toBeNull()
    expect(calculateActivities(data, '70').metMinutes).toBeNull()
  })
  it('valida estados y duración conjunta sin obligar a todas las respuestas', () => {
    expect(validateHabits({})).toEqual({})
    expect(validateHabits({}, true)).toHaveProperty('habits.availability')
    expect(validateHabits({ habits: { availability: 'notPerformed' } }, true)).toEqual({})
    expect(validateHabits({ habits: { availability: 'captured', activityStatus: 'none' } }, true)).toEqual({})
    expect(validateHabits({ habits: { availability: 'captured', activityStatus: 'captured' } }, true)).toHaveProperty('habits.activityStatus')
    const habits = { availability: 'captured', activityStatus: 'captured', activities: [{ name: 'Ficticio', duration: '25', unit: 'hours' }] }
    expect(validateHabits({ habits }, true)).toHaveProperty('habits.activityStatus')
    expect(validateHabitNumber('sleepHours')('25', { habits })).toBeTruthy()
    expect(validateHabitNumber('sleepHours')('0', { habits })).toBeUndefined()
    expect(validateHabitNumber('mealsPerDay')('1.5', { habits })).toBeTruthy()
    expect(validateActivity('duration')('0', { habits })).toBeTruthy()
    expect(validateActivity('duration')('0', { habits: { availability: 'unavailable' } })).toBeUndefined()
    expect(validateActivity('met')('', { habits })).toBeUndefined()
  })
})
