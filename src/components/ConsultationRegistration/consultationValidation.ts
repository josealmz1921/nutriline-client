const text = (value: unknown) => typeof value === 'string' ? value.trim() : ''

export function validateMeasurement(value: unknown) {
  const measurement = text(value)
  if (!measurement) return undefined
  if (!/^(0|[1-9]\d{0,4})(\.\d{1,3})?$/.test(measurement) || Number(measurement) <= 0) {
    return 'Ingresa una medida mayor que cero, con hasta 5 enteros y 3 decimales (usa punto).'
  }
}

export function localDateTime(value: Date) {
  const pad = (part: number) => String(part).padStart(2, '0')
  return `${String(value.getFullYear()).padStart(4, '0')}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}T${pad(value.getHours())}:${pad(value.getMinutes())}`
}

export function validateConsultationTime(value: unknown) {
  const raw = text(value)
  if (!raw) return undefined
  const date = new Date(raw)
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(raw) || !Number.isFinite(date.getTime()) || date.getUTCFullYear() < 1000 || localDateTime(date) !== raw) {
    return 'Selecciona una fecha y hora válidas, a partir del año 1000.'
  }
}

export function validateReason(value: unknown) {
  if (!text(value)) return 'Ingresa el motivo de consulta.'
  if (text(value).length > 500) return 'El motivo no puede superar 500 caracteres.'
}

export function validateNotes(value: unknown) {
  if (text(value).length > 10000) return 'Las notas no pueden superar 10000 caracteres.'
}
