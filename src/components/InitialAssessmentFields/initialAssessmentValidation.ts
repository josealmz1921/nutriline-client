import type { FileValue } from '../InputFile/types'

export function isPhoto(value: unknown): value is FileValue {
  return typeof value === 'object' && value !== null && 'base64' in value && typeof value.base64 === 'string' && 'name' in value && typeof value.name === 'string' && 'type' in value && typeof value.type === 'string' && 'size' in value && typeof value.size === 'number'
}

export function validatePhoto(value: unknown) {
  if (value == null) return
  if (!isPhoto(value) || !['image/jpeg', 'image/png', 'image/webp'].includes(value.type)) return 'Selecciona una imagen JPG, PNG o WebP.'
  if (value.size > 5 * 1024 * 1024) return 'La fotografía no puede superar 5 MB.'
}

export function validateInitialReason(value: unknown) {
  if (typeof value === 'string' && value.trim().length > 500) return 'El motivo no puede superar 500 caracteres.'
}
