import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Patients from './Patients'
import { MemoryRouter } from 'react-router-dom'

afterEach(cleanup)

const renderPatients = () => render(<MemoryRouter><Patients /></MemoryRouter>)

describe('Directorio de pacientes de demostración', () => {
  it('pagina los activos y reinicia la página al cambiar al filtro archivados', async () => {
    const user = userEvent.setup()
    renderPatients()
    expect(screen.getByText('Mariana Solís Peña')).toBeTruthy()
    expect(screen.queryByText('Diego Navarro León')).toBeNull()
    await user.click(screen.getByRole('button', { name: 'Página siguiente' }))
    expect(screen.getByText('Diego Navarro León')).toBeTruthy()
    expect(screen.queryByText('Mariana Solís Peña')).toBeNull()
    await user.click(screen.getByRole('button', { name: /Archivados/ }))
    expect(screen.getByText('Renata Molina Cruz')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Página 1' }).getAttribute('aria-current')).toBe('page')
    expect((screen.getByRole('button', { name: 'Página siguiente' }) as HTMLButtonElement).disabled).toBe(true)
  })

  it('busca sin acentos y limpia la búsqueda sin conservar páginas obsoletas', async () => {
    const user = userEvent.setup()
    renderPatients()
    await user.click(screen.getByRole('button', { name: 'Página siguiente' }))
    await user.type(screen.getByLabelText('Buscar pacientes'), 'sofia')
    await waitFor(() => expect(screen.getByText('Sofía Valenzuela Duque')).toBeTruthy())
    expect(screen.queryByText('Diego Navarro León')).toBeNull()
    await user.click(screen.getByRole('button', { name: 'Limpiar búsqueda' }))
    await waitFor(() => expect(screen.getByText('Mariana Solís Peña')).toBeTruthy())
    expect((screen.getByLabelText('Buscar pacientes') as HTMLInputElement).value).toBe('')
  })

  it('busca por correo y teléfono, y presenta el estado sin coincidencias', async () => {
    const user = userEvent.setup()
    renderPatients()
    const search = screen.getByLabelText('Buscar pacientes')
    await user.type(search, 'diego.navarro@')
    await waitFor(() => expect(screen.getByText('Diego Navarro León')).toBeTruthy())
    await user.clear(search)
    await user.type(search, '5500000003')
    await waitFor(() => expect(screen.getByText('Sofía Valenzuela Duque')).toBeTruthy())
    await user.clear(search)
    await user.type(search, 'sin-coincidencias')
    await screen.findByRole('heading', { name: 'No encontramos coincidencias' })
    expect(screen.queryByRole('table')).toBeNull()
    await user.click(screen.getAllByRole('button', { name: 'Limpiar búsqueda' }).at(-1)!)
    await screen.findByRole('table', { name: 'Directorio de pacientes' })
  })

  it('ordena por nombre y mantiene los pacientes sin consultas al final por visita', async () => {
    const user = userEvent.setup()
    renderPatients()
    await user.click(screen.getByRole('combobox', { name: 'Ordenar por' }))
    await user.click(screen.getByRole('option', { name: 'Nombre A–Z' }))
    let rows = within(screen.getByRole('table')).getAllByRole('rowheader')
    expect(rows[0].textContent).toContain('Andrés Castillo Mora')
    await user.click(screen.getByRole('combobox', { name: 'Ordenar por' }))
    await user.click(screen.getByRole('option', { name: 'Última consulta' }))
    await user.click(screen.getByRole('button', { name: 'Página siguiente' }))
    rows = within(screen.getByRole('table')).getAllByRole('rowheader')
    expect(rows.at(-1)?.textContent).toContain('Mateo Fuentes Silva')
    expect(screen.getAllByText('Sin consultas')).toHaveLength(2)
  })

  it('permite revisar estados de carga, vacío y error sin fingir solicitudes de red', async () => {
    const user = userEvent.setup()
    renderPatients()
    await user.click(screen.getByText('Previsualizar estados de la lista'))
    const choose = async (name: string) => {
      await user.click(screen.getByRole('combobox', { name: 'Estado de la interfaz' }))
      await user.click(screen.getByRole('option', { name }))
    }
    await choose('Cargando')
    await screen.findByText('Cargando directorio…')
    expect(screen.queryByRole('table')).toBeNull()
    await choose('Sin pacientes')
    await screen.findByRole('heading', { name: 'Aún no hay pacientes en esta lista' })
    await choose('Error de carga')
    expect(screen.getByRole('alert').textContent).toContain('error simulado')
    await user.click(screen.getByRole('button', { name: 'Restablecer vista' }))
    await screen.findByRole('table')
  })

  it('enlaza al registro y al expediente de cada paciente', () => {
    renderPatients()
    expect(screen.getByRole('link', { name: 'Registrar paciente' }).getAttribute('href')).toBe('/dashboard/pacientes/nuevo')
    expect(screen.getByRole('link', { name: 'Ver expediente de Mariana Solís Peña' }).getAttribute('href')).toBe('/dashboard/pacientes/DEMO-001')
  })
})
