import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { cargarCatalogo, ErrorCatalogo, FRASE_POR_DEFECTO } from './index';

let carpeta: string;

async function crear(archivos: Record<string, string>) {
	for (const [nombre, contenido] of Object.entries(archivos)) await writeFile(join(carpeta, nombre), contenido);
}

const YAML = `perro:
  nombre: Rocket
  llegada: 2026-09-09
capitulos:
  1: Su primer mes
`;

beforeEach(async () => {
	carpeta = await mkdtemp(join(tmpdir(), 'catalogo-'));
});

afterEach(async () => {
	await rm(carpeta, { recursive: true, force: true });
});

describe('cargarCatalogo sobre una carpeta de ejemplo', () => {
	it('arma fotos, tarjetas, capítulos y portada', async () => {
		await crear({
			'fotos.yaml': `${YAML}fotos:\n  IMG-20260916-WA0016.jpg:\n    destacada: true\n  20261009_124442.webp:\n    oculta: true\n`,
			'LEEME.md': '# guía',
			'IMG-20260909-WA0045.jpg': '',
			'IMG-20260916-WA0016.jpg': '',
			'20260913_112930.webp': '',
			'20260913_112936.webp': '',
			'20260913_112952.webp': '',
			'IMG-20261004-WA0002.webp': '',
			'20261009_124442.webp': '',
			'IMG-20261010-WA0001.jpg': '',
		});
		const c = await cargarCatalogo(carpeta);

		expect(c.fotos.map((f) => f.nombre)).toEqual([
			'IMG-20260909-WA0045.jpg',
			'20260913_112930.webp',
			'20260913_112936.webp',
			'20260913_112952.webp',
			'IMG-20260916-WA0016.jpg',
			'IMG-20261004-WA0002.webp',
			'IMG-20261010-WA0001.jpg',
		]);
		expect(c.tarjetas.map((t) => t.fotos.length)).toEqual([1, 3, 1, 1, 1]);
		expect(c.capitulos.map((x) => [x.numero, x.titulo, x.tarjetas.length])).toEqual([
			[1, 'Su primer mes', 4],
			[2, 'Mes 2', 1],
		]);
		expect(c.portada.nombre).toBe('IMG-20260916-WA0016.jpg');
		expect(c.frase).toBe(FRASE_POR_DEFECTO);
		expect(c.avisos).toEqual([]);
	});

	it('sin destacadas, la portada es la foto más reciente', async () => {
		await crear({ 'fotos.yaml': YAML, 'IMG-20260909-WA0045.jpg': '', 'IMG-20261004-WA0002.webp': '' });
		expect((await cargarCatalogo(carpeta)).portada.nombre).toBe('IMG-20261004-WA0002.webp');
	});

	it('falla si falta fotos.yaml o no hay fotos', async () => {
		await expect(cargarCatalogo(carpeta)).rejects.toBeInstanceOf(ErrorCatalogo);
		await crear({ 'fotos.yaml': YAML });
		await expect(cargarCatalogo(carpeta)).rejects.toThrow('No hay fotos publicables');
	});
});
