import { assessmentSections, type AssessmentSection } from './assessmentSections'

export const assessmentSteps = assessmentSections.map(section => ({
  id: section.id, label: section.label,
  available: true,
}))

export function canSelectAssessmentStep(step: AssessmentSection, completed: readonly AssessmentSection[]) {
  const index = assessmentSteps.findIndex(item => item.id === step)
  return index >= 0 && assessmentSteps[index].available && assessmentSteps.slice(0, index).every(item => completed.includes(item.id))
}

export function invalidateAssessmentStep(step: AssessmentSection, completed: readonly AssessmentSection[]) {
  const index = assessmentSteps.findIndex(item => item.id === step)
  return completed.filter(id => assessmentSteps.findIndex(item => item.id === id) < index)
}
