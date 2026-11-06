import { useState } from 'react'
import { useFormState } from 'informed'
import { legacyNationalities } from '../PatientRegistration/legacyNationalities'
import { isPhoto, validatePhoto } from './initialAssessmentValidation'

const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es').trim()

export function useInitialAssessmentFields() {
  const { values } = useFormState()
  const [failedPhoto, setFailedPhoto] = useState<string | null>(null)
  const photo = isPhoto(values.photo) && !validatePhoto(values.photo) ? values.photo : null
  const search = normalize(String(values.nationalitySearch ?? ''))
  const nationalities = legacyNationalities.filter(option => option.value === values.nationality || normalize(`${option.label} ${option.value}`).includes(search))
  return { photo, showPhoto: Boolean(photo && failedPhoto !== photo.base64),
    photoFailed: Boolean(photo && failedPhoto === photo.base64),
    onPhotoError: () => setFailedPhoto(photo?.base64 ?? null),
    nationalityOptions: [{ value: '', label: 'Sin especificar' }, ...nationalities],
    nationalityMatches: nationalities.filter(option => normalize(`${option.label} ${option.value}`).includes(search)).length }
}
