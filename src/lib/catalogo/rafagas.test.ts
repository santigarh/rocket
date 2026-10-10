import { describe, expect, it } from 'vitest';
import { foto } from './prueba-utils';
import { agruparRafagas } from './rafagas';

const tamanos = (ts: { fotos: unknown[] }[]) => ts.map((t) => t.fotos.length);

describe('agruparRafagas', () => {
	it('Tres fotos en 22 segundos: una única ráfaga', () => {
		const t = agruparRafagas([
			foto('20260913_112930.webp'),
			foto('20260913_112936.jpg', { texto: 'Caminando hacia la cámara' }),
			foto('20260913_112952.webp'),
		]);
		expect(tamanos(t)).toEqual([3]);
		expect(t[0]).toMatchObject({ id: '20260913_112930', texto: 'Caminando hacia la cámara' });
	});

	it('Fotos separadas por minutos: cada una por separado', () => {
		expect(tamanos(agruparRafagas([foto('20260913_112930.webp'), foto('20260913_113430.webp')]))).toEqual([1, 1]);
	});

	it('las fotos sin hora nunca forman ráfaga', () => {
		const t = agruparRafagas([foto('IMG-20260910-WA0010.jpg'), foto('IMG-20260910-WA0013.jpg')]);
		expect(tamanos(t)).toEqual([1, 1]);
	});

	it('la ráfaga se corta cuando una foto supera los 60 s respecto de la anterior', () => {
		const t = agruparRafagas([
			foto('20260913_112900.webp'),
			foto('20260913_112950.webp'),
			foto('20260913_113040.webp'),
			foto('20260913_113200.webp'),
		]);
		expect(tamanos(t)).toEqual([3, 1]);
	});

	it('una ráfaga es destacada si alguna de sus fotos lo es', () => {
		const t = agruparRafagas([foto('20260913_112930.webp'), foto('20260913_112936.jpg', { destacada: true })]);
		expect(t[0].destacada).toBe(true);
	});
});
