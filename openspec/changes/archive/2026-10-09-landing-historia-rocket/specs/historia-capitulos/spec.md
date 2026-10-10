# Spec Delta

## Purpose

Define cómo la landing cuenta la historia de Rocket en orden cronológico: portada, capítulos mensuales contados desde su llegada, línea de tiempo dentro de cada capítulo y cómo se adapta la presentación a medida que crece el número de fotos.

## ADDED Requirements

### Requirement: Portada
La landing SHALL abrir con una portada que muestre el nombre de Rocket, la fecha de su llegada y una foto de portada. La foto de portada SHALL ser la destacada más reciente o, si no hay destacadas, la foto publicable más reciente.

#### Scenario: Con destacadas
- **WHEN** hay dos fotos destacadas, del 13 de septiembre y del 5 de octubre
- **THEN** la portada usa la del 5 de octubre

#### Scenario: Sin destacadas
- **WHEN** ninguna foto está marcada como destacada
- **THEN** la portada usa la foto publicable más reciente

### Requirement: Capítulos mensuales desde la llegada
El sistema SHALL agrupar las fotos en capítulos numerados desde 1. El capítulo N SHALL abarcar desde la fecha de llegada más N-1 meses (inclusive) hasta la fecha de llegada más N meses (exclusive). Si ese día no existe en el mes, SHALL usarse el último día del mes.

#### Scenario: Primer mes de Rocket
- **WHEN** la llegada es el 9 de septiembre de 2026
- **THEN** el capítulo 1 abarca del 9 de septiembre al 8 de octubre de 2026, y una foto del 9 de octubre de 2026 pertenece al capítulo 2

### Requirement: Capítulos sin fotos
Solo los capítulos con al menos una foto publicable SHALL mostrarse. Un capítulo sin fotos no SHALL renumerar a los siguientes.

#### Scenario: Mes sin fotos
- **WHEN** hay fotos en los capítulos 1, 2 y 4, y ninguna en el 3
- **THEN** se muestran los capítulos 1, 2 y 4 con esos números

### Requirement: Título y rango de cada capítulo
Cada capítulo SHALL mostrar su título y su rango de fechas. El título SHALL ser el declarado para ese número de capítulo en `fotos.yaml` o, si no hay uno, "Mes N".

#### Scenario: Título propio
- **WHEN** `fotos.yaml` declara el título "Su primer mes" para el capítulo 1
- **THEN** el capítulo 1 muestra "Su primer mes" y el rango "9 sep – 8 oct 2026"

#### Scenario: Título por defecto
- **WHEN** el capítulo 2 no tiene título declarado
- **THEN** el capítulo 2 se titula "Mes 2"

### Requirement: Orden de lectura de la historia
Los capítulos SHALL presentarse de arriba hacia abajo del más antiguo al más reciente, y dentro de cada capítulo las tarjetas SHALL presentarse de izquierda a derecha en orden cronológico.

#### Scenario: Recorrido completo
- **WHEN** un visitante recorre la página de principio a fin
- **THEN** ve todas las tarjetas publicadas en orden cronológico, sin saltos hacia atrás

### Requirement: Tarjeta de foto
Cada tarjeta SHALL mostrar la foto completa sin recortes que oculten al sujeto, su fecha en formato legible en español y el texto de la foto cuando exista. Cada imagen SHALL tener texto alternativo: el texto de la foto o, si no tiene, "Rocket" seguido de la fecha.

#### Scenario: Tarjeta sin texto
- **WHEN** una foto del 16 de septiembre de 2026 no tiene texto
- **THEN** la tarjeta muestra "16 sep 2026" y la imagen tiene el texto alternativo "Rocket, 16 de septiembre de 2026"

### Requirement: Tarjeta de ráfaga
Una ráfaga SHALL presentarse como una única tarjeta que recorre sus fotos en secuencia, como un flipbook, mientras está visible. Su texto SHALL ser el de la primera foto de la ráfaga que tenga texto.

#### Scenario: Ráfaga visible
- **WHEN** la tarjeta de una ráfaga de tres fotos entra en pantalla
- **THEN** muestra las tres fotos en orden, una tras otra

### Requirement: Navegación dentro de un capítulo
La línea de tiempo de cada capítulo SHALL poder recorrerse con la rueda o el scroll vertical en escritorio, con deslizamiento horizontal en pantallas táctiles y con las flechas izquierda y derecha del teclado cuando tiene el foco. Cada capítulo SHALL mostrar un indicador de progreso.

#### Scenario: Scroll en escritorio
- **WHEN** en escritorio el visitante hace scroll hacia abajo sobre un capítulo
- **THEN** la línea de tiempo avanza horizontalmente hasta la última tarjeta antes de pasar al capítulo siguiente

#### Scenario: Teclado
- **WHEN** la línea de tiempo tiene el foco y el visitante pulsa la flecha derecha
- **THEN** avanza a la tarjeta siguiente

### Requirement: Índice de capítulos
La landing SHALL ofrecer un índice para saltar directamente a cualquier capítulo visible y SHALL indicar en qué capítulo se encuentra el visitante.

#### Scenario: Saltar al mes 2
- **WHEN** el visitante elige "Mes 2" en el índice
- **THEN** la página se desplaza al inicio del capítulo 2 y el índice lo marca como actual

### Requirement: Capítulos grandes
Cuando un capítulo tiene más de 24 tarjetas, la landing SHALL mostrar como máximo 16: primero sus destacadas y luego, hasta completar, tarjetas repartidas uniformemente en el tiempo, siempre en orden cronológico. SHALL enlazar a una página propia del capítulo con todas sus tarjetas.

#### Scenario: Mes con 40 fotos
- **WHEN** el capítulo 3 tiene 40 tarjetas, 3 de ellas destacadas
- **THEN** la landing muestra 16 tarjetas del capítulo 3, incluidas las 3 destacadas, y un enlace a la página del capítulo 3 con las 40

#### Scenario: Más destacadas que el máximo
- **WHEN** un capítulo tiene 30 tarjetas y 20 de ellas son destacadas
- **THEN** la landing muestra 16 destacadas repartidas uniformemente en el tiempo

#### Scenario: Primer mes de Rocket completo
- **WHEN** el capítulo 1 tiene 19 tarjetas
- **THEN** la landing las muestra todas y no enlaza a una página propia

### Requirement: Frase destacada
La landing SHALL incluir, después de la historia y antes de la galería, una sección con una frase de al menos dos líneas cuyas palabras pasan de un tono atenuado a su color pleno, una a una, a medida que la sección entra en pantalla. El texto SHALL poder configurarse en `fotos.yaml` y tener un valor por defecto.

#### Scenario: Frase configurada
- **WHEN** `fotos.yaml` declara una frase
- **THEN** la sección muestra esa frase y la revela palabra por palabra al hacer scroll

### Requirement: Movimiento reducido
Cuando el visitante tiene activada la preferencia de movimiento reducido, la landing no SHALL secuestrar el scroll ni animar ráfagas o frases. Cada línea de tiempo SHALL ser una lista horizontal desplazable de forma nativa y la frase SHALL mostrarse ya revelada.

#### Scenario: Movimiento reducido activo
- **WHEN** el sistema del visitante pide movimiento reducido
- **THEN** el scroll vertical desplaza la página normalmente, las ráfagas muestran su primera foto y la frase aparece completa

### Requirement: Metadatos para compartir
La landing SHALL declarar título, descripción e imagen para compartir en redes. La imagen SHALL ser la foto de portada.

#### Scenario: Enlace compartido
- **WHEN** alguien comparte la URL de la landing en una app de mensajería
- **THEN** la vista previa muestra el nombre de Rocket y la foto de portada
