import { parse } from 'yaml';
import { z } from 'zod';
import { ErrorCatalogo } from './errores';
import { fechaDesdeTexto, type FechaLocal } from './fechas';

z.config(z.locales.es());

const fechaConHora = z
	.string()
	.refine((t) => fechaDesdeTexto(t) !== null, 'fecha inválida: usa AAAA-MM-DD o AAAA-MM-DD HH:MM');

const soloDia = z
	.string()
	.refine((t) => fechaDesdeTexto(t)?.hora === undefined && fechaDesdeTexto(t) !== null, 'fecha inválida: usa AAAA-MM-DD');

const texto = z.string().trim().min(1);

const anotacion = z.strictObject({
	texto: texto.optional(),
	fecha: fechaConHora.optional(),
	destacada: z.boolean().optional(),
	oculta: z.boolean().optional(),
});

const esquema = z.strictObject({
	perro: z.strictObject({ nombre: texto, llegada: soloDia }),
	capitulos: z
		.record(z.string().regex(/^[1-9]\d*$/, 'el capítulo debe ser un número entero positivo'), texto)
		.nullish(),
	frase: texto.optional(),
	fotos: z.record(z.string(), anotacion.nullable()).nullish(),
});

export interface Anotacion {
	texto?: string;
	fecha?: FechaLocal;
	destacada: boolean;
	oculta: boolean;
}

export interface Config {
	perro: { nombre: string; llegada: FechaLocal };
	/** Títulos propios por número de capítulo. */
	capitulos: Map<number, string>;
	frase?: string;
	/** Anotaciones por nombre de archivo. */
	fotos: Map<string, Anotacion>;
}

function describir(issue: z.core.$ZodIssue): string {
	const ruta = issue.path.map(String);
	const en = (r: string[]) => (r.length ? ` en ${r.join(' › ')}` : '');
	if (issue.code === 'unrecognized_keys') {
		return `campo desconocido ${issue.keys.map((k) => `"${k}"`).join(', ')}${en(ruta)}`;
	}
	if (issue.code === 'invalid_type' && issue.input === undefined) {
		return `falta el campo "${ruta.at(-1)}"${en(ruta.slice(0, -1))}`;
	}
	return `${issue.message}${en(ruta)}`;
}

/** Lee y valida el contenido de fotos.yaml. Lanza ErrorCatalogo con todos los problemas. */
export function parsearConfig(contenido: string): Config {
	let datos: unknown;
	try {
		datos = parse(contenido) ?? {};
	} catch (e) {
		throw new ErrorCatalogo('fotos.yaml no es un YAML válido:', [(e as Error).message]);
	}

	const r = esquema.safeParse(datos, { reportInput: true });
	if (!r.success) {
		throw new ErrorCatalogo('fotos.yaml tiene errores:', r.error.issues.map(describir));
	}

	const d = r.data;
	const fotos = new Map<string, Anotacion>();
	for (const [nombre, a] of Object.entries(d.fotos ?? {})) {
		fotos.set(nombre, {
			texto: a?.texto,
			fecha: a?.fecha ? (fechaDesdeTexto(a.fecha) ?? undefined) : undefined,
			destacada: a?.destacada ?? false,
			oculta: a?.oculta ?? false,
		});
	}

	return {
		perro: { nombre: d.perro.nombre, llegada: fechaDesdeTexto(d.perro.llegada)! },
		capitulos: new Map(Object.entries(d.capitulos ?? {}).map(([n, t]) => [Number(n), t])),
		frase: d.frase,
		fotos,
	};
}
