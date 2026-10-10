# Spec Delta

## Purpose

Define cómo se obtiene el conjunto ordenado y fechado de fotos publicables de Rocket a partir de una carpeta de imágenes y de un archivo opcional de anotaciones `fotos.yaml`, de modo que agregar una foto sea solo soltar un archivo.

## ADDED Requirements

### Requirement: Descubrimiento de fotos desde la carpeta
El sistema SHALL considerar como foto candidata cada archivo con extensión `.jpg`, `.jpeg`, `.png`, `.webp` o `.avif` (sin distinguir mayúsculas) ubicado directamente en la carpeta de fotos del proyecto. El identificador de cada foto SHALL ser su nombre de archivo completo, incluida la extensión.

#### Scenario: Foto nueva soltada en la carpeta
- **WHEN** se agrega `IMG-20261020-WA0003.jpg` a la carpeta de fotos y se compila el sitio
- **THEN** la foto aparece en la historia y en la galería sin editar ningún otro archivo

#### Scenario: Archivo que no es imagen
- **WHEN** la carpeta contiene `notas.txt`
- **THEN** el archivo se ignora y la compilación continúa

### Requirement: Rechazo de fotos duplicadas
El sistema SHALL detener la compilación con un error cuando dos archivos de la carpeta comparten el mismo nombre base con distinta extensión, indicando ambos nombres.

#### Scenario: Misma foto en dos formatos
- **WHEN** la carpeta contiene `20260913_112936.jpg` y `20260913_112936.webp`
- **THEN** la compilación falla con un mensaje que nombra ambos archivos

### Requirement: Datos obligatorios de Rocket
El archivo `fotos.yaml` SHALL declarar el nombre del perro y su fecha de llegada. Si falta alguno de los dos o tiene un formato inválido, la compilación SHALL fallar con un mensaje que indique el campo.

#### Scenario: Falta la fecha de llegada
- **WHEN** `fotos.yaml` declara el nombre pero no la fecha de llegada
- **THEN** la compilación falla indicando que falta la fecha de llegada

### Requirement: Resolución de la fecha de cada foto
El sistema SHALL asignar a cada foto una fecha, y una hora cuando se conozca, usando en este orden de prioridad: la fecha declarada para esa foto en `fotos.yaml`, la fecha de captura incluida en los metadatos de la imagen, y la fecha codificada en el nombre de archivo.

#### Scenario: Corrección manual gana
- **WHEN** `IMG-20260918-WA0013.jpg` tiene `fecha: 2026-09-16` en `fotos.yaml`
- **THEN** la foto se fecha el 16 de septiembre de 2026

#### Scenario: Metadatos de cámara
- **WHEN** una foto sin entrada en `fotos.yaml` tiene fecha de captura 2026-09-13 11:29:36 en sus metadatos
- **THEN** la foto se fecha el 13 de septiembre de 2026 a las 11:29:36

#### Scenario: Nombre de archivo de cámara
- **WHEN** una foto sin metadatos de fecha se llama `20260927_145303.webp`
- **THEN** la foto se fecha el 27 de septiembre de 2026 a las 14:53:03

#### Scenario: Nombre de archivo de WhatsApp
- **WHEN** una foto sin metadatos de fecha se llama `IMG-20260910-WA0016.jpg`
- **THEN** la foto se fecha el 10 de septiembre de 2026, sin hora conocida

### Requirement: Fotos sin fecha determinable
El sistema SHALL detener la compilación con un error cuando una foto publicable no obtiene fecha por ninguna de las fuentes, listando todos los archivos afectados.

#### Scenario: Nombre libre sin metadatos
- **WHEN** la carpeta contiene `rocket-durmiendo.jpg` sin metadatos de fecha ni entrada en `fotos.yaml`
- **THEN** la compilación falla y el mensaje nombra `rocket-durmiendo.jpg` y sugiere declarar su fecha en `fotos.yaml`

### Requirement: Fotos anteriores a la llegada
El sistema SHALL detener la compilación con un error cuando una foto publicable queda fechada antes de la fecha de llegada de Rocket, indicando el archivo y la fecha obtenida.

#### Scenario: Fecha imposible
- **WHEN** la llegada es el 9 de septiembre de 2026 y una foto se fecha el 2 de septiembre de 2026
- **THEN** la compilación falla indicando el archivo y sugiriendo corregir su fecha u ocultarla

### Requirement: Anotaciones opcionales por foto
El sistema SHALL permitir anotar cualquier foto en `fotos.yaml` por su nombre de archivo con: texto, fecha corregida (con hora opcional), marca de destacada y marca de oculta. Una foto sin anotaciones SHALL publicarse solo con su fecha. Un campo desconocido SHALL hacer fallar la compilación.

#### Scenario: Foto con texto
- **WHEN** `20260913_112930.webp` tiene `texto: "Primer paseo por el patio"`
- **THEN** su tarjeta muestra la fecha y ese texto

#### Scenario: Campo mal escrito
- **WHEN** una entrada usa `destacda: true`
- **THEN** la compilación falla indicando el campo desconocido y la foto

### Requirement: Anotaciones huérfanas
El sistema SHALL emitir un aviso, sin detener la compilación, por cada entrada de `fotos.yaml` cuyo archivo no existe en la carpeta de fotos.

#### Scenario: Nombre mal tipeado
- **WHEN** `fotos.yaml` anota `IMG-20260910-WA001.jpg` y ese archivo no existe
- **THEN** la compilación termina y muestra un aviso con ese nombre

### Requirement: Fotos ocultas
Una foto marcada como oculta SHALL excluirse de todo el sitio publicado, incluida la portada, la historia y la galería, y su imagen no SHALL incluirse en el resultado de la compilación.

#### Scenario: Ocultar una foto con otra persona
- **WHEN** `20261009_124442.webp` está marcada `oculta: true`
- **THEN** la foto no aparece en ninguna página ni en los archivos generados

### Requirement: Orden cronológico determinista
El sistema SHALL ordenar las fotos publicables de la más antigua a la más reciente. Dentro de un mismo día, las fotos con hora conocida SHALL ir primero ordenadas por hora, y las fotos sin hora después, ordenadas por el número de secuencia de su nombre y, en último término, alfabéticamente.

#### Scenario: Mismo día sin hora
- **WHEN** existen `IMG-20260910-WA0043.jpg`, `IMG-20260910-WA0010.jpg` e `IMG-20260910-WA0016.jpg`
- **THEN** el orden es WA0010, WA0016, WA0043

#### Scenario: Corregir el orden con hora
- **WHEN** a `IMG-20260910-WA0043.jpg` se le declara `fecha: 2026-09-10 08:00`
- **THEN** pasa a ordenarse por esa hora junto a las fotos del día con hora conocida

### Requirement: Agrupación de ráfagas
El sistema SHALL agrupar en una ráfaga las fotos consecutivas con hora conocida tomadas con menos de 60 segundos de diferencia respecto de la anterior. Las fotos sin hora conocida nunca SHALL formar parte de una ráfaga.

#### Scenario: Tres fotos en 22 segundos
- **WHEN** existen fotos a las 11:29:30, 11:29:36 y 11:29:52 del mismo día
- **THEN** las tres forman una única ráfaga

#### Scenario: Fotos separadas por minutos
- **WHEN** dos fotos del mismo día están separadas por 5 minutos
- **THEN** cada una se presenta por separado
