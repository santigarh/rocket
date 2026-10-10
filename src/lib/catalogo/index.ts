import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import exifr from 'exifr';
import { construirCapitulos } from './capitulos';
import { ErrorCatalogo } from './errores';
import { parsearConfig, type Config } from './esquema';
import { fechaDesdeExif, type FechaLocal } from './fechas';
import { ordenarFotos } from './orden';
import { agruparRafagas } from './rafagas';
import type { ArchivoFoto, Capitulo, Foto, Tarjeta } from './tipos';
import { construirFotos, esImagen } from './validar';

export type { Capitulo, Foto, Tarjeta } from './tipos';
export { ErrorCatalogo } from './errores';

export const CARPETA_FOTOS = 'src/fotos';
export const FRASE_POR_DEFECTO = 'Cada foto es un día\nque no queremos olvidar.';

export interface Catalogo {
	perro: { nombre: string; llegada: FechaLocal };
	frase: string;
	/** Todas las fotos publicables, en orden cronológico. */
	fotos: Foto[];
	tarjetas: Tarjeta[];
	capitulos: Capitulo[];
	portada: Foto;
	avisos: string[];
}

/** Arma el catálogo a partir de los archivos y la configuración (sin tocar el disco). */
export function armarCatalogo(archivos: ArchivoFoto[], config: Config): Catalogo {
	const { fotos: sueltas, avisos } = construirFotos(archivos, config);
	if (!sueltas.length) {
		throw new ErrorCatalogo('No hay fotos publicables:', [`agrega imágenes a ${CARPETA_FOTOS}`]);
	}
	const fotos = ordenarFotos(sueltas);
	const tarjetas = agruparRafagas(fotos);
	const destacadas = fotos.filter((f) => f.destacada);

	return {
		perro: config.perro,
		frase: config.frase ?? FRASE_POR_DEFECTO,
		fotos,
		tarjetas,
		capitulos: construirCapitulos(tarjetas, config),
		portada: (destacadas.length ? destacadas : fotos).at(-1)!,
		avisos,
	};
}

async function leerExif(ruta: string): Promise<FechaLocal | null> {
	try {
		const datos = await exifr.parse(ruta, { pick: ['DateTimeOriginal'], reviveValues: false });
		return fechaDesdeExif(datos?.DateTimeOriginal);
	} catch {
		return null; // formato sin EXIF legible (p. ej. webp convertido): se usa el nombre
	}
}

export async function leerArchivos(carpeta: string): Promise<ArchivoFoto[]> {
	const entradas = await readdir(carpeta, { withFileTypes: true });
	return Promise.all(
		entradas
			.filter((e) => e.isFile())
			.map(async ({ name }) =>
				esImagen(name) ? { nombre: name, exif: await leerExif(join(carpeta, name)) } : { nombre: name },
			),
	);
}

export async function cargarCatalogo(carpeta = CARPETA_FOTOS): Promise<Catalogo> {
	const [archivos, yaml] = await Promise.all([
		leerArchivos(carpeta),
		readFile(join(carpeta, 'fotos.yaml'), 'utf8').catch(() => {
			throw new ErrorCatalogo('Falta fotos.yaml:', [`crea ${carpeta}/fotos.yaml con el nombre y la llegada del perro`]);
		}),
	]);
	return armarCatalogo(archivos, parsearConfig(yaml));
}

/** Una línea para el log de compilación: "22 fotos · Su primer mes: 19 tarjetas · Mes 2: 1 tarjeta". */
export function resumenCatalogo(c: Catalogo): string {
	const caps = c.capitulos.map((x) => {
		const n = x.tarjetas.length;
		const resumido = x.visibles.length < n ? ` (${x.visibles.length} en la landing)` : '';
		return `${x.titulo}: ${n} ${n === 1 ? 'tarjeta' : 'tarjetas'}${resumido}`;
	});
	return [`${c.fotos.length} fotos`, ...caps, `portada: ${c.portada.nombre}`].join(' · ');
}

let enCurso: Promise<Catalogo> | undefined;

/**
 * Catálogo compartido por todas las páginas de una misma compilación.
 * En `astro dev` se relee en cada petición para que las fotos nuevas aparezcan sin reiniciar.
 */
export function getCatalogo(): Promise<Catalogo> {
	if (import.meta.env?.DEV) return cargarCatalogo();
	enCurso ??= cargarCatalogo().then((c) => {
		for (const aviso of c.avisos) console.warn(`[fotos] ${aviso}`);
		console.info(`[fotos] ${resumenCatalogo(c)}`);
		return c;
	});
	return enCurso;
}
