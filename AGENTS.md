# Convenciones de nutriline-client

Estas reglas se aplican a todo el frontend. Stack actual: React, TypeScript,
Vite y Tailwind CSS 4. No asumir que el cliente usa Next.js.

## Componentes

- Usar TypeScript: `.tsx` para componentes con JSX y `.ts` para hooks y exports.
- Cada componente tiene su propia carpeta en PascalCase, con el mismo nombre
  que el componente. Respetar esta estructura:

  ```text
  NombreDelComponente/
  ├── index.ts
  ├── NombreDelComponente.tsx
  ├── NombreDelComponente.module.css
  └── useNombreDelComponente.ts
  ```

- `index.ts` solo reexporta por defecto el componente; no contiene JSX,
  implementación ni lógica:

  ```ts
  export { default } from './NombreDelComponente'
  ```

- Definir el componente y su exportación por defecto en
  `NombreDelComponente.tsx`. Importarlo desde su carpeta.

## Lógica y hooks

- Separar la lógica del componente en hooks locales, dentro de la carpeta
  del propio componente, por ejemplo `useNombreDelComponente.ts`.
- Mantener estado, efectos, manejadores y coordinación de datos en esos hooks;
  el componente se centra en renderizar y conectar los valores/acciones del hook.
- Crear los hooks que la lógica requiera; no crear hooks vacíos para componentes
  puramente presentacionales.
- Los hooks locales no se convierten automáticamente en hooks globales.
- Solo crear una carpeta de hooks globales/compartidos cuando exista una
  necesidad real de reutilización y **después de preguntar al usuario y obtener
  su aprobación**. No crear `src/hooks/` ni promover un hook local a compartido
  por conveniencia o anticipando necesidades futuras.

## Estado

- Usar **Zustand** para el estado compartido/global.
- No usar Redux ni Context API para gestionar estado.
- El estado local que no necesita compartirse puede usar `useState` u otros
  hooks de React, dentro del hook local del componente.
- Zustand está instalado. No instalar librerías de estado alternativas ni crear
  stores innecesarios.

## Formularios

- Usar **Informed**, ya instalado, para la gestión de formularios y campos.
- Integrar los componentes de campos que proporcione el usuario respetando la
  estructura de componentes, hooks locales y CSS Modules descrita aquí.

## Estilos

- Usar CSS Modules: `NombreDelComponente.module.css`.
- Importar los estilos como `styles` y aplicar clases con
  `className={styles.nombreClase}`.
- Usar utilidades Tailwind mediante `@apply` en los módulos, manteniendo los
  estilos del componente fuera del JSX.
- Añadir `@reference` al CSS global `src/index.css`, con la ruta relativa
  correspondiente a la ubicación del módulo:

  ```css
  @reference "../../index.css";

  .container {
    @apply flex flex-col;
  }
  ```

- Importar Tailwind con `@import "tailwindcss"` solo en el CSS global.
  `@reference` permite usar sus definiciones sin duplicar ese CSS en cada módulo.

## Alcance y verificación

- Aplicar estas convenciones al crear o modificar componentes. No refactorizar
  todo el starter ni añadir funcionalidades ajenas a la solicitud automáticamente.
- Antes de dar por verificado un cambio funcional, ejecutar `npm run build`
  y `npm run lint`, e informar si no pueden ejecutarse.
