import { describe, expect, it } from 'vitest';
import { ordenarFotos } from './orden';
import { foto } from './prueba-utils';

const nombres = (fs: { nombre: string }[]) => fs.map((f) => f.nombre);

describe('ordenarFotos', () => {
	it('ordena por día', () => {
		const r = ordenarFotos([foto('IMG-20261002-WA0025.jpg'), foto('IMG-20260909-WA0045.jpg'), foto('20260927_145303.webp')]);
		expect(nombres(r)).toEqual(['IMG-20260909-WA0045.jpg', '20260927_145303.webp', 'IMG-20261002-WA0025.jpg']);
	});

	it('Mismo día sin hora: por secuencia de WhatsApp', () => {
		const r = ordenarFotos([
			foto('IMG-20260910-WA0043.jpg'),
			foto('IMG-20260910-WA0010.jpg'),
			foto('IMG-20260910-WA0016.jpg'),
		]);
		expect(nombres(r)).toEqual(['IMG-20260910-WA0010.jpg', 'IMG-20260910-WA0016.jpg', 'IMG-20260910-WA0043.jpg']);
	});

	it('Corregir el orden con hora: pasa delante de las fotos sin hora', () => {
		const r = ordenarFotos([
			foto('IMG-20260910-WA0010.jpg'),
			foto('IMG-20260910-WA0043.jpg', { cuando: '2026-09-10 08:00' }),
			foto('IMG-20260910-WA0016.jpg'),
		]);
		expect(nombres(r)).toEqual(['IMG-20260910-WA0043.jpg', 'IMG-20260910-WA0010.jpg', 'IMG-20260910-WA0016.jpg']);
	});

	it('con hora: por hora; sin secuencia: por nombre', () => {
		const r = ordenarFotos([
			foto('b.jpg', { cuando: '2026-09-12' }),
			foto('20260912_180000.jpg'),
			foto('a.jpg', { cuando: '2026-09-12' }),
			foto('20260912_090000.jpg'),
		]);
		expect(nombres(r)).toEqual(['20260912_090000.jpg', '20260912_180000.jpg', 'a.jpg', 'b.jpg']);
	});
});
