import type { FechaLocal, FuenteFecha } from './fechas';

/** Lo que el adaptador sabe de cada archivo de la carpeta antes de validarlo. */
export interface ArchivoFoto {
	nombre: string;
	/** DateTimeOriginal leído del EXIF, si existe. */
	exif?: FechaLocal | null;
}

export interface Foto {
	/** Nombre de archivo; es la clave en fotos.yaml. */
	nombre: string;
	/** Nombre sin extensión; se usa en la URL del visor. */
	id: string;
	fecha: FechaLocal;
	fuente: FuenteFecha;
	/** Secuencia de WhatsApp, para ordenar fotos del mismo día sin hora. */
	secuencia?: number;
	texto?: string;
	destacada: boolean;
}

/** Una tarjeta de la historia: una foto suelta o una ráfaga (varias fotos). */
export interface Tarjeta {
	id: string;
	fotos: Foto[];
	fecha: FechaLocal;
	texto?: string;
	destacada: boolean;
}

export interface Capitulo {
	numero: number;
	titulo: string;
	/** Primer día del capítulo (inclusive). */
	desde: FechaLocal;
	/** Último día del capítulo (inclusive). */
	hasta: FechaLocal;
	tarjetas: Tarjeta[];
	/** Tarjetas que se muestran en la landing (todas, o el resumen si el capítulo es grande). */
	visibles: Tarjeta[];
}
