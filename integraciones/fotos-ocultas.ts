import { readdir, readFile, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import type { AstroIntegration } from 'astro';
import { parsearConfig } from '../src/lib/catalogo/esquema';
import { sinExtension } from '../src/lib/catalogo/validar';

/**
 * Vite emite el original de toda imagen que encuentra el glob de src/lib/imagenes.ts,
 * aunque ninguna página la use. Esta integración borra de la salida los archivos de
 * las fotos marcadas `oculta: true` en fotos.yaml, para que no se publiquen.
 */
export default function fotosOcultas(carpeta = 'src/fotos'): AstroIntegration {
	return {
		name: 'fotos-ocultas',
		hooks: {
			'astro:build:done': async ({ dir, logger }) => {
				const config = parsearConfig(await readFile(join(carpeta, 'fotos.yaml'), 'utf8'));
				const ocultas = [...config.fotos].filter(([, a]) => a.oculta).map(([nombre]) => sinExtension(nombre));
				if (!ocultas.length) return;

				const assets = join(fileURLToPath(dir), '_astro');
				const archivos = await readdir(assets).catch(() => [] as string[]);
				const borrar = archivos.filter((a) => ocultas.some((base) => a.startsWith(`${base}.`)));
				await Promise.all(borrar.map((a) => rm(join(assets, a))));
				logger.info(`${ocultas.length} foto(s) oculta(s); se quitaron ${borrar.length} archivo(s) de la salida`);
			},
		},
	};
}
