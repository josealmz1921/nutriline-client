import type { RecallPreparation } from '../DietaryRecall/recallModel'
import type { HabitActivity } from '../Habits/habitsModel'

export type DevFormProfile = 'patient' | 'anthropometry' | 'biochemistry' | 'recall' | 'habits' | 'reports' | 'consultation'
export const devProfileLabels: Record<DevFormProfile, string> = {
  patient: 'Datos del paciente', anthropometry: 'Antropometría', biochemistry: 'Bioquímica', recall: 'R24',
  habits: 'Hábitos', reports: 'Fórmulas', consultation: 'Datos de consulta',
}

const calendarDate = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
const localDateTime = (date: Date) => `${calendarDate(date)}T${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`

// Exclusivamente ejemplos de desarrollo. No son valores clínicos por defecto.
export function devFormExamples(profile: DevFormProfile, now: Date): Record<string, unknown> {
  const date = calendarDate(now)
  switch (profile) {
    case 'patient': return {
      fullName: 'Paciente ficticio de desarrollo', birthDate: '1996-05-15', email: 'paciente.desarrollo@example.invalid',
      phone: '+52 55 0000 0000', occupation: 'Ocupación ficticia', gender: 'Hombre', nationality: 'MX',
      reason: 'Evaluación inicial ficticia para probar la interfaz. Sin guardado.',
    }
    case 'anthropometry': return {
      measurementAvailability: 'captured', measurementState: 'fasting', height: '170', weight: '70', waist: '80', hip: '95', wrist: '16',
      biceps: '6', triceps: '12', subscapular: '14', suprailiac: '15', abdominalFold: '18', iliacCrest: '16', pectoral: '10', thighFold: '20', calfFold: '12', supraspinale: '13',
      flexedArm: '32', shoulders: '108', chest: '95', abdomen: '82', relaxedArm: '29', forearmGirth: '26', calfGirth: '36', ankle: '22',
      biacromial: '39', biiliocrestal: '28', transverseChest: '27', apChest: '19', humerus: '6.5', wristBreadth: '5.5', femur: '9.5', ankleBreadth: '7',
      armLength: '32', forearmLength: '25', handLength: '18', trochanterHeight: '88', tibialHeight: '43', thighLength: '44', legLength: '43', footLength: '25',
    }
    case 'biochemistry': return {
      'biochemistry.availability': 'captured', 'biochemistry.collectedOn': date, 'biochemistry.laboratory': 'Laboratorio ficticio de desarrollo',
      'biochemistry.results.glucose.value': '92', 'biochemistry.results.glucose.unit': 'mg/dL',
      'biochemistry.results.albumin.value': '4.2', 'biochemistry.results.albumin.unit': 'g/dL',
    }
    case 'recall': return {
      'recall.availability': 'captured', 'recall.meals.breakfast.status': 'captured', 'recall.meals.firstSnack.status': 'captured',
      'recall.meals.lunch.status': 'captured', 'recall.meals.secondSnack.status': 'captured', 'recall.meals.dinner.status': 'captured',
    }
    case 'habits': return {
      'habits.availability': 'captured', 'habits.preferred': 'Frutas y arroz · Ejemplo ficticio', 'habits.disliked': 'Preferencia ficticia: coliflor',
      'habits.mealsPerDay': '5', 'habits.minutesPerMeal': '25', 'habits.waterGlasses': '6', 'habits.sleepHours': '7.5',
      'habits.activityStatus': 'captured', 'habits.activityLevel': 'light',
    }
    case 'reports': return {
      'formulas.availability': 'captured', 'formulas.referenceDate': date, 'formulas.sex': 'male', 'formulas.population': 'generalAdult',
      'formulas.metabolicAuthor': 'mifflin', 'formulas.exercise': '1.375', 'formulas.stress': 'none', 'formulas.fatAuthor': 'deurenberg',
      'formulas.densityAuthor': 'durnin', 'formulas.boneAuthor': 'rocha', 'formulas.residualAuthor': 'wurch', 'formulas.muscleAuthor': 'remainder',
    }
    case 'consultation': return {
      occurredAt: localDateTime(new Date(now.getTime() - 60 * 60 * 1000)), measuredAt: localDateTime(new Date(now.getTime() - 90 * 60 * 1000)),
      reason: 'Consulta ficticia de desarrollo para probar la interfaz. Sin guardado.',
      notes: 'Notas ficticias de desarrollo. No corresponden a una consulta real.',
    }
  }
}

export function devRecallPreparation(mealId: string): RecallPreparation {
  const food = mealId === 'breakfast' ? { name: 'Leche descremada', quantity: '1', unit: 'taza', catalogId: '1094' }
    : mealId === 'firstSnack' ? { name: 'Manzana', quantity: '1', unit: 'pieza', catalogId: '1231' }
    : mealId === 'lunch' ? { name: 'Arroz cocido', quantity: '0.5', unit: 'taza', catalogId: '138' }
    : mealId === 'secondSnack' ? { name: 'Plátano', quantity: '0.5', unit: 'pieza', catalogId: '1748' }
    : { name: 'Tortilla de maíz', quantity: '2', unit: 'pieza', catalogId: '2067' }
  return { name: 'Preparación ficticia de desarrollo', foods: [food] }
}

export function devHabitActivity(): HabitActivity {
  return { name: 'Yoga Hatha', duration: '30', unit: 'minutes', met: '2.5', source: 'Catálogo histórico deportsmets · 2150 · ejemplo de desarrollo no validado clínicamente' }
}
