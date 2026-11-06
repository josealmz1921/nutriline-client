import { biochemicalDeterminations, type BiochemistryData } from '../Biochemistry/biochemistryModel'
import styles from './BiochemistryReview.module.css'

export default function BiochemistryReview({ data }: { data: BiochemistryData }) {
  const registered = biochemicalDeterminations.filter(determination => data.results[determination.id])
  return <section className={styles.root} aria-label="Bioquímica para revisión">
    <h3>Química sanguínea · Revisión</h3><p className={styles.note}>Transcripción manual, sin interpretación automática ni conversión de unidades. Referencias no validadas por el sistema.</p>
    {data.availability && <p>{data.availability === 'notPerformed' ? 'Estudio no realizado.' : 'Resultados no disponibles.'} No equivale a normalidad.</p>}
    <dl className={styles.metadata}><div><dt>Fecha de toma de muestra</dt><dd>{data.collectedOn ? <time dateTime={data.collectedOn}>{data.collectedOn}</time> : 'Sin fecha de muestra'}</dd></div><div><dt>Laboratorio</dt><dd>{data.laboratory ?? 'Sin laboratorio indicado'}</dd></div></dl>
    {!registered.length ? <p>Sin determinaciones registradas. No equivale a resultados normales.</p> : <>
      <p>{registered.length} de 10 determinaciones con datos. Las demás no se han registrado.</p>
      <div className={styles.results}>{registered.map(determination => {
        const result = data.results[determination.id]!
        return <section key={determination.id} aria-label={determination.label} className={styles.result}><h4>{determination.label}</h4><dl>
          <div><dt>Valor</dt><dd>{result.value ?? 'Sin valor registrado'}</dd></div>
          <div><dt>Unidad</dt><dd>{result.unit ?? 'Sin unidad indicada'}</dd></div>
          <div><dt>Referencia del laboratorio</dt><dd>{result.reference ?? 'Sin referencia indicada'}</dd></div>
          <div><dt>Resultado / interpretación manual</dt><dd>{result.interpretation ?? 'Sin interpretación registrada'}</dd></div>
        </dl></section>
      })}</div>
    </>}
  </section>
}
