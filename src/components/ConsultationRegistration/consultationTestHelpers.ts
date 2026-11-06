import { fireEvent, screen } from '@testing-library/react'
import type userEvent from '@testing-library/user-event'
import { selectRecallOption as selectOption } from '../DietaryRecall/recallTestHelpers'

type User = ReturnType<typeof userEvent.setup>
export async function consultationToAnthropometry(user: User) {
  for (const [label, value] of [['Fecha y hora de consulta', '2026-11-05T10:30'], ['Fecha y hora de mediciones', '2026-11-05T10:15'], ['Motivo de consulta', 'Consulta ficticia']]) fireEvent.change(screen.getByLabelText(label), { target: { value } })
  await user.click(screen.getByRole('button', { name: 'Continuar' }))
}
export async function consultationToBiochemistry(user: User) {
  await consultationToAnthropometry(user)
  fireEvent.change(screen.getByLabelText('Peso (kg)'), { target: { value: '64.2' } })
  fireEvent.change(screen.getByLabelText('Talla (cm)'), { target: { value: '167' } })
  await user.click(screen.getByRole('button', { name: 'Continuar' }))
}
export async function consultationToRecall(user: User) {
  await consultationToBiochemistry(user)
  await selectOption(user, 'Disponibilidad del estudio', 'Estudio no realizado')
  await user.click(screen.getByRole('button', { name: 'Completar sección' }))
}
export async function consultationSkipRecall(user: User) {
  await selectOption(user, 'Disponibilidad del recordatorio', 'Recordatorio no disponible')
  await user.click(screen.getByRole('button', { name: 'Completar R24' }))
}
export async function consultationSkipHabits(user: User) {
  await selectOption(user, 'Disponibilidad de hábitos', 'Hábitos no disponibles')
  await user.click(screen.getByRole('button', { name: 'Continuar' }))
}
export async function consultationReview(user: User) {
  await selectOption(user, 'Disponibilidad de revisión de fórmulas', 'Revisión de fórmulas no realizada')
  await user.click(screen.getByRole('button', { name: 'Revisar consulta' }))
}
