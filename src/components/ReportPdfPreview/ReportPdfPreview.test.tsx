import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { reportTestFixture } from '../PdfReportDocument/reportTestFixtures'
import ReportPdfPreview from './ReportPdfPreview'
import { renderReportPdf } from './renderReportPdf'

vi.mock('./renderReportPdf', () => ({ renderReportPdf: vi.fn() }))
const generate = vi.mocked(renderReportPdf)
beforeEach(() => {
  vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:reporte-ficticio')
  vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
})
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); generate.mockReset() })
const renderPreview = () => { const { context, data } = reportTestFixture(); return render(<ReportPdfPreview context={context} data={data} document="evaluation" onClose={vi.fn()} />) }

describe('Visor PDF y acciones locales', () => {
  it('usa el mismo blob para visor, abrir y descargar, y lo libera al cerrar', async () => {
    generate.mockResolvedValue(new Blob(['%PDF-ficticio'], { type: 'application/pdf' }))
    const { unmount } = renderPreview()
    const download = await screen.findByRole('link', { name: 'Descargar PDF' })
    expect(download.getAttribute('href')).toBe('blob:reporte-ficticio')
    expect(download.getAttribute('download')).toBe('nutriline-evaluacion-borrador.pdf')
    expect(screen.getByTitle('PDF · Reporte de evaluación').getAttribute('src')).toBe(download.getAttribute('href'))
    expect(screen.getByRole('link', { name: 'Abrir PDF en otra pestaña' }).getAttribute('href')).toBe(download.getAttribute('href'))
    expect(generate).toHaveBeenCalledOnce()
    unmount()
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:reporte-ficticio')
  })
  it('muestra carga sin descarga prematura y descarta una generación terminada tras cerrar', async () => {
    let resolve!: (blob: Blob) => void
    generate.mockReturnValue(new Promise(done => { resolve = done }))
    const { unmount } = renderPreview()
    await waitFor(() => expect(generate).toHaveBeenCalledOnce())
    expect(screen.getByRole('status').textContent).toContain('Generando PDF')
    expect((screen.getByRole('button', { name: 'Descargar PDF' }) as HTMLButtonElement).disabled).toBe(true)
    unmount()
    await act(async () => { resolve(new Blob(['%PDF'])); await Promise.resolve() })
    expect(URL.createObjectURL).not.toHaveBeenCalled()
  })
  it('conserva contenido accesible ante errores y permite reintentar', async () => {
    generate.mockRejectedValueOnce(new Error('Error ficticio')).mockResolvedValueOnce(new Blob(['%PDF']))
    renderPreview()
    expect((await screen.findByRole('alert')).textContent).toContain('Tus datos siguen en el formulario')
    expect(screen.getByText('Paciente ficticio Álvarez · Nacimiento: 1994-05-15 · Referencia: 2026-11-05')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar generación' }))
    expect(await screen.findByRole('link', { name: 'Descargar PDF' })).toBeTruthy()
    expect(generate).toHaveBeenCalledTimes(2)
  })
  it('ofrece la misma copia para impresión móvil sin regenerar el documento', async () => {
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false })))
    const open = vi.spyOn(window, 'open').mockReturnValue(null)
    generate.mockResolvedValue(new Blob(['%PDF-ficticio']))
    renderPreview()
    await screen.findByRole('link', { name: 'Descargar PDF' })
    fireEvent.click(screen.getByRole('button', { name: 'Imprimir' }))
    expect(open).toHaveBeenCalledWith('blob:reporte-ficticio', '_blank', 'noopener,noreferrer')
    expect(screen.getByRole('status').textContent).toContain('depende del navegador')
    expect(generate).toHaveBeenCalledOnce()
  })
})
