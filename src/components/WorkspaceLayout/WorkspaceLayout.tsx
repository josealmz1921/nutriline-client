import { Link, Outlet } from 'react-router-dom'
import { LuChevronRight, LuMenu, LuSprout } from 'react-icons/lu'
import Dialog from '../Dialog'
import WorkspaceNavigation from '../WorkspaceNavigation'
import { useWorkspaceLayout } from './useWorkspaceLayout'
import styles from './WorkspaceLayout.module.css'

export default function WorkspaceLayout() {
  const { menuOpen, closeMenu, openMenu, skipToContent, sectionLabel, isHome, isConsultations, isConsultationRecord } = useWorkspaceLayout()
  return <div className={styles.layout}>
    <a href="#main-content" onClick={skipToContent} className={styles.skipLink}>Saltar al contenido</a>
    <aside className={styles.sidebar}><WorkspaceNavigation /></aside>
    <div className={styles.workspace}>
      <header className={styles.header}>
        <button type="button" onClick={openMenu} className={styles.menuButton} aria-label="Abrir menú" aria-expanded={menuOpen} aria-haspopup="dialog"><LuMenu aria-hidden="true" /></button>
        <div className={styles.breadcrumb}><LuSprout aria-hidden="true" /><span>Espacio clínico</span><LuChevronRight aria-hidden="true" />{isConsultationRecord ? <><Link to="/dashboard/consultas">Consultas</Link><LuChevronRight aria-hidden="true" /><strong>Detalle</strong></> : sectionLabel ? <><Link to="/dashboard/pacientes">Pacientes</Link><LuChevronRight aria-hidden="true" /><strong>{sectionLabel}</strong></> : <strong>{isHome ? 'Inicio' : isConsultations ? 'Consultas' : 'Pacientes'}</strong>}</div>
        <span className={styles.demoBadge}>Vista de demostración</span>
      </header>
      <main id="main-content" className={styles.main} tabIndex={-1}><Outlet /></main>
      <footer className={styles.footer}>Nutriline · Gestión nutricional con propósito</footer>
    </div>
    {menuOpen && <Dialog isOpen onClose={closeMenu} ariaLabel="Menú de navegación"><WorkspaceNavigation onNavigate={closeMenu} /></Dialog>}
  </div>
}
