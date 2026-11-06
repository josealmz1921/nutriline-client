import { useState } from 'react'
import { useFormApi } from 'informed'
import { fillDevEmptyFields } from './devFormFill'
import type { DevFormProfile } from './devFormExamples'

export function useDevFormTools(profile: DevFormProfile, onFillRows?: () => number) {
  const api = useFormApi()
  const [message, setMessage] = useState('')
  const fill = () => {
    if (!import.meta.env.DEV) return
    const fields = fillDevEmptyFields(api, profile)
    const rows = onFillRows?.() ?? 0
    setMessage(fields || rows ? `Ejemplos ficticios añadidos: ${fields} campos y ${rows} filas nuevas. Revisa y continúa manualmente.` : 'Sin cambios: no hay espacios vacíos elegibles. Se respetan las capturas, filas y declaraciones de ausencia.')
  }
  return { fill, message }
}
