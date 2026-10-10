/** Error de compilación del catálogo: junta todos los problemas en un único mensaje. */
export class ErrorCatalogo extends Error {
	readonly problemas: string[];

	constructor(titulo: string, problemas: string[]) {
		super(`${titulo}\n${problemas.map((p) => `  • ${p}`).join('\n')}`);
		this.name = 'ErrorCatalogo';
		this.problemas = problemas;
	}
}
