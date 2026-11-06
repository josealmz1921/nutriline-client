import { reviewFormulas, type FormulaContext } from '../AssessmentFormulas/formulaModel'
import { reviewBiochemistry } from '../Biochemistry/biochemistryModel'
import { recallMeals, reviewRecall } from '../DietaryRecall/recallModel'
import { reviewHabits } from '../Habits/habitsModel'

export function reportTestFixture() {
  const context: FormulaContext = {
    name: 'Paciente ficticio Álvarez', birthDate: '1994-05-15',
    evaluation: { reason: 'Evaluación ficticia', symptoms: ['Fiebre'], notes: 'Notas ficticias sin aprobación clínica.', occurredAt: '2026-11-05T10:00', measuredAt: '2026-11-05T09:30', timeZone: 'America/Mexico_City' },
    measurements: { measurementAvailability: 'captured', weight: '70', height: '170', waist: '80', hip: '95', biceps: '6', triceps: '12', subscapular: '14', suprailiac: '15', supraspinale: '13', humerus: '6.5', femur: '9.5', flexedArm: '32', calfGirth: '36', calfFold: '12' },
    biochemistry: reviewBiochemistry({ results: { glucose: { value: '92', unit: 'mg/dL', reference: 'Referencia ficticia', interpretation: 'Comentario manual' } } }),
    recall: reviewRecall({ availability: 'captured', meals: Object.fromEntries(recallMeals.map(meal => [meal.id, meal.id === 'breakfast' ? { status: 'captured', preparations: [{ name: 'Desayuno ficticio', foods: [{ name: 'Alimento libre ficticio', quantity: '1', unit: 'taza', catalogId: 'manual' }] }] } : { status: 'notConsumed' }])) }),
    habits: reviewHabits({ availability: 'captured', mealsPerDay: '5', sleepHours: '7', activityStatus: 'none' }),
  }
  const data = reviewFormulas({ availability: 'captured', referenceDate: '2026-11-05', sex: 'male', population: 'generalAdult', metabolicAuthor: 'mifflin', exercise: '1.375', stress: 'none', fatAuthor: 'deurenberg', densityAuthor: 'durnin', boneAuthor: 'rocha', residualAuthor: 'wurch', muscleAuthor: 'remainder' })
  return { context, data }
}
