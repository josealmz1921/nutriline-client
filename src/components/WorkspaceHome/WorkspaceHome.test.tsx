import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import WorkspaceHome from './WorkspaceHome'
import { workspaceOverview } from './workspaceOverview'
import { demoPatientRecords } from '../PatientRecord/demoPatientRecords'

afterEach(cleanup)

describe('Inicio de demostración', () => {
  it('presenta resumen coherente con pacientes y consultas existentes, sin simular sincronización', () => {
    render(<MemoryRouter><WorkspaceHome /></MemoryRouter>)
    expect(screen.getByRole('heading', { level: 1, name: 'Inicio' })).toBeTruthy()
    expect(document.title).toBe('Inicio · Nutriline')
    expect(screen.getByRole('heading', { name: 'Hola, Dra. Elena Ramos' })).toBeTruthy()
    const summary = screen.getByRole('region', { name: 'Resumen de tu espacio' })
    expect(within(summary).getByText('10')).toBeTruthy()
    expect(within(summary).getByText('12')).toBeTruthy()
    expect(within(summary).getByText('2')).toBeTruthy()
    expect(within(summary).getByText('13 pacientes en total · 3 archivados')).toBeTruthy()
    expect(screen.getByText(/No hay conexión a la API, sincronización ni cambios guardados/)).toBeTruthy()
    expect(screen.queryByText(/jornada activa|al día|completada|hace 45 min/i)).toBeNull()
    expect(screen.getByText('5 de noviembre de 2026').getAttribute('datetime')).toBe('2026-11-05')
  })

  it('enlaza acciones a rutas existentes y muestra una consulta por paciente en actividad', () => {
    render(<MemoryRouter><WorkspaceHome /></MemoryRouter>)
    expect(screen.getByRole('link', { name: 'Registrar paciente' }).getAttribute('href')).toBe('/dashboard/pacientes/nuevo')
    expect(screen.getByRole('link', { name: 'Buscar paciente' }).getAttribute('href')).toBe('/dashboard/pacientes')
    const activity = screen.getByRole('region', { name: 'Actividad reciente' })
    const links = within(activity).getAllByRole('link', { name: /Ver expediente de/ })
    expect(links).toHaveLength(4)
    expect(links[0].getAttribute('href')).toBe('/dashboard/pacientes/DEMO-001')
    expect(links[1].getAttribute('href')).toBe('/dashboard/pacientes/DEMO-002')
    expect(links[2].getAttribute('href')).toBe('/dashboard/pacientes/DEMO-005')
    expect(links[3].getAttribute('href')).toBe('/dashboard/pacientes/DEMO-003')
    expect(within(activity).getAllByText('Mariana Solís Peña')).toHaveLength(1)
    expect(within(activity).getByText(/11:30/)).toBeTruthy()
  })

  it('distingue la agenda pendiente de consultas ya registradas', () => {
    render(<MemoryRouter><WorkspaceHome /></MemoryRouter>)
    const agenda = screen.getByRole('region', { name: 'Tu agenda, en una próxima etapa' })
    expect(within(agenda).getByText('POR DISEÑAR')).toBeTruthy()
    expect(agenda.textContent).toContain('no representa consultas programadas')
    expect(within(agenda).queryByRole('link')).toBeNull()
  })
})

describe('Resumen del espacio clínico', () => {
  it('calcula totales sin modificar fixtures ni duplicar pacientes en actividad', () => {
    const before = JSON.stringify(demoPatientRecords)
    const overview = workspaceOverview(demoPatientRecords)
    expect(overview.activePatients).toBe(10)
    expect(overview.archivedPatients).toBe(3)
    expect(overview.consultations).toBe(12)
    expect(overview.withoutConsultations).toBe(2)
    expect(new Set(overview.recentActivity.map(item => item.patient.id)).size).toBe(4)
    expect(overview.recentActivity[0].consultation.id).toBe('DEMO-C003')
    expect(JSON.stringify(demoPatientRecords)).toBe(before)
  })

  it('no inventa actividad o conteos si no hay datos', () => {
    expect(workspaceOverview([])).toEqual({ totalPatients: 0, activePatients: 0, archivedPatients: 0, consultations: 0, withoutConsultations: 0, recentActivity: [] })
    const overview = workspaceOverview([{ ...demoPatientRecords[0], consultations: [] }])
    expect(overview.withoutConsultations).toBe(1)
    expect(overview.recentActivity).toEqual([])
  })
})
