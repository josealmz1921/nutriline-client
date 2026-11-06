import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Login from './Login'
import { MemoryRouter } from 'react-router-dom'

afterEach(cleanup)

describe('Login', () => {
  it('permite mostrar y ocultar la contraseña sin perder su valor', async () => {
    const user = userEvent.setup()
    render(<MemoryRouter><Login /></MemoryRouter>)
    const password = screen.getByLabelText(/^Contraseña/)
    const icons = [...screen.getByRole('button', { name: 'Mostrar contraseña' }).querySelectorAll('svg')]
    expect(icons).toHaveLength(2)
    await user.type(password, 'clave-ficticia')
    expect(password.getAttribute('type')).toBe('password')
    await user.click(screen.getByRole('button', { name: 'Mostrar contraseña' }))
    expect(password.getAttribute('type')).toBe('text')
    expect([...screen.getByRole('button', { name: 'Ocultar contraseña' }).querySelectorAll('svg')]).toEqual(icons)
    expect((password as HTMLInputElement).value).toBe('clave-ficticia')
    await user.click(screen.getByRole('button', { name: 'Ocultar contraseña' }))
    expect(password.getAttribute('type')).toBe('password')
    expect([...screen.getByRole('button', { name: 'Mostrar contraseña' }).querySelectorAll('svg')]).toEqual(icons)
  })

  it('informa que el acceso es una vista previa, sin simular una sesión', async () => {
    const user = userEvent.setup()
    render(<MemoryRouter><Login /></MemoryRouter>)
    await user.type(screen.getByLabelText(/^Correo electrónico/), 'demo@example.com')
    await user.type(screen.getByLabelText(/^Contraseña/), 'clave-ficticia')
    await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }))
    await waitFor(() => expect(screen.getByRole('status').textContent).toContain('no se enviaron tus datos'))
    expect(screen.getByRole('heading', { name: 'Qué gusto verte de nuevo' })).toBeTruthy()
  })

  it('comunica que la recuperación aún no está disponible', async () => {
    const user = userEvent.setup()
    render(<MemoryRouter><Login /></MemoryRouter>)
    await user.click(screen.getByRole('button', { name: '¿Olvidaste tu contraseña?' }))
    expect(screen.getByRole('status').textContent).toContain('cuando conectemos la autenticación')
  })
})
