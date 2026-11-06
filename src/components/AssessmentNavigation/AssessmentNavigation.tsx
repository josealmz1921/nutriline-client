import { LuArrowLeft, LuCheck } from 'react-icons/lu'
import { useAssessmentNavigation } from './useAssessmentNavigation'
import styles from './AssessmentNavigation.module.css'

export interface AssessmentStep<T extends string> { id: T; label: string; available: boolean }
interface Props<T extends string> {
  steps: readonly AssessmentStep<T>[]
  current: T
  completed: readonly T[]
  onSelect: (step: T) => void
  label?: string
}

// Presentacional y sin dependencias del registro: reutilizable en otros formularios.
export default function AssessmentNavigation<T extends string>({ steps, current, completed, onSelect, label = 'Secciones de la evaluación inicial' }: Props<T>) {
  const { currentIndex, frontier, percentage, previous, next, handleSelect } = useAssessmentNavigation(steps, current, completed, onSelect)
  return <nav className={styles.navigation} aria-label={label}>
    <progress className={styles.accessibleProgress} max={steps.length} value={completed.length} aria-label="Secciones completadas" />
    <div className={styles.mobile}>
      <div className={styles.stepIndex}><span>PASO</span><strong>{String(currentIndex + 1).padStart(2, '0')}</strong><span>DE {String(steps.length).padStart(2, '0')}</span></div>
      <div className={styles.mobileContent}>
        <div className={styles.mobileHeading}>
          <span className={styles.ring} aria-hidden="true"><svg viewBox="0 0 44 44"><circle className={styles.ringTrack} cx="22" cy="22" r="18" /><circle className={styles.ringValue} data-empty={percentage === 0} cx="22" cy="22" r="18" pathLength="100" strokeDasharray={`${percentage} 100`} /></svg><span>{percentage}%</span></span>
          <div className={styles.mobileTitle}><strong>{steps[currentIndex]?.label}</strong><span>{next ? `Después: ${next.label}${next.available ? '' : ' · Próximamente'}` : 'Última sección'}</span></div>
        </div>
        <div className={styles.mobileActions}>
          {previous && completed.includes(previous.id) ? <button type="button" onClick={() => onSelect(previous.id)}><LuArrowLeft aria-hidden="true" /> Anterior</button> : <span>Completa los datos para continuar</span>}
          <select aria-label="Ir a una sección de la evaluación" value="" onChange={handleSelect}><option value="" disabled>Ver pasos</option>{steps.map((step, index) => <option key={step.id} value={step.id} disabled={!step.available || (frontier !== -1 && index > frontier)}>{String(index + 1).padStart(2, '0')} · {step.label}</option>)}</select>
        </div>
      </div>
    </div>
    <ol className={styles.steps}>{steps.map((step, index) => {
      const done = completed.includes(step.id)
      const locked = !step.available || (frontier !== -1 && index > frontier)
      const following = steps[index + 1]
      return <li key={step.id} className={styles.step} data-connected={done && (index < currentIndex || Boolean(following && completed.includes(following.id)))}><button type="button" disabled={locked} onClick={() => onSelect(step.id)} aria-current={current === step.id ? 'step' : undefined} aria-controls="assessment-panel" data-completed={done}>
        <span className={styles.number}>{done ? <LuCheck aria-hidden="true" /> : current === step.id ? <span className={styles.currentDot} /> : <span className={styles.upcomingNumber}>{index + 1}</span>}</span>
        <span className={styles.text}><strong>{step.label}</strong><span>{!step.available ? 'Pendiente de desarrollar' : done ? 'Completado' : current === step.id ? 'Actual' : locked ? 'Bloqueado · Completa el paso anterior' : 'Disponible'}</span></span>
      </button></li>
    })}</ol>
    <span className={styles.status} role="status">{completed.length} de {steps.length} secciones completadas · Sin guardar</span>
  </nav>
}
