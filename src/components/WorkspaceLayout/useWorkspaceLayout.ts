import { useCallback, useState, type MouseEvent } from 'react'
import { useMatch } from 'react-router-dom'

export function useWorkspaceLayout() {
  const isHome = Boolean(useMatch('/dashboard/inicio'))
  const isConsultations = Boolean(useMatch('/dashboard/consultas/*'))
  const isConsultationRecord = Boolean(useMatch('/dashboard/consultas/:consultationId'))
  const isRegistration = Boolean(useMatch('/dashboard/pacientes/nuevo'))
  const isRecord = Boolean(useMatch('/dashboard/pacientes/:patientId')) && !isRegistration
  const isConsultation = Boolean(useMatch('/dashboard/pacientes/:patientId/consultas/nueva'))
  const isEditing = Boolean(useMatch('/dashboard/pacientes/:patientId/editar'))
  const sectionLabel = isRegistration ? 'Registro' : isEditing ? 'Editar paciente' : isConsultation ? 'Nueva consulta' : isRecord ? 'Expediente' : null
  const [menuOpen, setMenuOpen] = useState(false)
  const closeMenu = useCallback(() => setMenuOpen(false), [])
  const skipToContent = (event: MouseEvent<HTMLAnchorElement>) => {
    // Enfocar el contenido sin modificar la URL ni crear una entrada de historial.
    event.preventDefault()
    document.getElementById('main-content')?.focus()
  }
  return { menuOpen, closeMenu, openMenu: () => setMenuOpen(true), skipToContent, sectionLabel, isHome, isConsultations, isConsultationRecord }
}
