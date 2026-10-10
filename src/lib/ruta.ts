/**
 * Ruta interna con el prefijo `base` del sitio (p. ej. `/rocket` en GitHub Pages).
 * `ruta('/mes/3')` → `/rocket/mes/3`; `ruta('/')` → `/rocket/`.
 */
export function ruta(camino: string): string {
	const base = import.meta.env.BASE_URL.replace(/\/$/, '');
	return `${base}/${camino.replace(/^\//, '')}`;
}
