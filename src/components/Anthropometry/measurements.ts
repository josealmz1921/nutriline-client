// Correspondencia explícita con los 38 campos de NuevoPaciente.php.
export const measurementGroups = [
  { title: 'Básicas', unit: 'cm', fields: [
    { id: 'height', label: 'Talla', legacy: 'Tallap', unit: 'cm' },
    { id: 'weight', label: 'Peso', legacy: 'PesoP', unit: 'kg' },
    { id: 'waist', label: 'Cintura', legacy: 'cinturaP', unit: 'cm' },
    { id: 'hip', label: 'Cadera', legacy: 'caderP', unit: 'cm' },
    { id: 'wrist', label: 'Muñeca', legacy: 'munecaP', unit: 'cm' },
  ] },
  { title: 'Pliegues', unit: 'mm', fields: [
    { id: 'biceps', label: 'Bíceps', legacy: 'bicepP' },
    { id: 'triceps', label: 'Tríceps', legacy: 'tricepP' },
    { id: 'subscapular', label: 'Subescapular', legacy: 'Subescapular' },
    { id: 'suprailiac', label: 'Suprailíaco', legacy: 'Suprailiaco' },
    { id: 'abdominalFold', label: 'Abdominal', legacy: 'Abdominal' },
    { id: 'iliacCrest', label: 'Ileocrestal', legacy: 'Ileocrestal' },
    { id: 'pectoral', label: 'Pectoral', legacy: 'Pectoral' },
    { id: 'thighFold', label: 'Muslo anterior', legacy: 'Muslo_Anterior' },
    { id: 'calfFold', label: 'Pierna medial', legacy: 'Pierna_Medial' },
  ] },
  { title: 'Perímetros', unit: 'cm', fields: [
    { id: 'flexedArm', label: 'Brazo contraído', legacy: 'brazo_contraido' },
    { id: 'shoulders', label: 'Hombros', legacy: 'Hombros' },
    { id: 'chest', label: 'Tórax', legacy: 'torax' },
    { id: 'abdomen', label: 'Abdominal', legacy: 'Abdominal2' },
    { id: 'relaxedArm', label: 'Brazo relajado', legacy: 'Brazo_relajado' },
    { id: 'forearmGirth', label: 'Antebrazo', legacy: 'Antebrazo' },
    { id: 'calfGirth', label: 'Pierna', legacy: 'pierna' },
    { id: 'ankle', label: 'Tobillo', legacy: 'tobillo' },
  ] },
  { title: 'Diámetros', unit: 'cm', fields: [
    { id: 'biacromial', label: 'Biacromial', legacy: 'Diametros' },
    { id: 'biiliocrestal', label: 'Biiliocrestal', legacy: 'Biiliocrestal' },
    { id: 'transverseChest', label: 'Transverso de tórax', legacy: 'TransversoT' },
    { id: 'apChest', label: 'Anteroposterior de tórax', legacy: 'APT' },
    { id: 'humerus', label: 'Biepicondíleo de húmero', legacy: 'Biepicondileo' },
    { id: 'wristBreadth', label: 'Biestiloideo de muñeca', legacy: 'Biestiloideo' },
    { id: 'femur', label: 'Biepicondíleo de fémur', legacy: 'biepicondileo' },
    { id: 'ankleBreadth', label: 'Bimaleolar de tobillo', legacy: 'Bimaleolar' },
  ] },
  { title: 'Longitudes', unit: 'cm', fields: [
    { id: 'armLength', label: 'Brazo', legacy: 'Brazo2' },
    { id: 'forearmLength', label: 'Antebrazo', legacy: 'Antebrazo2' },
    { id: 'handLength', label: 'Mano', legacy: 'Mano2' },
    { id: 'trochanterHeight', label: 'Altura trocantérea', legacy: 'alturaTroncal' },
    { id: 'tibialHeight', label: 'Altura tibial', legacy: 'Altura_tibial' },
    { id: 'thighLength', label: 'Muslo', legacy: 'long_muslo' },
    { id: 'legLength', label: 'Pierna', legacy: 'long_pierna' },
    { id: 'footLength', label: 'Pie', legacy: 'long_pie' },
  ] },
] as const

export const measurements = measurementGroups.flatMap(group => group.fields.map(field => ({
  id: field.id, label: `${group.title}: ${field.label}`, unit: 'unit' in field ? field.unit : group.unit, legacy: field.legacy,
})))

export const measurementStates = [
  { value: '', label: 'No definido' }, { value: 'fasting', label: 'Ayunas' },
  { value: 'postprandial', label: 'Postprandial' }, { value: 'postTraining', label: 'Post entrenamiento' },
]
