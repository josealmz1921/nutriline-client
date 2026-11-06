import type { PatientPreview } from './types'

// Datos sintéticos exclusivos de la vista previa; no contienen expedientes reales.
export const demoPatients: readonly PatientPreview[] = [
  { id: 'DEMO-001', name: 'Mariana Solís Peña', age: 32, email: 'mariana.solis@example.com', phone: '+52 55 0000 0001', status: 'active', registeredAt: '2026-11-05', lastVisit: '2026-11-05' },
  { id: 'DEMO-002', name: 'Carlos Mendoza Rivas', age: 45, email: 'carlos.mendoza@example.com', phone: '+52 55 0000 0002', status: 'active', registeredAt: '2026-11-04', lastVisit: '2026-11-04' },
  { id: 'DEMO-003', name: 'Sofía Valenzuela Duque', age: 28, email: 'sofia.valenzuela@example.com', phone: '+52 55 0000 0003', status: 'active', registeredAt: '2026-11-03', lastVisit: '2026-11-02' },
  { id: 'DEMO-004', name: 'Javier Ortiz Galindo', age: 51, email: 'javier.ortiz@example.com', phone: '+52 55 0000 0004', status: 'active', registeredAt: '2026-11-02', lastVisit: '2026-11-01' },
  { id: 'DEMO-005', name: 'Valentina Ruiz Torres', age: 36, email: 'valentina.ruiz@example.com', phone: '+52 55 0000 0005', status: 'active', registeredAt: '2026-11-01', lastVisit: '2026-11-03' },
  { id: 'DEMO-006', name: 'Diego Navarro León', age: 24, email: 'diego.navarro@example.com', phone: '+52 55 0000 0006', status: 'active', registeredAt: '2026-10-31', lastVisit: null },
  { id: 'DEMO-007', name: 'Camila Vega Santos', age: 39, email: 'camila.vega@example.com', phone: '+52 55 0000 0007', status: 'active', registeredAt: '2026-10-30', lastVisit: '2026-10-31' },
  { id: 'DEMO-008', name: 'Andrés Castillo Mora', age: 43, email: 'andres.castillo@example.com', phone: '+52 55 0000 0008', status: 'active', registeredAt: '2026-10-29', lastVisit: '2026-10-29' },
  { id: 'DEMO-009', name: 'Lucía Herrera Paz', age: 30, email: 'lucia.herrera@example.com', phone: '+52 55 0000 0009', status: 'active', registeredAt: '2026-10-28', lastVisit: '2026-10-30' },
  { id: 'DEMO-010', name: 'Mateo Fuentes Silva', age: 47, email: 'mateo.fuentes@example.com', phone: '+52 55 0000 0010', status: 'active', registeredAt: '2026-10-27', lastVisit: null },
  { id: 'DEMO-011', name: 'Renata Molina Cruz', age: 34, email: 'renata.molina@example.com', phone: '+52 55 0000 0011', status: 'archived', registeredAt: '2026-10-26', lastVisit: '2026-10-27' },
  { id: 'DEMO-012', name: 'Emilio Paredes Gil', age: 56, email: 'emilio.paredes@example.com', phone: '+52 55 0000 0012', status: 'archived', registeredAt: '2026-10-25', lastVisit: '2026-10-26' },
  { id: 'DEMO-013', name: 'Ana Belén Ríos', age: 29, email: 'ana.rios@example.com', phone: '+52 55 0000 0013', status: 'archived', registeredAt: '2026-10-24', lastVisit: null },
]
