import { Form } from 'informed'
import { Link } from 'react-router-dom'
import { LuArrowLeft, LuArrowRight, LuFlaskConical, LuSearch, LuSlidersHorizontal, LuUserPlus, LuX } from 'react-icons/lu'
import Input from '../Input'
import Select from '../Select'
import PatientDirectory from '../PatientDirectory'
import PatientsState from '../PatientsState'
import { usePatients } from './usePatients'
import styles from './Patients.module.css'

const orderOptions = [{ value: 'recent', label: 'Más recientes' }, { value: 'name', label: 'Nombre A–Z' }, { value: 'visit', label: 'Última consulta' }]
const previewOptions = [{ value: 'ready', label: 'Lista de pacientes' }, { value: 'loading', label: 'Cargando' }, { value: 'empty', label: 'Sin pacientes' }, { value: 'error', label: 'Error de carga' }]
const initialValues = { query: '', order: 'recent', preview: 'ready' }

export default function Patients() {
  const { formApi, query, status, preview, counts, totalRegistered, patients, total, currentPage, pageCount, from, to,
    setPage, handleFormChange, changeStatus, clearSearch, resetPreview, openRegistration } = usePatients()
  const showList = preview === 'ready' && patients.length > 0

  return <>
    <div className={styles.heading}>
      <div><p className={styles.eyebrow}>DIRECTORIO CLÍNICO</p><div className={styles.titleRow}><h1>Pacientes</h1><span>{totalRegistered} registrados</span></div><p className={styles.description}>Cada paciente, una historia que acompañar.</p></div>
      <Link to="/dashboard/pacientes/nuevo" className={styles.register}><LuUserPlus aria-hidden="true" /> Registrar paciente</Link>
    </div>
    <p className={styles.demoNote}><LuFlaskConical aria-hidden="true" /><span>Datos ficticios para explorar la interfaz. Puedes probar el formulario de registro; todavía no se guardan pacientes.</span></p>

    <Form formApiRef={formApi} initialValues={initialValues} onValueChange={handleFormChange} className={styles.controls}>
      <div className={styles.toolbar}>
        <div className={styles.search}>
          <Input identifier="query" type="search" label="Buscar pacientes" placeholder="Buscar por nombre, correo o teléfono…" before={<LuSearch aria-hidden="true" />}
            after={query ? <button type="button" className={styles.clearButton} aria-label="Limpiar búsqueda" onClick={clearSearch}><LuX aria-hidden="true" /></button> : undefined}
            classes={{ root: styles.searchRoot, label: styles.searchLabel, input: styles.searchInput }} />
        </div>
        <div className={styles.order}><Select name="order" label="Ordenar por" options={orderOptions} /></div>
      </div>
      <div className={styles.filters}>
        <div role="group" aria-label="Filtrar por estado" className={styles.statusFilters}>
          <button type="button" aria-pressed={status === 'active'} onClick={() => changeStatus('active')}>Activos <span>{counts.active}</span></button>
          <button type="button" aria-pressed={status === 'archived'} onClick={() => changeStatus('archived')}>Archivados <span>{counts.archived}</span></button>
        </div>
        <p className={styles.filteredCount} role="status">{preview === 'ready' ? `${total} ${total === 1 ? 'paciente' : 'pacientes'} en esta lista` : 'Previsualización de estado'}</p>
      </div>
      <section className={styles.directory} aria-label="Resultados del directorio" aria-busy={preview === 'loading'}>
        {showList ? <PatientDirectory patients={patients} /> : <PatientsState
          state={preview !== 'ready' ? preview : query.trim() ? 'no-results' : 'empty'}
          onReset={preview === 'error' ? resetPreview : clearSearch} onRegister={openRegistration} />}
        {showList && <div className={styles.pagination}>
          <p>Mostrando <strong>{from}–{to}</strong> de <strong>{total}</strong> pacientes</p>
          <nav aria-label="Paginación de pacientes">
            <button type="button" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)} aria-label="Página anterior"><LuArrowLeft aria-hidden="true" /></button>
            {Array.from({ length: pageCount }, (_, index) => index + 1).map(page => <button type="button" key={page} aria-label={`Página ${page}`} aria-current={page === currentPage ? 'page' : undefined} onClick={() => setPage(page)}>{page}</button>)}
            <button type="button" disabled={currentPage === pageCount} onClick={() => setPage(currentPage + 1)} aria-label="Página siguiente"><LuArrowRight aria-hidden="true" /></button>
          </nav>
        </div>}
      </section>
      <details className={styles.previewControls}><summary><LuSlidersHorizontal aria-hidden="true" /> Previsualizar estados de la lista</summary>
        <div><p>Controles de demostración, sin solicitudes de red.</p><Select name="preview" label="Estado de la interfaz" options={previewOptions} /></div>
      </details>
    </Form>

  </>
}
