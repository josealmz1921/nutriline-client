export const metabolicAuthors = [
  { value: '', label: 'Sin seleccionar' }, { value: 'valencia', label: 'Valencia y colaboradores, 2008 · Pendiente de verificar' },
  { value: 'mifflin', label: 'Mifflin-St Jeor, 1990 · Versión simplificada' }, { value: 'schofield', label: 'Schofield, 1985' },
  { value: 'harris', label: 'Harris y Benedict, 1919' }, { value: 'fao', label: 'FAO/WHO/UNU, 2001 · Schofield' },
  { value: 'iom', label: 'Institute of Medicine, 2005 · EER, no TMB' },
]
export const fatAuthors = [
  { value: '', label: 'Sin seleccionar' }, { value: 'deurenberg', label: 'Deurenberg y colaboradores, 1991' },
  { value: 'garrow', label: 'Garrow y Webster, 1985 · Pendiente de verificar' }, { value: 'lean', label: 'Lean y colaboradores, 1996' },
  { value: 'durnin', label: 'Durnin y Womersley, 1974 + Siri' }, { value: 'brozek', label: 'Brozek · Desde densidad Durnin-Womersley' },
  { value: 'faulkner', label: 'Faulkner · Pendiente de verificar población' }, { value: 'yuhasz', label: 'Yuhasz, 1974 · Pendiente de verificar protocolo' },
]
export const exerciseOptions = [
  { value: '', label: 'Sin seleccionar' }, { value: '1.2', label: 'Sedentario · Factor 1.2' },
  { value: '1.375', label: 'Ligero · Factor 1.375' }, { value: '1.55', label: 'Moderado · Factor 1.55' },
  { value: '1.725', label: 'Activo · Factor 1.725' }, { value: '1.9', label: 'Muy activo · Factor 1.9' },
  { value: 'mets', label: 'METS · Actividades declaradas (no gasto diario)' },
]
export const stressOptions = [
  { value: '', label: 'Sin seleccionar' }, { value: 'none', label: 'Sin ajuste por estrés (declarado)' },
  ...['Inanición simple', 'Lesión cefálica cerrada', 'Posoperatorio', 'Quemaduras mayores', 'Septicemia', 'Síndrome de reacción inflamatoria', 'Síndrome de realimentación', 'Traumatismo múltiple', 'Úlceras por decúbito etapa I', 'Úlceras por decúbito etapa II', 'Úlceras por decúbito etapa III', 'Úlceras por decúbito etapa IV'].map((label, index) => ({ value: `legacy-${index}`, label: `${label} · Factor pendiente de revisión clínica` })),
]
export const densityAuthors = [{ value: '', label: 'Sin seleccionar' }, { value: 'durnin', label: 'Durnin-Womersley, 1974 · Densidad para Siri' }]
export const boneAuthors = [{ value: '', label: 'Sin seleccionar' }, { value: 'rocha', label: 'Rocha · Von Döbeln modificada' }]
export const residualAuthors = [{ value: '', label: 'Sin seleccionar' }, { value: 'wurch', label: 'Wurch · Modelo histórico' }]
export const muscleAuthors = [{ value: '', label: 'Sin seleccionar' }, { value: 'remainder', label: 'Modelo por diferencia (Matiegka en el original)' }]
