// Aparición suave de los elementos `.revelar` cuando entran en pantalla.
// Con movimiento reducido el CSS ya los muestra sin animación.

function revelarTodo(elementos: Iterable<Element>) {
	for (const el of elementos) el.classList.add('visible');
}

const elementos = document.querySelectorAll('.revelar');

if (!('IntersectionObserver' in window)) {
	revelarTodo(elementos);
} else {
	const observador = new IntersectionObserver(
		(entradas) => {
			for (const entrada of entradas) {
				if (!entrada.isIntersecting) continue;
				entrada.target.classList.add('visible');
				observador.unobserve(entrada.target);
			}
		},
		{ rootMargin: '0px 0px -10% 0px', threshold: 0.1 },
	);
	elementos.forEach((el) => observador.observe(el));
}

export {};
