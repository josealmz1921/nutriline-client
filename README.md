# Nutriline Client

Frontend en preparación con React + TypeScript + Vite. Los componentes copiados
ya están adaptados al cliente. La pantalla inicial muestra el login responsive;
todavía no hay conexión a la API.
No se usa Next.js ni Firebase.

## Autorrelleno para desarrollo

Con `npm run dev`, la evaluación inicial y Nueva consulta muestran una barra
**Modo desarrollo** por sección. **Rellenar campos vacíos** añade ejemplos
ficticios para probar la interfaz; después debes revisar y continuar manualmente.

- Conserva campos capturados, incluso valores inválidos: no sustituye validaciones.
- Respeta declaraciones de ausencia y tiempos del R24 sin consumo.
- Añade preparaciones/alimentos y una actividad solo cuando sus listas están vacías;
  nunca completa ni reemplaza filas existentes ni duplica ejemplos al repetir.
- No mezcla ejemplos con determinaciones bioquímicas parcialmente capturadas.
- No confirma pasos, guarda, persiste ni envía información. Las ediciones siguen
  invalidando las confirmaciones dependientes.
- La barra, las acciones y sus ejemplos se excluyen del JavaScript de producción
  mediante `import.meta.env.DEV`; no aparecen con `npm run build` + `npm run preview`.

Implementación en `src/components/DevFormTools/`, sin hooks globales ni stores nuevos.

El login sigue la paleta de Stitch y usa `react-icons/lu` y Plus Jakarta Sans
alojada localmente. Permite mostrar/ocultar la contraseña. El envío y la
recuperación solo muestran avisos de vista previa: no autentican, no envían
credenciales ni las guardan en almacenamiento persistente. No hay lógica de pagos.

## Primera pantalla migrada: pacientes

Desde el login, usar **Explorar pacientes de demostración**, o abrir
`http://localhost:5173/dashboard/pacientes`. `/login` vuelve al acceso. Estas rutas son
solo navegación visual: no hay sesión, permisos simulados ni protección de rutas.

### Navegación y alojamiento

React Router usa `BrowserRouter` en `src/main.tsx`. Las rutas se declaran en
`src/components/Application/Application.tsx`, sin leer hashes ni condicionales
por pantalla. Los enlaces usan `Link`/`NavLink` y el layout comparte un `Outlet`.

| Ruta | Vista |
| --- | --- |
| `/` | Redirección a `/login` |
| `/login` | Login de demostración |
| `/dashboard` | Redirección a `/dashboard/inicio` |
| `/dashboard/inicio` | Resumen del espacio clínico de demostración |
| `/dashboard/consultas` | Historial general con búsqueda, filtros y paginación |
| `/dashboard/consultas/:consultationId` | Detalle de una consulta de demostración |
| `/dashboard/pacientes` | Directorio con layout compartido |
| `/dashboard/pacientes/nuevo` | Formulario y revisión de registro (sin guardado) |
| `/dashboard/pacientes/:patientId` | Expediente e historial de demostración |
| `/dashboard/pacientes/:patientId/editar` | Edición y revisión de cambios sin guardado |
| `/dashboard/pacientes/:patientId/consultas/nueva` | Nueva consulta y revisión sin guardado |
| Cualquier otra | Página no encontrada |

Vite (`npm run dev` y `npm run preview`) ya sirve la SPA al abrir o recargar una
ruta interna. En producción el alojamiento debe hacer lo mismo: devolver
`dist/index.html` para las rutas del cliente que no correspondan a archivos.
No hay un proveedor de despliegue seleccionado; el fallback debe configurarse
en el servidor que se utilice. Ejemplo para Nginx sirviendo `dist`:

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

Si se publica una API en el mismo dominio, configurar `/api/` por separado
antes del fallback; sus errores no deben devolver el HTML del frontend.
La pantalla 404 de React Router es visual: con un fallback estático la respuesta
HTTP normalmente será 200, no un 404 del servidor.

- Layout con menú lateral y menú accesible en móvil.
- Directorio inspirado en Stitch: tabla en escritorio y tarjetas en pantallas pequeñas.
- 13 pacientes sintéticos (10 activos y 3 archivados), sin datos de producción.
- Búsqueda por nombre sin acentos, correo y teléfono; filtros de estado,
  orden por registro/nombre/última consulta y paginación de cinco registros.
- Controles desplegables para previsualizar carga, vacío y error. No representan
  solicitudes de red ni borran los datos ficticios.
- Registro abre el formulario de demostración y Ver expediente abre la ficha del
  paciente. Inicio y Consultas están disponibles; Agenda sigue como próxima sección.

Los datos están aislados en `src/components/Patients/demoPatients.ts`; no se
modificó el PHP ni se conectó la API. La búsqueda usa Informed y la lógica de
cada vista vive en sus hooks locales, sin nuevos hooks globales ni stores.

## Inicio

`/dashboard/inicio` adapta la referencia visual de Stitch al layout compartido,
con saludo, accesos inmediatos, tarjetas de resumen y actividad reciente.
Es el destino de `/dashboard` y de la marca Nutriline; el enlace del login
**Explorar pacientes de demostración** conserva su acceso explícito al directorio.

- Registrar paciente y Buscar paciente enlazan a pantallas disponibles, sin
  simular acciones ni duplicar la búsqueda del directorio en un modal.
- Los indicadores se calculan de los mismos fixtures de pacientes y expedientes:
  10 activos de 13 pacientes (3 archivados), 12 consultas registradas en total
  y 2 pacientes activos sin primera consulta. No son estadísticas de producción.
- La actividad muestra los cuatro pacientes con consulta más reciente, una sola
  entrada por paciente, ordenados por instante. Cada entrada abre su expediente.
  Se indica que los horarios corresponden a Ciudad de México.
- La fecha del escenario (05/11/2026) es fija y está etiquetada como demostración;
  no se presenta como la fecha actual ni se inventan estados “completada”,
  sincronización, tendencias o tiempos relativos.
- Agenda sigue pendiente de definir y diseñar. No se presentan citas ni métricas
  de consultas programadas como si existiera esa funcionalidad.

`src/components/WorkspaceHome/workspaceOverview.ts` concentra los cálculos puros
del resumen. `SummaryCard` es presentacional y se reutiliza para los indicadores.
No hay solicitudes, persistencia ni cambios en los datos de demostración.

## Historial general de consultas

`/dashboard/consultas` reúne las mismas 12 consultas sintéticas de los expedientes,
sin crear fixtures independientes. Permite:

- Buscar por nombre sin acentos, motivo, ID de paciente o ID de consulta.
- Filtrar por pacientes activos/archivados y fechas Desde/Hasta inclusivas,
  interpretadas como días de Ciudad de México. Un intervalo invertido se explica
  en pantalla en lugar de mostrar resultados engañosos.
- Ordenar por instante reciente, antiguo o nombre del paciente y paginar de cinco
  en cinco. Búsqueda y filtros reinician la página; Restablecer limpia los controles.
- Abrir `/dashboard/consultas/:consultationId` para ver exactamente ese registro,
  con motivo, notas, mediciones e IMC numérico, y enlazar al expediente del paciente.
  Un ID desconocido muestra “Consulta no encontrada”. El historial de archivados
  se conserva visible, sin habilitar consultas nuevas.
- Elegir un paciente activo en **Nueva consulta** y continuar al formulario ya
  existente. No hay guardado, solicitudes ni creación real de registros.
- Revisar estados simulados de carga, vacío y error mediante controles de
  demostración. Los indicadores superiores siempre describen el fixture completo,
  no las filas filtradas ni el estado simulado.

La tabla se convierte en tarjetas en pantallas pequeñas. No se inventan estados
clínicos como “completada” ni se confunde el historial con citas programadas.
El detalle reutiliza `ConsultationDetail`. Los selectores dentro de un diálogo
mantienen su popup en él para que elegir una opción no cierre la ventana y su
control está registrado con Informed para enfocar correctamente errores.

Se estabilizó el repintado SVG del login: los dos iconos de visibilidad conservan
sus nodos y tamaño al alternar, con un solo icono visible. Los adornos del campo
se centran sin `translateY` para evitar posiciones fraccionarias.

## Registro de pacientes

`/dashboard/pacientes/nuevo` inicia la modernización de la evaluación original de
`ProyectoDietas/Nutriologo/NuevoPaciente.php`, no solo del contrato reducido de la
API. Incluye nombre y nacimiento obligatorios, correo/teléfono/ocupación opcionales,
foto local, género, nacionalidad, motivo y los 18 signos/síntomas del original.
No incluye cronómetro ni controles de pago. **No es aún la evaluación completa.**

La navegación presenta las seis secciones: Datos del paciente, Antropometría,
Bioquímica, Recordatorio de 24 horas, Hábitos y Fórmulas/reportes. Datos del
paciente permite capturar y revisar; Antropometría permite capturar 38 medidas
originales más el supraespinal específico y calcular IMC, índices cintura/cadera y
cintura/talla y somatotipo Heath–Carter con proyección X/Y. Bioquímica ofrece las diez
determinaciones de química sanguínea, valor/unidad/referencia del informe y resultado
manual, con revisión sin guardado. R24 captura cinco tiempos con preparaciones,
alimentos, cantidades y unidades. Hábitos ofrece entrevista y actividades dinámicas;
Fórmulas/reportes selecciona métodos, calcula resultados dependientes de datos y
abre vistas previas locales. No todos los métodos históricos están activados:
los que necesitan revisión clínica o trazabilidad permanecen sin resultado.
Ver [docs/EVALUACION-INICIAL.md](docs/EVALUACION-INICIAL.md) para alcance y origen.

La evaluación inicial ahora avanza por pasos: nombre/nacimiento → peso/talla →
química sanguínea → R24 → Hábitos → Fórmulas/reportes. **Continuar** valida con Informed y enfoca el primer error;
no obliga a capturar las 38 medidas ni los diez análisis. Las fórmulas sin sus
dependencias permanecen sin resultado. Se puede declarar mediciones/estudios no
realizados o no disponibles, sin ceros ni normalidad inferida. Bioquímica necesita
al menos un valor con unidad, o declaración explícita de ausencia del estudio.
La barra cuenta secciones confirmadas, no campos ni registros guardados; hoy su
máximo alcanzable es 6/6. Esto confirma revisión en demostración, no aprobación
clínica, guardado ni creación de expediente. No hay botón de guardado ficticio.

El indicador sustituye el menú lateral: en escritorio muestra círculos conectados,
checks en pasos completados y un punto en el actual. En móvil (hasta 800 px) usa
una franja compacta con número, nombre, progreso circular y selector «Ver pasos»
para volver a secciones habilitadas. Anterior/Continuar permanecen al pie del
formulario, donde Continuar valida; el indicador nunca permite saltarse requisitos.

Se puede volver a pasos completados sin perder datos. Editar un paso revoca su
confirmación y las posteriores, pero **no borra sus borradores**. Deben validarse
otra vez con Continuar. La revisión de datos no confirma ni avanza el paso.
La navegación (`AssessmentNavigation`) y acciones (`AssessmentStepActions`) son
presentacionales y reutilizables, sin dependencia de rutas o datos de pacientes.
Nueva consulta usa también seis pasos, con sus propias fechas, motivo, signos y
síntomas y notas. Comparte la antropometría completa, Bioquímica, R24, Hábitos,
Fórmulas y reportes locales. No se copian mediciones ni resultados antiguos para
completar fórmulas y no se vuelve a registrar al paciente.

La fecha usa un campo nativo `date` (su presentación depende del idioma del
navegador) y conserva `YYYY-MM-DD`, sin convertir el cumpleaños a un instante.
Las validaciones locales revisan obligatoriedad, calendario, fechas futuras,
longitudes y formato básico del correo. No sustituyen la validación del servidor.

**Revisar datos** abre un diálogo con los valores normalizados de los datos iniciales
y permite volver al formulario sin perderlos. No finaliza la evaluación. Cambiar
de sección conserva también los campos, la foto y las selecciones porque el
formulario Informed de cada sección permanece montado una vez abierto (Hábitos y
Fórmulas se montan al llegar por primera vez). La revisión de datos
iniciales no incluye ni valida Antropometría; sus resultados se consultan en su
propia sección. No existe guardado todavía: los datos
no salen del componente ni se añaden al listado. Cancelar o abandonar la vista
descarta el formulario, sin persistencia en navegador ni solicitudes a la API.
Usar exclusivamente datos ficticios durante esta etapa. La edición también es de demostración.

### Bioquímica reutilizable en evaluaciones y consultas

`BiochemistryFields` se conecta a cualquier formulario Informed mediante el espacio
`biochemistry`, sin formulario anidado ni store global. `BiochemistryReview` presenta
el mismo modelo en ambos flujos. Ambos usan `Biochemistry` como contenedor
independiente por paso, sin formularios anidados. Fecha de muestra y laboratorio son opcionales, sin copiar
resultados anteriores ni modificar las consultas de demostración.

Un valor capturado requiere su unidad; las referencias e interpretaciones manuales
pueden quedar pendientes. Las referencias del PHP se conservan como trazabilidad,
no se precargan ni generan diagnósticos. No se convierte un campo vacío en cero.
Biometría hemática, orina, agregar/quitar estudios e impresión siguen pendientes.
El backend aún no admite estos datos; no hay solicitudes ni guardado simulado.

### R24 reutilizable en evaluaciones y consultas

`RecallFields` y `RecallReview` comparten el modelo `recall` de Informed, sin
formularios anidados ni estado global. Se agregan/quitan preparaciones y alimentos
por desayuno, primera colación, comida, segunda colación y cena. Quitar filas requiere
confirmación. Cada tiempo debe declarar consumo, no consumo o información ausente;
también se puede declarar todo el recordatorio no realizado/no disponible.
Estas declaraciones excluyen el borrador de revisión/cálculos sin borrarlo.

Se conservan las 24 columnas originales. El catálogo local es solo un subconjunto
de seis referencias de `nutrilinedb.sql`, **histórico y sin validación clínica**;
la captura libre no inventa nutrientes. Los aportes se escalan respecto a la cantidad
original, únicamente con nombre y unidad coincidentes, sin equivalencias inventadas.
Un subtotal conocido no se presenta como total diario si hay alimentos o tiempos
desconocidos. La segunda columna Azúcar, índices/carga glicémicos y las unidades
ambiguas no se suman. El catálogo completo, su validación y la API siguen pendientes.

### Hábitos y fórmulas reutilizables

`HabitsFields`/`HabitsReview` conservan preferencias/rechazos, comidas, minutos por
comida, vasos de agua, horas de sueño, nivel de actividad declarado y actividades
de un día con duración/unidad. La búsqueda incluye seis referencias históricas de
demostración; existe captura libre con MET y fuente opcionales. Sin MET/fuente no
se calculan aportes, pero sí se conserva la actividad. No se convierten vasos a ml.
Cada aporte es MET × 0.0175 × kg × minutos: se suman kcal y MET·min, no los MET
de actividades distintas. No es gasto total diario ni gasto neto de ejercicio.

`FormulaFields`/`FormulaReview` usan los datos de la evaluación confirmada o de la
consulta actual. El sexo utilizado por la ecuación y la población se eligen
explícitamente; no se deducen del género. La edad usa fechas calendario.
Se ofrecen Mifflin simplificada, Harris-Benedict original y Schofield/FAO;
composición Deurenberg, Lean, Durnin-Womersley/Siri y Brozek, masa ósea Rocha,
residual Wurch y componente por diferencia. Cada resultado explica datos, unidades
y límites. El consumo R24 solo usa totales completos, no subtotales conocidos.
La diferencia es consumo menos gasto, con su signo correcto y sin diagnóstico.

Valencia, IOM como TMB, Garrow, Faulkner, Yuhasz y multiplicadores de estrés no
verificados se conservan visibles sin cálculo automático. IOM es EER, no TMB;
Siri convierte densidad en grasa, no estima densidad por sí solo. Las
interpretaciones de grasa e IMC son manuales y opcionales. Todos los métodos
siguen sujetos a validación clínica; no se consideran aprobados para uso real.

Los reportes completo, antropométrico y alimentario tienen vista previa PDF real,
descarga e impresión local, siempre marcados como borrador. El reporte alimentario
presenta R24, no un plan prescrito. No se guarda en el expediente ni se envían datos.
Editar una sección revoca su confirmación y todas las posteriores, sin borrar
borradores ni selecciones.

### PDF y vista previa

En el último paso de evaluación inicial y Nueva consulta están disponibles:

- **Ver reporte completo de evaluación:** contexto confirmado, mediciones, resultados,
  bioquímica, R24, hábitos, métodos y dependencias.
- **Ver reporte de antropometría:** medidas, índices, composición y somatocarta.
- **Ver reporte alimentario (R24):** consumo declarado, nutrientes, hábitos y energía;
  **no** es un menú diario ni una dieta prescrita.

`@react-pdf/renderer` genera texto seleccionable en A4, con encabezado, numeración,
colores salvia y Plus Jakarta Sans local. El motor se carga bajo demanda en un
chunk independiente. El modelo está en `PdfReportDocument/reportModel.ts` y los
estilos PDF en `pdfReportStyles.ts`: React PDF no interpreta CSS Modules. El visor
y sus controles web sí usan CSS Modules.

`ReportPdfPreview` crea un único Blob por apertura. El visor nativo del navegador,
**Descargar PDF**, **Abrir PDF en otra pestaña** e **Imprimir** usan ese mismo archivo;
no se generan versiones diferentes para pantalla e impresión. Las URLs temporales
se liberan al cerrar y se descartan generaciones tardías. Ante errores se ofrece
reintento y contenido textual accesible. En móvil se prioriza abrir o descargar el
PDF; la impresión depende de las capacidades del navegador y dispone de alternativa
en otra pestaña. No se simula que la impresión haya terminado.

Los reportes usan pasos previamente confirmados y validan las fórmulas actuales
antes de abrir. Ausencias explícitas excluyen sus borradores; no se inventan ceros,
normalidad, referencias clínicas, firma ni cédula. Descargar un archivo no guarda
la evaluación ni equivale a aprobación clínica. Se solicitan únicamente los assets
locales del motor/fuentes, no APIs ni servicios de PDF externos.

El **PDF de dieta diaria** queda separado y pendiente de su captura de menú
prescrito (comidas, preparaciones, cantidades e indicaciones). Nunca se llena desde
el R24. El profesional/logotipo personal tampoco se inventa: falta su configuración.

Las pruebas incluyen generación real de los tres PDF y notas largas multipágina.
Para guardar copias de prueba ficticias, ejecutar con `PDF_REVIEW_DIR` apuntando a
una carpeta existente; sin esa variable las pruebas no escriben documentos.

## Expediente del paciente

Desde el listado, **Ver expediente** abre `/dashboard/pacientes/:patientId`,
por ejemplo `/dashboard/pacientes/DEMO-001`. Presenta los datos personales del
directorio junto con nacimiento, ocupación e historial sintético. Un ID que no
existe muestra “Paciente no encontrado” y un enlace para volver al listado.

- Las consultas se ordenan por instante descendente y se paginan de dos en dos.
  Fecha, hora e identificador distinguen las consultas del mismo día.
- Los horarios se muestran explícitamente en Ciudad de México. Nacimiento
  permanece como fecha sin zona horaria; las edades se señalan como ejemplos
  al 05/11/2026, no como un cálculo actualizado automáticamente.
- Al seleccionar una consulta se muestran su motivo, notas, peso, talla,
  cintura/cadera opcionales e IMC numérico, sin diagnósticos ni clasificaciones.
- Si no hay consultas, no se inventan mediciones. Si un dato opcional falta,
  aparece “No registrada” o “Sin especificar”, nunca un cero sustituto.
- Un paciente archivado conserva su historial visible; Nueva consulta queda
  deshabilitada con explicación. Archivar/reactivar muestran avisos de próximas
  etapas, sin modificar datos. Editar y Nueva consulta abren sus formularios.

Los fixtures están en `src/components/PatientRecord/demoPatientRecords.ts`,
separados de la presentación. El IMC se calcula únicamente al construir esos
ejemplos; cuando se conecte la API se usará el resultado del servidor.
No se creó un store ni se añadieron hooks globales para una vista de solo lectura.

## Edición del paciente

**Editar paciente** abre `/dashboard/pacientes/:patientId/editar` con nombre,
nacimiento, ocupación, correo y teléfono precargados. Registro y edición reutilizan
`src/components/PatientFields/` y las mismas validaciones del contrato del backend.

- Nombre y nacimiento son obligatorios. Correo, teléfono y ocupación pueden
  dejarse vacíos: en la revisión quedan como “Sin especificar”.
- **Revisar cambios** compara el valor actual con el propuesto, destacando los
  cambios. El nombre y los opcionales se recortan; el correo se normaliza a
  minúsculas. Si no hay diferencias efectivas, aparece un aviso sin abrir revisión.
- Volver al formulario o cerrar la revisión conserva lo escrito. Cancelar o salir
  descarta los cambios; volver a entrar carga los datos originales del fixture.
- La fecha de nacimiento sigue siendo `YYYY-MM-DD`, sin conversión horaria.
- Se pueden revisar datos de pacientes archivados, sin reactivarlos. Un ID
  desconocido muestra “Paciente no encontrado”, sin formulario.

Esta pantalla no hace solicitudes, no persiste información, no modifica el
directorio y no cambia consultas, mediciones ni estado de archivo del paciente.

## Nueva consulta

Desde un expediente activo, **Nueva consulta** abre un asistente de seis pasos:

1. Datos de consulta: ficha de referencia sin edición, horarios de consulta y
   mediciones, motivo (hasta 500 caracteres), 18 signos/síntomas opcionales y notas
   (hasta 10000 caracteres).
2. Antropometría: las 38 medidas originales más supraespinal; IMC, índices y
   somatotipo. Peso/talla esenciales si se capturan mediciones; el resto es opcional.
3. Bioquímica.
4. Recordatorio de 24 horas.
5. Hábitos.
6. Fórmulas y revisión: selección de métodos y reportes de antropometría y R24.

Los pasos usan los mismos componentes y validaciones que la evaluación inicial,
con formularios Informed independientes. Admiten declaraciones de ausencia sin
reemplazar datos por cero. Las medidas aceptan punto o coma según el módulo
compartido; esto aún no implica compatibilidad de persistencia con la API.

Los horarios se validan y muestran en la zona del dispositivo, indicada en pantalla.
La fecha de referencia de fórmulas se declara por separado; no se toma de consultas
anteriores. La ficha no se registra de nuevo y los estudios empiezan vacíos.

**Revisar consulta** abre el resumen de los seis pasos confirmados. Los reportes
usan sus últimas instantáneas confirmadas, sin clasificación clínica automática ni
dieta prescrita. Editar un paso revoca su confirmación y las posteriores, conservando
los borradores y bloqueando el acceso hasta reconfirmarlos. El autorrelleno dev
no confirma ni avanza pasos.

No hace solicitudes, guarda ni altera el historial. Volver conserva los valores;
cancelar, salir o cambiar de paciente los descarta, incluso si React reutiliza la
ruta. Pacientes archivados o inexistentes no pueden abrir la captura por URL directa.
`ConsultationWizard` coordina el flujo con un hook local, sin estado global nuevo.

## Dependencias y ejecución

```sh
npm ci
npm run dev
```

Usar Node 24.22.2 (el mismo runtime de las verificaciones del backend).
Zustand está instalado para estado compartido, sin stores creados por anticipación.
Los formularios usan Informed; no crear Redux ni Context API para estado de la aplicación.
Convenciones completas: [AGENTS.md](AGENTS.md).

## Componentes disponibles

- Campos Informed: `Input`, `Textarea`, `Checkbox`, `RadioGroup`, `Toggle`,
  `Select`, `DatePicker` e `InputFile`.
- Auxiliares: `Message`, `Portal`, `Dialog`, `Collapsible`, `ToolTip`,
  `BulkActions`, `Dropzone` y `BlogEditor`.
- Select sin formulario: `Select/components/SelectControl`.
- Se conserva la colección SVG proporcionada en `Icons/icons.tsx`.

Cada componente principal usa carpeta PascalCase, `index.ts` con reexportación
por defecto, archivo `.tsx` y CSS Module con el mismo nombre. La lógica propia
está en hooks locales. Los hooks globales proporcionados por el usuario se
mantienen; no se añadieron hooks globales nuevos.

```tsx
import { Form } from 'informed'
import Input from './components/Input'
import DatePicker from './components/DatePicker'

export default function Example() {
  return (
    <Form>
      <Input identifier="fullName" label="Nombre" required />
      <DatePicker field="birthDate" label="Nacimiento" />
      <DatePicker field="occurredAt" label="Atención" mode="datetime" />
      <button type="submit">Guardar</button>
    </Form>
  )
}
```

DatePicker usa `YYYY-MM-DD` por defecto, sin desplazar cumpleaños por zona horaria.
Con `mode="datetime"` guarda un instante ISO en UTC y lo muestra en hora local.
InputFile lee archivos localmente; Dropzone selecciona, previsualiza y reordena.
**Ninguno sube archivos automáticamente.** Cloudinary y su contrato de backend
siguen pendientes; no se introdujo Firebase para resolver imports antiguos.

El alias `@/src/...` está configurado tanto en Vite como en TypeScript.
Los tipos propios viven en archivos `.ts`, no en declaraciones `.d.ts` que
puedan ocultar errores con `skipLibCheck`. `erasableSyntaxOnly` está desactivado
porque los tipos públicos de EditorJS incluyen enums en archivos `.ts`;
esto no desactiva la comprobación de tipos del proyecto.

Las utilidades de validación copiadas son auxiliares heredados: no sustituyen
las reglas, permisos ni validaciones del backend. No se migró su lógica a una
política clínica ni se habilitaron flujos de recuperación/creación de cuentas.

## Estilos: Tailwind CSS + CSS Modules

Tailwind CSS 4 está integrado mediante `@tailwindcss/vite`. El CSS global
`src/index.css` importa Tailwind una sola vez. Para los componentes, usar
archivos `*.module.css` y referenciar ese CSS global para habilitar `@apply`:

```css
@reference "../../index.css";

.button {
  @apply rounded-lg px-4 py-2 font-medium;
}
```

```tsx
import styles from './Button.module.css'

export default function Button() {
  return <button className={styles.button}>Guardar</button>
}
```

Ajustar la ruta de `@reference` según la ubicación del módulo. No importar
`tailwindcss` dentro de cada módulo: `@reference` comparte las definiciones
sin duplicar el CSS global. Ejemplo funcionando: `src/App.module.css`.

## Verificación

```sh
npm run build
npm run lint
npm test
TZ=America/Mexico_City npm test
```

Vitest + Testing Library ejercitan campos reales con Informed, validación,
archivos, Select por ratón/teclado/reset/fallback, fechas, Toggle asíncrono,
diálogo y colapsable. Importan también los componentes auxiliares y sus CSS
para detectar problemas que el starter sin usar esos componentes no descubriría.
También cubren navegación de demostración, menú, búsqueda, ordenamiento,
filtros, paginación y estados del directorio, además de los iconos del login.
No equivalen a pruebas de integración con la API ni a una validación visual completa.

Auditoría durante la adaptación: sin vulnerabilidades de producción reportadas;
persisten 10 avisos moderados de desarrollo. No se aplicó `npm audit fix --force`.

## Plantilla original

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is enabled on this template. See [this documentation](https://react.dev/learn/react-compiler) for more information.

Note: This will impact Vite dev & build performances.
You can also try [the experimental native React Compiler support in plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md#rust-react-compiler) by using `compiler: true` in the plugin options instead of using the Babel plugin.

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```

You can also install [eslint-plugin-react-x](https://npmx.dev/package/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://npmx.dev/package/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```
