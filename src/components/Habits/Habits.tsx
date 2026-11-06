import { Form } from 'informed'
import HabitsFields from '../HabitsFields'
import HabitsReview from '../HabitsReview'
import AssessmentStepActions from '../AssessmentStepActions'
import Dialog from '../Dialog'
import { validateHabits } from './habitsValidation'
import type { HabitsData } from './habitsModel'
import { useHabits } from './useHabits'
import styles from './Habits.module.css'

const validateStep = (values: Record<string, unknown>) => validateHabits(values, true)
export default function Habits({ weight, onComplete, onBack, onValueChange }: { weight?: unknown; onComplete: (data: HabitsData) => void; onBack: () => void; onValueChange: () => void }) {
  const { formApiRef, handleSubmit, review, closeReview, submitFailed, continueStep } = useHabits(onComplete)
  return <><Form formApiRef={formApiRef} onSubmit={handleSubmit} onSubmitFailure={submitFailed} onValueChange={onValueChange} validateFields={validateStep} noValidate focusOnInvalid className={styles.form}>
    <HabitsFields weight={weight} onDraftChange={onValueChange} />
    <AssessmentStepActions onBack={onBack} onContinue={continueStep} note="Declara la entrevista y la disponibilidad de actividad física. Los demás datos son opcionales. Continuar no guarda ni prescribe."><button type="submit" className={styles.secondary}>Revisar hábitos</button></AssessmentStepActions>
  </Form>{review && <Dialog isOpen onClose={closeReview} ariaLabel="Revisar hábitos"><div className={styles.review}><h2>Revisa los hábitos</h2><p>Vista previa sin guardar ni enviar.</p><HabitsReview data={review} weight={weight} /><button type="button" onClick={closeReview} className={styles.secondary}>Volver a hábitos</button></div></Dialog>}</>
}
