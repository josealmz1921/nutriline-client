import { calculateAnthropometry } from '../Anthropometry/anthropometryCalculations'
import { measurements } from '../Anthropometry/measurements'
import { calculateFormulas } from '../AssessmentFormulas/formulaCalculations'
import { boneAuthors, densityAuthors, exerciseOptions, fatAuthors, metabolicAuthors, muscleAuthors, residualAuthors, stressOptions } from '../AssessmentFormulas/formulaCatalog'
import { reviewFormulas, type FormulaContext, type FormulaData } from '../AssessmentFormulas/formulaModel'
import { biochemicalDeterminations, reviewBiochemistry } from '../Biochemistry/biochemistryModel'
import { calculateRecall } from '../DietaryRecall/recallCalculations'
import { recallMeals, reviewRecall } from '../DietaryRecall/recallModel'
import { activityLevels, calculateActivities, habitNumbers, reviewHabits } from '../Habits/habitsModel'

export type ReportKind = 'anthropometry' | 'diet' | 'evaluation'
export interface ReportSection { title: string; paragraphs?: string[]; rows?: { label: string; value: string }[] }
export interface ReportModel {
  kind: ReportKind; title: string; patient: string; birthDate: string; referenceDate: string; fileName: string
  sections: ReportSection[]; point: { x: number; y: number } | null
}
const format = (value: number | null, unit = '', precision = 2) => value === null ? 'Sin resultado' : `${value.toLocaleString('es-MX', { maximumFractionDigits: precision })}${unit ? ` ${unit}` : ''}`
const text = (value: unknown) => typeof value === 'string' && value.trim() ? value.trim() : 'No registrado'
const availability = (value: string | null | undefined, subject: string) => value === 'notPerformed' ? `${subject} no realizad${['Estudio', 'Recordatorio'].includes(subject) ? 'o' : 'a'}.` : value === 'unavailable' ? `${subject} no disponible.` : `${subject} sin registrar.`

// Modelo de presentación independiente de React PDF: comparte cálculos existentes,
// nunca muta formularios, genera prescripciones ni completa datos clínicos ausentes.
export function buildReportModel(source: FormulaContext, rawData: FormulaData, kind: ReportKind): ReportModel {
  const data = reviewFormulas(rawData)
  const recall = reviewRecall(source.recall)
  const habits = reviewHabits(source.habits)
  const unavailable = ['notPerformed', 'unavailable'].includes(String(source.measurements.measurementAvailability))
  const m = unavailable ? {} : source.measurements
  const context = { ...source, measurements: m, recall, habits }
  const anthro = calculateAnthropometry(m)
  const formulas = calculateFormulas(data, context)
  const sections: ReportSection[] = []
  if (kind === 'evaluation') {
    const info = source.evaluation
    sections.push({ title: 'Contexto de la evaluación', rows: [
      { label: 'Motivo de consulta', value: text(info?.reason) },
      { label: 'Signos y síntomas referidos', value: info?.symptoms?.length ? info.symptoms.join(', ') : 'No registrados (no confirma ausencia)' },
      { label: 'Notas del profesional', value: text(info?.notes) },
      ...(info?.occurredAt ? [{ label: 'Consulta · horario declarado', value: `${info.occurredAt.replace('T', ' ')} (${info.timeZone || 'zona no registrada'})` }] : []),
      ...(info?.measuredAt ? [{ label: 'Mediciones · horario declarado', value: `${info.measuredAt.replace('T', ' ')} (${info.timeZone || 'zona no registrada'})` }] : []),
    ] })
  }
  if (kind !== 'diet') {
    sections.push({ title: 'Mediciones antropométricas', paragraphs: unavailable ? ['Mediciones no realizadas o no disponibles. Los borradores excluidos no se muestran ni se usan para calcular.'] : ['Peso en kg, longitudes/perímetros/diámetros en cm y pliegues en mm. Datos de esta evaluación, sin copiar consultas anteriores.'], rows: unavailable ? [] : [
      ...measurements.map(field => ({ label: field.label, value: m[field.id] ? `${m[field.id]} ${field.unit}` : 'No registrado' })),
      { label: 'Pliegue supraespinal', value: m.supraspinale ? `${m.supraspinale} mm` : 'No registrado' },
    ] })
    sections.push({ title: 'Resultados antropométricos', paragraphs: ['Resultados descriptivos sin clasificación clínica automática. Cada cálculo depende de sus propias mediciones.'], rows: [
      ...(['bmi', 'waistHip', 'waistHeight', 'endomorphy', 'mesomorphy', 'ectomorphy'] as const).map((key, i) => ({ label: ['IMC numérico', 'Índice cintura/cadera', 'Índice cintura/talla', 'Endomorfia', 'Mesomorfia', 'Ectomorfia'][i], value: `${format(anthro[key].value)}${anthro[key].missing.length ? ` · Requiere: ${anthro[key].missing.join(', ')}` : ''}${anthro[key].error ? ` · ${anthro[key].error}` : ''}` })),
    ] })
  }
  if (kind === 'evaluation') {
    const bio = source.biochemistry ? reviewBiochemistry(source.biochemistry) : undefined
    sections.push({ title: 'Bioquímica', paragraphs: bio?.availability ? [availability(bio.availability, 'Estudio')] : bio ? [`Fecha de muestra: ${text(bio.collectedOn)} · Laboratorio: ${text(bio.laboratory)}`, 'Unidades y referencias transcritas del informe; no se aplican rangos históricos ni interpretaciones automáticas.'] : ['Estudio sin registrar.'], rows: bio && !bio.availability ? biochemicalDeterminations.map(item => {
      const row = bio.results[item.id]
      return { label: item.label, value: row ? `Valor: ${text(row.value)} · Unidad: ${text(row.unit)}\nReferencia: ${text(row.reference)}\nInterpretación manual: ${text(row.interpretation)}` : 'No registrado' }
    }) : [] })
  }
  if (kind !== 'anthropometry') {
    sections.push({ title: 'Recordatorio de 24 horas · No es una dieta prescrita', paragraphs: ['Describe consumo declarado, no un menú recomendado ni sustituciones autorizadas. Las referencias históricas de alimentos no están validadas clínicamente.', ...(recall.availability !== 'captured' ? [availability(recall.availability, 'Recordatorio')] : [])] })
    if (recall.availability === 'captured') {
      for (const meal of recallMeals) {
        const entry = recall.meals[meal.id]
        sections.push({ title: meal.label, paragraphs: entry.status !== 'captured' ? [entry.status === 'notConsumed' ? 'No hubo consumo (declarado).' : 'Tiempo sin información disponible.'] : [], rows: entry.status === 'captured' ? entry.preparations.map(prep => ({ label: prep.name || 'Preparación sin nombre', value: prep.foods.map(food => `${text(food.name)} · ${text(food.quantity)} ${text(food.unit)}`).join('\n') || 'Sin alimentos registrados' })) : [] })
      }
      sections.push({ title: 'Nutrientes del R24 · Referencia histórica', paragraphs: ['Un subtotal conocido no es un total diario. No se convierten unidades ni se inventan aportes para alimentos libres.'], rows: calculateRecall(recall).map(row => ({ label: `${row.label}${row.unit ? ` (${row.unit})` : ''}`, value: !row.additive ? 'Unidad o método pendiente de verificar; no se suma.' : row.value !== null ? `${format(row.value)} · Total de los tiempos declarados` : row.subtotal !== null ? `${format(row.subtotal)} · Subtotal conocido, no total diario` : 'Sin total calculable' })) })
    }
    sections.push({ title: 'Hábitos', paragraphs: habits.availability === 'captured' ? [] : [availability(habits.availability, 'Entrevista de hábitos')], rows: habits.availability === 'captured' ? [
      { label: 'Alimentos que prefiere', value: text(habits.preferred) }, { label: 'Alimentos que no le gustan', value: text(habits.disliked) },
      ...habitNumbers.map(field => ({ label: field.label, value: text(habits[field.id]) })),
      { label: 'Nivel de actividad declarado', value: activityLevels.find(item => item.value === habits.activityLevel)?.label || 'No registrado' },
    ] : [] })
    if (habits.availability === 'captured') {
      const activity = calculateActivities(habits, m.weight)
      sections.push({ title: 'Actividad física declarada', paragraphs: [habits.activityStatus === 'none' ? 'Sin actividad física (declarado).' : habits.activityStatus !== 'captured' ? 'Actividad física no disponible o sin registrar.' : 'Energía bruta de actividad: MET × 0.0175 × kg × minutos. No es ejercicio neto ni gasto diario; no se añade automáticamente al metabolismo basal.'], rows: [
        ...activity.rows.map(row => ({ label: text(row.name), value: `Duración: ${text(row.duration)} ${row.unit === 'hours' ? 'horas' : row.unit === 'minutes' ? 'minutos' : '(unidad no registrada)'} · MET: ${text(row.met)}\nFuente: ${text(row.source)}\nEnergía bruta: ${format(row.kcal, 'kcal')}` })),
        { label: 'Total MET·min', value: format(activity.metMinutes) }, { label: 'Energía bruta de las actividades', value: format(activity.kcal, 'kcal') },
      ] })
    }
  }
  const ids = kind === 'anthropometry' ? ['fat', 'fatKg', 'density', 'bone', 'residual', 'muscle', 'bmi'] : kind === 'diet' ? ['bmr', 'exercise', 'stress', 'expenditure', 'consumption', 'balance'] : formulas.map(row => row.id)
  if (data.availability === 'captured') sections.push({ title: 'Métodos seleccionados', rows: [
    { label: 'Sexo de las ecuaciones', value: data.sex === 'male' ? 'Masculino' : data.sex === 'female' ? 'Femenino' : 'Sin determinar' },
    { label: 'Población declarada', value: data.population === 'generalAdult' ? 'Adulto general · Aplicabilidad revisada por el profesional' : data.population === 'other' ? 'Otra población / No aplicable' : 'Sin determinar' },
    ...([
      ['Metabolismo', data.metabolicAuthor, metabolicAuthors], ['Factor de actividad', data.exercise, exerciseOptions], ['Estrés fisiológico', data.stress, stressOptions],
      ['Grasa', data.fatAuthor, fatAuthors], ['Densidad', data.densityAuthor, densityAuthors], ['Masa ósea', data.boneAuthor, boneAuthors], ['Masa residual', data.residualAuthor, residualAuthors], ['Masa muscular', data.muscleAuthor, muscleAuthors],
    ] as const).map(([label, value, options]) => ({ label, value: options.find(option => option.value === value)?.label || 'Sin seleccionar' })),
  ] })
  sections.push({ title: 'Fórmulas y dependencias', paragraphs: ['Estimaciones para revisión profesional, no diagnóstico, aprobación clínica ni prescripción.', ...(data.availability !== 'captured' ? [availability(data.availability, 'Revisión de fórmulas')] : [])], rows: data.availability === 'captured' ? formulas.filter(row => ids.includes(row.id)).map(row => ({ label: row.label, value: `${format(row.value, row.unit, row.id === 'density' ? 4 : 2)}\n${row.detail}` })) : [] })
  sections.push({ title: 'Interpretaciones del profesional', rows: [{ label: 'Grasa', value: text(data.fatInterpretation) }, { label: 'IMC', value: text(data.bmiInterpretation) }] })
  return { kind, title: kind === 'evaluation' ? 'Reporte de evaluación' : kind === 'anthropometry' ? 'Reporte de antropometría' : 'Reporte alimentario · R24, no dieta prescrita', patient: source.name || 'Paciente de demostración', birthDate: source.birthDate || 'No registrado', referenceDate: data.referenceDate || 'No registrada', fileName: `nutriline-${kind === 'diet' ? 'r24' : kind === 'evaluation' ? 'evaluacion' : 'antropometria'}-borrador.pdf`, sections, point: kind !== 'diet' ? anthro.point : null }
}
