import { describe, expect, it } from 'vitest';
import { ErrorCatalogo } from './errores';
import { config } from './prueba-utils';
import { construirFotos, esImagen } from './validar';

function problemas(fn: () => unknown): string[] {
	try {
		fn();
	} catch (e) {
		if (e instanceof ErrorCatalogo) return e.problemas;
		throw e;
	}
	throw new Error('se esperaba un ErrorCatalogo');
}

describe('esImagen', () => {
	it('acepta las extensiones de imagen sin distinguir mayúsculas', () => {
		for (const n of ['a.jpg', 'a.JPEG', 'a.png', 'a.webp', 'a.avif']) expect(esImagen(n)).toBe(true);
	});
	it('Archivo que no es imagen: se ignora', () => {
		expect(esImagen('notas.txt')).toBe(false);
		expect(esImagen('fotos.yaml')).toBe(false);
	});
});

describe('construirFotos', () => {
	it('Foto nueva soltada en la carpeta: aparece sin anotaciones', () => {
		const { fotos, avisos } = construirFotos([{ nombre: 'IMG-20261020-WA0003.jpg' }, { nombre: 'notas.txt' }], config());
		expect(fotos.map((f) => f.nombre)).toEqual(['IMG-20261020-WA0003.jpg']);
		expect(fotos[0]).toMatchObject({ fuente: 'nombre', secuencia: 3, destacada: false, texto: undefined });
		expect(avisos).toEqual([]);
	});

	it('usa EXIF antes que el nombre y fotos.yaml antes que EXIF', () => {
		const exif = { anio: 2026, mes: 9, dia: 13, hora: { h: 11, m: 29, s: 36 } };
		const { fotos } = construirFotos(
			[{ nombre: '20260913_112936.jpg', exif }, { nombre: 'IMG-20260918-WA0013.jpg', exif }],
			config('fotos:\n  IMG-20260918-WA0013.jpg:\n    fecha: 2026-09-16\n'),
		);
		expect(fotos[0]).toMatchObject({ fuente: 'exif', fecha: exif });
		expect(fotos[1]).toMatchObject({ fuente: 'yaml', fecha: { anio: 2026, mes: 9, dia: 16 } });
	});

	it('Misma foto en dos formatos: error que nombra ambos', () => {
		const p = problemas(() =>
			construirFotos([{ nombre: '20260913_112936.jpg' }, { nombre: '20260913_112936.webp' }], config()),
		);
		expect(p).toHaveLength(1);
		expect(p[0]).toContain('20260913_112936.jpg');
		expect(p[0]).toContain('20260913_112936.webp');
	});

	it('Nombre libre sin metadatos: error que la nombra y sugiere fotos.yaml', () => {
		const p = problemas(() => construirFotos([{ nombre: 'rocket-durmiendo.jpg' }], config()));
		expect(p[0]).toContain('rocket-durmiendo.jpg');
		expect(p[0]).toContain('fotos.yaml');
	});

	it('Fecha imposible: foto anterior a la llegada', () => {
		const p = problemas(() =>
			construirFotos([{ nombre: 'perro.jpg' }], config('fotos:\n  perro.jpg:\n    fecha: 2026-09-02\n')),
		);
		expect(p[0]).toContain('perro.jpg');
		expect(p[0]).toContain('2 de septiembre de 2026');
	});

	it('lista todos los problemas juntos', () => {
		const p = problemas(() =>
			construirFotos([{ nombre: 'a.jpg' }, { nombre: 'b.jpg' }, { nombre: 'c.png' }, { nombre: 'c.webp' }], config()),
		);
		// 1 duplicado (c.png / c.webp) + 4 archivos sin fecha
		expect(p).toHaveLength(5);
		expect(p.filter((x) => x.includes('no tiene fecha'))).toHaveLength(4);
	});

	it('Nombre mal tipeado: aviso sin detener la compilación', () => {
		const { fotos, avisos } = construirFotos(
			[{ nombre: 'IMG-20260910-WA0010.jpg' }],
			config('fotos:\n  IMG-20260910-WA001.jpg:\n    texto: Hola\n'),
		);
		expect(fotos).toHaveLength(1);
		expect(avisos).toHaveLength(1);
		expect(avisos[0]).toContain('IMG-20260910-WA001.jpg');
	});

	it('Ocultar una foto: queda fuera y no se valida su fecha', () => {
		const { fotos } = construirFotos(
			[{ nombre: '20261009_124442.webp' }, { nombre: 'sin-fecha.jpg' }],
			config('fotos:\n  20261009_124442.webp:\n    oculta: true\n  sin-fecha.jpg:\n    oculta: true\n'),
		);
		expect(fotos).toEqual([]);
	});
});
