import { biochemicalDeterminations, isBiochemistryUnavailable, readBiochemistryDraft } from './biochemistryModel'

export function validateLabValue(value: unknown) {
  if (value == null || value === '') return
  if (typeof value !== 'string' || value.length > 24 || !/^\d+(?:[.,]\d+)?$/.test(value.trim()) || !Number.isFinite(Number(value.trim().replace(',', '.')))) {
    return 'Ingresa un número no negativo, sin unidades, de hasta 24 caracteres.'
  }
}

export const validateLabText = (limit: number) => (value: unknown) => {
  if (value == null || value === '') return
  if (typeof value !== 'string' || value.length > limit) return `Usa hasta ${limit} caracteres.`
}

export const validateBiochemistryField = (validate: (value: unknown) => unknown) => (value: unknown, values: Record<string, unknown>) =>
  isBiochemistryUnavailable(values.biochemistry) ? undefined : validate(value)

export function validateLabUnit(value: unknown, values: Record<string, unknown>, determinationId: string) {
  if (isBiochemistryUnavailable(values.biochemistry)) return
  const draft = readBiochemistryDraft(values.biochemistry)
  const results = readBiochemistryDraft(draft.results)
  const result = readBiochemistryDraft(results[determinationId])
  if (typeof result.value === 'string' && result.value.trim() && (typeof value !== 'string' || !value.trim())) return 'Indica la unidad del informe para este valor.'
  return validateLabText(40)(value)
}

export function validateBiochemistryStep(values: Record<string, unknown>) {
  const draft = readBiochemistryDraft(values.biochemistry)
  if (isBiochemistryUnavailable(draft)) return {}
  const results = readBiochemistryDraft(draft.results)
  if (biochemicalDeterminations.some(item => {
    const result = readBiochemistryDraft(results[item.id])
    return typeof result.value === 'string' && result.value.trim() !== ''
  })) return {}
  return { biochemistry: { availability: 'Captura al menos un resultado o indica que el estudio no se realizó o no está disponible.' } }
}

export function validateLabDate(value: unknown) {
  if (value == null || value === '') return
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return 'Ingresa una fecha válida.'
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(`${value}T12:00:00Z`)
  if (year < 1000 || Number.isNaN(date.getTime()) || date.getUTCFullYear() !== year || date.getUTCMonth() + 1 !== month || date.getUTCDate() !== day) return 'Ingresa una fecha válida.'
}
