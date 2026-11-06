import { LuCalculator, LuRuler } from 'react-icons/lu'
import Input from '../Input'
import Select from '../Select'
import { measurementGroups, measurementStates } from '../Anthropometry/measurements'
import { validateMeasurement } from '../Anthropometry/anthropometryCalculations'
import CalculationCard from '../AnthropometryCalculation'
import { useAnthropometryFields } from './useAnthropometryFields'
import styles from './AnthropometryFields.module.css'

const inputClasses = { root: styles.field, label: styles.label, input: styles.input }
const selectClasses = { input: styles.select, standard: styles.label }
const format = (value: number) => value.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const availabilityOptions = [{ value: 'captured', label: 'Capturar mediciones' }, { value: 'notPerformed', label: 'Mediciones no realizadas' }, { value: 'unavailable', label: 'Mediciones no disponibles' }]

export default function AnthropometryFields({ requireEssentials = false }: { requireEssentials?: boolean }) {
  const { results, unavailable, captured, extent, plotPoint } = useAnthropometryFields()
  return <>
    <div className={styles.intro}><LuRuler aria-hidden="true" /><div><h3>Mediciones del paciente</h3><p>{captured} de 38 medidas originales capturadas. {requireEssentials ? 'Peso y talla son esenciales cuando hay mediciones; el resto depende de la fórmula.' : 'Cada cálculo pide sus propios datos.'} No se guardan ni se envían.</p></div></div>
    <div className={styles.state}><Select name="measurementAvailability" label="Disponibilidad de mediciones" options={availabilityOptions} classes={selectClasses} /></div>
    {unavailable && <p role="status" className={styles.pending}>Mediciones declaradas no realizadas o no disponibles. No habrá resultados de fórmulas; no equivale a medidas normales ni a cero. Si cambias a captura, recuperarás el borrador.</p>}
    <div hidden={unavailable}>
    <div className={styles.state}><Select name="measurementState" label="Estado de medición" options={measurementStates} classes={selectClasses} /></div>
    {measurementGroups.map(group => <fieldset key={group.title} className={styles.section}>
      <legend>{group.title}</legend><p className={styles.hint}>{group.title === 'Básicas' ? 'Peso en kg; las demás medidas en cm.' : `Captura en ${group.unit}.`} Admite punto o coma decimal, sin escribir unidades.</p>
      <div className={styles.fields}>{group.fields.map(field => <Input key={field.id} identifier={field.id} inputMode="decimal" label={`${field.label} (${'unit' in field ? field.unit : group.unit})`} required={!unavailable && requireEssentials && ['height', 'weight'].includes(field.id) ? 'Ingresa esta medida esencial.' : false} validate={(value, values) => ['notPerformed', 'unavailable'].includes(String(values.measurementAvailability)) ? undefined : validateMeasurement(value)} autoComplete="off" maxLength={12} classes={inputClasses} />)}</div>
    </fieldset>)}
    <section className={styles.results} aria-labelledby="anthropometry-results"><h3 id="anthropometry-results"><LuCalculator aria-hidden="true" /> Cálculos antropométricos</h3><p className={styles.hint}>Actualización automática. Resultados numéricos descriptivos, sin clasificación clínica, diagnóstico ni objetivos prescritos. Un dato ausente o inválido nunca se reemplaza por cero.</p>
      <div className={styles.cards}>
        <CalculationCard title="IMC" result={results.bmi} unit="kg/m²" formula="Peso (kg) / talla (m)²." />
        <CalculationCard title="Índice cintura/cadera" result={results.waistHip} formula="Cintura (cm) / cadera (cm)." />
        <CalculationCard title="Índice cintura/talla" result={results.waistHeight} formula="Cintura (cm) / talla (cm)." />
      </div>
    </section>
    <section className={styles.results} aria-labelledby="somatotype-title"><h3 id="somatotype-title">Somatotipo · Heath–Carter</h3>
      <p className={styles.hint}>Se conservan las 38 medidas antiguas y se añade esta medición específica. No se sustituye el supraespinal por el suprailíaco o ileocrestal. Para mesomorfia usa el perímetro máximo de brazo flexionado y contraído y el máximo de pantorrilla (campo Pierna).</p>
      <div className={styles.extra}><Input identifier="supraspinale" inputMode="decimal" label="Supraespinal (mm)" validate={(value, values) => ['notPerformed', 'unavailable'].includes(String(values.measurementAvailability)) ? undefined : validateMeasurement(value)} autoComplete="off" maxLength={12} classes={inputClasses} /></div>
      <div className={styles.cards}>
        <CalculationCard title="Endomorfia" result={results.endomorphy} formula="X = (tríceps + subescapular + supraespinal) × 170.18 / talla; −0.7182 + 0.1451X − 0.00068X² + 0.0000014X³." />
        <CalculationCard title="Mesomorfia" result={results.mesomorphy} formula="0.858 × húmero + 0.601 × fémur + 0.188 × brazo corregido + 0.161 × pierna corregida − 0.131 × talla + 4.5. Perímetros corregidos = perímetro (cm) − pliegue (mm)/10." />
        <CalculationCard title="Ectomorfia" result={results.ectomorphy} formula="R = talla (cm) / ∛peso (kg). R ≥ 40.75: 0.732R − 28.58; 38.25 < R < 40.75: 0.463R − 17.63; R ≤ 38.25: 0.1." />
      </div>
      <p className={styles.hint}>Según el manual, una componente calculada ≤ 0 se expresa como 0.1. No se redondea antes de calcular las coordenadas. Esto no equivale a sustituir una medición faltante.</p>
      <figure className={styles.chart}><figcaption>Proyección del somatotipo (X, Y) · sin zonas de interpretación</figcaption>
        {results.point && plotPoint ? <><svg viewBox="0 0 400 400" role="img" aria-label={`Somatotipo: X ${format(results.point.x)}, Y ${format(results.point.y)}`}>
          <path d="M50 50V350H350V50Z" className={styles.frame} /><path d="M50 200H350M200 50V350" className={styles.axes} />
          <text x="200" y="30" textAnchor="middle">Y · Mesomorfia</text><text x="200" y="385" textAnchor="middle">X · Ectomorfia − Endomorfia</text>
          <text x="50" y="220">−{extent}</text><text x="330" y="220">{extent}</text><text x="205" y="65">{extent}</text><text x="205" y="345">−{extent}</text>
          <circle cx={plotPoint.x} cy={plotPoint.y} r="6" className={styles.point} />
        </svg><p>X: {format(results.point.x)} · Y: {format(results.point.y)}</p></> : <p>Completa las tres componentes para visualizar el punto; no se dibuja un punto ficticio en el origen.</p>}
        <p className={styles.hint}>X = ectomorfia − endomorfia. Y = 2 × mesomorfia − endomorfia − ectomorfia. Escala adaptativa, igual en ambos ejes.</p>
      </figure>
      <p className={styles.hint}>Fuente: <a href="https://afitpilot.com/heritage/somatotype-2019-app/Heath-CarterManual.pdf" target="_blank" rel="noreferrer">J. E. L. Carter, manual Heath–Carter (2002)</a>. Ecuaciones cotejadas con el manual; la aplicación y medición requieren criterio profesional. No es un porcentaje de grasa.</p>
    </section>
    <section className={styles.pending}><h3>Comparación deportiva y referencia meta</h3><p>Conservadas en el alcance, todavía no disponibles: falta validar el catálogo deportivo y sus referencias. No se inventan valores de deporte ni metas del paciente.</p><p>Porcentaje de grasa, densidad, masas corporales y sus autores siguen en Fórmulas y reportes. METS, energía y R24 no se calculan desde este módulo.</p></section>
    </div>
  </>
}
