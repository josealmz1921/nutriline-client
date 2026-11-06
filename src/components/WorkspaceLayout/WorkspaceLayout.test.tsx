import { afterEach, expect, it } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import WorkspaceLayout from './WorkspaceLayout'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'

afterEach(cleanup)

function LocationProbe() {
  const location = useLocation()
  return <output data-testid="location">{location.pathname}{location.hash}</output>
}

function renderLayout() {
  return render(<MemoryRouter initialEntries={['/dashboard/pacientes']}>
    <LocationProbe />
    <Routes><Route path="/dashboard" element={<WorkspaceLayout />}><Route path="pacientes" element={<h1>Directorio</h1>} /><Route path="inicio" element={<h1>Resumen</h1>} /></Route></Routes>
  </MemoryRouter>)
}

it('abre el menú móvil, permite cerrarlo con Escape y devuelve el foco', async () => {
  const user = userEvent.setup()
  renderLayout()
  // jsdom no aplica los breakpoints; hacemos visible el control móvil para probar su comportamiento.
  const trigger = screen.getByLabelText('Abrir menú')
  trigger.style.display = 'flex'
  await user.click(trigger)
  expect(screen.getByRole('dialog', { name: 'Menú de navegación' })).toBeTruthy()
  await user.keyboard('{Escape}')
  expect(screen.queryByRole('dialog')).toBeNull()
  expect(document.activeElement).toBe(trigger)
})

it('el enlace para saltar al contenido no cambia la ruta de demostración', async () => {
  const user = userEvent.setup()
  renderLayout()
  await user.click(screen.getByRole('link', { name: 'Saltar al contenido' }))
  expect(document.activeElement).toBe(screen.getByRole('main'))
  expect(screen.getByTestId('location').textContent).toBe('/dashboard/pacientes')
})

it('navega a Inicio desde el menú móvil y cierra el diálogo', async () => {
  const user = userEvent.setup()
  renderLayout()
  const trigger = screen.getByLabelText('Abrir menú')
  trigger.style.display = 'flex'
  await user.click(trigger)
  await user.click(within(screen.getByRole('dialog', { name: 'Menú de navegación' })).getByRole('link', { name: 'Inicio' }))
  await screen.findByRole('heading', { name: 'Resumen' })
  expect(screen.queryByRole('dialog')).toBeNull()
  expect(screen.getByTestId('location').textContent).toBe('/dashboard/inicio')
  expect(screen.getByRole('link', { name: 'Inicio', current: 'page' })).toBeTruthy()
})
