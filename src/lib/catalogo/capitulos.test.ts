import { describe, expect, it } from 'vitest';
import {
	construirCapitulos,
	esCapituloGrande,
	numeroCapitulo,
	rangoCapitulo,
	resumir,
	rutasDeCapitulos,
} from './capitulos';
import { fechaDesdeTexto, formatoRango } from './fechas';
import { config, foto } from './prueba-utils';
import { agruparRafagas } from './rafagas';
import type { Tarjeta } from './tipos';

const f = (t: string) => fechaDesdeTexto(t)!;
const LLEGADA = f('2026-09-09');

/** n tarjetas, una por día desde el 9 de noviembre (capítulo 3). */
function tarjetasDelMes(n: number, destacadas: number[] = []): Tarjeta[] {
	return agruparRafagas(
		Array.from({ length: n }, (_, i) => {
			const dia = new Date(Date.UTC(2026, 10, 9 + Math.floor((i * 30) / n)));
			const cuando = dia.toISOString().slice(0, 10);
			return foto(`f${String(i).padStart(2, '0')}.jpg`, { cuando, destacada: destacadas.includes(i) });
		}),
	);
}

describe('numeroCapitulo y rangos', () => {
	it('Primer mes de Rocket: 9 sep – 8 oct; el 9 oct es el capítulo 2', () => {
		expect(numeroCapitulo(f('2026-09-09'), LLEGADA)).toBe(1);
		expect(numeroCapitulo(f('2026-10-08'), LLEGADA)).toBe(1);
		expect(numeroCapitulo(f('2026-10-09'), LLEGADA)).toBe(2);
		const { desde, hasta } = rangoCapitulo(LLEGADA, 1);
		expect(formatoRango(desde, hasta)).toBe('9 sep – 8 oct 2026');
	});

	it('cruza de año', () => {
		expect(numeroCapitulo(f('2027-01-08'), LLEGADA)).toBe(4);
		expect(numeroCapitulo(f('2027-01-09'), LLEGADA)).toBe(5);
		expect(numeroCapitulo(f('2027-09-09'), LLEGADA)).toBe(13);
	});

	it('llegada un día 31: los capítulos se ajustan al último día del mes', () => {
		const l = f('2027-01-31');
		expect(rangoCapitulo(l, 1)).toEqual({ desde: f('2027-01-31'), hasta: f('2027-02-27') });
		expect(rangoCapitulo(l, 2)).toEqual({ desde: f('2027-02-28'), hasta: f('2027-03-30') });
		expect(numeroCapitulo(f('2027-02-28'), l)).toBe(2);
		expect(numeroCapitulo(f('2027-03-31'), l)).toBe(3);
	});
});

describe('construirCapitulos', () => {
	it('Mes sin fotos: se omite sin renumerar', () => {
		const t = agruparRafagas([
			foto('a.jpg', { cuando: '2026-09-10' }),
			foto('b.jpg', { cuando: '2026-10-10' }),
			foto('c.jpg', { cuando: '2026-12-10' }),
		]);
		expect(construirCapitulos(t, config()).map((c) => c.numero)).toEqual([1, 2, 4]);
	});

	it('Título propio y Título por defecto', () => {
		const t = agruparRafagas([foto('a.jpg', { cuando: '2026-09-10' }), foto('b.jpg', { cuando: '2026-10-10' })]);
		const caps = construirCapitulos(t, config('capitulos:\n  1: Su primer mes\n'));
		expect(caps.map((c) => c.titulo)).toEqual(['Su primer mes', 'Mes 2']);
	});
});

describe('resumir capítulos grandes', () => {
	it('Mes con 40 fotos: 16 visibles, incluidas las 3 destacadas, en orden', () => {
		const t = tarjetasDelMes(40, [5, 20, 33]);
		const v = resumir(t);
		expect(v).toHaveLength(16);
		expect(v.filter((x) => x.destacada)).toHaveLength(3);
		expect(v.map((x) => t.indexOf(x))).toEqual([...v.map((x) => t.indexOf(x))].sort((a, b) => a - b));
		// repartidas: ningún hueco enorme entre visibles consecutivas
		const idx = v.map((x) => t.indexOf(x));
		expect(Math.max(...idx.slice(1).map((x, i) => x - idx[i]))).toBeLessThanOrEqual(6);
	});

	it('Más destacadas que el máximo: 16 destacadas', () => {
		const t = tarjetasDelMes(30, Array.from({ length: 20 }, (_, i) => i));
		const v = resumir(t);
		expect(v).toHaveLength(16);
		expect(v.every((x) => x.destacada)).toBe(true);
	});

	it('Primer mes de Rocket completo: 19 tarjetas se muestran todas', () => {
		const t = tarjetasDelMes(19);
		expect(resumir(t)).toBe(t);
	});

	it('el umbral es 24: con 24 no resume, con 25 sí', () => {
		expect(resumir(tarjetasDelMes(24))).toHaveLength(24);
		expect(resumir(tarjetasDelMes(25))).toHaveLength(16);
		const cap = construirCapitulos(tarjetasDelMes(25), config())[0];
		expect(esCapituloGrande(cap)).toBe(true);
	});
});

describe('rutasDeCapitulos (páginas /mes/N)', () => {
	it('genera página solo para capítulos que superan el umbral', () => {
		const pequeno = agruparRafagas([foto('a.jpg', { cuando: '2026-09-10' })]);
		const caps = construirCapitulos([...pequeno, ...tarjetasDelMes(30)], config());
		expect(caps.map((c) => c.numero)).toEqual([1, 3]);
		const rutas = rutasDeCapitulos(caps);
		expect(rutas.map((r) => r.params.n)).toEqual(['3']);
		expect(rutas[0].props.capitulo.tarjetas).toHaveLength(30);
	});

	it('con las fotos de hoy (capítulo de 19 tarjetas) no genera ninguna', () => {
		expect(rutasDeCapitulos(construirCapitulos(tarjetasDelMes(19), config()))).toEqual([]);
	});
});
