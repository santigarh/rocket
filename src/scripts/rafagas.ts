// Tarjetas de ráfaga: recorren sus fotos como un flipbook mientras están en pantalla.
// Con movimiento reducido se quedan en la primera foto.

const INTERVALO_MS = 420;
const reducido = matchMedia('(prefers-reduced-motion: reduce)');

function iniciar(tarjeta: HTMLElement) {
	const cuadros = [...tarjeta.querySelectorAll<HTMLElement>('[data-cuadro]')];
	let activo = 0;
	let temporizador: number | undefined;

	const mostrar = (i: number) => {
		cuadros.forEach((c, j) => c.classList.toggle('opacity-0', j !== i));
		activo = i;
	};
	const detener = () => {
		clearInterval(temporizador);
		temporizador = undefined;
	};
	const arrancar = () => {
		if (temporizador !== undefined || reducido.matches) return;
		temporizador = window.setInterval(() => mostrar((activo + 1) % cuadros.length), INTERVALO_MS);
	};

	new IntersectionObserver(([entrada]) => (entrada.isIntersecting ? arrancar() : detener()), {
		threshold: 0.5,
	}).observe(tarjeta);

	reducido.addEventListener('change', () => {
		if (reducido.matches) {
			detener();
			mostrar(0);
		}
	});
}

document.querySelectorAll<HTMLElement>('[data-rafaga]').forEach(iniciar);

export {};
