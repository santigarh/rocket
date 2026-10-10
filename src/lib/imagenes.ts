import type { ImageMetadata } from 'astro';

// Glob no `eager`: solo se importan (y emiten) las fotos que una página pide,
// así las fotos ocultas no llegan al sitio publicado.
const cargadores = import.meta.glob<{ default: ImageMetadata }>(
	'/src/fotos/*.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG,WEBP,AVIF}',
);

export async function imagenDe(nombre: string): Promise<ImageMetadata> {
	const cargar = cargadores[`/src/fotos/${nombre}`];
	if (!cargar) throw new Error(`No se encontró la imagen ${nombre} en src/fotos`);
	return (await cargar()).default;
}
