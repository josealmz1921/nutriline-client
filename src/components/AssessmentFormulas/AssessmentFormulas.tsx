import { Form } from 'informed'
import FormulaFields from '../FormulaFields'
import ReportPdfPreview from '../ReportPdfPreview'
import AssessmentStepActions from '../AssessmentStepActions'
import Dialog from '../Dialog'
import { localCalendarDate, type FormulaContext, type FormulaData } from './formulaModel'
import { validateFormulas } from './formulaValidation'
import { useAssessmentFormulas } from './useAssessmentFormulas'
import styles from './AssessmentFormulas.module.css'

const validateStep = (values: Record<string, unknown>) => validateFormulas(values, true)
export default function AssessmentFormulas({ context, onComplete, onBack, onValueChange, consultation = false }: { context: FormulaContext; onComplete: (data: FormulaData) => void; onBack: () => void; onValueChange: () => void; consultation?: boolean }) {
  const { formApiRef, handleSubmit, preview, closePreview, complete, previewAnthropometry, previewDiet, previewEvaluation } = useAssessmentFormulas(onComplete)
  return <><Form initialValues={{ formulas: { referenceDate: consultation ? '' : localCalendarDate() } }} formApiRef={formApiRef} onSubmit={handleSubmit} onValueChange={onValueChange} validateFields={validateStep} noValidate focusOnInvalid className={styles.form}>
    <FormulaFields context={context} /><section className={styles.documents} aria-label="Documentos de evaluación"><h3>Reportes · Vista previa PDF</h3><p>Usan los últimos pasos confirmados y las fórmulas validadas al abrir. Puedes descargar o imprimir un borrador local: no guarda en el expediente, prescribe ni crea un registro. Los métodos pendientes se muestran sin resultado.</p><div><button type="button" onClick={previewEvaluation}>Ver reporte completo de evaluación</button><button type="button" onClick={previewAnthropometry}>Ver reporte de antropometría</button><button type="button" onClick={previewDiet}>Ver reporte alimentario (R24)</button></div><p>La dieta diaria tendrá su propio menú y PDF. El R24 no se convierte en una prescripción.</p></section>
    <AssessmentStepActions onBack={onBack} onContinue={complete} continueLabel={consultation ? 'Revisar consulta' : 'Confirmar revisión (sin guardar)'} note={consultation ? 'Revisa los seis pasos de esta consulta. No guarda, no modifica el expediente ni prescribe una dieta.' : 'Confirma solo la revisión de esta demostración, incluso si hay fórmulas no aplicables o pendientes. No finaliza un registro clínico ni crea un paciente.'} />
  </Form>{preview && <Dialog isOpen wide onClose={closePreview} ariaLabel="Vista previa de reporte"><ReportPdfPreview context={context} data={preview.data} document={preview.document} onClose={closePreview} /></Dialog>}</>
}
