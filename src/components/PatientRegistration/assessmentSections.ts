// Inventario de NuevoPaciente.php. Pendiente no significa omitido ni implementado.
export const assessmentSections = [
  { id: 'patient', label: 'Datos del paciente', description: 'Identidad, contacto y contexto inicial', groups: [] },
  { id: 'anthropometry', label: 'Antropometría', description: 'Mediciones y somatocarta', groups: [
    { title: 'Estado de medición', fields: ['No definido', 'Ayunas', 'Postprandial', 'Post entrenamiento'] },
    { title: 'Básicas', fields: ['Talla', 'Peso', 'Cintura', 'Cadera', 'Muñeca'] },
    { title: 'Pliegues', fields: ['Bíceps', 'Tríceps', 'Subescapular', 'Suprailíaco', 'Abdominal', 'Ileocrestal', 'Pectoral', 'Muslo anterior', 'Pierna medial'] },
    { title: 'Perímetros', fields: ['Brazo contraído', 'Hombros', 'Tórax', 'Abdominal', 'Brazo relajado', 'Antebrazo', 'Pierna', 'Tobillo'] },
    { title: 'Diámetros', fields: ['Biacromial', 'Biiliocrestal', 'Transverso de tórax', 'Anteroposterior de tórax', 'Biepicondíleo de húmero', 'Biestiloideo de muñeca', 'Biepicondíleo de fémur', 'Bimaleolar de tobillo'] },
    { title: 'Longitudes', fields: ['Brazo', 'Antebrazo', 'Mano', 'Altura trocantérea', 'Altura tibial', 'Muslo', 'Pierna', 'Pie'] },
    { title: 'Somatocarta', fields: ['Comparación con deporte', 'Referencia del paciente', 'Referencia meta'] },
  ] },
  { id: 'biochemistry', label: 'Bioquímica', description: 'Análisis y resultados de laboratorio', groups: [
    { title: 'Química sanguínea', fields: ['Glucosa en plasma', 'Ácido úrico en suero', 'Albúmina en suero', 'Creatinina en suero', 'Ferritina en suero', 'Globulina', 'Prealbúmina en suero', 'Proteínas totales en suero', 'Transferrina en suero', 'Urea en suero'] },
    { title: 'Datos por determinación', fields: ['Valor', 'Rango de referencia y unidad', 'Resultado / interpretación'] },
    { title: 'Opciones y acciones del original por verificar', fields: ['Biometría hemática', 'Examen general de orina', 'Agregar análisis', 'Quitar análisis', 'Imprimir'] },
  ] },
  { id: 'recall', label: 'Recordatorio de 24 horas', description: 'Tiempos de comida y nutrientes', groups: [
    { title: 'Tiempos de comida', fields: ['Desayuno', 'Primera colación', 'Comida', 'Segunda colación', 'Cena'] },
    { title: 'Preparaciones y alimentos', fields: ['Nombre de la preparación', 'Alimento', 'Cantidad', 'Medida', 'Agregar y quitar preparaciones / alimentos'] },
    { title: 'Nutrientes y resultados del original', fields: ['Energía (kcal)', 'Energía (kJ)', 'Proteína', 'Lípidos', 'Hidratos de carbono', 'Fibra', 'Vitamina A', 'Ácido ascórbico', 'Ácido fólico', 'Hierro no HEM', 'Calcio', 'Hierro', 'Sodio', 'Potasio', 'Azúcar (g)', 'Azúcar (segunda columna del original; por verificar)', 'Índice glicémico', 'Carga glicémica', 'Colesterol', 'Selenio', 'Ácidos grasos saturados', 'Ácidos grasos monoinsaturados', 'Ácidos grasos poliinsaturados', 'Etanol'] },
  ] },
  { id: 'habits', label: 'Hábitos', description: 'Alimentación, sueño y actividad física', groups: [
    { title: 'Alimentación y descanso', fields: ['Alimentos que prefiere', 'Alimentos que no le gustan', 'Comidas por día', 'Tiempo por comida', 'Vasos de agua por día', 'Horas de sueño'] },
    { title: 'Actividad física', fields: ['Buscar deporte', 'Actividad seleccionada', 'Tiempo y unidad de actividad', 'METS totales', 'Kcal utilizadas', 'Nivel de actividad física'] },
  ] },
  { id: 'reports', label: 'Fórmulas y reportes', description: 'Cálculos, revisión y documentos', groups: [
    { title: 'Balance energético', fields: ['Autor de tasa metabólica basal', 'Resultado de TMB', 'Intensidad de ejercicio / METS', 'Kcal de ejercicio', 'Factor de lesión / estrés fisiológico', 'Gasto por estrés', 'Balance energético resultante', 'Consumo R24', 'Estatus'] },
    { title: 'Autores de TMB del original (por validar)', fields: ['Valencia y colaboradores, 2008', 'Mifflin-St Jeor, 1990', 'Schofield, 1985', 'Harris y Benedict, 1919', 'FAO/WHO/UNU, 2001', 'Institute of Medicine, 2005'] },
    { title: 'Opciones de ejercicio del original', fields: ['Sedentario', 'Ligero', 'Moderado', 'Activo', 'Muy activo', 'METS'] },
    { title: 'Factores de lesión del original (por validar)', fields: ['Inanición simple', 'Lesión cefálica cerrada', 'Posoperatorio', 'Quemaduras mayores', 'Septicemia', 'Síndrome de reacción inflamatoria', 'Síndrome de realimentación', 'Traumatismo múltiple', 'Úlceras por decúbito etapa I', 'Úlceras por decúbito etapa II', 'Úlceras por decúbito etapa III', 'Úlceras por decúbito etapa IV'] },
    { title: 'Composición corporal', fields: ['Autor de porcentaje de grasa', 'Porcentaje de grasa', 'Interpretación de grasa', 'Kilogramos de grasa', 'Autor y resultado de densidad corporal', 'Autor y resultado de masa ósea', 'Autor y resultado de masa residual', 'Autor y resultado de masa muscular', 'IMC', 'Interpretación del IMC (requiere revisión clínica)'] },
    { title: 'Autores de composición del original (por validar)', fields: ['Deurenberg y colaboradores, 1991', 'Garrow y Webster, 1985', 'Lean y colaboradores, 1996', 'Durnin y Womersley, 1974', 'Brozek', 'Faulkner', 'Yuhasz, 1974', 'Siri, 1956', 'Rocha', 'Wurch', 'Matiegka'] },
    { title: 'Documentos y cierre', fields: ['Reporte de antropometría', 'Reporte de dieta', 'Vista previa', 'Finalizar evaluación (sin cronómetro)'] },
  ] },
] as const

export type AssessmentSection = typeof assessmentSections[number]['id']

// Se corrige la ortografía visible; se conservan los 18 conceptos del original.
export const symptoms = [
  { id: 'weightLoss', label: 'Pérdida de peso' }, { id: 'weightGain', label: 'Ganancia de peso' },
  { id: 'fever', label: 'Fiebre' }, { id: 'weakness', label: 'Debilidad' }, { id: 'jointPain', label: 'Dolor articular' },
  { id: 'diarrhea', label: 'Diarrea' }, { id: 'constipation', label: 'Estreñimiento' }, { id: 'bloating', label: 'Distensión abdominal' },
  { id: 'edema', label: 'Edema' }, { id: 'masses', label: 'Tumoraciones' }, { id: 'other', label: 'Otros' },
  { id: 'polyuria', label: 'Poliuria' }, { id: 'nocturia', label: 'Nicturia' }, { id: 'frequency', label: 'Polaquiuria' },
  { id: 'tenesmus', label: 'Tenesmo' }, { id: 'headache', label: 'Cefalea' }, { id: 'nausea', label: 'Náuseas' }, { id: 'vomiting', label: 'Vómito' },
] as const
