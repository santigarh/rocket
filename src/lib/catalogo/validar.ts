import { ErrorCatalogo } from './errores';
import type { Config } from './esquema';
import { compararDia, fechaDesdeNombre, formatoLargo, resolverFecha } from './fechas';
import type { ArchivoFoto, Foto } from './tipos';

const RE_IMAGEN = /\.(jpe?g|png|webp|avif)$/i;

export function esImagen(nombre: string): boolean {
	return RE_IMAGEN.test(nombre);
}

export function sinExtension(nombre: string): string {
	return nombre.replace(/\.[^.]+$/, '');
}

/**
 * Cruza los archivos de la carpeta con fotos.yaml y devuelve las fotos publicables.
 * Junta todos los problemas y lanza un único ErrorCatalogo; las anotaciones
 * huérfanas no detienen la compilación y se devuelven como avisos.
 */
export function construirFotos(archivos: ArchivoFoto[], config: Config): { fotos: Foto[]; avisos: string[] } {
	const imagenes = archivos.filter((a) => esImagen(a.nombre));
	const problemas: string[] = [];

	const porBase = new Map<string, string[]>();
	for (const { nombre } of imagenes) {
		const base = sinExtension(nombre).toLowerCase();
		porBase.set(base, [...(porBase.get(base) ?? []), nombre]);
	}
	for (const nombres of porBase.values()) {
		if (nombres.length > 1) {
			problemas.push(`foto duplicada en varios formatos: ${nombres.join(', ')} (deja solo uno)`);
		}
	}

	const fotos: Foto[] = [];
	for (const { nombre, exif } of imagenes) {
		const anotacion = config.fotos.get(nombre);
		if (anotacion?.oculta) continue;

		const deNombre = fechaDesdeNombre(nombre);
		const resuelta = resolverFecha({ yaml: anotacion?.fecha, exif, nombre: deNombre?.fecha });
		if (!resuelta) {
			problemas.push(`${nombre}: no tiene fecha; declárala en fotos.yaml (fecha: AAAA-MM-DD)`);
			continue;
		}
		if (compararDia(resuelta.fecha, config.perro.llegada) < 0) {
			problemas.push(
				`${nombre}: quedó fechada el ${formatoLargo(resuelta.fecha)}, antes de la llegada ` +
					`(${formatoLargo(config.perro.llegada)}); corrige su fecha u ocúltala en fotos.yaml`,
			);
			continue;
		}
		fotos.push({
			nombre,
			id: sinExtension(nombre),
			fecha: resuelta.fecha,
			fuente: resuelta.fuente,
			secuencia: deNombre?.secuencia,
			texto: anotacion?.texto,
			destacada: anotacion?.destacada ?? false,
		});
	}

	if (problemas.length) throw new ErrorCatalogo('Hay problemas con las fotos:', problemas);

	const existentes = new Set(imagenes.map((a) => a.nombre));
	const avisos = [...config.fotos.keys()]
		.filter((n) => !existentes.has(n))
		.map((n) => `fotos.yaml anota "${n}", pero ese archivo no está en la carpeta de fotos`);

	return { fotos, avisos };
}
