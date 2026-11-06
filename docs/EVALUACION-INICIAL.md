# Evaluación inicial: alcance y trazabilidad

## Fuente revisada

- `ProyectoDietas/Nutriologo/NuevoPaciente.php`: seis pestañas, campos y opciones.
- `ProyectoDietas/js/animaciones.js`: navegación, validación y envío original.
- `ProyectoDietas/js/formulas.js` y `js/reportesPrint.js`: referencias para la
  revisión futura de fórmulas y reportes, **no aprobadas clínicamente por copiarlas**.
- Recorrido visual de las seis pestañas en el original local, sin pulsar Finalizar
  ni guardar pacientes. En Bioquímica, el selector visible de estudios carece de
  nombre/id y todas sus opciones tienen valor vacío; hay únicamente 20 inputs
  (diez valores y diez resultados). No se encontraron campos ni comportamiento
  asociado a biometría hemática u orina en el código revisado.

La migración anterior cubría solo los cinco campos básicos de la API. No era una
migración completa de Nuevo paciente. Esta etapa corrige ese alcance explícitamente.

## Disponible en esta entrega

La ruta `/dashboard/pacientes/nuevo` ofrece **Datos del paciente** con estos campos:

| Origen PHP | Campo moderno | Tratamiento |
| --- | --- | --- |
| `NombrePacient` | `fullName` | Obligatorio, hasta 150 caracteres |
| `FechaNacimientoP` | `birthDate` | Obligatorio, fecha sin zona horaria |
| `generoPaciente` | `gender` | Hombre / Mujer / sin especificar; no se deduce para cálculos |
| `PaisP` | `nationality` | Las 234 parejas código/etiqueta originales, buscables |
| `InputDatosP3` / teléfono | `phone` | Opcional, hasta 32 caracteres |
| `InputDatosP4` / correo | `email` | Opcional, formato de correo, hasta 254 caracteres |
| `InputDatosP5` / ocupación | `occupation` | Opcional, hasta 150 caracteres |
| `imagen` | `photo` | Opcional, lectura y vista previa local, sin subida |
| `motivoCP` | `reason` | Separado de la identidad, hasta 500 caracteres |
| `sintomas[]` | `symptoms.<id>` | Los 18 conceptos originales con ortografía corregida |
| Programar Consulta | Acción pendiente | Visible y deshabilitada, no crea citas |

La foto admite JPG/PNG/WebP hasta 5 MB como límite técnico de la vista previa.
No se usa Cloudinary, Firebase ni almacenamiento persistente. Se puede quitar.
Los valores sobreviven a cambiar de sección y cerrar revisión, pero salir o
recargar descarta el formulario. Nunca usar datos ni fotografías reales aquí.

El catálogo conserva también códigos históricos (`AN`, `UK`, `TP`, `YU`, etc.).
Se verificó igualdad exacta, en orden y contenido, de las 234 opciones con el PHP;
no debe reemplazarse por una lista internacional moderna sin migración explícita.

Se conservan estos signos/síntomas: pérdida/ganancia de peso, fiebre, debilidad,
dolor articular, diarrea, estreñimiento, distensión abdominal, edema, tumoraciones,
otros, poliuria, nicturia, polaquiuria, tenesmo, cefalea, náuseas y vómito.
Ninguno viene marcado. No registrar síntomas **no equivale a declarar su ausencia**.

Nombre y nacimiento mantienen su obligatoriedad de la vista previa actual. Los
otros campos pueden quedar pendientes; esto no implica que haya datos suficientes
para calcular. No se aplica la obligatoriedad indiscriminada del JavaScript antiguo.

## Antropometría disponible (demostración)

Las 38 medidas originales tienen captura por grupo, con unidades explícitas y
correspondencia de nombres PHP en `Anthropometry/measurements.ts`. El estado de
medición conserva No definido, Ayunas, Postprandial y Post entrenamiento. Admite
punto o coma decimal; no admite cero, negativos, unidades escritas ni texto parcial.
Los datos persisten al alternar secciones, no al salir o recargar. La revisión de
Datos del paciente sigue limitada a identidad y contexto; no cierra esta sección.

Resultados automáticos, numéricos y sin interpretación clínica:

- IMC = peso (kg) / talla (m)².
- Índices cintura/cadera y cintura/talla, medidas en cm.
- Endomorfia, mesomorfia y ectomorfia Heath–Carter, dependencias independientes.
- Proyección X = ectomorfia − endomorfia, Y = 2 × mesomorfia − endomorfia − ectomorfia.
  Gráfico cartesiano de escala simétrica adaptativa, **no** zonas de diagnóstico
  ni silueta normativa. Solo se dibuja si hay tres resultados válidos.

Fuente matemática: J. E. L. Carter, *The Heath-Carter Anthropometric Somatotype,
Instruction Manual*, revisión marzo 2002:
https://afitpilot.com/heritage/somatotype-2019-app/Heath-CarterManual.pdf

Diferencias intencionales respecto a `formulas.js:1623–1668`:

- Se añade un campo **supraespinal** separado. No se asume equivalencia con el
  suprailíaco o ileocrestal antiguo; los dos campos antiguos se conservan.
- X de endomorfia aplica 170.18/talla a **toda** la suma; se usa X³, no raíz cúbica.
- Mesomorfia usa brazo **contraído**, no relajado; pliegues mm / 10 para corregir
  perímetros cm. Rechaza perímetros corregidos no positivos.
- Ectomorfia incluye exactamente R ≥ 40.75, 38.25 < R < 40.75 y R ≤ 38.25; la
  última rama es 0.1, no 1. Componentes calculadas ≤ 0 se expresan como 0.1 según
  el manual. No sustituye medidas ausentes ni oculta resultados inválidos.
- Se conservan valores sin redondear durante el cálculo; solo presentación a dos
  decimales. Pruebas incluyen el ejemplo B-188 del manual (3.0–2.1–4.8 a una cifra).

Ecuaciones cotejadas no equivalen a validación clínica del producto: la técnica de
medición, aplicabilidad individual y revisión profesional siguen siendo necesarias.
Comparación por deporte y referencia meta permanecen explícitamente pendientes;
no se inventan catálogos, valores deportivos ni objetivos.

## Bioquímica disponible y reutilizable

Las diez determinaciones de química sanguínea están disponibles tanto en registro
de paciente como en Nueva consulta. Se comprobó correspondencia exacta y en orden
con los 20 nombres originales (valor y resultado) de `NuevoPaciente.php:989–1136`.
`Biochemistry/biochemistryModel.ts` mantiene esas parejas y la referencia histórica.

- `BiochemistryFields`: campos sin Form, ruta ni estado global. Vive dentro del
  formulario Informed que lo contiene y usa `biochemistry.collectedOn`,
  `biochemistry.laboratory` y `biochemistry.results.<id>`.
- Cada determinación conserva `value`, `unit`, `reference`, `interpretation`.
  Todos son textos opcionales. Si se captura valor, se exige unidad. Referencias
  e interpretación manual pueden quedar pendientes y así se indican al revisar.
- Valor: decimal no negativo de hasta 24 caracteres, punto o coma; cero explícito
  admitido técnicamente, no validado como clínicamente posible. No admite sufijos,
  notación exponencial ni comparadores (`<`, `>`). Un resultado bajo umbral puede
  transcribirse en el campo manual sin inventar un valor numérico.
- Unidad libre hasta 40 caracteres, referencia libre hasta 200, interpretación
  manual hasta 500. Sin conversiones automáticas ni catálogo de unidades impuesto.
- Fecha de muestra opcional, calendario válido `YYYY-MM-DD` sin convertirla a
  instante; laboratorio opcional hasta 150 caracteres. No se infieren desde la
  fecha de consulta ni la fecha de mediciones.
- `reviewBiochemistry`: copia normalizada sin mutar el borrador ni convertir
  unidades; conserva precisión decimal textual y el significado de ausentes.
  Una nota o referencia sin valor no se descarta. Los campos vacíos no generan
  cero, normalidad, interpretación ni diagnósticos.
- `BiochemistryReview`: misma revisión presentacional en ambos flujos.
- `Biochemistry`: contenedor de formulario y diálogo reutilizado como paso tanto
  en evaluación inicial como en consulta; **no** hay un Form exterior que lo anide.

El módulo inicial permanece montado al cambiar de sección y tiene revisión propia;
Revisar datos sigue siendo revisión de identidad/contexto. En Nueva consulta la
revisión incluye también el estudio capturado. Cada consulta empieza vacía y el
formulario está identificado por paciente: no usa un store global ni copia datos
de otros pacientes/consultas. Salir o recargar descarta la captura.

No se replica `animaciones.js:e54–e63`, que etiqueta valores por encima o debajo
de rangos como “Desnutricion deplecion severa” incluso para glucosa. Rangos y
unidades antiguos (especialmente creatinina/ferritina) se conservan en metadatos de
trazabilidad, **no** como valores sugeridos o rangos clínicos en la interfaz.
El profesional transcribe la referencia del informe. No hay interpretación automática.

Biometría hemática y examen de orina se mantienen en el alcance pendiente, no se
inventan paneles ni se anuncian como disponibles. Agregar/quitar estudios e
imprimir siguen pendientes; no se ocultan ni eliminan las diez determinaciones.
No hay persistencia, integración API, impresión ni cambios al backend/fixtures.

## Cobertura y funcionalidades pendientes

`src/components/PatientRegistration/assessmentSections.ts` mantiene el inventario
visible como trazabilidad. Las seis secciones tienen interfaz; no implica
catálogos completos ni aprobación clínica de todos los métodos:

1. **Antropometría:** captura, resultados y proyección disponibles según lo anterior;
   comparación deportiva y referencia meta pendientes.
2. **Bioquímica:** captura y revisión de las 10 determinaciones disponibles según
   lo anterior. Otros estudios/acciones e interpretación automática pendientes.
3. **R24:** captura y revisión disponibles en evaluación y consultas: cinco tiempos,
   preparaciones/alimentos dinámicos, cantidades/unidades, eliminación confirmada
   y 24 columnas originales. Catálogo completo y validación clínica pendientes.
4. **Hábitos:** entrevista y actividades disponibles, con declaración de ausencia,
   duración/unidad, MET·min, kcal y nivel de actividad declarado. Catálogo de deportes
   limitado a seis referencias históricas más captura libre, no las 822 entradas SQL.
5. **Fórmulas/reportes:** selección de métodos y cálculos con dependencias explícitas,
    interpretaciones manuales y PDF locales de evaluación completa, antropometría y
    alimentación, con vista previa, descarga e impresión. Se conservan autores no
    verificados sin cálculo automático; no hay dieta prescrita, aprobación clínica
    ni cierre persistido.

No hay botones de finalizar ni resultados clínicos inventados en los paneles pendientes.
La retirada del **cronómetro** es intencional y aprobada; no se retira por ello
ningún dato de captura necesario para evaluar. El tiempo de actividad física
pertenece a Hábitos y **no** es el cronómetro de duración de la consulta.

## Condiciones antes de activar cálculos o guardado

### Navegación secuencial y esenciales

El registro inicial usa barra accesible (`progress`) con seis secciones. Los
estados son Actual, Completado, Bloqueado o Pendiente de desarrollar. No usa un
porcentaje de campos llenos ni afirma guardado. Seis secciones están
disponibles: el máximo actual es **6/6**, sin habilitar un cierre ficticio.

- Datos del paciente: nombre y nacimiento válidos. Opcionales, si se capturan,
  deben respetar sus validaciones técnicas actuales. Revisar datos no avanza.
- Antropometría: peso y talla válidos si se capturan mediciones; las otras 36
  medidas y el supraespinal son opcionales. Cada fórmula sigue requiriendo sus
  propias dependencias y no calcula con ausentes. Si no hubo medición o no está
  disponible, el usuario lo declara explícitamente; no se muestran fórmulas ni
  resultados anteriores. El borrador se conserva al volver a Capturar mediciones.
- Bioquímica: al menos un resultado con su unidad o declaración explícita de
  Estudio no realizado / Resultados no disponibles. No exige diez análisis ni
  una interpretación. El estado de ausencia se incluye en la revisión y excluye
  los resultados/metadatos del borrador hasta volver a capturar, sin borrarlos.

- R24: declarar los cinco tiempos o ausencia global explícita. Cada tiempo con
  consumo requiere preparación con nombre y al menos un alimento con nombre,
  cantidad positiva y unidad. Los estados sin información no equivalen a cero.
- Hábitos: declaración de entrevista capturada/no realizada/no disponible. Si se
  captura, debe declararse actividad del día, ninguna actividad o información
  ausente. No obliga a preferencias, agua, comidas ni sueño; si todos son ausentes
  y la actividad es desconocida se pide declarar ausencia global. Actividades con
  nombre, duración positiva y unidad; MET/fuente opcionales, necesarios para calcular.
  La duración conjunta no puede superar 24 h, sin superponer actividades.
- Fórmulas: revisión activa o ausencia explícita. Una fecha válida/no futura permite
  determinar edad. Confirmar revisión no exige fabricar resultados de métodos
  opcionales, ausentes o pendientes y no equivale a confirmar aplicabilidad clínica.

Continuar usa la validación Informed y enfoca el primer error. Solo se puede ir
al primer paso no confirmado o regresar a los confirmados. Editar un paso ya
completado revoca también las confirmaciones posteriores (incluso si el cambio
es válido) y requiere confirmarlas de nuevo, conservando todas las capturas.
La protección está tanto en los botones como en la función de selección.

`AssessmentNavigation` recibe pasos, disponibilidad y completados desde su
contenedor; `AssessmentStepActions` presenta acciones sin lógica de paciente.
El estado de progreso es local en `usePatientRegistration`, no un store global.
Los formularios continúan montados al alternar pasos; Hábitos y Fórmulas se montan
por primera vez al alcanzarlos. Nueva consulta usa ahora su propio asistente de
seis pasos (`ConsultationWizard`), compartiendo navegación, acciones, antropometría
completa, Bioquímica, R24, Hábitos, Fórmulas y reportes. Datos de consulta añade
horarios, motivo actual, los 18 signos/síntomas y notas, sin volver a registrar la
identidad del paciente. Cada paso valida antes de avanzar y editarlo invalida las
confirmaciones dependientes sin borrar borradores. Reportes y revisión final usan
las últimas instantáneas confirmadas. Cambiar de paciente reinicia el asistente.
Se auditó `Nutriologo/consultasusurio.php` en navegador: muestra una sección a la
vez, con ficha precargada mayormente de solo lectura y las mismas 38 medidas.
No se reproducen cronómetro, pagos ni actualización de estado al abrir consultas.

### Auditoría R24 y límites de los cálculos

Se trazaron `busquedaAlimentos.php`, `consutas.js`, las columnas de `alimentos`
en `nutrilinedb.sql` y los arrays de guardado en `animaciones.js`. El buscador
original depende de MySQL; no se reutiliza su endpoint ni se envía información.
El prototipo incorpora seis referencias históricas exactas: Manzana (1231),
Tortilla de maíz (2067), Arroz cocido (138), Leche descremada (1094), Aceite de
oliva (18) y Plátano (1748). No son un catálogo completo ni validado clínicamente.

La fórmula revisada es cantidad capturada / cantidad original × aporte original,
no una base universal de 100 g. Nombre y unidad deben coincidir; los alimentos
libres o editados no reciben equivalencias. Se distinguen subtotal conocido y
total de tiempos declarados, con cobertura explícita y sin ceros para ausentes.
Los ceros que sí figuran en las referencias históricas se conservan como tales,
sin afirmar que su calidad haya sido validada.

Las columnas `azucarg` y `azucar` son distintas en SQL, pero no se documenta la
segunda: se conserva sin sumar. Tampoco se suma índice/carga glicémicos como hacía
el original. Vitamina A, ácido fólico, selenio y etanol quedan sin suma hasta
verificar sus unidades/método; sus valores fuente pueden verse en cada referencia.
No se generan diagnósticos ni prescripciones. El módulo Fórmulas puede usar el
total completo de energía, nunca el subtotal, para una diferencia consumo−gasto.
No hay persistencia ni se modifica el backend. Los borradores viven solo en la vista.

### Auditoría Hábitos, ecuaciones y reportes

Se trazaron los seis campos de alimentación/descanso, `nafA`, `deportsmets` y las
filas `tiempoActividad`/`tiempoDeporte` de `formulas.js`, además de los arrays de
actividad en `animaciones.js`. Se conservan las opciones originales de intensidad
y lesión, seis autores de metabolismo y los autores de composición.

Correcciones respecto al JavaScript original:

- Actividad: por fila MET×0.0175×peso×minutos; no suma todos los MET para multiplicar
  cada duración ni omite la conversión horas→minutos. Volumen en MET·min, no
  «METS totales» aditivos sin duración. Kcal brutas no se suman automáticamente a
  metabolismo basal ni se presentan como gasto total de 24 h.
- Mifflin: variante simplificada uniforme 10×kg+6.25×cm−5×edad+5/−161, alcance
  19–78 años en esta vista. No replica 9.9/9.99 ni variables `tmb`/`tbm` inconsistentes.
- Harris-Benedict original redondeada: coeficiente masculino de edad 6.755, no
  6.775. Schofield/FAO emplea tabla 5.2, incluidas personas ≥60, bandas sin huecos
  [18,30), [30,60), ≥60; las ecuaciones no se consideran dos métodos independientes.
- IOM 2005 es requerimiento EER, no TMB: se conserva sin activarlo como metabolismo
  basal, sin reutilizar incorrectamente factores 1.2–1.9 ni duplicar actividad.
- Durnin-Womersley usa log10 y coeficientes por sexo/edad, no suma lineal sin
  logaritmo ni perímetro de antebrazo en lugar de pliegue. Alcance 18–72 en esta vista.
  Siri convierte densidad→grasa; la opción de densidad aclara el método real.
- Rocha convierte talla y diámetros a metros y usa diámetro femoral, no húmero.
  El componente por diferencia resta grasa en kg, no porcentaje, y se etiqueta
  como modelo histórico, no medición validada de músculo esquelético.
- La diferencia es consumo−gasto: negativo significa consumo menor al gasto
  estimado, no el «Superavits» invertido del original. El consumo se muestra
  separado de esa diferencia. No clasifica clínicamente grasa ni IMC.

Se activan Deurenberg adulto, Lean, Durnin/Siri y Brozek; Wurch permanece explícito
como modelo histórico. Porcentajes fuera de 0–100 y componentes negativos no se
recortan ni sustituyen por cero. El sexo de las ecuaciones se declara por separado
del género; población general adulta requiere selección profesional explícita.
Otras poblaciones, menores, embarazo/lactancia y protocolos deportivos específicos
no se extrapolan. Todo sigue pendiente de validación clínica de producto.

Valencia 2008, Garrow/Webster, Faulkner, Yuhasz y factores de lesión se conservan
sin resultados automáticos hasta verificar fuente, protocolo/población y unidades.
No se afirma que se hayan implementado todas las fórmulas históricas.

Los reportes usan instantáneas de secciones confirmadas. Cambiar una sección
revoca también las posteriores, y volver a confirmarla actualiza las dependencias.
Antropometría presenta medidas, índices y composición; alimentación presenta R24,
hábitos y energía, sin llamarlo dieta prescrita. Los tres reportes (incluido el
completo con bioquímica y contexto) se generan con `@react-pdf/renderer`, en A4,
texto seleccionable, fuentes locales y somatocarta vectorial. Vista previa,
descarga e impresión comparten el mismo Blob. No se guardan evaluaciones ni se
envían datos; solo se cargan assets locales del motor/fuentes. Las URLs Blob se
liberan al cerrar. Hay reintento, contenido textual y apertura alternativa en móvil.
No se inventan datos de profesional, cédula ni firma. La captura y PDF de la dieta
diaria prescrita siguen pendientes y no se sustituyen por el R24. 6/6 solo confirma
revisión de la demo.

Fuentes contrastadas (ecuaciones y unidades, no aprobación clínica):

- [Compendium 2024: definiciones de MET](https://pacompendium.com/).
- [FAO, Human energy requirements, capítulo 5, tabla 5.2](https://www.fao.org/4/y5686e/y5686e07.htm).
- [Mifflin, variante simplificada](https://www.calculator.net/bmr-calculator.html).
- [Harris-Benedict original](https://www.nutritioncarepro.com/harris-benedict-equation).
- [Deurenberg 1991 y fórmulas de conversión de densidad](https://en.wikipedia.org/wiki/Body_fat_percentage).
- [Durnin-Womersley: coeficientes y ejemplo](https://www.thecalculator.co/health/Body-Fat-Skinfold-By-Durnin-And-Womersley-Calculator-1111.html).
- [Lean 1996](https://pubmed.ncbi.nlm.nih.gov/8604668/).
- [Rocha, unidades en metros](https://www.scielo.cl/scielo.php?script=sci_arttext&pid=S0717-95022012000300030).
- [Componentes históricos, Wurch](https://www.apunts.org/en-download-pdf-X0213371701058267).

Los hooks que leen objetos anidados de Informed obtienen una instantánea JSON
inmutable con `useFormStateSelector`; Informed muta objetos y no debe entregarse
su referencia mutable al cálculo memoizado por React Compiler. Se prueba que
totales y dependencias cambian inmediatamente, sin tener que enviar el formulario.

### Pendiente antes del guardado real

- Verificar dependencia de campos, unidades, fórmula/autor, poblaciones aplicables
  e interpretación con revisión clínica. Conservar valores ausentes como ausentes,
  nunca convertirlos automáticamente en cero como hacía el JavaScript original.
- Ampliar el contrato y modelo del backend: hoy no admiten toda esta evaluación.
  Ni esta pantalla ni la edición actual deben fingir que ya pueden guardarla.
- Definir aprobación clínica y cierre persistido sin confundirlos con revisión demo.
- Adaptar posteriormente edición y expediente a los nuevos módulos; ampliar los
  contratos del backend antes de persistir la evaluación o consulta completa.

No se modificó el PHP, la base original ni el backend en esta entrega.
