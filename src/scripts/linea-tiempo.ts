// Líneas de tiempo de los capítulos.
//
// Modo fijado (puntero fino, ancho >= 768 px, sin movimiento reducido): la sección
// mide 100vh + lo que sobra de la pista; el escenario queda fijo (sticky) y el scroll
// vertical desplaza la pista horizontalmente, 1:1, sin inercia artificial.
// Modo nativo (resto): la pista se desplaza sola con scroll horizontal y scroll-snap.

interface Linea {
	seccion: HTMLElement;
	pista: HTMLElement;
	lista: HTMLElement;
	items: HTMLElement[];
	barra: HTMLElement;
	/** Píxeles que la pista excede del ancho visible. */
	desborde: number;
	/** Posición vertical de la sección en el documento. */
	arriba: number;
	visible: boolean;
}

const consultaFijado = matchMedia('(pointer: fine) and (min-width: 768px)');
const consultaReducido = matchMedia('(prefers-reduced-motion: reduce)');
const fijado = () => consultaFijado.matches && !consultaReducido.matches;
const comportamiento = (): ScrollBehavior => (consultaReducido.matches ? 'auto' : 'smooth');

const lineas: Linea[] = [...document.querySelectorAll<HTMLElement>('[data-capitulo]')].map((seccion) => ({
	seccion,
	pista: seccion.querySelector<HTMLElement>('.capitulo__pista')!,
	lista: seccion.querySelector<HTMLElement>('.capitulo__lista')!,
	items: [...seccion.querySelectorAll<HTMLElement>('.capitulo__item')],
	barra: seccion.querySelector<HTMLElement>('.capitulo__barra')!,
	desborde: 0,
	arriba: 0,
	visible: false,
}));

const limitar = (x: number) => Math.min(1, Math.max(0, x));

function medir() {
	const modo = fijado();
	document.documentElement.classList.toggle('linea-fijada', modo);
	for (const l of lineas) {
		l.lista.style.removeProperty('--desplazamiento');
		l.seccion.style.height = '';
		if (modo) {
			l.desborde = Math.max(0, l.lista.scrollWidth - l.pista.clientWidth);
			l.seccion.style.height = `${window.innerHeight + l.desborde}px`;
		}
	}
	for (const l of lineas) l.arriba = l.seccion.getBoundingClientRect().top + window.scrollY;
	pintar();
}

/** Progreso de 0 a 1 de una línea. */
function progreso(l: Linea): number {
	if (fijado()) return l.desborde ? limitar((window.scrollY - l.arriba) / l.desborde) : 1;
	const max = l.pista.scrollWidth - l.pista.clientWidth;
	return max > 0 ? limitar(l.pista.scrollLeft / max) : 1;
}

function pintarLinea(l: Linea) {
	const p = progreso(l);
	if (fijado()) l.lista.style.setProperty('--desplazamiento', `${-p * l.desborde}px`);
	l.barra.style.transform = `scaleX(${p})`;
}

let pendiente = false;
function pintar() {
	pendiente = false;
	for (const l of lineas) if (l.visible || !fijado()) pintarLinea(l);
}
function pedirPintado() {
	if (pendiente) return;
	pendiente = true;
	requestAnimationFrame(pintar);
}

/** Posición (en px de pista) en la que la tarjeta i queda donde empieza la primera. */
function posicionDe(l: Linea, i: number): number {
	return Math.min(l.desborde, Math.max(0, l.items[i].offsetLeft - l.items[0].offsetLeft));
}

function indiceActual(l: Linea): number {
	if (fijado()) {
		const x = progreso(l) * l.desborde;
		let actual = 0;
		l.items.forEach((_, i) => {
			if (posicionDe(l, i) <= x + 2) actual = i;
		});
		return actual;
	}
	const centro = l.pista.scrollLeft + l.pista.clientWidth / 2;
	let mejor = 0;
	l.items.forEach((item, i) => {
		const c = (it: HTMLElement) => it.offsetLeft + it.offsetWidth / 2;
		if (Math.abs(c(item) - centro) < Math.abs(c(l.items[mejor]) - centro)) mejor = i;
	});
	return mejor;
}

function irA(l: Linea, i: number) {
	const destino = Math.min(l.items.length - 1, Math.max(0, i));
	if (fijado()) {
		window.scrollTo({ top: l.arriba + posicionDe(l, destino), behavior: comportamiento() });
	} else {
		l.items[destino].scrollIntoView({ inline: 'center', block: 'nearest', behavior: comportamiento() });
	}
}

for (const l of lineas) {
	l.pista.addEventListener('keydown', (e) => {
		if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
		e.preventDefault();
		irA(l, indiceActual(l) + (e.key === 'ArrowRight' ? 1 : -1));
	});
	l.pista.addEventListener('scroll', () => !fijado() && pedirPintado(), { passive: true });
	// En modo fijado, un gesto horizontal del trackpad también avanza la historia.
	l.seccion.addEventListener(
		'wheel',
		(e) => {
			if (fijado() && Math.abs(e.deltaX) > Math.abs(e.deltaY)) window.scrollBy({ top: e.deltaX, behavior: 'auto' });
		},
		{ passive: true },
	);
}

const observador = new IntersectionObserver(
	(entradas) => {
		for (const e of entradas) {
			const l = lineas.find((x) => x.seccion === e.target);
			if (l) l.visible = e.isIntersecting;
		}
		pedirPintado();
	},
	{ rootMargin: '10% 0px' },
);
lineas.forEach((l) => observador.observe(l.seccion));

// Un único listener de scroll, limitado a un pintado por cuadro.
window.addEventListener('scroll', () => fijado() && pedirPintado(), { passive: true });

let anchoPrevio = window.innerWidth;
let altoPrevio = window.innerHeight;
window.addEventListener('resize', () => {
	if (window.innerWidth === anchoPrevio && Math.abs(window.innerHeight - altoPrevio) < 120 && !fijado()) return;
	anchoPrevio = window.innerWidth;
	altoPrevio = window.innerHeight;
	medir();
});
consultaFijado.addEventListener('change', medir);
consultaReducido.addEventListener('change', medir);
// Las fotos cargan diferidas: cuando cambian de tamaño, la pista cambia de ancho.
const vigilante = new ResizeObserver(() => medir());
lineas.forEach((l) => vigilante.observe(l.lista));

medir();

export {};
