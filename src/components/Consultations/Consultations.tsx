import { Form } from 'informed'
import { LuArchive, LuArrowLeft, LuArrowRight, LuClipboardList, LuClipboardPlus, LuFlaskConical, LuSearch, LuSlidersHorizontal, LuUsers, LuX } from 'react-icons/lu'
import Input from '../Input'
import Select from '../Select'
import Dialog from '../Dialog'
import SummaryCard from '../SummaryCard'
import ConsultationDirectory from '../ConsultationDirectory'
import { initialFilters, useConsultations } from './useConsultations'
import styles from './Consultations.module.css'

const statusOptions = [{ value: 'all', label: 'Todos los pacientes' }, { value: 'active', label: 'Pacientes activos' }, { value: 'archived', label: 'Pacientes archivados' }]
const orderOptions = [{ value: 'recent', label: 'Más recientes' }, { value: 'oldest', label: 'Más antiguas' }, { value: 'patient', label: 'Paciente A–Z' }]
const previewOptions = [{ value: 'ready', label: 'Lista de consultas' }, { value: 'loading', label: 'Cargando' }, { value: 'empty', label: 'Sin consultas' }, { value: 'error', label: 'Error de carga' }]
const initialValues = { ...initialFilters, preview: 'ready' }
const inputClasses = { input: styles.input, root: styles.field, label: styles.label, hasBefore: styles.hasBefore, hasAfter: styles.hasAfter }
const selectClasses = { input: styles.selectInput, standard: styles.label }

export default function Consultations() {
  const { headingRef, formApi, filters, preview, invalidRange, total, currentPage, pageCount, setPage, handleFormChange, resetFilters,
    entries, from, to, registeredCount, patientCount, archivedCount, hasFilters, clearQuery, resetPreview,
    choosingPatient, showPatientChoice, closePatientChoice, openNewConsultation, patientOptions } = useConsultations()
  const showList = preview === 'ready' && !invalidRange && entries.length > 0
  return <>
    <header className={styles.heading}><div><p>HISTORIAL CLÍNICO</p><h1 ref={headingRef} tabIndex={-1}>Consultas</h1><span>Cada encuentro, un paso en su acompañamiento.</span></div><button type="button" className={styles.primary} onClick={showPatientChoice}><LuClipboardPlus aria-hidden="true" /> Nueva consulta</button></header>
    <p className={styles.demoNote}><LuFlaskConical aria-hidden="true" /> Historial ficticio compartido con los expedientes. No hay conexión a la API ni consultas guardadas desde los formularios.</p>
    <dl className={styles.metrics} aria-label="Resumen del historial"><SummaryCard icon={<LuClipboardList />} label="Consultas registradas" value={registeredCount} description="Total del historial de demostración" /><SummaryCard icon={<LuUsers />} label="Pacientes con consultas" value={patientCount} description="Pacientes activos y archivados con historial" /><SummaryCard icon={<LuArchive />} label="De pacientes archivados" value={archivedCount} description="Consultas que permanecen disponibles para revisión" /></dl>
    <Form formApiRef={formApi} initialValues={initialValues} onValueChange={handleFormChange} className={styles.controls}>
      <div className={styles.toolbar}><Input identifier="query" type="search" label="Buscar consultas" placeholder="Nombre, motivo o identificador…" before={<LuSearch aria-hidden="true" />} after={filters.query ? <button type="button" aria-label="Limpiar búsqueda" onClick={clearQuery} className={styles.clear}><LuX aria-hidden="true" /></button> : undefined} classes={inputClasses} /><Select name="order" label="Ordenar por" options={orderOptions} classes={selectClasses} /></div>
      <div className={styles.filters}><Select name="status" label="Estado del paciente" options={statusOptions} classes={selectClasses} /><Input identifier="fromDate" type="date" label="Desde" min="1000-01-01" max="9999-12-31" classes={inputClasses} /><Input identifier="toDate" type="date" label="Hasta" min="1000-01-01" max="9999-12-31" classes={inputClasses} /><button type="button" className={styles.reset} onClick={resetFilters}>Restablecer filtros</button></div>
      <p className={styles.timezone}>Las fechas filtran días completos en Ciudad de México. El estado corresponde al paciente, no a la consulta.</p>
      {invalidRange && <p role="alert" className={styles.rangeError}>La fecha Desde no puede ser posterior a Hasta.</p>}
      <div className={styles.resultHeading}><h2>Historial de consultas</h2><p role="status">{preview !== 'ready' ? 'Previsualización de estado' : invalidRange ? 'Corrige el intervalo de fechas' : `${total} ${total === 1 ? 'consulta encontrada' : 'consultas encontradas'}`}</p></div>
      <section className={styles.results} aria-label="Resultados de consultas" aria-busy={preview === 'loading'}>
        {showList ? <><ConsultationDirectory entries={entries} /><div className={styles.pagination}><p>{from}–{to} de {total} consultas</p><nav aria-label="Paginación del historial general"><button type="button" aria-label="Página anterior" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}><LuArrowLeft aria-hidden="true" /></button><span>Página {currentPage} de {pageCount}</span><button type="button" aria-label="Página siguiente" disabled={currentPage === pageCount} onClick={() => setPage(currentPage + 1)}><LuArrowRight aria-hidden="true" /></button></nav></div></> : <div className={styles.state} role={preview === 'error' ? 'alert' : 'status'}>
          <span className={styles.stateIcon}><LuClipboardList aria-hidden="true" /></span>
          <h3>{preview === 'loading' ? 'Cargando consultas…' : preview === 'error' ? 'No pudimos mostrar las consultas' : invalidRange ? 'Revisa las fechas del filtro' : preview === 'empty' || !hasFilters ? 'Aún no hay consultas' : 'No encontramos consultas'}</h3>
          <p>{preview === 'loading' ? 'Estado de carga simulado, sin solicitudes de red.' : preview === 'error' ? 'Este es un error simulado. El historial ficticio no se ha modificado.' : invalidRange ? 'Selecciona un intervalo válido para consultar el historial.' : preview === 'empty' || !hasFilters ? 'Las consultas de cada paciente aparecerán en este historial.' : 'Prueba con otro nombre, motivo, identificador o intervalo de fechas.'}</p>
          {preview === 'error' ? <button type="button" className={styles.secondary} onClick={resetPreview}>Restablecer vista</button> : preview !== 'loading' && <button type="button" className={styles.secondary} onClick={resetFilters}>Restablecer filtros</button>}
        </div>}
      </section>
      <details className={styles.preview}><summary><LuSlidersHorizontal aria-hidden="true" /> Previsualizar estados de la lista</summary><div><p>Controles de demostración: no envían solicitudes ni borran el historial.</p><Select name="preview" label="Estado de la interfaz" options={previewOptions} classes={selectClasses} /></div></details>
    </Form>
    {choosingPatient && <Dialog isOpen onClose={closePatientChoice} ariaLabel="Elegir paciente para nueva consulta"><div className={styles.patientChoice}><h2>¿A quién acompañamos hoy?</h2><p>Elige un paciente activo para abrir su formulario de consulta. Solo podrás revisar datos, sin guardarlos.</p><Form onSubmit={openNewConsultation} noValidate focusOnInvalid><Select name="patientId" label="Paciente" placeholder="Selecciona un paciente" options={patientOptions} fallbackOnMissing="none" validate={value => value ? undefined : 'Selecciona un paciente activo.'} classes={selectClasses} /><p>Los pacientes archivados conservan su historial, pero no admiten consultas nuevas.</p><button type="submit" className={styles.primary}>Continuar al formulario <LuArrowRight aria-hidden="true" /></button><button type="button" className={styles.reset} onClick={closePatientChoice}>Cancelar</button></Form></div></Dialog>}
  </>
}
