# Tareas

## 1. Preparación del proyecto

- [x] 1.1 Agregar Tailwind v4 con `pnpm astro add tailwind` y verificar que `pnpm build` termina sin errores
- [x] 1.2 Agregar dependencias `exifr`, `yaml`, `zod` y `@fontsource-variable/geist`, y como dependencia de desarrollo `vitest`; agregar el script `"test": "vitest run"` y verificar que `pnpm test` se ejecuta (aunque aún no haya pruebas)
- [x] 1.3 Crear la estructura `src/lib/catalogo/` (`fechas.ts`, `orden.ts`, `rafagas.ts`, `capitulos.ts`, `validar.ts`, `index.ts`) con exportaciones vacías y verificar que `pnpm astro check` no reporta errores de tipos

## 2. Migración de las fotos

- [x] 2.1 Mover todos los archivos de `public/photos/` a `src/fotos/` y verificar que `public/photos/` queda vacía y `src/fotos/` tiene 23 archivos
- [x] 2.2 Eliminar `src/fotos/20260913_112936.webp` (duplicado; se conserva el `.jpg` con EXIF) y verificar que quedan 22 fotos sin nombres base repetidos
- [x] 2.3 Crear `src/fotos/fotos.yaml` con `perro: { nombre: Rocket, llegada: 2026-09-09 }`, `capitulos: { 1: "Su primer mes" }`, una `frase` por defecto y una sección `fotos:` vacía con comentarios de ejemplo; verificar que el archivo se lee como YAML válido

## 3. Catálogo: fechas y anotaciones

- [x] 3.1 Implementar en `fechas.ts` el tipo de fecha local `{año, mes, día, hora?}` y el parseo de nombres `AAAAMMDD_HHMMSS` e `IMG-AAAAMMDD-WA####` (incluida la secuencia WA); verificar con pruebas de Vitest que cubren los escenarios "Nombre de archivo de cámara" y "Nombre de archivo de WhatsApp"
- [x] 3.2 Implementar en `fechas.ts` la resolución con prioridad yaml > EXIF > nombre; verificar con pruebas de los escenarios "Corrección manual gana" y "Metadatos de cámara"
- [x] 3.3 Implementar el esquema zod estricto de `fotos.yaml` (perro obligatorio; capítulos, frase y fotos opcionales; por foto: `texto`, `fecha` con hora opcional, `destacada`, `oculta`); verificar con pruebas de los escenarios "Falta la fecha de llegada" y "Campo mal escrito"

## 4. Catálogo: validación, orden y ráfagas

- [x] 4.1 Implementar en `validar.ts` las reglas de duplicados, fotos sin fecha, fotos anteriores a la llegada (error que lista todos los archivos afectados) y anotaciones huérfanas (aviso); verificar con pruebas de los escenarios "Misma foto en dos formatos", "Nombre libre sin metadatos", "Fecha imposible" y "Nombre mal tipeado"
- [x] 4.2 Implementar en `orden.ts` el orden determinista (día, hora conocida primero, secuencia WA, nombre); verificar con pruebas de los escenarios "Mismo día sin hora" y "Corregir el orden con hora"
- [x] 4.3 Implementar en `rafagas.ts` la agrupación de fotos con hora conocida separadas menos de 60 s; verificar con pruebas de los escenarios "Tres fotos en 22 segundos" y "Fotos separadas por minutos", y de que las fotos sin hora nunca se agrupan

## 5. Catálogo: capítulos y ensamblado

- [x] 5.1 Implementar en `capitulos.ts` el cálculo del capítulo N desde la llegada (ajustando al último día del mes), el título por defecto "Mes N", el rango de fechas y la omisión de capítulos vacíos sin renumerar; verificar con pruebas de los escenarios "Primer mes de Rocket", "Mes sin fotos", "Título propio" y "Título por defecto", más un caso de llegada el día 31
- [x] 5.2 Implementar en `capitulos.ts` el recorte de capítulos grandes con las constantes 24/16 (destacadas primero, luego repartidas en el tiempo, siempre en orden cronológico); verificar con pruebas de los escenarios "Mes con 40 fotos", "Más destacadas que el máximo" y "Primer mes de Rocket completo"
- [x] 5.3 Implementar el adaptador en `index.ts`: listar `src/fotos/` con `fs` (solo extensiones de imagen), leer EXIF con `exifr`, cargar el yaml, aplicar validaciones, excluir ocultas, ordenar, agrupar, asignar capítulos y elegir la foto de portada (destacada más reciente o la más reciente); asociar cada foto con su import mediante `import.meta.glob` no `eager`. Verificar con una prueba sobre una carpeta de ejemplo y con un script de depuración que, sobre las fotos reales, informe 22 fotos, capítulo 1 con 19 tarjetas y capítulo 2 con 1
- [x] 5.4 Documentar en `src/fotos/LEEME.md` cómo agregar fotos y todas las opciones de `fotos.yaml`, con los errores posibles y cómo resolverlos; verificar que el archivo existe y que el catálogo lo ignora al compilar

## 6. Base visual y layout

- [x] 6.1 Reescribir `src/layouts/Layout.astro`: `lang="es"`, fuente Geist, variables de color del tema claro en `:root` y del oscuro bajo `prefers-color-scheme: dark`, enlace "saltar al contenido", `<main>` semántico y props de título, descripción e imagen para compartir (`og:*`, `twitter:*`); verificar en el navegador que ambos temas cambian al alternar el tema del sistema
- [x] 6.2 Crear el favicon de Rocket y verificar que se muestra en la pestaña del navegador
- [x] 6.3 Crear las utilidades comunes: easing `cubic-bezier(0.32,0.72,0,1)`, revelado al hacer scroll con `IntersectionObserver` (`translate-y-16 blur-md opacity-0` → visible) y desactivación con `prefers-reduced-motion`; verificar en el navegador que los elementos aparecen al entrar en pantalla y que con movimiento reducido aparecen sin animación

## 7. Portada e historia por capítulos

- [x] 7.1 Crear el componente de portada (nombre con degradado según el tema, fecha de llegada, foto de portada con `<Picture>`, ancho máximo de 680 px para título y subtítulo); verificar en el navegador que muestra "Rocket", "9 de septiembre de 2026" y la foto elegida por el catálogo
- [x] 7.2 Crear el componente de tarjeta (marco tipo polaroid, `object-fit: contain`, fecha legible en español, texto opcional, texto alternativo según la spec, `<Picture>` sin ampliar por encima del tamaño original); verificar en el navegador una tarjeta con texto, una sin texto y la foto horizontal de 1600×900
- [x] 7.3 Crear la tarjeta de ráfaga (flipbook mientras está visible, pausa fuera de pantalla, primera foto fija con movimiento reducido); verificar en el navegador con la ráfaga del 13 de septiembre
- [x] 7.4 Crear el componente de capítulo: título, rango, pista horizontal; en escritorio con puntero fino, sección sticky con desplazamiento horizontal ligado al scroll mediante un único listener limitado con `requestAnimationFrame`; en pantallas táctiles y con movimiento reducido, scroll horizontal nativo con `scroll-snap`; flechas de teclado e indicador de progreso. Verificar en el navegador en escritorio, en vista móvil y con movimiento reducido emulado
- [x] 7.5 Crear el índice de capítulos (salto a cada capítulo y marca del capítulo actual); verificar en el navegador que "Mes 2" lleva al capítulo 2 y queda marcado
- [x] 7.6 Crear `src/pages/mes/[n].astro` con `getStaticPaths()` solo para capítulos que superan el umbral, y el enlace "ver todas" desde la landing; verificar con `pnpm build` que hoy no se genera ninguna página `/mes/N` y, con una prueba de `getStaticPaths` que use un catálogo de 30 tarjetas, que sí se genera

## 8. Frase destacada y galería

- [x] 8.1 Crear la sección de frase (texto de `fotos.yaml`, entre `text-4xl` y `text-6xl`, cada palabra pasa del tono atenuado al color pleno de una en una al hacer scroll, ya revelada con movimiento reducido); verificar en el navegador
- [x] 8.2 Crear la galería (todas las fotos publicables en orden, ráfagas como miniaturas individuales, carga diferida); verificar en el navegador que muestra 22 miniaturas y, en el panel de red, que no se descargan antes de acercarse
- [x] 8.3 Crear el visor con `<dialog>`: foto completa, fecha, texto, "N / total", anterior/siguiente con botones, flechas y swipe, controles deshabilitados en los extremos, cierre con botón, Escape o clic fuera, y retorno del foco; verificar en el navegador todos los escenarios de "Abrir y cerrar el visor" y "Navegación en el visor"
- [x] 8.4 Sincronizar el visor con la URL (`#foto=<id>`): abrir desde la URL al cargar, quitar la marca al cerrar, ignorar ids inexistentes; verificar en el navegador los escenarios "Compartir una foto" y "Foto que ya no existe"

## 9. Ensamblado de la landing

- [x] 9.1 Reescribir `src/pages/index.astro` con portada, índice, capítulos, frase, galería y pie de página (créditos y año), y eliminar `src/components/Welcome.astro`, `src/assets/astro.svg` y `src/assets/background.svg`; verificar que `pnpm build` termina y que la página no tiene restos de la plantilla
- [x] 9.2 Crear una página 404 propia con enlace de vuelta a la historia; verificar en el navegador visitando una ruta inexistente con `pnpm preview`

## 10. Verificación integral

- [x] 10.1 Marcar temporalmente una foto como `oculta: true`, compilar y verificar que no aparece en ninguna página ni en `dist/` (buscando su nombre y su imagen); luego revertir la marca
- [x] 10.2 Agregar temporalmente a `src/fotos/` una foto sin fecha (`prueba.jpg`) y verificar que `pnpm build` falla con un mensaje que la nombra; luego eliminarla
- [x] 10.3 Recorrer la landing completa en escritorio y en vista móvil, con tema claro y oscuro, revisando la lista rápida del skill `landing-page-design` (tipografía, espaciado, radios, sin degradados de fondo, estados de foco visibles, sin enlaces muertos); verificar que no hay errores en la consola
- [x] 10.4 Ejecutar `pnpm test`, `pnpm astro check` y `pnpm build` y verificar que los tres terminan sin errores

## Seguimiento del flujo

- Completar el contenido de `fotos.yaml` (textos, destacadas, decidir si se oculta la foto del 9 oct y la frase final) cuando el usuario lo defina.
- Elegir el hosting y desplegar.
- Archivar el cambio con `/opsx:archive` una vez revisado.
