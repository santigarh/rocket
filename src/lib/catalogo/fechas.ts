// Fechas "locales": componentes sueltos, sin zona horaria, para que una foto
// de las 23:30 no cambie de día según dónde se compile el sitio.

export interface Hora {
	h: number;
	m: number;
	s: number;
}

export interface FechaLocal {
	anio: number;
	/** 1 a 12 */
	mes: number;
	dia: number;
	hora?: Hora;
}

export type FuenteFecha = 'yaml' | 'exif' | 'nombre';

export interface FechaDeNombre {
	fecha: FechaLocal;
	/** Número de secuencia de WhatsApp (WA0016 → 16), si lo hay. */
	secuencia?: number;
}

const RE_CAMARA = /^(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})(\d{2})/;
const RE_WHATSAPP = /^IMG-(\d{4})(\d{2})(\d{2})-WA(\d+)/i;
const RE_TEXTO = /^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?$/;
const RE_EXIF = /^(\d{4}):(\d{2}):(\d{2}) (\d{2}):(\d{2}):(\d{2})/;

export function diasEnMes(anio: number, mes: number): number {
	return new Date(Date.UTC(anio, mes, 0)).getUTCDate();
}

export function esFechaValida(f: FechaLocal): boolean {
	if (f.mes < 1 || f.mes > 12 || f.dia < 1 || f.dia > diasEnMes(f.anio, f.mes)) return false;
	if (!f.hora) return true;
	const { h, m, s } = f.hora;
	return h >= 0 && h < 24 && m >= 0 && m < 60 && s >= 0 && s < 60;
}

function armar(anio: string, mes: string, dia: string, h?: string, m?: string, s?: string): FechaLocal | null {
	const f: FechaLocal = { anio: +anio, mes: +mes, dia: +dia };
	if (h !== undefined && m !== undefined) f.hora = { h: +h, m: +m, s: s ? +s : 0 };
	return esFechaValida(f) ? f : null;
}

/** Fecha codificada en el nombre: `20260913_112930.jpg` o `IMG-20260910-WA0016.jpg`. */
export function fechaDesdeNombre(nombre: string): FechaDeNombre | null {
	const cam = RE_CAMARA.exec(nombre);
	if (cam) {
		const fecha = armar(cam[1], cam[2], cam[3], cam[4], cam[5], cam[6]);
		return fecha ? { fecha } : null;
	}
	const wa = RE_WHATSAPP.exec(nombre);
	if (wa) {
		const fecha = armar(wa[1], wa[2], wa[3]);
		return fecha ? { fecha, secuencia: +wa[4] } : null;
	}
	return null;
}

/** Fecha escrita a mano en fotos.yaml: `AAAA-MM-DD` o `AAAA-MM-DD HH:MM[:SS]`. */
export function fechaDesdeTexto(texto: string): FechaLocal | null {
	const t = RE_TEXTO.exec(texto.trim());
	return t ? armar(t[1], t[2], t[3], t[4], t[5], t[6]) : null;
}

/** `DateTimeOriginal` del EXIF en crudo: `2026:09:13 11:29:36`. */
export function fechaDesdeExif(valor: unknown): FechaLocal | null {
	if (typeof valor !== 'string') return null;
	const e = RE_EXIF.exec(valor);
	return e ? armar(e[1], e[2], e[3], e[4], e[5], e[6]) : null;
}

/** Prioridad: corrección en fotos.yaml > metadatos de la cámara > nombre de archivo. */
export function resolverFecha(fuentes: {
	yaml?: FechaLocal | null;
	exif?: FechaLocal | null;
	nombre?: FechaLocal | null;
}): { fecha: FechaLocal; fuente: FuenteFecha } | null {
	if (fuentes.yaml) return { fecha: fuentes.yaml, fuente: 'yaml' };
	if (fuentes.exif) return { fecha: fuentes.exif, fuente: 'exif' };
	if (fuentes.nombre) return { fecha: fuentes.nombre, fuente: 'nombre' };
	return null;
}

// ---- aritmética ----

/** Número de día absoluto (días desde 1970-01-01); sirve para comparar y restar días. */
export function numeroDeDia(f: FechaLocal): number {
	return Date.UTC(f.anio, f.mes - 1, f.dia) / 86_400_000;
}

export function desdeNumeroDeDia(n: number): FechaLocal {
	const d = new Date(n * 86_400_000);
	return { anio: d.getUTCFullYear(), mes: d.getUTCMonth() + 1, dia: d.getUTCDate() };
}

export function segundosDelDia(h: Hora): number {
	return h.h * 3600 + h.m * 60 + h.s;
}

/** Compara solo el día (ignora la hora). */
export function compararDia(a: FechaLocal, b: FechaLocal): number {
	return numeroDeDia(a) - numeroDeDia(b);
}

/** Suma meses; si el día no existe en el mes destino, usa el último día del mes. */
export function sumarMeses(f: FechaLocal, meses: number): FechaLocal {
	const total = f.anio * 12 + (f.mes - 1) + meses;
	const anio = Math.floor(total / 12);
	const mes = (total % 12) + 1;
	return { anio, mes, dia: Math.min(f.dia, diasEnMes(anio, mes)) };
}

// ---- formato en español ----

const MESES_CORTOS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const MESES_LARGOS = [
	'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
	'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

/** "16 sep 2026" */
export function formatoCorto(f: FechaLocal): string {
	return `${f.dia} ${MESES_CORTOS[f.mes - 1]} ${f.anio}`;
}

/** "16 de septiembre de 2026" */
export function formatoLargo(f: FechaLocal): string {
	return `${f.dia} de ${MESES_LARGOS[f.mes - 1]} de ${f.anio}`;
}

/** "9 sep – 8 oct 2026", o "9 dic 2026 – 8 ene 2027" si cruza de año. */
export function formatoRango(desde: FechaLocal, hasta: FechaLocal): string {
	const ini = `${desde.dia} ${MESES_CORTOS[desde.mes - 1]}`;
	if (desde.anio === hasta.anio) return `${ini} – ${formatoCorto(hasta)}`;
	return `${ini} ${desde.anio} – ${formatoCorto(hasta)}`;
}

/** Valor para atributos `datetime` (`2026-09-13` o `2026-09-13T11:29:36`). */
export function formatoISO(f: FechaLocal): string {
	const p = (n: number) => String(n).padStart(2, '0');
	const dia = `${f.anio}-${p(f.mes)}-${p(f.dia)}`;
	return f.hora ? `${dia}T${p(f.hora.h)}:${p(f.hora.m)}:${p(f.hora.s)}` : dia;
}
