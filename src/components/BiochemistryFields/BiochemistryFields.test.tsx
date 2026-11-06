import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Form } from 'informed'
import BiochemistryFields from './BiochemistryFields'
import { reviewBiochemistry } from '../Biochemistry/biochemistryModel'

afterEach(cleanup)

describe('Campos de bioquímica reutilizables', () => {
  it('admite precaptura desde un formulario externo sin mutar sus datos ni crear otro Form', async () => {
    const user = userEvent.setup()
    const submitted = vi.fn()
    const source = { biochemistry: { collectedOn: '2026-11-05', laboratory: 'Laboratorio ficticio', results: { glucose: { value: '5,2', unit: 'mmol/L', reference: 'Referencia del informe', interpretation: 'Nota original' } } } }
    const before = JSON.stringify(source)
    const { container } = render(<Form initialValues={source} onSubmit={({ values }) => submitted(reviewBiochemistry(values.biochemistry))} noValidate><BiochemistryFields /><button type="submit">Revisar desde formulario externo</button></Form>)
    expect(container.querySelectorAll('form')).toHaveLength(1)
    expect((screen.getByLabelText('Valor · Glucosa en plasma') as HTMLInputElement).value).toBe('5,2')
    expect((screen.getByLabelText('Unidad · Glucosa en plasma') as HTMLInputElement).value).toBe('mmol/L')
    fireEvent.change(screen.getByLabelText('Resultado / interpretación manual · Glucosa en plasma'), { target: { value: 'Nueva nota' } })
    await user.click(screen.getByRole('button', { name: 'Revisar desde formulario externo' }))
    expect(submitted).toHaveBeenCalledWith({ collectedOn: '2026-11-05', laboratory: 'Laboratorio ficticio', results: { glucose: { value: '5.2', unit: 'mmol/L', reference: 'Referencia del informe', interpretation: 'Nueva nota' } } })
    expect(JSON.stringify(source)).toBe(before)
  })
})
