import { Link } from 'react-router-dom'
import { LuArrowLeft, LuSprout } from 'react-icons/lu'
import { useNotFound } from './useNotFound'
import styles from './NotFound.module.css'

export default function NotFound() {
  useNotFound()
  return <main className={styles.page}>
    <span className={styles.icon}><LuSprout aria-hidden="true" /></span>
    <p className={styles.code}>404 · NUTRILINE</p>
    <h1>No encontramos esta página</h1>
    <p>La dirección no existe o esta sección todavía no está disponible.</p>
    <Link to="/dashboard/pacientes" className={styles.primary}><LuArrowLeft aria-hidden="true" /> Ir a pacientes</Link>
    <Link to="/login" className={styles.secondary}>Volver al login</Link>
  </main>
}
