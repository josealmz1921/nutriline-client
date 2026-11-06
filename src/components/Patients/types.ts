export interface PatientPreview {
  id: string
  name: string
  age: number
  email: string
  phone: string
  status: 'active' | 'archived'
  registeredAt: string
  lastVisit: string | null
}

export type PatientStatus = PatientPreview['status']
export type ListPreview = 'ready' | 'loading' | 'empty' | 'error'
export type PatientOrder = 'recent' | 'name' | 'visit'
