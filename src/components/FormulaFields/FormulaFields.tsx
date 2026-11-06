import { LuCalculator } from 'react-icons/lu'
import Input from '../Input'
import Textarea from '../Textarea'
import Select from '../Select'
import FormulaReview from '../FormulaReview'
import DevFormTools from '../DevFormTools'
import { boneAuthors, densityAuthors, exerciseOptions, fatAuthors, metabolicAuthors, muscleAuthors, residualAuthors, stressOptions } from '../AssessmentFormulas/formulaCatalog'
import type { FormulaContext } from '../AssessmentFormulas/formulaModel'
import { validateFormulaDate, validateFormulaText } from '../AssessmentFormulas/formulaValidation'
import { useFormulaFields } from './useFormulaFields'
import styles from './FormulaFields.module.css'

const classes = { root: styles.field, label: styles.label, input: styles.input }
const selectClasses = { input: styles.select, standard: styles.label }
const availability = [{ value: '', label: 'Selecciona una opción' }, { value: 'captured', label: 'Revisar fórmulas y resultados' }, { value: 'notPerformed', label: 'Revisión de fórmulas no realizada' }, { value: 'unavailable', label: 'Fórmulas no disponibles' }]
const sexes = [{ value: '', label: 'Sin especificar · No calcular' }, { value: 'male', label: 'Masculino (coeficientes de la ecuación)' }, { value: 'female', label: 'Femenino (coeficientes de la ecuación)' }]
const populations = [{ value: '', label: 'Sin determinar · No calcular' }, { value: 'generalAdult', label: 'Adulto general · Aplicabilidad revisada por el profesional' }, { value: 'other', label: 'Otra población / No aplicable' }]

export default function FormulaFields({ context, birthDate }: { context?: FormulaContext; birthDate?: string }) {
  const { inactive, data, results } = useFormulaFields(context, birthDate)
  return <section className={styles.root} aria-label="Selección de fórmulas">
    {import.meta.env.DEV && <DevFormTools profile="reports" />}
    <header className={styles.header}><LuCalculator aria-hidden="true" /><div><h2>Métodos, cálculos y revisión</h2><p>Resultados dependientes de las mediciones, edad, sexo de la ecuación y disponibilidad del R24. No se rellenan datos faltantes ni se generan diagnósticos.</p></div></header>
    <Select name="formulas.availability" label="Disponibilidad de revisión de fórmulas" options={availability} classes={selectClasses} />
    {inactive && <p className={styles.notice}>Se excluyen los resultados del borrador sin borrar selecciones. No significa que todos los valores sean cero.</p>}
    <div hidden={inactive}><p className={styles.notice}>Demostración matemática, no validación clínica. No aplicar automáticamente a menores, embarazo/lactancia, deportistas con protocolos específicos ni enfermedad/lesión. Si la población no es aplicable, conserva los datos sin calcular. El sexo de la ecuación se elige expresamente, no a partir del género.</p>
      <div className={styles.fields}><Input identifier="formulas.referenceDate" label="Fecha de referencia de fórmulas" type="date" validate={validateFormulaDate} classes={classes} />
        <Select name="formulas.sex" label="Sexo utilizado por las ecuaciones" options={sexes} classes={selectClasses} />
        <Select name="formulas.population" label="Población y aplicabilidad de las ecuaciones" options={populations} classes={selectClasses} />
      </div>
      <h3>Balance energético</h3><div className={styles.fields}>
        <Select name="formulas.metabolicAuthor" label="Autor de metabolismo basal / reposo" options={metabolicAuthors} classes={selectClasses} />
        <Select name="formulas.exercise" label="Método de actividad / ejercicio" options={exerciseOptions} classes={selectClasses} />
        <Select name="formulas.stress" label="Lesión / estrés fisiológico" options={stressOptions} classes={selectClasses} />
      </div><p className={styles.notice}>Los factores 1.2–1.9 son selecciones del modelo original, no una medición del ejercicio ni los coeficientes PA de IOM. METS presenta solo las actividades declaradas, sin sumarlas automáticamente al gasto diario. Las condiciones de lesión se conservan sin aplicar multiplicadores no verificados.</p>
      <h3>Composición corporal</h3><div className={styles.fields}>
        <Select name="formulas.fatAuthor" label="Autor de porcentaje de grasa" options={fatAuthors} classes={selectClasses} />
        <Select name="formulas.densityAuthor" label="Método de densidad corporal" options={densityAuthors} classes={selectClasses} />
        <Select name="formulas.boneAuthor" label="Autor de masa ósea" options={boneAuthors} classes={selectClasses} />
        <Select name="formulas.residualAuthor" label="Autor de masa residual" options={residualAuthors} classes={selectClasses} />
        <Select name="formulas.muscleAuthor" label="Método de masa muscular / componente por diferencia" options={muscleAuthors} classes={selectClasses} />
      </div><div className={styles.fields}><Textarea identifier="formulas.fatInterpretation" label="Interpretación de grasa (manual, opcional)" validate={validateFormulaText} maxLength={2000} classes={{ ...classes, input: styles.textarea }} />
        <Textarea identifier="formulas.bmiInterpretation" label="Interpretación del IMC (manual, opcional)" validate={validateFormulaText} maxLength={2000} classes={{ ...classes, input: styles.textarea }} /></div>
    </div><FormulaReview data={data} results={results} />
  </section>
}
