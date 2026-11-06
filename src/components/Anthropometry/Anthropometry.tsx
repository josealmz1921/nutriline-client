import { Form } from 'informed'
import AnthropometryFields from '../AnthropometryFields'
import AssessmentStepActions from '../AssessmentStepActions'
import DevFormTools from '../DevFormTools'
import { useAnthropometry } from './useAnthropometry'
import styles from './Anthropometry.module.css'

const initialValues = { measurementState: '', measurementAvailability: 'captured' }

export default function Anthropometry({ onComplete, onBack, onValueChange }: { onComplete?: (values: Record<string, unknown>) => void; onBack?: () => void; onValueChange?: () => void }) {
  const { formApiRef, continueStep, handleSubmit } = useAnthropometry(onComplete)
  return <Form initialValues={initialValues} formApiRef={formApiRef} onSubmit={handleSubmit} onValueChange={onValueChange} focusOnInvalid noValidate className={styles.form}>
    {import.meta.env.DEV && <DevFormTools profile="anthropometry" />}
    <AnthropometryFields requireEssentials={Boolean(onComplete)} />
    {onComplete && <AssessmentStepActions onBack={onBack} onContinue={continueStep} note="Peso y talla permiten el IMC. Las otras medidas son opcionales; cada fórmula muestra sus dependencias. Si no se midió, indícalo explícitamente. Sin guardado." />}
  </Form>
}
