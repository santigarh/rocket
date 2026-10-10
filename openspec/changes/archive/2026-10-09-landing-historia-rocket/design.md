# Diseño: landing con la historia de Rocket

## Contexto

Ver `proposal.md` (Por qué) y las specs `catalogo-fotos`, `historia-capitulos` y `galeria-fotos` para los requisitos.

Estado actual relevante:

- Proyecto Astro 7 recién creado: solo `index.astro`, `Welcome.astro` y `Layout.astro` de la plantilla. Sin Tailwind, sin frameworks de UI, sin tests. Gestor de paquetes: pnpm.
- `public/photos/` tiene 23 archivos (22 fotos distintas). Hay 9 `.webp` convertidos con sharp y 13 `.jpg` nuevos, con fechas entre el 9 sep y el 9 oct 2026.
- **Hallazgo:** la conversión previa a `.webp` eliminó los metadatos EXIF. Las fotos de WhatsApp (`IMG-*-WA*.jpg`) tampoco traen EXIF, porque WhatsApp lo elimina. Hoy la única fuente de fecha confiable es el nombre de archivo. Solo `20260913_112936.jpg` conserva su fecha de captura en EXIF.
- **Hallazgo:** `20260913_112936` existe como `.jpg` y como `.webp` (duplicado).
- Fotos pequeñas: casi todas son verticales de 543×965 o 724×965, y hay una horizontal de 1600×900. Ninguna aguanta un formato a pantalla completa en escritorio.
- El proyecto incluye el skill `.claude/skills/landing-page-design`, que fija reglas visuales: tipografía, escala, espaciado, radios, movimiento y la sección de frase.

## Objetivos / No objetivos

**Objetivos:**
- Toda la lógica de fotos (fechas, orden, capítulos, ráfagas, validación) corre **en build** y produce un sitio 100 % estático.
- La lógica del catálogo vive en funciones puras, separadas de Astro, para poder probarla.
- Cero servicios externos o de pago.

**No objetivos:**
- Subir fotos desde el navegador o cualquier panel de administración.
- Video, generación de imágenes con IA o efectos 3D.
- Varios perros o varios idiomas.
- Decidir el hosting (ver Preguntas abiertas).

## Decisiones

### 1. Fotos en `src/fotos/` con el pipeline de imágenes de Astro
Las fotos se mueven a `src/fotos/` y se renderizan con `<Picture>` de `astro:assets`, que genera AVIF y WebP en varios anchos (`srcset`) y sirve al celular versiones livianas.
- *Alternativa descartada:* mantenerlas en `public/` y convertirlas con un script propio. Ofrece control total, pero duplica lo que Astro ya hace, obliga a mantener el script y no genera `srcset`.
- *Consecuencia:* se pueden soltar `.jpg` directos del celular, sin convertir. Así además se conserva el EXIF del original.

### 2. `fotos.yaml` junto a las fotos, validado con un esquema
`src/fotos/fotos.yaml` contiene `perro` (nombre, llegada), `capitulos` (títulos opcionales por número), `frase` (opcional) y `fotos` (anotaciones por nombre de archivo). Se valida con un esquema zod **estricto**, de modo que un campo desconocido produce un error, como pide la spec.
- *Alternativa descartada:* content collection con `file()` loader. Encaja con Astro, pero el catálogo necesita cruzar el yaml con el listado de archivos y con el EXIF de todos modos. Cargar y validar el yaml dentro del mismo módulo del catálogo deja toda la lógica en un solo lugar y la hace testeable sin levantar Astro.
- Ubicarlo dentro de la carpeta refuerza la idea de que todo lo de las fotos vive en un solo lugar. La regla de descubrimiento ignora lo que no es imagen.

### 3. Módulo de catálogo puro + adaptador de Astro
```
src/lib/catalogo/
  fechas.ts      parseo de nombre de archivo, prioridad yaml > EXIF > nombre
  orden.ts       orden determinista (dia, hora, secuencia WA, nombre)
  rafagas.ts     agrupacion < 60 s
  capitulos.ts   N = meses desde la llegada, recorte de capitulos grandes
  validar.ts     duplicados, sin fecha, antes de la llegada, huerfanas, campos
  index.ts       getCatalogo(): junta todo y devuelve el modelo listo para pintar
```
- El adaptador lista los archivos de `src/fotos/` con `fs`, lee el EXIF con **`exifr`** (solo `DateTimeOriginal`, leyendo el mínimo de bytes) y asocia cada nombre con su import de imagen mediante `import.meta.glob`.
- Los errores se lanzan con un mensaje que lista **todos** los archivos afectados de una vez, no solo el primero.
- *Alternativa descartada:* `sharp().metadata()` para el EXIF. Ya está instalado, pero devuelve el EXIF como buffer crudo y habría que parsearlo a mano.

### 4. Fechas "locales" sin zona horaria
Cada fecha se representa como componentes `{año, mes, día, hora?}` y no como `Date` en UTC, para evitar que una foto de las 23:30 cambie de día según la zona horaria del build. El formato para mostrarla usa `Intl.DateTimeFormat('es')`.
- Los capítulos se calculan sumando meses a la fecha de llegada y ajustando al último día del mes cuando haga falta, como dice la spec.

### 5. Línea de tiempo: scroll fijado en escritorio, scroll nativo en táctil
```
 Escritorio (puntero fino, ancho >= 768 px)
 +-- seccion del capitulo (alto = ancho total de la pista) --------+
 |  +-- contenedor sticky (100vh) ------------------------------+  |
 |  |  [titulo + rango]                                         |  |
 |  |  [tarjeta][tarjeta][tarjeta]... --> translateX(progreso)  |  |
 |  |  ===========*======================== progreso            |  |
 |  +-----------------------------------------------------------+  |
 +-----------------------------------------------------------------+

 Tactil / movimiento reducido
   [tarjeta][tarjeta][tarjeta] ...  overflow-x + scroll-snap (nativo)
```
- El progreso se calcula con **un único listener de scroll limitado con `requestAnimationFrame`**, permitido por el skill, y solo para la sección visible, que se detecta con `IntersectionObserver`.
- *Alternativa descartada:* CSS scroll-driven animations (`animation-timeline`). Es más elegante, pero su soporte entre navegadores aún no es parejo y la spec exige que funcione en todos. Se puede adoptar más adelante como mejora progresiva.
- *Alternativa descartada:* librerías (GSAP ScrollTrigger, Swiper). Funcionan, pero suman peso y una dependencia para un efecto de unas 100 líneas.
- Las tarjetas usan `object-fit: contain` dentro de un marco tipo polaroid, así ninguna foto se recorta. La horizontal de 1600×900 ocupa una tarjeta más ancha.

### 6. Visor con `<dialog>` nativo
El visor usa `<dialog>` con `showModal()`, que trae gratis el atrapado de foco, el cierre con Escape y la capa de fondo. La URL usa `#foto=<nombre-sin-extensión>`, y al cargar se abre el visor si ese id existe. El swipe se implementa con Pointer Events.

### 7. Páginas de capítulo solo cuando hacen falta
`src/pages/mes/[n].astro` usa `getStaticPaths()` para generar páginas **solo** para los capítulos que superan el umbral de la spec.
- Umbral: más de 24 tarjetas → la landing muestra 16 (destacadas primero, luego repartidas en el tiempo). Se eligió 24/16 en lugar del 12/8 inicial porque con las fotos actuales el capítulo 1 (9 sep – 8 oct) ya tiene 19 tarjetas (21 fotos, con la ráfaga del 13 sep agrupada) y el primer mes debe verse completo. El capítulo 2 tiene 1 foto (la del 9 oct). Hoy no se genera ninguna página de capítulo.
- Umbral y máximo se definen como constantes en `capitulos.ts` para poder ajustarlos sin tocar el resto.

### 8. Sistema visual según `landing-page-design`
- Tailwind v4 (`astro add tailwind`), porque las reglas del skill están expresadas en su escala de tipografía y espaciado.
- Fuente **Geist** autoalojada (`@fontsource-variable/geist`), sin italicas y con peso máximo semibold/bold.
- Íconos de Phosphor como SVG en línea; solo hacen falta unos pocos (flechas, cerrar).
- Easing `cubic-bezier(0.32,0.72,0,1)` para las transiciones; apariciones al hacer scroll con `IntersectionObserver`.
- La landing se monta en este orden: portada → capítulos → frase → galería → pie de página.
- **Tema automático:** los colores se definen como variables CSS en `:root` (tema claro) y se redefinen bajo `@media (prefers-color-scheme: dark)`. En el tema oscuro se usan solo los fondos permitidos por el skill (`#181818`, `#1F1F1F`, `#272727`). El degradado del título de portada cambia según el tema: `#000→#666` en claro y `#FFF→#9B9B9B` en oscuro. No hay selector manual de tema.

### 9. Tests del catálogo con Vitest
Se agrega `vitest` para cubrir las funciones puras: parseo de nombres, prioridad de fechas, orden, ráfagas, límites de capítulo y validaciones. Cada escenario de la spec `catalogo-fotos` y los de capítulos se traducen en casos de prueba. La parte visual se verifica a mano en el navegador.

## Riesgos / Compromisos

- **[Un mes muy fotografiado puede superar las 24 tarjetas y verse resumido en la landing]** → Es el comportamiento buscado: el resumen prioriza las destacadas y la página `/mes/N` muestra el capítulo completo. Si se quiere ver más, basta ajustar las constantes del umbral.
- **[La fecha de WhatsApp es la de recepción, no la de captura]** → Puede desordenar fotos. Mitigación: corrección por foto en `fotos.yaml` (con hora) y, para fotos futuras, pasarlas como archivo o desde la galería del teléfono para conservar el EXIF.
- **[Las fotos ocultas podrían terminar en `dist/` igualmente]** → Confirmado en la implementación: aun con el glob no `eager`, Vite emite el original de toda imagen que encuentra el glob. Mitigación aplicada: la integración `integraciones/fotos-ocultas.ts` borra en `astro:build:done` los archivos de `dist/_astro` de las fotos marcadas `oculta: true` (verificado: 0 archivos de la foto oculta en `dist/`).
- **[El scroll fijado se siente como "secuestro" del scroll]** → Solo se activa con puntero fino; en táctil y con movimiento reducido el scroll es nativo. La pista avanza 1:1 con el scroll, sin inercia artificial.
- **[Fotos de baja resolución, 965 px de alto]** → La tarjeta se limita a su tamaño natural, con `max-height` de unos 80vh y sin ampliar por encima de 1×, y `<Picture>` no genera anchos mayores que el original.
- **[El repo crece con cada foto]** → Aceptable por ahora, con unos 3–4 MB. Si supera los ~200 MB, evaluar Git LFS.
- **[Tiempo de build con muchas fotos]** → Astro cachea las imágenes optimizadas entre builds (`node_modules/.astro`), así que solo se procesan las fotos nuevas.

## Plan de migración

1. Mover `public/photos/*` a `src/fotos/`.
2. Resolver el duplicado `20260913_112936`: conservar el `.jpg`, que tiene EXIF, y borrar el `.webp`.
3. Crear `src/fotos/fotos.yaml` con `perro: { nombre: Rocket, llegada: 2026-09-09 }` y el título "Su primer mes" para el capítulo 1.
4. Reemplazar la página de bienvenida.
5. Rollback: el cambio es solo de contenido y código estático; basta revertir el commit.

## Preguntas abiertas

- **Paleta exacta del tema claro:** el tono de acento y el fondo claro concretos se eligen durante la implementación a partir de las fotos (negro y fuego de Rocket, verdes del pasto). Solo cambia valores de variables.
- **Foto del 9 oct con una persona:** ¿se publica o se marca `oculta`? Es contenido de `fotos.yaml`.
- **Textos y destacadas:** qué fotos llevan frase y cuáles son destacadas. También es contenido de `fotos.yaml` y se puede completar después.
- **Texto de la frase destacada:** se puede definir después; hay un valor por defecto.
- **Hosting:** Netlify, Vercel, GitHub Pages u otro. No afecta el build estático.
