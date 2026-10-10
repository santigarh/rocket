import { describe, expect, it } from 'vitest';
import { ErrorCatalogo } from './errores';
import { parsearConfig } from './esquema';

const BASE = `
perro:
  nombre: Rocket
  llegada: 2026-09-09
`;

function errorDe(yaml: string): ErrorCatalogo {
	try {
		parsearConfig(yaml);
	} catch (e) {
		if (e instanceof ErrorCatalogo) return e;
		throw e;
	}
	throw new Error('se esperaba un ErrorCatalogo');
}

describe('parsearConfig', () => {
	it('lee el archivo mínimo', () => {
		const c = parsearConfig(BASE);
		expect(c.perro).toEqual({ nombre: 'Rocket', llegada: { anio: 2026, mes: 9, dia: 9 } });
		expect(c.fotos.size).toBe(0);
		expect(c.capitulos.size).toBe(0);
	});

	it('lee capítulos, frase y anotaciones', () => {
		const c = parsearConfig(`${BASE}
capitulos:
  1: Su primer mes
frase: Hola
fotos:
  IMG-20260918-WA0013.jpg:
    fecha: 2026-09-16
    texto: Primer día en el parque
    destacada: true
  20261009_124442.webp:
    oculta: true
  sin-nada.jpg:
`);
		expect(c.capitulos.get(1)).toBe('Su primer mes');
		expect(c.frase).toBe('Hola');
		expect(c.fotos.get('IMG-20260918-WA0013.jpg')).toEqual({
			texto: 'Primer día en el parque',
			fecha: { anio: 2026, mes: 9, dia: 16 },
			destacada: true,
			oculta: false,
		});
		expect(c.fotos.get('20261009_124442.webp')?.oculta).toBe(true);
		expect(c.fotos.get('sin-nada.jpg')).toEqual({ destacada: false, oculta: false, texto: undefined, fecha: undefined });
	});

	it('Falta la fecha de llegada', () => {
		const e = errorDe('perro:\n  nombre: Rocket\n');
		expect(e.problemas).toEqual(['falta el campo "llegada" en perro']);
	});

	it('Campo mal escrito: indica el campo y la foto', () => {
		const e = errorDe(`${BASE}
fotos:
  20260913_112930.webp:
    destacda: true
`);
		expect(e.problemas).toHaveLength(1);
		expect(e.problemas[0]).toContain('"destacda"');
		expect(e.problemas[0]).toContain('20260913_112930.webp');
	});

	it('rechaza fechas con formato inválido', () => {
		expect(errorDe(`${BASE}
fotos:
  a.jpg:
    fecha: 16/09/2026
`).problemas[0]).toContain('fecha inválida');
		expect(errorDe('perro:\n  nombre: Rocket\n  llegada: 2026-09-09 10:00\n').problemas[0]).toContain('fecha inválida');
	});

	it('informa YAML mal formado', () => {
		expect(errorDe('perro: [sin cerrar').message).toContain('no es un YAML válido');
	});
});
