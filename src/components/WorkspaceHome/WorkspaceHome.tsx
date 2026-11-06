import { Link } from 'react-router-dom'
import { LuArrowRight, LuArrowUpRight, LuCalendarDays, LuClipboardList, LuClock3, LuFlaskConical, LuSearch, LuSprout, LuUserPlus, LuUsers } from 'react-icons/lu'
import SummaryCard from '../SummaryCard'
import { formatConsultation } from '../ConsultationHistory/formatConsultation'
import { useWorkspaceHome } from './useWorkspaceHome'
import styles from './WorkspaceHome.module.css'

export default function WorkspaceHome() {
  const { headingRef, totalPatients, activePatients, archivedPatients, consultations, withoutConsultations, recentActivity } = useWorkspaceHome()
  return <>
    <header className={styles.heading}><p>TU ESPACIO CLÍNICO</p><h1 ref={headingRef} tabIndex={-1}>Inicio</h1><span>Una mirada a tu consulta, con tiempo para lo importante.</span></header>
    <section className={styles.welcome} aria-labelledby="welcome-title">
      <div><p className={styles.eyebrow}>ACOMPAÑAR TAMBIÉN ES CONECTAR</p><h2 id="welcome-title">Hola, Dra. Elena Ramos</h2><p>Tu espacio para conocer a cada paciente y dar continuidad a su historia nutricional.</p><span className={styles.referenceDate}><LuCalendarDays aria-hidden="true" /> Escenario de demostración · <time dateTime="2026-11-05">5 de noviembre de 2026</time></span></div>
      <span className={styles.welcomeArt} aria-hidden="true"><LuSprout /></span>
    </section>
    <p className={styles.demoNote}><LuFlaskConical aria-hidden="true" /> Resumen de datos ficticios. No hay conexión a la API, sincronización ni cambios guardados.</p>
    <section className={styles.quickActions} aria-labelledby="quick-title"><h2 id="quick-title">Acceso inmediato</h2><div>
      <Link to="/dashboard/pacientes/nuevo" className={styles.primary}><LuUserPlus aria-hidden="true" /> Registrar paciente <LuArrowRight aria-hidden="true" /></Link>
      <Link to="/dashboard/pacientes" className={styles.secondary}><LuSearch aria-hidden="true" /> Buscar paciente <LuArrowRight aria-hidden="true" /></Link>
    </div></section>
    <section className={styles.overview} aria-labelledby="overview-title"><div className={styles.sectionHeading}><h2 id="overview-title">Resumen de tu espacio</h2><span>Directorio de demostración</span></div><dl className={styles.metrics}>
      <SummaryCard icon={<LuUsers />} label="Pacientes activos" value={activePatients} description={`${totalPatients} pacientes en total · ${archivedPatients} archivados`} />
      <SummaryCard icon={<LuClipboardList />} label="Consultas registradas" value={consultations} description="Historial ficticio completo, incluidos pacientes archivados" />
      <SummaryCard icon={<LuClock3 />} label="Sin primera consulta" value={withoutConsultations} description="Pacientes activos sin consultas en su expediente" />
    </dl></section>
    <div className={styles.content}>
      <section className={styles.activity} aria-labelledby="activity-title"><div className={styles.sectionHeading}><h2 id="activity-title">Actividad reciente</h2><Link to="/dashboard/pacientes">Ver pacientes <LuArrowUpRight aria-hidden="true" /></Link></div><p className={styles.activityDescription}>Última consulta de cada paciente · Horarios de Ciudad de México.</p>
        {recentActivity.length ? <ul className={styles.activityList}>{recentActivity.map(({ patient, consultation }) => <li key={patient.id}>
          <Link to={`/dashboard/pacientes/${patient.id}`} aria-label={`Ver expediente de ${patient.name}`} className={styles.activityLink}>
            <span className={styles.avatar} aria-hidden="true">{patient.name.split(' ').slice(0, 2).map(part => part[0]).join('')}</span>
            <div className={styles.activityText}><strong>{patient.name}</strong><p>{consultation.reason}</p><span><LuClock3 aria-hidden="true" /><time dateTime={consultation.occurredAt}>{formatConsultation(consultation.occurredAt)}</time></span></div>
            <span className={styles.recordLabel}>Ver expediente <LuArrowUpRight aria-hidden="true" /></span>
          </Link>
        </li>)}</ul> : <p className={styles.empty}>Aún no hay consultas para mostrar.</p>}
      </section>
      <aside className={styles.aside}>
        <section className={styles.workflow} aria-labelledby="workflow-title"><span className={styles.sectionIcon}><LuSprout aria-hidden="true" /></span><h2 id="workflow-title">Cada historia empieza por conocer</h2><p>Recorre el flujo de atención en las pantallas de demostración.</p><ol><li><span>1</span><div><strong>Registra a tu paciente</strong><p>Revisa sus datos personales y de contacto.</p></div></li><li><span>2</span><div><strong>Abre su expediente</strong><p>Consulta su historia y sus mediciones.</p></div></li><li><span>3</span><div><strong>Prepara una consulta</strong><p>Ingresa motivo, mediciones y notas sin guardar.</p></div></li></ol><Link to="/dashboard/pacientes">Explorar expedientes <LuArrowRight aria-hidden="true" /></Link></section>
        <section className={styles.pending} aria-labelledby="agenda-title"><span className={styles.sectionIcon}><LuCalendarDays aria-hidden="true" /></span><div><span className={styles.pendingBadge}>POR DISEÑAR</span><h2 id="agenda-title">Tu agenda, en una próxima etapa</h2><p>El alcance de las citas está pendiente de definir. Este resumen no representa consultas programadas.</p></div></section>
      </aside>
    </div>
  </>
}
