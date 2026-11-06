import { createElement, type ReactElement } from 'react'
import { pdf, type DocumentProps } from '@react-pdf/renderer'
import PdfReportDocument from '../PdfReportDocument'
import type { ReportModel } from '../PdfReportDocument/reportModel'

export async function renderReportPdf(model: ReportModel): Promise<Blob> {
  // La raíz del componente es Document. Dejar que el reconciliador lo invoque
  // también respeta los hooks que introduce React Compiler.
  return pdf(createElement(PdfReportDocument, { model }) as ReactElement<DocumentProps>).toBlob()
}
