// Fuente: NuevoPaciente.php:989–1136. Referencias históricas, NO clínicas validadas.
export const biochemicalDeterminations = [
  { id: 'glucose', label: 'Glucosa en plasma', legacyValue: 'glucosaPlas', legacyResult: 'glucosaPlasR', legacyReference: '70 a 110 mg/dl' },
  { id: 'uricAcid', label: 'Ácido úrico en suero', legacyValue: 'acidUricS', legacyResult: 'acidUricSR', legacyReference: '2.5 a 8.0 mg/dl' },
  { id: 'albumin', label: 'Albúmina en suero', legacyValue: 'albuminaSue', legacyResult: 'albuminaSueR', legacyReference: '3.5 a 5.0 g/dl' },
  { id: 'creatinine', label: 'Creatinina en suero', legacyValue: 'cretaninaSu', legacyResult: 'cretaninaSuR', legacyReference: '0.1 a 0.4 mg/dl' },
  { id: 'ferritin', label: 'Ferritina en suero', legacyValue: 'FerritinaS', legacyResult: 'FerritinaSR', legacyReference: '15 a 200 μg/dl' },
  { id: 'globulin', label: 'Globulina', legacyValue: 'globulina', legacyResult: 'globulinaR', legacyReference: '2.0 a 3.5 g/dl' },
  { id: 'prealbumin', label: 'Prealbúmina en suero', legacyValue: 'prealnuS', legacyResult: 'prealnuSR', legacyReference: '10 a 40 mg/dl' },
  { id: 'totalProtein', label: 'Proteínas totales en suero', legacyValue: 'proteeinasTS', legacyResult: 'proteeinasTSR', legacyReference: '5.5 a 8.0 g/dl' },
  { id: 'transferrin', label: 'Transferrina en suero', legacyValue: 'transferrinaSuer', legacyResult: 'transferrinaSuerR', legacyReference: '200 a 400 mg/dl' },
  { id: 'urea', label: 'Urea en suero', legacyValue: 'ureaSuer', legacyResult: 'ureaSuerR', legacyReference: '17 a 42 mg/dl' },
] as const

export type DeterminationId = typeof biochemicalDeterminations[number]['id']

export interface BiochemicalResult {
  value: string | null
  unit: string | null
  reference: string | null
  interpretation: string | null
}

// Modelo local del módulo, no contrato de API ni estado global del paciente.
export interface BiochemistryData {
  availability?: 'notPerformed' | 'unavailable'
  collectedOn: string | null
  laboratory: string | null
  results: Partial<Record<DeterminationId, BiochemicalResult>>
}

const record = (value: unknown): Record<string, unknown> => typeof value === 'object' && value !== null ? value as Record<string, unknown> : {}
const text = (value: unknown) => typeof value === 'string' ? value.trim() || null : null

export function readBiochemistryDraft(value: unknown) {
  return record(value)
}

export function isBiochemistryUnavailable(value: unknown) {
  return ['notPerformed', 'unavailable'].includes(String(record(value).availability))
}

// Normaliza una copia para revisión; nunca muta la captura ni inventa ausentes.
export function reviewBiochemistry(value: unknown): BiochemistryData {
  const draft = record(value)
  if (isBiochemistryUnavailable(draft)) return { availability: draft.availability as 'notPerformed' | 'unavailable', collectedOn: null, laboratory: null, results: {} }
  const sourceResults = record(draft.results)
  const results: BiochemistryData['results'] = {}
  for (const determination of biochemicalDeterminations) {
    const source = record(sourceResults[determination.id])
    const result = {
      value: text(source.value)?.replace(',', '.') ?? null,
      unit: text(source.unit), reference: text(source.reference), interpretation: text(source.interpretation),
    }
    if (Object.values(result).some(item => item !== null)) results[determination.id] = result
  }
  return { collectedOn: text(draft.collectedOn), laboratory: text(draft.laboratory), results }
}
