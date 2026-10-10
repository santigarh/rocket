// Índice de capítulos: marca la sección actual y maneja el menú del celular.

const enlaces = [...document.querySelectorAll<HTMLAnchorElement>('a[data-indice]')];
const secciones = [...document.querySelectorAll<HTMLElement>('[data-capitulo], #galeria')];

function marcar(id: string | null) {
	for (const a of enlaces) {
		if (id && a.hash === `#${id}`) a.setAttribute('aria-current', 'location');
		else a.removeAttribute('aria-current');
	}
}

// La sección actual es la que cruza la línea media de la pantalla.
const visibles = new Set<string>();
const observador = new IntersectionObserver(
	(entradas) => {
		for (const e of entradas) {
			if (e.isIntersecting) visibles.add(e.target.id);
			else visibles.delete(e.target.id);
		}
		marcar(secciones.find((s) => visibles.has(s.id))?.id ?? null);
	},
	{ rootMargin: '-50% 0px -50% 0px' },
);
secciones.forEach((s) => observador.observe(s));

// ---- menú del celular ----
const boton = document.querySelector<HTMLButtonElement>('.hamburguesa');
const menu = document.getElementById('menu-movil');

function abrir(abierto: boolean) {
	if (!boton || !menu) return;
	boton.setAttribute('aria-expanded', String(abierto));
	boton.setAttribute('aria-label', abierto ? 'Cerrar el índice' : 'Abrir el índice');
	menu.classList.toggle('abierto', abierto);
	document.body.style.overflow = abierto ? 'hidden' : '';
}

boton?.addEventListener('click', () => abrir(boton.getAttribute('aria-expanded') !== 'true'));
menu?.addEventListener('click', (e) => {
	if ((e.target as HTMLElement).closest('a')) abrir(false);
});
document.addEventListener('keydown', (e) => {
	if (e.key === 'Escape' && boton?.getAttribute('aria-expanded') === 'true') {
		abrir(false);
		boton.focus();
	}
});

export {};
