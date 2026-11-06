/// <reference types="node" />
// @vitest-environment node
import { beforeAll, describe, expect, it } from 'vitest'
import { Font } from '@react-pdf/renderer'
import { resolve } from 'node:path'
import { writeFile } from 'node:fs/promises'
import { inflateSync } from 'node:zlib'
import { renderReportPdf } from '../ReportPdfPreview/renderReportPdf'
import { buildReportModel, type ReportKind } from './reportModel'
import { reportTestFixture } from './reportTestFixtures'

beforeAll(() => {
  // En Node las fuentes se leen de disco; en navegador se sirven por Vite.
  delete Font.getRegisteredFonts().Jakarta
  Font.register({ family: 'Jakarta', fonts: [400, 600].map(weight => ({ src: resolve(`node_modules/@fontsource/plus-jakarta-sans/files/plus-jakarta-sans-latin-${weight}-normal.woff`), fontWeight: weight })) })
})

describe('Generación real con React PDF', () => {
  for (const kind of ['anthropometry', 'diet', 'evaluation'] as ReportKind[]) it(`genera un PDF A4 paginado para ${kind}`, async () => {
    const { context, data } = reportTestFixture()
    const model = buildReportModel(context, data, kind)
    const blob = await renderReportPdf(model)
    const bytes = Buffer.from(await blob.arrayBuffer())
    expect(bytes.subarray(0, 5).toString()).toBe('%PDF-')
    expect(blob.type).toBe('application/pdf')
    expect(bytes.length).toBeGreaterThan(10000)
    const content = bytes.toString('latin1')
    const dimensions = /\/MediaBox\s*\[([^\]]+)\]/.exec(content)?.[1].trim().split(/\s+/).map(Number)
    expect(dimensions?.[2]).toBeCloseTo(595.28, 1)
    expect(dimensions?.[3]).toBeCloseTo(841.89, 1)
    expect(content.match(/\/Type \/Page\b/g)!.length).toBeGreaterThan(0)
    const drawingStreams = [...content.matchAll(/stream\r?\n([\s\S]*?)\r?\nendstream/g)].flatMap(match => {
      try { const stream = inflateSync(Buffer.from(match[1], 'latin1')).toString('latin1'); return stream.includes('BT') && stream.includes('TJ') ? [stream] : [] } catch { return [] }
    })
    expect(drawingStreams.length).toBe(content.match(/\/Type \/Page\b/g)!.length)
    for (const stream of drawingStreams) {
      const counter = stream.slice(stream.lastIndexOf('1 0 0 1 42 799 cm'))
      expect(counter.includes('TJ')).toBe(true)
      expect(/1 0 0 1 [\d.]+ -\d{5,} cm/.test(stream)).toBe(false)
    }
    if (process.env.PDF_REVIEW_DIR) await writeFile(resolve(process.env.PDF_REVIEW_DIR, model.fileName), bytes)
  }, 20000)
  it('conserva notas extensas en un documento multipágina', async () => {
    const { context, data } = reportTestFixture()
    context.evaluation!.notes = 'Texto ficticio de revisión profesional. '.repeat(250)
    const blob = await renderReportPdf(buildReportModel(context, data, 'evaluation'))
    const content = Buffer.from(await blob.arrayBuffer()).toString('latin1')
    expect(content.match(/\/Type \/Page\b/g)!.length).toBeGreaterThan(3)
  }, 20000)
})
