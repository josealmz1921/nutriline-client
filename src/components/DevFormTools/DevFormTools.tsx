import { LuFlaskConical, LuWandSparkles } from 'react-icons/lu'
import { devProfileLabels, type DevFormProfile } from './devFormExamples'
import { useDevFormTools } from './useDevFormTools'
import styles from './DevFormTools.module.css'

export default function DevFormTools({ profile, onFillRows }: { profile: DevFormProfile; onFillRows?: () => number }) {
  const { fill, message } = useDevFormTools(profile, onFillRows)
  if (!import.meta.env.DEV) return null
  return <section className={styles.root} aria-label={`Herramientas de desarrollo · ${devProfileLabels[profile]}`}>
    <div className={styles.heading}><LuFlaskConical aria-hidden="true" /><span>Modo desarrollo</span><span className={styles.scope}>{devProfileLabels[profile]}</span></div>
    <p>Solo ejemplos ficticios. Completa espacios vacíos sin sobrescribir capturas ni filas existentes. No confirma pasos, no guarda y no envía datos. No es una dieta ni una referencia clínica.</p>
    <button type="button" onClick={fill}><LuWandSparkles aria-hidden="true" /> Rellenar campos vacíos</button>
    {message && <p className={styles.status} role="status">{message}</p>}
  </section>
}
