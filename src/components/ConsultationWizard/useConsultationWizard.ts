import { useCallback, useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { demoPatientRecords } from '../PatientRecord/demoPatientRecords'
import { reviewBiochemistry, type BiochemistryData } from '../Biochemistry/biochemistryModel'
import { reviewRecall, type RecallData } from '../DietaryRecall/recallModel'
import { reviewHabits, type HabitsData } from '../Habits/habitsModel'
import type { FormulaContext, FormulaData } from '../AssessmentFormulas/formulaModel'
import type { ConsultationInformationData } from '../ConsultationInformation/useConsultationInformation'
import { consultationSteps, type ConsultationStep } from '../ConsultationRegistration/consultationSteps'

interface Review { info: ConsultationInformationData; context: FormulaContext; biochemistry: BiochemistryData; formulas: FormulaData }
export function useConsultationWizard() {
  const { patientId } = useParams<{ patientId: string }>()
  const patient = demoPatientRecords.find(item => item.id === patientId)
  const [section, setSection] = useState<ConsultationStep>('information')
  const [completed, setCompleted] = useState<ConsultationStep[]>([])
  const [info, setInfo] = useState<ConsultationInformationData | null>(null)
  const [biochemistry, setBiochemistry] = useState(reviewBiochemistry(undefined))
  const [context, setContext] = useState<FormulaContext>({ birthDate: patient?.birthDate ?? '', name: patient?.name, measurements: {}, recall: reviewRecall(undefined), habits: reviewHabits(undefined) })
  const [review, setReview] = useState<Review | null>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const panelHeadingRef = useRef<HTMLHeadingElement>(null)
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
  useEffect(() => { document.title = `Nueva consulta${patient ? ` · ${patient.name}` : ''} · Nutriline`; headingRef.current?.focus() }, [patient])
  useEffect(() => { panelHeadingRef.current?.focus() }, [section])
  const selectSection = (next: ConsultationStep) => {
    const index = consultationSteps.findIndex(step => step.id === next)
    if (index >= 0 && consultationSteps.slice(0, index).every(step => completed.includes(step.id))) setSection(next)
  }
  const invalidate = useCallback((step: ConsultationStep) => {
    setCompleted(previous => previous.includes(step) ? previous.filter(id => consultationSteps.findIndex(item => item.id === id) < consultationSteps.findIndex(item => item.id === step)) : previous)
    setReview(null)
  }, [])
  const informationChanged = useCallback(() => invalidate('information'), [invalidate])
  const anthropometryChanged = useCallback(() => invalidate('anthropometry'), [invalidate])
  const biochemistryChanged = useCallback(() => invalidate('biochemistry'), [invalidate])
  const recallChanged = useCallback(() => invalidate('recall'), [invalidate])
  const habitsChanged = useCallback(() => invalidate('habits'), [invalidate])
  const formulasChanged = useCallback(() => invalidate('reports'), [invalidate])
  const complete = (step: ConsultationStep, next?: ConsultationStep) => { setCompleted(previous => previous.includes(step) ? previous : [...previous, step]); if (next) setSection(next) }
  const completeInformation = (data: ConsultationInformationData) => { setInfo(data); setContext(previous => ({ ...previous, evaluation: { ...data, timeZone } })); complete('information', 'anthropometry') }
  const completeAnthropometry = (measurements: Record<string, unknown>) => { setContext(previous => ({ ...previous, measurements })); complete('anthropometry', 'biochemistry') }
  const completeBiochemistry = (data: BiochemistryData) => { setBiochemistry(data); setContext(previous => ({ ...previous, biochemistry: data })); complete('biochemistry', 'recall') }
  const completeRecall = (recall: RecallData) => { setContext(previous => ({ ...previous, recall })); complete('recall', 'habits') }
  const completeHabits = (habits: HabitsData) => { setContext(previous => ({ ...previous, habits })); complete('habits', 'reports') }
  const completeFormulas = (formulas: FormulaData) => {
    if (!patient || patient.status !== 'active' || !info || !consultationSteps.slice(0, -1).every(step => completed.includes(step.id))) return
    complete('reports'); setReview({ info, context, biochemistry, formulas })
  }
  return { patient, headingRef, panelHeadingRef, timeZone, review, closeReview: () => setReview(null), section, completed, context, selectSection,
    informationChanged, anthropometryChanged, biochemistryChanged, recallChanged, habitsChanged, formulasChanged,
    completeInformation, completeAnthropometry, completeBiochemistry, completeRecall, completeHabits, completeFormulas }
}
