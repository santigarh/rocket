// Frase destacada: las palabras pasan del tono atenuado al color pleno, una a una,
// a medida que la sección cruza la pantalla. Un listener de scroll limitado con
// requestAnimationFrame, activo solo mientras la sección está visible.

const seccion = document.querySelector<HTMLElement>('.frase');
const palabras = seccion ? [...seccion.querySelectorAll<HTMLElement>('.palabra')] : [];
const reducido = matchMedia('(prefers-reduced-motion: reduce)');

if (seccion && palabras.length) {
	let visible = false;
	let pendiente = false;

	const pintar = () => {
		pendiente = false;
		if (reducido.matches) {
			palabras.forEach((p) => p.classList.add('activa'));
			return;
		}
		// 0 cuando el inicio de la sección llega al 85 % de la pantalla; 1 cuando su final pasa por el 45 %.
		const r = seccion.getBoundingClientRect();
		const alto = window.innerHeight;
		const inicio = alto * 0.85;
		const fin = alto * 0.45;
		const progreso = Math.min(1, Math.max(0, (inicio - r.top) / (inicio - fin + r.height * 0.4)));
		const activas = Math.round(progreso * palabras.length);
		palabras.forEach((p, i) => p.classList.toggle('activa', i < activas));
	};

	const pedir = () => {
		if (!visible || pendiente) return;
		pendiente = true;
		requestAnimationFrame(pintar);
	};

	new IntersectionObserver(([e]) => {
		visible = e.isIntersecting;
		pedir();
	}).observe(seccion);

	window.addEventListener('scroll', pedir, { passive: true });
	reducido.addEventListener('change', pintar);
	pintar();
}

export {};
