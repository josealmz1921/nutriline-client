import type { ChangeEvent } from 'react'
import type { AssessmentStep } from './AssessmentNavigation'

export function useAssessmentNavigation<T extends string>(steps: readonly AssessmentStep<T>[], current: T, completed: readonly T[], onSelect: (step: T) => void) {
  const currentIndex = steps.findIndex(step => step.id === current)
  const frontier = steps.findIndex(step => !completed.includes(step.id))
  const percentage = steps.length ? Math.round(completed.length / steps.length * 100) : 0
  const handleSelect = (event: ChangeEvent<HTMLSelectElement>) => {
    const step = steps.find(item => item.id === event.target.value)
    const index = steps.findIndex(item => item.id === event.target.value)
    if (step?.available && (frontier === -1 || index <= frontier)) onSelect(step.id)
  }
  return { currentIndex, frontier, percentage, previous: steps[currentIndex - 1], next: steps[currentIndex + 1], handleSelect }
}
