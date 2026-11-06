import { positiveDecimal } from '../Anthropometry/anthropometryCalculations'
import { calculateRecall } from '../DietaryRecall/recallCalculations'
import { calculateActivities } from '../Habits/habitsModel'
import { ageAtDate, type FormulaContext, type FormulaData } from './formulaModel'

export interface FormulaResult { id: string; label: string; unit: string; value: number | null; detail: string }
const result = (id: string, label: string, unit: string, value: number | null, detail: string): FormulaResult => ({ id, label, unit, value: value !== null && Number.isFinite(value) ? value : null, detail })
const positive = (n: number | null) => n !== null && Number.isFinite(n) && n > 0 ? n : null
const percentage = (n: number | null) => n !== null && Number.isFinite(n) && n > 0 && n < 100 ? n : null

// Tabla Durnin–Womersley: log10 de bíceps + tríceps + subescapular + suprailíaco (mm).
export function durninDensity(age: number, sex: string, folds: number[]) {
  if (age < 18 || age > 72 || !['male', 'female'].includes(sex) || folds.length !== 4 || folds.some(n => !Number.isFinite(n) || n <= 0)) return null
  const index = age < 20 ? 0 : age < 30 ? 1 : age < 40 ? 2 : age < 50 ? 3 : 4
  const table = sex === 'male' ? [[1.162, .063], [1.1631, .0632], [1.1422, .0544], [1.162, .07], [1.1715, .0779]] : [[1.1549, .0678], [1.1599, .0717], [1.1423, .0632], [1.1333, .0612], [1.1339, .0645]]
  const [c, m] = table[index]
  return positive(c - m * Math.log10(folds.reduce((a, b) => a + b, 0)))
}

export function calculateFormulas(data: FormulaData, context: FormulaContext): FormulaResult[] {
  const m = context.measurements
  const measurementsAvailable = !['notPerformed', 'unavailable'].includes(String(m.measurementAvailability))
  const measure = (key: string) => measurementsAvailable ? positiveDecimal(m[key]) : null
  const weight = measure('weight'), height = measure('height'), waist = measure('waist')
  const age = ageAtDate(context.birthDate, data.referenceDate)
  const sexKnown = ['male', 'female'].includes(data.sex)
  const eligible = data.availability === 'captured' && data.population === 'generalAdult' && sexKnown && age !== null && age >= 18 && age <= 120
  const baseReason = 'Requiere revisión de fórmulas activa, población adulta general, sexo de la ecuación y fecha de referencia válidos. No se infiere el sexo a partir del género.'
  const bmi = weight !== null && height !== null ? positive(weight / (height / 100) ** 2) : null
  let bmr: number | null = null
  let bmrDetail = 'Selecciona autor. Cada método exige sus datos; sin ellos no hay resultado.'
  if (data.metabolicAuthor === 'valencia') bmrDetail = 'Se conserva Valencia 2008, pero no se activa hasta verificar fuente, coeficientes y población.'
  if (data.metabolicAuthor === 'iom') bmrDetail = 'IOM 2005 estima requerimiento energético (EER), no TMB. Pendiente de protocolo y coeficientes PA; no se aplica como metabolismo basal ni se duplica actividad.'
  if (eligible && weight !== null && age !== null) {
    if (data.metabolicAuthor === 'mifflin') {
      bmrDetail = 'Mifflin-St Jeor, versión simplificada: 10×kg + 6.25×cm − 5×años + (5 masculino / −161 femenino). Estimación en reposo; alcance 19–78 años.'
      if (height !== null && age >= 19 && age <= 78) bmr = positive(10 * weight + 6.25 * height - 5 * age + (data.sex === 'male' ? 5 : -161))
    }
    if (data.metabolicAuthor === 'harris') {
      bmrDetail = 'Harris-Benedict original (coeficientes redondeados), no revisión de 1984. Masculino: 66.473 + 13.752×kg + 5.003×cm − 6.755×años; femenino: 655.096 + 9.563×kg + 1.850×cm − 4.676×años.'
      if (height !== null) bmr = positive(data.sex === 'male' ? 66.473 + 13.752 * weight + 5.003 * height - 6.755 * age : 655.096 + 9.563 * weight + 1.85 * height - 4.676 * age)
    }
    if (['schofield', 'fao'].includes(data.metabolicAuthor)) {
      const index = age < 30 ? 0 : age < 60 ? 1 : 2
      const coefficients = data.sex === 'male' ? [[15.057, 692.2], [11.472, 873.1], [11.711, 587.7]] : [[14.818, 486.6], [8.126, 845.6], [9.082, 658.5]]
      const [a, b] = coefficients[index]
      bmr = positive(a * weight + b)
      bmrDetail = `Schofield, tabla 5.2 FAO: ${a}×peso (kg) + ${b}. Bandas sin solapamiento: 18–<30, 30–<60, ≥60 años. FAO conserva estas ecuaciones; no es un segundo método independiente.`
    }
  }
  const activities = calculateActivities(context.habits, weight)
  const pal = ['1.2', '1.375', '1.55', '1.725', '1.9'].includes(data.exercise) ? Number(data.exercise) : null
  const activityIncrement = bmr !== null && pal !== null ? bmr * (pal - 1) : null
  const exerciseKcal = eligible && data.exercise === 'mets' ? activities.kcal : activityIncrement
  const stressKcal = bmr !== null && data.stress === 'none' ? 0 : null
  const expenditure = bmr !== null && pal !== null && stressKcal !== null ? positive(bmr * pal) : null
  const consumption = data.availability === 'captured' ? calculateRecall(context.recall).find(n => n.id === 'energiaKcal')?.value ?? null : null
  const balance = consumption !== null && expenditure !== null ? consumption - expenditure : null
  const folds = ['biceps', 'triceps', 'subscapular', 'suprailiac'].map(measure)
  const density = eligible && age !== null && folds.every(n => n !== null) ? durninDensity(age, data.sex, folds as number[]) : null
  let fat: number | null = null
  let fatDetail = 'Selecciona método. Requiere población adulta general, sexo de la ecuación y dependencias disponibles.'
  if (eligible && age !== null) {
    if (data.fatAuthor === 'deurenberg') {
      fatDetail = '1.20×IMC + 0.23×edad − 10.8×sexo − 5.4 (masculino=1, femenino=0). Estimación adulta, no diagnóstico.'
      if (bmi !== null) fat = percentage(1.2 * bmi + .23 * age - 10.8 * (data.sex === 'male' ? 1 : 0) - 5.4)
    }
    if (data.fatAuthor === 'lean') {
      fatDetail = 'Lean 1996: masculino 0.567×cintura(cm) + 0.101×edad − 31.8; femenino 0.439×cintura + 0.221×edad − 9.4. Alcance de esta vista: 18–83 años.'
      if (waist !== null && age <= 83) fat = percentage(data.sex === 'male' ? .567 * waist + .101 * age - 31.8 : .439 * waist + .221 * age - 9.4)
    }
    if (['durnin', 'brozek'].includes(data.fatAuthor)) {
      fatDetail = `Densidad Durnin-Womersley con cuatro pliegues en mm y log10, coeficientes por edad/sexo (18–72 años en esta vista). ${data.fatAuthor === 'brozek' ? 'Brozek: (4.57/densidad − 4.142)×100.' : 'Siri: (4.95/densidad − 4.50)×100.'} Rechaza porcentajes fuera de 0–100; no los recorta.`
      if (density !== null) fat = percentage(data.fatAuthor === 'brozek' ? (4.57 / density - 4.142) * 100 : (4.95 / density - 4.5) * 100)
    }
  }
  if (['garrow', 'faulkner', 'yuhasz'].includes(data.fatAuthor)) fatDetail = 'Método original conservado. Pendiente de verificar protocolo/población y unidades; no se replican porcentajes obtenidos de fórmulas de masa ni perímetros usados como pliegues.'
  const fatKg = fat !== null && weight !== null ? fat * weight / 100 : null
  const wrist = measure('wristBreadth'), femur = measure('femur')
  const bone = eligible && data.boneAuthor === 'rocha' && height !== null && wrist !== null && femur !== null ? positive(3.02 * (((height / 100) ** 2) * (wrist / 100) * (femur / 100) * 400) ** .712) : null
  const residual = eligible && data.residualAuthor === 'wurch' && weight !== null ? weight * (data.sex === 'male' ? .241 : .209) : null
  const remainder = data.muscleAuthor === 'remainder' && weight !== null && fatKg !== null && bone !== null && residual !== null ? positive(weight - fatKg - bone - residual) : null
  const visible = data.availability === 'captured'
  const rows = [
    result('bmr', 'Metabolismo basal / en reposo estimado', 'kcal/día', bmr, `${bmrDetail} ${!eligible ? baseReason : 'Requiere peso; Mifflin/Harris también talla.'}`),
    result('exercise', data.exercise === 'mets' ? 'Energía bruta de actividades declaradas' : 'Incremento por factor de actividad', 'kcal', exerciseKcal, data.exercise === 'mets' ? 'Suma por actividad de MET×0.0175×kg×min. No se añade automáticamente a TMB: no representa 24 horas ni gasto neto.' : 'TMB×(factor−1). Es un incremento de un modelo de gasto diario, no kcal medidas de ejercicio. Factor elegido por el profesional, no inferido.'),
    result('stress', 'Ajuste por estrés fisiológico', 'kcal/día', stressKcal, data.stress === 'none' ? 'Sin ajuste declarado: 0. No significa ausencia clínica de estrés.' : 'Se conservan las doce condiciones originales sin asignar factores automáticos no verificados. Sin ajuste definido no hay gasto diario completo.'),
    result('expenditure', 'Gasto diario estimado por factor', 'kcal/día', expenditure, 'TMB×factor de actividad, solo si se declara sin ajuste por estrés. No es prescripción ni balance medido.'),
    result('consumption', 'Consumo R24 declarado', 'kcal', consumption, 'Solo total completo de tiempos declarados y referencias históricas conocidas; un subtotal no se usa como consumo diario.'),
    result('balance', 'Diferencia consumo − gasto', 'kcal', balance, balance === null ? 'Sin diferencia calculable: falta consumo o gasto completo. No se infiere déficit/superávit de datos ausentes.' : balance < 0 ? 'Diferencia negativa (consumo menor al gasto estimado), no diagnóstico.' : balance > 0 ? 'Diferencia positiva (consumo mayor al gasto estimado), no diagnóstico.' : 'Diferencia numérica cero; no confirma equilibrio clínico.'),
    result('fat', 'Grasa corporal estimada', '%', fat, fatDetail),
    result('fatKg', 'Kilogramos de grasa estimados', 'kg', fatKg, 'Peso×porcentaje/100. Requiere un porcentaje calculable y peso disponible.'),
    result('density', 'Densidad corporal estimada', 'g/cm³', data.densityAuthor === 'durnin' ? density : null, 'Durnin-Womersley: c−m×log10(suma de bíceps, tríceps, subescapular y suprailíaco en mm), coeficientes por edad/sexo. Siri convierte densidad en grasa, no calcula densidad desde pliegues por sí solo.'),
    result('bone', 'Masa ósea estimada · Rocha', 'kg', bone !== null && weight !== null && bone >= weight ? null : bone, '3.02×(talla²×diámetro biestiloideo×diámetro femoral×400)^0.712. Todas las longitudes convertidas a metros. Modelo antropométrico, no densidad mineral ósea.'),
    result('residual', 'Masa residual estimada · Wurch', 'kg', residual, 'Modelo histórico: peso×0.241 masculino / peso×0.209 femenino. No es una medición independiente.'),
    result('muscle', 'Componente por diferencia', 'kg', remainder, 'Peso−grasa(kg)−masa ósea−residual. No se resta porcentaje a kilogramos. Etiquetado Matiegka en el original; no equivale a una medición validada de músculo esquelético.'),
    result('bmi', 'IMC numérico', 'kg/m²', bmi, 'Peso(kg)/talla(m)². Interpretación a cargo del profesional; sin clasificación automática.'),
  ]
  return rows.map(row => visible ? row : { ...row, value: null, detail: 'Revisión no realizada, no disponible o sin registrar. Se excluyen resultados del borrador.' })
}
