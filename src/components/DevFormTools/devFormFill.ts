import type { FormApi } from 'informed'
import { devFormExamples, type DevFormProfile } from './devFormExamples'

export const isDevEmpty = (value: unknown) => value === undefined || value === null || (typeof value === 'string' && value.trim() === '')
const isUnavailable = (value: unknown) => ['notPerformed', 'unavailable'].includes(String(value))

// Se trabaja con campos individuales; nunca reset(), setValues(), submitForm()
// ni sustitución de objetos completos que borre otras capturas.
export function fillDevEmptyFields(api: Pick<FormApi, 'getValue' | 'setValue'>, profile: DevFormProfile, now = new Date()) {
  if (!import.meta.env.DEV) return 0
  const availability = profile === 'anthropometry' ? 'measurementAvailability' : ({ biochemistry: 'biochemistry.availability', recall: 'recall.availability', habits: 'habits.availability', reports: 'formulas.availability' } as Partial<Record<DevFormProfile, string>>)[profile]
  if (availability && isUnavailable(api.getValue(availability))) return 0
  let count = 0
  const examples = devFormExamples(profile, now)
  const partialDeterminations = new Set<string>()
  if (profile === 'biochemistry') {
    for (const id of ['glucose', 'albumin']) {
      if (['value', 'unit', 'reference', 'interpretation'].some(key => !isDevEmpty(api.getValue(`biochemistry.results.${id}.${key}`)))) partialDeterminations.add(id)
    }
  }
  for (const [name, value] of Object.entries(examples)) {
    const determination = /^biochemistry\.results\.([^.]+)\./.exec(name)?.[1]
    if (determination && partialDeterminations.has(determination)) continue
    if (isDevEmpty(api.getValue(name))) { api.setValue(name, value); count++ }
  }
  return count
}
