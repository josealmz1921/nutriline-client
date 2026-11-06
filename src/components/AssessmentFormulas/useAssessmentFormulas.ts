import { useRef, useState } from 'react'
import type { FormApi, FormState } from 'informed'
import { reviewFormulas, type FormulaData } from './formulaModel'
import type { ReportKind } from '../PdfReportDocument/reportModel'

export function useAssessmentFormulas(onComplete: (data: FormulaData) => void) {
  const formApiRef = useRef<FormApi | null>(null)
  const intent = useRef<'complete' | ReportKind>('complete')
  const [preview, setPreview] = useState<{ document: ReportKind; data: FormulaData } | null>(null)
  const handleSubmit = ({ values }: FormState) => {
    if (intent.current === 'complete') onComplete(reviewFormulas(values.formulas))
    else setPreview({ document: intent.current, data: reviewFormulas(values.formulas) })
  }
  const submit = (action: typeof intent.current) => { intent.current = action; formApiRef.current?.submitForm() }
  return { formApiRef, handleSubmit, preview, closePreview: () => setPreview(null), complete: () => submit('complete'),
    previewAnthropometry: () => submit('anthropometry'), previewDiet: () => submit('diet'), previewEvaluation: () => submit('evaluation') }
}
