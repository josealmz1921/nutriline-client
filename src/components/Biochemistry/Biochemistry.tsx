import { Form } from 'informed'
import { LuArrowRight } from 'react-icons/lu'
import BiochemistryFields from '../BiochemistryFields'
import BiochemistryReview from '../BiochemistryReview'
import Dialog from '../Dialog'
import AssessmentStepActions from '../AssessmentStepActions'
import { validateBiochemistryStep } from './biochemistryValidation'
import { useBiochemistry } from './useBiochemistry'
import styles from './Biochemistry.module.css'
import type { BiochemistryData } from './biochemistryModel'

export default function Biochemistry({ onComplete, onBack, onValueChange }: { onComplete?: (data: BiochemistryData) => void; onBack?: () => void; onValueChange?: () => void }) {
  const { review, handleSubmit, closeReview, formApiRef, continueStep, submitFailed } = useBiochemistry(onComplete)
  return <>
    <Form onSubmit={handleSubmit} formApiRef={formApiRef} onSubmitFailure={submitFailed} onValueChange={onValueChange} validateFields={onComplete ? validateBiochemistryStep : undefined} noValidate focusOnInvalid className={styles.form}>
      <BiochemistryFields />
      {onComplete ? <AssessmentStepActions onBack={onBack} onContinue={continueStep} continueLabel="Completar sección" note="Captura resultados con unidad o declara que el estudio no se realizó/no está disponible. Completar valida esta sección y continúa al R24; no guarda ni finaliza la evaluación."><button type="submit" className={styles.secondary}>Revisar bioquímica</button></AssessmentStepActions> : <div className={styles.actions}><p>Revisa solo este estudio. No finaliza la evaluación, no imprime y no guarda resultados.</p><button type="submit" className={styles.primary}>Revisar bioquímica <LuArrowRight aria-hidden="true" /></button></div>}
    </Form>
    {review && <Dialog isOpen onClose={closeReview} ariaLabel="Revisar bioquímica"><div className={styles.review}>
      <h2>Revisa la bioquímica</h2><p>Vista previa: no se ha guardado ni enviado información.</p>
      <BiochemistryReview data={review} />
      <button type="button" onClick={closeReview} className={styles.primary}>Volver a bioquímica</button>
    </div></Dialog>}
  </>
}
