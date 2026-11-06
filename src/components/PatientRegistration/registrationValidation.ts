export function validateFullName(value: unknown) {
  if (typeof value !== 'string' || !value.trim()) return 'Ingresa el nombre completo.'
  if (value.trim().length > 150) return 'Usa un máximo de 150 caracteres.'
}

export function validateBirthDate(value: unknown) {
  if (typeof value !== 'string' || !value) return 'Selecciona la fecha de nacimiento.'
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return 'Ingresa una fecha válida.'
  const date = new Date(`${value}T00:00:00Z`)
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== value) return 'Ingresa una fecha válida.'
  if (value < '1000-01-01' || value > new Date().toISOString().slice(0, 10)) return 'La fecha debe estar entre el año 1000 y hoy.'
}

export function validateEmail(value: unknown) {
  if (value === undefined || value === null || value === '') return
  if (typeof value !== 'string') return 'Ingresa un correo válido.'
  const email = value.trim()
  if (!email) return
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Ingresa un correo válido, por ejemplo nombre@correo.com.'
}

export function validatePhone(value: unknown) {
  if (typeof value === 'string' && value.trim().length > 32) return 'Usa un máximo de 32 caracteres.'
}

export function validateOccupation(value: unknown) {
  if (typeof value === 'string' && value.trim().length > 150) return 'Usa un máximo de 150 caracteres.'
}
