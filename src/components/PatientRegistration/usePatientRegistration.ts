import { useCallback, useEffect, useRef, useState } from 'react'
import type { FormApi, FormState } from 'informed'
import { canSelectAssessmentStep, invalidateAssessmentStep } from './assessmentProgress'
import { assessmentSections, symptoms, type AssessmentSection } from './assessmentSections'
import { legacyNationalities } from './legacyNationalities'
import { isPhoto, validatePhoto } from '../InitialAssessmentFields/initialAssessmentValidation'
import { reviewRecall, type RecallData } from '../DietaryRecall/recallModel'
import { reviewHabits, type HabitsData } from '../Habits/habitsModel'
import type { FormulaContext } from '../AssessmentFormulas/formulaModel'
import type { BiochemistryData } from '../Biochemistry/biochemistryModel'

interface RegistrationPreview {
  fullName: string
  birthDate: string
  email: string | null
  phone: string | null
  occupation: string | null
  gender: string | null
  nationality: string | null
  reason: string | null
  symptoms: string[]
  photoName: string | null
}

const optionalText = (value: unknown) => typeof value === 'string' ? value.trim() || null : null

export function usePatientRegistration() {
  const [section, setSection] = useState<AssessmentSection>('patient')
  const [completed, setCompleted] = useState<AssessmentSection[]>([])
  const [formulaContext, setFormulaContext] = useState<FormulaContext>({ birthDate: '', measurements: {}, recall: reviewRecall(undefined), habits: reviewHabits(undefined) })
  const formApiRef = useRef<FormApi | null>(null)
  const continueRequested = useRef(false)
  const selectSection = (next: AssessmentSection) => {
    if (canSelectAssessmentStep(next, completed)) setSection(next)
  }
  const invalidateStep = useCallback((step: AssessmentSection) => {
    setCompleted(previous => previous.includes(step) ? invalidateAssessmentStep(step, previous) : previous)
  }, [])
  const patientChanged = useCallback(() => invalidateStep('patient'), [invalidateStep])
  const anthropometryChanged = useCallback(() => invalidateStep('anthropometry'), [invalidateStep])
  const biochemistryChanged = useCallback(() => invalidateStep('biochemistry'), [invalidateStep])
  const recallChanged = useCallback(() => invalidateStep('recall'), [invalidateStep])
  const habitsChanged = useCallback(() => invalidateStep('habits'), [invalidateStep])
  const formulasChanged = useCallback(() => invalidateStep('reports'), [invalidateStep])
  const completePatient = () => { setCompleted(previous => [...previous.filter(id => id !== 'patient'), 'patient']); setSection('anthropometry') }
  const completeAnthropometry = (measurements: Record<string, unknown>) => { setFormulaContext(previous => ({ ...previous, measurements })); setCompleted(previous => [...previous.filter(id => id !== 'anthropometry'), 'anthropometry']); setSection('biochemistry') }
  const completeBiochemistry = (biochemistry: BiochemistryData) => { setFormulaContext(previous => ({ ...previous, biochemistry })); setCompleted(previous => previous.includes('biochemistry') ? previous : [...previous, 'biochemistry']); setSection('recall') }
  const completeRecall = (recall: RecallData) => { setFormulaContext(previous => ({ ...previous, recall })); setCompleted(previous => previous.includes('recall') ? previous : [...previous, 'recall']); setSection('habits') }
  const completeHabits = (habits: HabitsData) => { setFormulaContext(previous => ({ ...previous, habits })); setCompleted(previous => previous.includes('habits') ? previous : [...previous, 'habits']); setSection('reports') }
  const completeFormulas = () => setCompleted(previous => previous.includes('reports') ? previous : [...previous, 'reports'])
  const continuePatient = () => { continueRequested.current = true; formApiRef.current?.submitForm() }
  const submitFailed = () => { continueRequested.current = false }
  const panelHeadingRef = useRef<HTMLHeadingElement>(null)
  const [preview, setPreview] = useState<RegistrationPreview | null>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  useEffect(() => {
    document.title = 'Registrar paciente · Nutriline'
    headingRef.current?.focus()
  }, [])
  useEffect(() => { panelHeadingRef.current?.focus() }, [section])
  const handleSubmit = ({ values }: FormState) => {
    if (continueRequested.current) { continueRequested.current = false; setFormulaContext(previous => ({ ...previous, name: String(values.fullName).trim(), birthDate: String(values.birthDate), evaluation: { reason: optionalText(values.reason) || '', symptoms: symptoms.filter(item => (values.symptoms as Record<string, unknown> | undefined)?.[item.id] === true).map(item => item.label) } })); completePatient(); return }
    setPreview({
      fullName: String(values.fullName).trim(),
      birthDate: String(values.birthDate),
      email: optionalText(values.email)?.toLowerCase() ?? null,
      phone: optionalText(values.phone),
      occupation: optionalText(values.occupation),
      gender: optionalText(values.gender),
      nationality: legacyNationalities.find(country => country.value === values.nationality)?.label ?? null,
      reason: optionalText(values.reason),
      symptoms: symptoms.filter(symptom => {
        const checked = values.symptoms
        return typeof checked === 'object' && checked !== null && (checked as Record<string, unknown>)[symptom.id] === true
      }).map(symptom => symptom.label),
      photoName: isPhoto(values.photo) && !validatePhoto(values.photo) ? values.photo.name : null,
    })
  }
  const closePreview = useCallback(() => setPreview(null), [])
  const today = new Date().toISOString().slice(0, 10)

  return { preview, headingRef, today, handleSubmit, closePreview, section, selectSection,
    completed, formApiRef, continuePatient, submitFailed, patientChanged, anthropometryChanged, biochemistryChanged,
    completeAnthropometry, completeBiochemistry, recallChanged, completeRecall,
    habitsChanged, formulasChanged, completeHabits, completeFormulas, formulaContext,
    panelHeadingRef, selectedSection: assessmentSections.find(item => item.id === section) ?? assessmentSections[0] }
}
