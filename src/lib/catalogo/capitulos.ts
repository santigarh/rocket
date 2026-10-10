import type { Config } from './esquema';
import { compararDia, desdeNumeroDeDia, numeroDeDia, segundosDelDia, sumarMeses, type FechaLocal } from './fechas';
import type { Capitulo, Tarjeta } from './tipos';

/** Un capítulo con más tarjetas que esto se resume en la landing... */
export const UMBRAL_CAPITULO_GRANDE = 24;
/** ...mostrando como máximo estas. */
export const MAXIMO_VISIBLES = 16;

/** Primer día del capítulo N (N = 1 es el mes de la llegada). */
export function inicioCapitulo(llegada: FechaLocal, n: number): FechaLocal {
	return sumarMeses(llegada, n - 1);
}

export function numeroCapitulo(fecha: FechaLocal, llegada: FechaLocal): number {
	let n = Math.max(1, (fecha.anio - llegada.anio) * 12 + (fecha.mes - llegada.mes) + 1);
	while (n > 1 && compararDia(fecha, inicioCapitulo(llegada, n)) < 0) n--;
	while (compararDia(fecha, inicioCapitulo(llegada, n + 1)) >= 0) n++;
	return n;
}

export function rangoCapitulo(llegada: FechaLocal, n: number): { desde: FechaLocal; hasta: FechaLocal } {
	return {
		desde: inicioCapitulo(llegada, n),
		hasta: desdeNumeroDeDia(numeroDeDia(inicioCapitulo(llegada, n + 1)) - 1),
	};
}

function instante(t: Tarjeta): number {
	return numeroDeDia(t.fecha) * 86_400 + (t.fecha.hora ? segundosDelDia(t.fecha.hora) : 0);
}

/** Elige k tarjetas lo más repartidas posible en el tiempo; conserva el orden original. */
export function repartir(tarjetas: Tarjeta[], k: number): Tarjeta[] {
	if (k >= tarjetas.length) return tarjetas;
	if (k <= 0) return [];
	const tiempos = tarjetas.map(instante);
	const t0 = tiempos[0], tN = tiempos.at(-1)!;
	const elegidas = new Set<number>();
	for (let i = 0; i < k; i++) {
		const objetivo = t0 + ((i + 0.5) * (tN - t0)) / k;
		let mejor = -1;
		for (let j = 0; j < tarjetas.length; j++) {
			if (elegidas.has(j)) continue;
			if (mejor < 0 || Math.abs(tiempos[j] - objetivo) < Math.abs(tiempos[mejor] - objetivo)) mejor = j;
		}
		elegidas.add(mejor);
	}
	return tarjetas.filter((_, j) => elegidas.has(j));
}

/** Tarjetas visibles en la landing: todas, o un resumen si el capítulo es grande. */
export function resumir(tarjetas: Tarjeta[]): Tarjeta[] {
	if (tarjetas.length <= UMBRAL_CAPITULO_GRANDE) return tarjetas;
	const destacadas = tarjetas.filter((t) => t.destacada);
	if (destacadas.length >= MAXIMO_VISIBLES) return repartir(destacadas, MAXIMO_VISIBLES);
	const relleno = repartir(
		tarjetas.filter((t) => !t.destacada),
		MAXIMO_VISIBLES - destacadas.length,
	);
	const elegidas = new Set([...destacadas, ...relleno]);
	return tarjetas.filter((t) => elegidas.has(t));
}

/** Agrupa las tarjetas (ya ordenadas) en capítulos; omite los capítulos vacíos sin renumerar. */
export function construirCapitulos(tarjetas: Tarjeta[], config: Config): Capitulo[] {
	const llegada = config.perro.llegada;
	const porNumero = new Map<number, Tarjeta[]>();
	for (const t of tarjetas) {
		const n = numeroCapitulo(t.fecha, llegada);
		porNumero.set(n, [...(porNumero.get(n) ?? []), t]);
	}
	return [...porNumero.entries()]
		.sort(([a], [b]) => a - b)
		.map(([numero, ts]) => ({
			numero,
			titulo: config.capitulos.get(numero) ?? `Mes ${numero}`,
			...rangoCapitulo(llegada, numero),
			tarjetas: ts,
			visibles: resumir(ts),
		}));
}

export function esCapituloGrande(c: Capitulo): boolean {
	return c.visibles.length < c.tarjetas.length;
}

/** Rutas estáticas de `/mes/N`: solo para los capítulos resumidos en la landing. */
export function rutasDeCapitulos(capitulos: Capitulo[]) {
	return capitulos.filter(esCapituloGrande).map((capitulo) => ({
		params: { n: String(capitulo.numero) },
		props: { capitulo },
	}));
}
