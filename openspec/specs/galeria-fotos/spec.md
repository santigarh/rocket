# galeria-fotos Specification

## Purpose

Define la galería completa con todas las fotos publicadas de Rocket y el visor ampliado que permite recorrerlas una a una, como cierre de la landing y como forma rápida de encontrar cualquier foto.

## Requirements

### Requirement: Galería completa
La landing SHALL terminar con una galería que muestre todas las fotos publicables en orden cronológico, cada una con su fecha. Las fotos de una ráfaga SHALL aparecer como miniaturas individuales.

#### Scenario: Ráfaga en la galería
- **WHEN** existe una ráfaga de tres fotos
- **THEN** la galería muestra tres miniaturas consecutivas

#### Scenario: Foto oculta
- **WHEN** una foto está marcada como oculta
- **THEN** no aparece en la galería

### Requirement: Carga diferida de miniaturas
Las imágenes de la galería que no están en pantalla al cargar la página no SHALL descargarse hasta que el visitante se acerque a ellas.

#### Scenario: Carga inicial
- **WHEN** el visitante abre la landing y no ha llegado a la galería
- **THEN** no se descarga ninguna miniatura de la galería

### Requirement: Abrir y cerrar el visor
Activar una miniatura SHALL abrir un visor que muestre esa foto ampliada, completa y sin recortes, con su fecha, su texto si lo tiene y su posición "N / total". El visor SHALL cerrarse con un botón visible, con la tecla Escape o tocando fuera de la foto, y el foco SHALL volver a la miniatura que lo abrió.

#### Scenario: Abrir una foto
- **WHEN** el visitante activa la quinta miniatura de 21
- **THEN** el visor muestra esa foto ampliada con "5 / 21"

#### Scenario: Cerrar con Escape
- **WHEN** el visor está abierto y el visitante pulsa Escape
- **THEN** el visor se cierra y el foco queda en la miniatura de origen

### Requirement: Navegación en el visor
Dentro del visor, el visitante SHALL poder ir a la foto anterior o siguiente con botones visibles, con las flechas del teclado y deslizando en pantallas táctiles. En la primera y en la última foto, el control que no tiene destino SHALL mostrarse deshabilitado.

#### Scenario: Siguiente con teclado
- **WHEN** el visor muestra la foto 5 y el visitante pulsa la flecha derecha
- **THEN** el visor muestra la foto 6 con "6 / 21"

#### Scenario: Última foto
- **WHEN** el visor muestra la última foto
- **THEN** el control "siguiente" aparece deshabilitado

### Requirement: Enlace directo a una foto
Cada foto abierta en el visor SHALL reflejarse en la URL de la página, de modo que abrir esa URL lleve a la landing con el visor abierto en esa foto. Cerrar el visor SHALL quitar esa marca de la URL.

#### Scenario: Compartir una foto
- **WHEN** alguien abre una URL copiada mientras el visor mostraba la foto del 27 de septiembre
- **THEN** la landing carga con el visor abierto en esa foto

#### Scenario: Foto que ya no existe
- **WHEN** la URL apunta a una foto que se ocultó o se eliminó
- **THEN** la landing carga normalmente con el visor cerrado
