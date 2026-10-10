# Fotos de Rocket

Todo lo que se ve en la landing sale de esta carpeta.

## Agregar una foto

1. Suelta la imagen aquí (`.jpg`, `.jpeg`, `.png`, `.webp` o `.avif`). No hace falta convertirla: Astro genera versiones optimizadas al compilar.
2. Compila (`pnpm build`) o deja corriendo `pnpm dev`.

Listo. La foto aparece en su capítulo y en la galería, con su fecha.

> Consejo: pasa las fotos como **archivo** (o desde la galería del teléfono) en lugar de reenviarlas por WhatsApp. WhatsApp borra la fecha de la cámara y renombra el archivo con la fecha en que se *recibió*.

## De dónde sale la fecha

En este orden:

1. `fecha:` escrita en `fotos.yaml` para esa foto.
2. La fecha de captura guardada dentro de la imagen (EXIF).
3. El nombre del archivo:
   - `20260913_112930.jpg` → 13 sep 2026, 11:29:30 (cámara)
   - `IMG-20260910-WA0016.jpg` → 10 sep 2026, sin hora (WhatsApp)

## Capítulos

Cada capítulo es un mes desde la llegada: con llegada el 9 de septiembre, el capítulo 1 va del 9 sep al 8 oct, el 2 del 9 oct al 8 nov, y así. Los meses sin fotos no se muestran.

Si un capítulo tiene más de 24 tarjetas, la landing muestra 16 (primero las destacadas) y enlaza a una página con el mes completo (`/mes/N`).

Las fotos tomadas con menos de un minuto de diferencia se agrupan en una sola tarjeta que se anima como un flipbook.

## fotos.yaml

```yaml
perro:                       # obligatorio
  nombre: Rocket
  llegada: 2026-09-09        # AAAA-MM-DD

capitulos:                   # opcional: títulos propios por número de capítulo
  1: Su primer mes           # sin título → "Mes N"

frase: |                     # opcional: frase grande antes de la galería
  Llegó cabiendo en dos manos.
  Ahora ocupa la casa entera.

fotos:                       # opcional: solo las fotos que quieras anotar
  IMG-20260909-WA0045.jpg:
    texto: El día que llegó a casa   # se muestra en la tarjeta y el visor
    destacada: true                   # candidata a portada y prioridad en meses grandes
  IMG-20260918-WA0013.jpg:
    fecha: 2026-09-16 08:30           # corrige la fecha (la hora es opcional)
  20261009_124442.webp:
    oculta: true                      # no se publica en ningún lado
```

La **portada** usa la destacada más reciente; si no hay destacadas, la foto más reciente.

## Errores al compilar

| Mensaje | Qué hacer |
|---|---|
| `foto duplicada en varios formatos` | Hay dos archivos con el mismo nombre y distinta extensión. Borra uno. |
| `no tiene fecha` | El nombre no trae fecha y la imagen no tiene EXIF. Agrega `fecha:` para esa foto en `fotos.yaml`, o márcala `oculta: true`. |
| `antes de la llegada` | La fecha obtenida es anterior a `llegada`. Corrige su `fecha:` en `fotos.yaml` u ocúltala. |
| `campo desconocido` | Un campo de `fotos.yaml` está mal escrito (por ejemplo `destacda`). Los válidos son `texto`, `fecha`, `destacada` y `oculta`. |
| `falta el campo` | Falta `nombre` o `llegada` en `perro`. |
| `fecha inválida` | Usa `AAAA-MM-DD` o `AAAA-MM-DD HH:MM`. |

Un **aviso** (no detiene la compilación) indica que `fotos.yaml` anota un archivo que no existe: casi siempre es un nombre mal tipeado.
