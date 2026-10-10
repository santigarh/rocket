import { numeroDeDia, segundosDelDia, type FechaLocal } from './fechas';
import type { Foto, Tarjeta } from './tipos';

export const SEGUNDOS_RAFAGA = 60;

function instante(f: FechaLocal): number | null {
	return f.hora ? numeroDeDia(f) * 86_400 + segundosDelDia(f.hora) : null;
}

/**
 * Agrupa en tarjetas las fotos ya ordenadas. Las consecutivas con hora conocida y
 * a menos de 60 s de la anterior forman una ráfaga; las fotos sin hora van solas.
 */
export function agruparRafagas(fotos: Foto[]): Tarjeta[] {
	const grupos: Foto[][] = [];
	let anterior: number | null = null;

	for (const foto of fotos) {
		const t = instante(foto.fecha);
		const ultimo = grupos.at(-1);
		if (ultimo && t !== null && anterior !== null && t - anterior < SEGUNDOS_RAFAGA) {
			ultimo.push(foto);
		} else {
			grupos.push([foto]);
		}
		anterior = t;
	}

	return grupos.map((g) => ({
		id: g[0].id,
		fotos: g,
		fecha: g[0].fecha,
		texto: g.find((f) => f.texto)?.texto,
		destacada: g.some((f) => f.destacada),
	}));
}
