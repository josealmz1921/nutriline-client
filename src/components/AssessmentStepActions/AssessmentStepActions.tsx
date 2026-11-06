import type { ReactNode } from 'react'
import { LuArrowLeft, LuArrowRight } from 'react-icons/lu'
import styles from './AssessmentStepActions.module.css'

interface Props {
  onBack?: () => void
  onContinue: () => void
  continueLabel?: string
  note: string
  children?: ReactNode
}

export default function AssessmentStepActions({ onBack, onContinue, continueLabel = 'Continuar', note, children }: Props) {
  return <footer className={styles.actions}><p>{note}</p><div>
    {onBack && <button type="button" onClick={onBack} className={styles.secondary}><LuArrowLeft aria-hidden="true" /> Anterior</button>}
    {children}
    <button type="button" onClick={onContinue} className={styles.primary}>{continueLabel}<LuArrowRight aria-hidden="true" /></button>
  </div></footer>
}
