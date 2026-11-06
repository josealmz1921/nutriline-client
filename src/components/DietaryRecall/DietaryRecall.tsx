import { Form } from 'informed'
import RecallFields from '../RecallFields'
import RecallReview from '../RecallReview'
import AssessmentStepActions from '../AssessmentStepActions'
import Dialog from '../Dialog'
import { validateRecall } from './recallValidation'
import { useDietaryRecall } from './useDietaryRecall'
import type { RecallData } from './recallModel'
import styles from './DietaryRecall.module.css'

const validateStep = (values: Record<string, unknown>) => validateRecall(values, true)

export default function DietaryRecall({ onComplete, onBack, onValueChange }: { onComplete?: (data: RecallData) => void; onBack?: () => void; onValueChange?: () => void }) {
  const { formApiRef, handleSubmit, continueStep, submitFailed, review, closeReview } = useDietaryRecall(onComplete)
  return <>
    <Form formApiRef={formApiRef} onSubmit={handleSubmit} onSubmitFailure={submitFailed} onValueChange={onValueChange} validateFields={validateStep} noValidate focusOnInvalid className={styles.form}>
      <RecallFields onDraftChange={onValueChange} />
      <AssessmentStepActions onBack={onBack} onContinue={continueStep} continueLabel="Completar R24" note="Declara los cinco tiempos, incluido si no hubo consumo o falta información. No necesitas inventar alimentos ni nutrientes. Continuar abre Hábitos; no guarda ni finaliza la evaluación."><button type="submit" className={styles.secondary}>Revisar recordatorio</button></AssessmentStepActions>
    </Form>
    {review && <Dialog isOpen onClose={closeReview} ariaLabel="Revisar recordatorio"><div className={styles.review}><h2>Revisa el recordatorio</h2><p>Vista previa: no se ha guardado ni enviado información.</p><RecallReview data={review} /><button type="button" className={styles.primary} onClick={closeReview}>Volver al recordatorio</button></div></Dialog>}
  </>
}
