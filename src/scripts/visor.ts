// Visor de la galería: <dialog> nativo (foco atrapado y Escape incluidos),
// navegación con botones, flechas y deslizamiento, y enlace directo #foto=<id>.

const visor = document.querySelector<HTMLDialogElement>('#visor');
const miniaturas = [...document.querySelectorAll<HTMLButtonElement>('button.miniatura')];

if (visor && miniaturas.length) {
	const imagen = visor.querySelector<HTMLImageElement>('.visor__imagen')!;
	const zona = visor.querySelector<HTMLElement>('.visor__zona')!;
	const posicion = visor.querySelector<HTMLElement>('.visor__posicion')!;
	const fecha = visor.querySelector<HTMLElement>('.visor__fecha')!;
	const texto = visor.querySelector<HTMLElement>('.visor__texto')!;
	const anteriores = [...visor.querySelectorAll<HTMLButtonElement>('.visor__anterior')];
	const siguientes = [...visor.querySelectorAll<HTMLButtonElement>('.visor__siguiente')];
	const PREFIJO = '#foto=';

	let actual = -1;
	let origen: HTMLButtonElement | null = null;

	const quitarMarca = () => history.replaceState(null, '', location.pathname + location.search);

	function mostrar(i: number) {
		const m = miniaturas[i];
		if (!m) return;
		actual = i;
		const d = m.dataset;
		imagen.src = d.src!;
		imagen.srcset = d.srcset ?? '';
		imagen.sizes = '(min-width: 768px) 80vw, 100vw';
		imagen.width = Number(d.ancho);
		imagen.height = Number(d.alto);
		imagen.alt = d.alt ?? '';
		posicion.textContent = `${i + 1} / ${miniaturas.length}`;
		fecha.textContent = d.fecha ?? '';
		texto.textContent = d.texto ?? '';
		texto.hidden = !d.texto;
		anteriores.forEach((b) => (b.disabled = i === 0));
		siguientes.forEach((b) => (b.disabled = i === miniaturas.length - 1));
		history.replaceState(null, '', `${PREFIJO}${encodeURIComponent(d.id!)}`);
	}

	function abrir(i: number, desde: HTMLButtonElement | null) {
		origen = desde;
		mostrar(i);
		if (!visor!.open) visor!.showModal();
	}

	const mover = (paso: number) => {
		const destino = actual + paso;
		if (destino >= 0 && destino < miniaturas.length) mostrar(destino);
	};

	// Limpieza al cerrar; idempotente porque puede llegar por cerrar() y por el evento `close`.
	function alCerrar() {
		if (actual === -1) return;
		actual = -1;
		quitarMarca();
		origen?.focus();
		origen = null;
	}

	function cerrar() {
		if (visor!.open) visor!.close();
		alCerrar();
	}

	miniaturas.forEach((m, i) => m.addEventListener('click', () => abrir(i, m)));
	anteriores.forEach((b) => b.addEventListener('click', () => mover(-1)));
	siguientes.forEach((b) => b.addEventListener('click', () => mover(1)));
	visor.querySelector('.visor__cerrar')!.addEventListener('click', cerrar);

	// Escape: cerramos nosotros para limpiar la URL y el foco en el acto.
	visor.addEventListener('cancel', (e) => {
		e.preventDefault();
		cerrar();
	});

	visor.addEventListener('keydown', (e) => {
		if (e.key === 'ArrowRight') mover(1);
		else if (e.key === 'ArrowLeft') mover(-1);
		else if (e.key === 'Escape') {
			e.preventDefault();
			cerrar();
		}
	});

	// Tocar fuera de la foto (el fondo o la zona vacía alrededor) cierra el visor,
	// salvo que el toque haya sido el final de un deslizamiento.
	let huboArrastre = false;
	visor.addEventListener('click', (e) => {
		if (huboArrastre) {
			huboArrastre = false;
			return;
		}
		if (e.target === visor || e.target === zona) cerrar();
	});

	visor.addEventListener('close', alCerrar);

	// Deslizar con el dedo (o arrastrar) para cambiar de foto.
	let inicioX: number | null = null;
	zona.addEventListener('pointerdown', (e) => {
		inicioX = e.clientX;
	});
	zona.addEventListener('pointerup', (e) => {
		if (inicioX === null) return;
		const dx = e.clientX - inicioX;
		inicioX = null;
		huboArrastre = Math.abs(dx) > 10;
		if (Math.abs(dx) > 50) mover(dx < 0 ? 1 : -1);
	});
	zona.addEventListener('pointercancel', () => (inicioX = null));

	// Enlace directo: abrir el visor si la URL trae #foto=<id> de una foto existente.
	function abrirDesdeUrl() {
		if (!location.hash.startsWith(PREFIJO)) return;
		const id = decodeURIComponent(location.hash.slice(PREFIJO.length));
		const i = miniaturas.findIndex((m) => m.dataset.id === id);
		if (i >= 0) abrir(i, miniaturas[i]);
		else quitarMarca();
	}
	abrirDesdeUrl();
	window.addEventListener('hashchange', abrirDesdeUrl);
}

export {};
