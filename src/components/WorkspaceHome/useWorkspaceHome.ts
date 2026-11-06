import { useEffect, useRef } from 'react'
import { demoPatientRecords } from '../PatientRecord/demoPatientRecords'
import { workspaceOverview } from './workspaceOverview'

export function useWorkspaceHome() {
  const headingRef = useRef<HTMLHeadingElement>(null)
  useEffect(() => {
    document.title = 'Inicio · Nutriline'
    headingRef.current?.focus()
  }, [])
  return { headingRef, ...workspaceOverview(demoPatientRecords) }
}
