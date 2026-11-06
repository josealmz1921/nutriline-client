import { afterEach, expect, it } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation, useNavigate } from 'react-router-dom'
import Application from './Application'

afterEach(cleanup)

function HistoryControls() {
  const navigate = useNavigate()
  const location = useLocation()
  return <>
    <output data-testid="location">{location.pathname}{location.hash}</output>
    <button type="button" onClick={() => navigate(-1)}>Atrás en historial</button>
    <button type="button" onClick={() => navigate(1)}>Adelante en historial</button>
  </>
}

function renderRoute(path: string) {
  return render(<MemoryRouter initialEntries={[path]}><HistoryControls /><Application /></MemoryRouter>)
}

it('abre pacientes desde el login y vuelve usando rutas reales y el historial', async () => {
  const user = userEvent.setup()
  renderRoute('/login')
  expect(screen.getByRole('link', { name: /Explorar pacientes de demostración/ }).getAttribute('href')).toBe('/dashboard/pacientes')
  await user.click(screen.getByRole('link', { name: /Explorar pacientes de demostración/ }))
  await screen.findByRole('heading', { name: 'Pacientes' })
  expect(document.title).toBe('Pacientes · Nutriline')
  expect(screen.getByTestId('location').textContent).toBe('/dashboard/pacientes')
  expect(screen.getByRole('link', { name: 'Pacientes' }).getAttribute('aria-current')).toBe('page')
  await user.click(screen.getByRole('button', { name: 'Atrás en historial' }))
  await screen.findByRole('heading', { name: 'Qué gusto verte de nuevo' })
  await user.click(screen.getByRole('button', { name: 'Adelante en historial' }))
  await screen.findByRole('heading', { name: 'Pacientes' })
  await user.click(screen.getByRole('link', { name: 'Volver al login' }))
  await screen.findByRole('heading', { name: 'Qué gusto verte de nuevo' })
  expect(document.title).toBe('Iniciar sesión · Nutriline')
  expect(screen.getByTestId('location').textContent).toBe('/login')
})

it('redirige la raíz a /login', async () => {
  renderRoute('/')
  await screen.findByRole('heading', { name: 'Qué gusto verte de nuevo' })
  expect(screen.getByTestId('location').textContent).toBe('/login')
})

it('redirige /dashboard a Inicio dentro del layout', async () => {
  renderRoute('/dashboard')
  await screen.findByRole('heading', { level: 1, name: 'Inicio' })
  expect(screen.getByRole('navigation', { name: 'Navegación principal' })).toBeTruthy()
  expect(screen.getByTestId('location').textContent).toBe('/dashboard/inicio')
  expect(screen.getByRole('link', { name: 'Inicio', current: 'page' })).toBeTruthy()
})

it('permite recorrer Inicio, registro y expediente con rutas e historial reales', async () => {
  const user = userEvent.setup()
  renderRoute('/dashboard/inicio')
  await user.click(screen.getByRole('link', { name: 'Registrar paciente' }))
  await screen.findByRole('heading', { name: 'Registrar paciente' })
  await user.click(screen.getByRole('button', { name: 'Atrás en historial' }))
  await screen.findByRole('heading', { level: 1, name: 'Inicio' })
  await user.click(screen.getByRole('link', { name: 'Ver expediente de Mariana Solís Peña' }))
  await screen.findByRole('heading', { name: 'Mariana Solís Peña' })
  expect(screen.getByRole('link', { name: 'Pacientes', current: 'page' })).toBeTruthy()
  await user.click(screen.getByRole('link', { name: 'Inicio' }))
  await screen.findByRole('heading', { level: 1, name: 'Inicio' })
  expect(screen.getByRole('link', { name: 'Inicio', current: 'page' })).toBeTruthy()
  await user.click(screen.getByRole('link', { name: 'Buscar paciente' }))
  await screen.findByRole('heading', { name: 'Pacientes' })
})

it('permite entrar directamente a /dashboard/pacientes sin simular una sesión', () => {
  renderRoute('/dashboard/pacientes')
  expect(screen.getByRole('heading', { name: 'Pacientes' })).toBeTruthy()
  expect(screen.getByText('Vista de demostración')).toBeTruthy()
})

it('abre registro desde el listado, mantiene Pacientes activo y permite cancelar', async () => {
  const user = userEvent.setup()
  renderRoute('/dashboard/pacientes')
  await user.click(screen.getByRole('link', { name: 'Registrar paciente' }))
  await screen.findByRole('heading', { name: 'Registrar paciente' })
  expect(screen.getByTestId('location').textContent).toBe('/dashboard/pacientes/nuevo')
  expect(document.title).toBe('Registrar paciente · Nutriline')
  expect(screen.getByRole('link', { name: 'Pacientes', current: 'page' })).toBeTruthy()
  await user.click(screen.getByRole('link', { name: 'Cancelar' }))
  await screen.findByRole('heading', { name: 'Pacientes' })
  expect(screen.getByText('13 registrados')).toBeTruthy()
})

it('abre un expediente desde el listado y permite volver por el historial', async () => {
  const user = userEvent.setup()
  renderRoute('/dashboard/pacientes')
  await user.click(screen.getByRole('link', { name: 'Ver expediente de Mariana Solís Peña' }))
  await screen.findByRole('heading', { name: 'Mariana Solís Peña' })
  expect(screen.getByTestId('location').textContent).toBe('/dashboard/pacientes/DEMO-001')
  expect(screen.getByRole('link', { name: 'Pacientes', current: 'page' })).toBeTruthy()
  await user.click(screen.getByRole('button', { name: 'Atrás en historial' }))
  await screen.findByRole('heading', { name: 'Pacientes' })
  await user.click(screen.getByRole('button', { name: 'Adelante en historial' }))
  await screen.findByRole('heading', { name: 'Mariana Solís Peña' })
})

it('abre nueva consulta desde el expediente y permite cancelar sin alterar el historial', async () => {
  const user = userEvent.setup()
  renderRoute('/dashboard/pacientes/DEMO-001')
  await user.click(screen.getByRole('button', { name: 'Nueva consulta' }))
  expect(await screen.findByRole('heading', { name: 'Nueva consulta' })).toBeTruthy()
  expect(screen.getByTestId('location').textContent).toBe('/dashboard/pacientes/DEMO-001/consultas/nueva')
  await user.click(screen.getByRole('link', { name: 'Cancelar' }))
  expect(await screen.findByRole('heading', { name: 'Mariana Solís Peña' })).toBeTruthy()
  expect(screen.getByText('1–2 de 3 consultas')).toBeTruthy()
})

it('abre edición desde el expediente y cancelar conserva los datos originales', async () => {
  const user = userEvent.setup()
  renderRoute('/dashboard/pacientes/DEMO-001')
  await user.click(screen.getByRole('button', { name: 'Editar paciente' }))
  await screen.findByRole('heading', { name: 'Editar paciente' })
  expect(screen.getByTestId('location').textContent).toBe('/dashboard/pacientes/DEMO-001/editar')
  expect(screen.getByRole('link', { name: 'Pacientes', current: 'page' })).toBeTruthy()
  await user.clear(screen.getByLabelText('Nombre completo'))
  await user.type(screen.getByLabelText('Nombre completo'), 'Cambio sin guardar')
  await user.click(screen.getByRole('link', { name: 'Cancelar' }))
  await screen.findByRole('heading', { name: 'Mariana Solís Peña' })
  await user.click(screen.getByRole('button', { name: 'Editar paciente' }))
  expect((screen.getByLabelText('Nombre completo') as HTMLInputElement).value).toBe('Mariana Solís Peña')
})

it('abre Consultas desde el menú y el detalle exacto desde el historial', async () => {
  const user = userEvent.setup()
  renderRoute('/dashboard/inicio')
  await user.click(screen.getByRole('link', { name: 'Consultas' }))
  await screen.findByRole('heading', { level: 1, name: 'Consultas' })
  expect(screen.getByRole('link', { name: 'Consultas', current: 'page' })).toBeTruthy()
  await user.click(screen.getByRole('link', { name: 'Ver consulta DEMO-C002 de Mariana Solís Peña' }))
  await screen.findByRole('heading', { level: 1, name: 'Consulta DEMO-C002' })
  expect(screen.getByTestId('location').textContent).toBe('/dashboard/consultas/DEMO-C002')
  await user.click(screen.getByRole('button', { name: 'Atrás en historial' }))
  await screen.findByRole('heading', { level: 1, name: 'Consultas' })
})

it('elige un paciente activo y abre el formulario existente de nueva consulta', async () => {
  const user = userEvent.setup()
  renderRoute('/dashboard/consultas')
  await user.click(screen.getByRole('button', { name: 'Nueva consulta' }))
  await user.click(screen.getByRole('combobox', { name: 'Paciente' }))
  await user.click(screen.getByRole('option', { name: 'Carlos Mendoza Rivas · DEMO-002' }))
  await user.click(screen.getByRole('button', { name: 'Continuar al formulario' }))
  await screen.findByRole('heading', { name: 'Nueva consulta' })
  expect(screen.getByTestId('location').textContent).toBe('/dashboard/pacientes/DEMO-002/consultas/nueva')
  expect(screen.queryByRole('dialog')).toBeNull()
})

it.each(['/no-existe', '/dashboard/no-existe'])('muestra 404 para %s y ofrece volver a pacientes', async path => {
  const user = userEvent.setup()
  renderRoute(path)
  expect(screen.getByRole('heading', { name: 'No encontramos esta página' })).toBeTruthy()
  expect(document.title).toBe('Página no encontrada · Nutriline')
  await user.click(screen.getByRole('link', { name: 'Ir a pacientes' }))
  await screen.findByRole('heading', { name: 'Pacientes' })
  expect(screen.getByTestId('location').textContent).toBe('/dashboard/pacientes')
})
