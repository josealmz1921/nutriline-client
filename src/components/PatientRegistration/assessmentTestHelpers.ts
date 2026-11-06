import { fireEvent, screen } from '@testing-library/react'
import type userEvent from '@testing-library/user-event'

export async function continueToAnthropometry(user: ReturnType<typeof userEvent.setup>) {
  const name = screen.getByLabelText('Nombre completo') as HTMLInputElement
  if (!name.value) fireEvent.change(name, { target: { value: 'Paciente ficticio' } })
  fireEvent.change(screen.getByLabelText('Fecha de nacimiento'), { target: { value: '1992-05-15' } })
  await user.click(screen.getByRole('button', { name: 'Continuar' }))
}

export async function continueToBiochemistry(user: ReturnType<typeof userEvent.setup>) {
  await continueToAnthropometry(user)
  fireEvent.change(screen.getByLabelText('Talla (cm)'), { target: { value: '170' } })
  fireEvent.change(screen.getByLabelText('Peso (kg)'), { target: { value: '70' } })
  await user.click(screen.getByRole('button', { name: 'Continuar' }))
}

export async function continueToRecall(user: ReturnType<typeof userEvent.setup>) {
  await continueToBiochemistry(user)
  await user.click(screen.getByRole('combobox', { name: 'Disponibilidad del estudio' }))
  await user.click(screen.getByRole('option', { name: 'Estudio no realizado' }))
  await user.click(screen.getByRole('button', { name: 'Completar sección' }))
}
