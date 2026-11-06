import { screen } from '@testing-library/react'
import type userEvent from '@testing-library/user-event'
import { expect } from 'vitest'
import { recallMeals } from './recallModel'

export async function selectRecallOption(user: ReturnType<typeof userEvent.setup>, label: string, option: string) {
  await user.click(screen.getByRole('combobox', { name: label }))
  await user.click(screen.getByRole('option', { name: option }))
}

export async function startRecallMeal(user: ReturnType<typeof userEvent.setup>) {
  await selectRecallOption(user, 'Disponibilidad del recordatorio', 'Capturar recordatorio')
  for (const meal of recallMeals) await selectRecallOption(user, `Estado · ${meal.label}`, meal.id === 'breakfast' ? 'Hubo consumo · Capturar' : 'No hubo consumo')
  expect(screen.getByRole('combobox', { name: 'Estado · Desayuno' }).textContent).toContain('Hubo consumo')
  await user.click(screen.getByRole('button', { name: 'Agregar preparación · Desayuno' }))
  await user.click(screen.getByRole('button', { name: 'Agregar alimento · Desayuno · Preparación 1' }))
}
