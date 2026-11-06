import { describe, expect, it } from 'vitest'
import { buildReportModel } from './reportModel'
import { reportTestFixture } from './reportTestFixtures'

describe('Modelo de reportes PDF', () => {
  it('incluye datos confirmados, bioquímica, autores, fórmulas y punto sin mutar las entradas', () => {
    const { context, data } = reportTestFixture()
    const before = JSON.stringify({ context, data })
    const model = buildReportModel(context, data, 'evaluation')
    const output = JSON.stringify(model)
    for (const expected of ['Paciente ficticio Álvarez', 'Fiebre', 'Notas ficticias', '92', 'mg/dL', 'Comentario manual', 'Mifflin', 'Alimento libre ficticio']) expect(output).toContain(expected)
    expect(model.point).not.toBeNull()
    expect(JSON.stringify({ context, data })).toBe(before)
    expect(model.fileName).toBe('nutriline-evaluacion-borrador.pdf')
  })
  it('no revela borradores excluidos por ausencia ni produce valores falsos', () => {
    const { context, data } = reportTestFixture()
    context.measurements.measurementAvailability = 'notPerformed'
    context.biochemistry = { availability: 'unavailable', collectedOn: null, laboratory: null, results: { glucose: { value: '987', unit: 'secreto', reference: null, interpretation: null } } }
    context.recall.availability = 'unavailable'
    context.habits.availability = 'notPerformed'
    const model = buildReportModel(context, data, 'evaluation')
    const output = JSON.stringify(model)
    expect(model.point).toBeNull()
    for (const hidden of ['987', 'secreto', 'Alimento libre ficticio', '70 kg']) expect(output).not.toContain(hidden)
    expect(output).toContain('Sin resultado')
    expect(output).toContain('Mediciones no realizadas o no disponibles')
  })
  it('distingue R24 de prescripción y no convierte un subtotal en total diario', () => {
    const { context, data } = reportTestFixture()
    const model = buildReportModel(context, data, 'diet')
    expect(model.title).toContain('no dieta prescrita')
    expect(model.point).toBeNull()
    const nutrients = model.sections.find(section => section.title.startsWith('Nutrientes'))!
    expect(nutrients.rows?.find(row => row.label.startsWith('Energía (kcal)'))?.value).toBe('Sin total calculable')
    expect(model.sections[0].paragraphs?.[0]).toContain('no un menú recomendado')
    expect(model.sections.some(section => section.title === 'Bioquímica')).toBe(false)
  })
})
