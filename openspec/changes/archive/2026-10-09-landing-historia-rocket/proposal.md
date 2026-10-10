# Propuesta: landing con la historia de Rocket

## Por qué

Rocket, un cachorro pinscher miniatura, llegó a casa el 9 de septiembre de 2026 y ya hay más de 20 fotos de su primer mes, y seguirán llegando más. Queremos una landing interactiva que cuente su historia en orden cronológico, navegando entre fotografías, sin depender de servicios de generación de video (Higgsfield, Monid) y que se mantenga sola al agregar fotos: soltar un archivo en una carpeta debe bastar.

## Qué cambia

- Se reemplaza la página de bienvenida de Astro por una landing propia de Rocket: portada con su nombre, historia por capítulos, una frase destacada y galería final con visor.
- La historia se organiza en **capítulos mensuales contados desde su llegada** (capítulo 1 = 9 sep → 8 oct). Cada capítulo es una línea de tiempo horizontal y la página crece hacia abajo con cada mes nuevo.
- Las fotos pasan a vivir en `src/fotos/` (hoy están en `public/photos/`) para que Astro las optimice en varios formatos y tamaños; ya no hace falta convertirlas a mano a `.webp`.
- Se introduce `fotos.yaml` como único archivo opcional de anotaciones: datos de Rocket, títulos de capítulo y, por foto, texto, fecha corregida, destacada u oculta.
- La fecha de cada foto se obtiene automáticamente (EXIF, luego nombre de archivo, luego `fotos.yaml`), y el build falla si alguna foto queda sin fecha.
- Las ráfagas (fotos con menos de un minuto de diferencia) se agrupan en una sola tarjeta tipo flipbook.
- Cuando un capítulo crezca demasiado, en la landing solo se muestran sus destacadas y se enlaza a una página propia del mes.
- El diseño visual sigue el skill `landing-page-design` del proyecto (tipografía, espaciados, movimiento, sección de frase que se revela palabra por palabra).

## Capacidades

### Capacidades nuevas

- `catalogo-fotos`: cómo se descubren, fechan, anotan, validan, ordenan y agrupan las fotos de Rocket a partir de la carpeta y de `fotos.yaml`.
- `historia-capitulos`: cómo se presenta la historia: portada, capítulos mensuales desde la llegada, línea de tiempo por capítulo, navegación y comportamiento cuando crece el número de fotos.
- `galeria-fotos`: galería completa de todas las fotos publicadas y visor ampliado con navegación por teclado, swipe y botones.

### Capacidades modificadas

Ninguna (el proyecto no tiene specs previas).

## Impacto

- **Código**: se reemplazan `src/pages/index.astro` y `src/components/Welcome.astro`; se adapta `src/layouts/Layout.astro`; se agregan componentes nuevos y la configuración de content collections (`src/content.config.ts`).
- **Contenido**: las fotos se mueven de `public/photos/` a `src/fotos/`. Hay un duplicado actual (`20260913_112936` existe como `.jpg` y `.webp`) que debe resolverse.
- **Dependencias**: posiblemente un lector de EXIF en build (p. ej. `exifr`) y una fuente permitida por el skill de diseño (Geist o Manrope). Sin dependencias de servicios externos ni de pago.
- **Despliegue**: sigue siendo un sitio estático; agregar fotos requiere volver a compilar.
