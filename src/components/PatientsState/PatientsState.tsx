import { LuCircleAlert, LuSearch, LuUsers } from 'react-icons/lu'
import styles from './PatientsState.module.css'

interface Props {
  state: 'loading' | 'error' | 'empty' | 'no-results'
  onReset: () => void
  onRegister: () => void
}

export default function PatientsState({ state, onReset, onRegister }: Props) {
  if (state === 'loading') return <div role="status" className={styles.loading}>
    <p>Cargando directorio… <span>Estado de demostración</span></p>
    {[1, 2, 3, 4].map(row => <div key={row} className={styles.skeleton} aria-hidden="true"><span /><div><span /><span /></div><span /></div>)}
  </div>

  const isError = state === 'error'
  const empty = state === 'empty'
  return <div role={isError ? 'alert' : 'status'} className={styles.container}>
    <span className={isError ? styles.errorIcon : styles.icon}>{isError ? <LuCircleAlert aria-hidden="true" /> : empty ? <LuUsers aria-hidden="true" /> : <LuSearch aria-hidden="true" />}</span>
    <h2>{isError ? 'No pudimos cargar los pacientes' : empty ? 'Aún no hay pacientes en esta lista' : 'No encontramos coincidencias'}</h2>
    <p>{isError ? 'Este es un error simulado para revisar la interfaz. No hay una conexión al servidor.' : empty ? 'Los expedientes aparecerán aquí cuando registres pacientes.' : 'Prueba con otro nombre, correo o teléfono, o revisa el filtro de estado.'}</p>
    <button type="button" onClick={empty ? onRegister : onReset}>{isError ? 'Restablecer vista' : empty ? 'Registrar paciente' : 'Limpiar búsqueda'}</button>
  </div>
}
