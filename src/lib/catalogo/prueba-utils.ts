// Utilidades compartidas por las pruebas del catálogo.
import { parsearConfig } from './esquema';
import { fechaDesdeNombre, fechaDesdeTexto } from './fechas';
import { sinExtension } from './validar';
import type { Foto } from './tipos';

export const LLEGADA = '2026-09-09';

export function config(extra = '') {
	return parsearConfig(`perro:\n  nombre: Rocket\n  llegada: ${LLEGADA}\n${extra}`);
}

/** Foto a partir de su nombre (fecha del nombre) o de una fecha explícita. */
export function foto(nombre: string, opciones: Partial<Foto> & { cuando?: string } = {}): Foto {
	const { cuando, ...resto } = opciones;
	const deNombre = fechaDesdeNombre(nombre);
	const fecha = cuando ? fechaDesdeTexto(cuando)! : deNombre!.fecha;
	return {
		nombre,
		id: sinExtension(nombre),
		fecha,
		fuente: cuando ? 'yaml' : 'nombre',
		secuencia: deNombre?.secuencia,
		destacada: false,
		...resto,
	};
}
