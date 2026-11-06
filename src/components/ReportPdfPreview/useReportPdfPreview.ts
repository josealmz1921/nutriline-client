import { useEffect, useRef, useState } from 'react'
import type { FormulaContext, FormulaData } from '../AssessmentFormulas/formulaModel'
import { buildReportModel, type ReportKind } from '../PdfReportDocument/reportModel'

export function useReportPdfPreview(context: FormulaContext, data: FormulaData, kind: ReportKind) {
  // La vista previa representa la instantánea al abrir; nunca una captura viva.
  const [model] = useState(() => buildReportModel(context, data, kind))
  const [result, setResult] = useState<{ url: string; error: boolean }>({ url: '', error: false })
  const [attempt, setAttempt] = useState(0)
  const [printHelp, setPrintHelp] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  useEffect(() => {
    let active = true
    let objectUrl = ''
    // Motor y fuentes se cargan solo al solicitar un PDF, no al abrir el registro.
    void import('./renderReportPdf').then(module => module.renderReportPdf(model)).then(blob => {
      if (!active) return
      objectUrl = URL.createObjectURL(blob)
      setResult({ url: objectUrl, error: false })
    }).catch(() => { if (active) setResult({ url: '', error: true }) })
    return () => { active = false; if (objectUrl) URL.revokeObjectURL(objectUrl) }
  }, [model, attempt])
  const retry = () => { setResult({ url: '', error: false }); setAttempt(value => value + 1) }
  const print = () => {
    if (!result.url) return
    setPrintHelp(true)
    try {
      if (iframeRef.current?.contentWindow && window.matchMedia('(min-width: 768px)').matches) {
        iframeRef.current.contentWindow.focus()
        iframeRef.current.contentWindow.print()
      } else window.open(result.url, '_blank', 'noopener,noreferrer')
    } catch { window.open(result.url, '_blank', 'noopener,noreferrer') }
  }
  return { model, url: result.url, error: result.error, retry, print, printHelp, iframeRef }
}
