import { describe, expect, it } from 'vitest';
import {
	fechaDesdeExif,
	fechaDesdeNombre,
	fechaDesdeTexto,
	formatoCorto,
	formatoLargo,
	formatoRango,
	resolverFecha,
	sumarMeses,
} from './fechas';

describe('fechaDesdeNombre', () => {
	it('Nombre de archivo de cámara: fecha y hora', () => {
		expect(fechaDesdeNombre('20260927_145303.webp')).toEqual({
			fecha: { anio: 2026, mes: 9, dia: 27, hora: { h: 14, m: 53, s: 3 } },
		});
	});

	it('Nombre de archivo de WhatsApp: fecha sin hora y secuencia', () => {
		expect(fechaDesdeNombre('IMG-20260910-WA0016.jpg')).toEqual({
			fecha: { anio: 2026, mes: 9, dia: 10 },
			secuencia: 16,
		});
	});

	it('nombre libre o fecha imposible: sin fecha', () => {
		expect(fechaDesdeNombre('rocket-durmiendo.jpg')).toBeNull();
		expect(fechaDesdeNombre('20260231_120000.jpg')).toBeNull();
	});
});

describe('fechaDesdeTexto y fechaDesdeExif', () => {
	it('acepta día solo o día con hora', () => {
		expect(fechaDesdeTexto('2026-09-16')).toEqual({ anio: 2026, mes: 9, dia: 16 });
		expect(fechaDesdeTexto('2026-09-10 08:00')).toEqual({ anio: 2026, mes: 9, dia: 10, hora: { h: 8, m: 0, s: 0 } });
		expect(fechaDesdeTexto('16/09/2026')).toBeNull();
	});

	it('lee el formato crudo del EXIF', () => {
		expect(fechaDesdeExif('2026:09:13 11:29:36')).toEqual({ anio: 2026, mes: 9, dia: 13, hora: { h: 11, m: 29, s: 36 } });
		expect(fechaDesdeExif(undefined)).toBeNull();
	});
});

describe('resolverFecha', () => {
	const exif = { anio: 2026, mes: 9, dia: 13, hora: { h: 11, m: 29, s: 36 } };
	const nombre = { anio: 2026, mes: 9, dia: 18 };

	it('Corrección manual gana', () => {
		const yaml = fechaDesdeTexto('2026-09-16');
		expect(resolverFecha({ yaml, exif, nombre })).toEqual({ fecha: { anio: 2026, mes: 9, dia: 16 }, fuente: 'yaml' });
	});

	it('Metadatos de cámara ganan al nombre', () => {
		expect(resolverFecha({ exif, nombre })).toEqual({ fecha: exif, fuente: 'exif' });
	});

	it('sin ninguna fuente: null', () => {
		expect(resolverFecha({})).toBeNull();
	});
});

describe('sumarMeses', () => {
	it('suma meses y cruza de año', () => {
		expect(sumarMeses({ anio: 2026, mes: 9, dia: 9 }, 1)).toEqual({ anio: 2026, mes: 10, dia: 9 });
		expect(sumarMeses({ anio: 2026, mes: 11, dia: 9 }, 3)).toEqual({ anio: 2027, mes: 2, dia: 9 });
	});

	it('ajusta al último día del mes', () => {
		expect(sumarMeses({ anio: 2027, mes: 1, dia: 31 }, 1)).toEqual({ anio: 2027, mes: 2, dia: 28 });
	});
});

describe('formato en español', () => {
	const f = { anio: 2026, mes: 9, dia: 16 };
	it('corto, largo y rango', () => {
		expect(formatoCorto(f)).toBe('16 sep 2026');
		expect(formatoLargo(f)).toBe('16 de septiembre de 2026');
		expect(formatoRango({ anio: 2026, mes: 9, dia: 9 }, { anio: 2026, mes: 10, dia: 8 })).toBe('9 sep – 8 oct 2026');
		expect(formatoRango({ anio: 2026, mes: 12, dia: 9 }, { anio: 2027, mes: 1, dia: 8 })).toBe('9 dic 2026 – 8 ene 2027');
	});
});
