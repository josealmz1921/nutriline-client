import { LuCalendarDays, LuClipboardList, LuHouse, LuLogOut, LuSprout, LuUsers } from 'react-icons/lu'
import styles from './WorkspaceNavigation.module.css'
import { Link, NavLink } from 'react-router-dom'

interface Props { onNavigate?: () => void }

export default function WorkspaceNavigation({ onNavigate }: Props) {
  return <div className={styles.container}>
    <Link to="/dashboard/inicio" onClick={onNavigate} className={styles.brand}><span><LuSprout aria-hidden="true" /></span>Nutriline.</Link>
    <p className={styles.caption}>ESPACIO CLÍNICO</p>
    <nav aria-label="Navegación principal" className={styles.navigation}>
      <NavLink to="/dashboard/inicio" onClick={onNavigate} className={({ isActive }) => isActive ? styles.active : styles.link}><LuHouse aria-hidden="true" /> Inicio</NavLink>
      <NavLink to="/dashboard/pacientes" onClick={onNavigate} className={({ isActive }) => isActive ? styles.active : styles.link}><LuUsers aria-hidden="true" /> Pacientes</NavLink>
      <NavLink to="/dashboard/consultas" onClick={onNavigate} className={({ isActive }) => isActive ? styles.active : styles.link}><LuClipboardList aria-hidden="true" /> Consultas</NavLink>
      <button type="button" disabled className={styles.link}><LuCalendarDays aria-hidden="true" /> Agenda <span>Próximamente</span></button>
    </nav>
    <div className={styles.profile}>
      <div className={styles.identity}><span className={styles.avatar} aria-hidden="true">ER</span><div><strong>Dra. Elena Ramos</strong><span>Perfil de demostración</span></div></div>
      <Link to="/login" onClick={onNavigate} className={styles.exit}><LuLogOut aria-hidden="true" /> Volver al login</Link>
    </div>
  </div>
}
