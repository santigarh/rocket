import { compararDia, segundosDelDia } from './fechas';
import type { Foto } from './tipos';

/**
 * Orden cronológico determinista: por día; dentro del día, primero las fotos con
 * hora (por hora), después las sin hora (por secuencia de WhatsApp) y, al final,
 * por nombre.
 */
export function compararFotos(a: Foto, b: Foto): number {
	const dia = compararDia(a.fecha, b.fecha);
	if (dia !== 0) return dia;

	const ha = a.fecha.hora, hb = b.fecha.hora;
	if (ha && !hb) return -1;
	if (!ha && hb) return 1;
	if (ha && hb) {
		const hora = segundosDelDia(ha) - segundosDelDia(hb);
		if (hora !== 0) return hora;
	}

	const sec = (a.secuencia ?? Infinity) - (b.secuencia ?? Infinity);
	if (sec !== 0 && !Number.isNaN(sec)) return sec;

	return a.nombre.localeCompare(b.nombre);
}

export function ordenarFotos(fotos: Foto[]): Foto[] {
	return [...fotos].sort(compararFotos);
}
