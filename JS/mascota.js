// ============================================
// MASCOTA ARRASTRABLE (fija sobre toda la página)
// ============================================

(function () {

    const mascota = document.getElementById('mascota');
    if (!mascota) return;

    const video = mascota.querySelector('video');

    // video que se muestra SOLO mientras la mascota está agarrada
    const videoAgarrada = mascota.querySelector('.mascota-agarrada');

    const MARGEN_SUELO = 20; // debe coincidir con el "bottom" del CSS

    let arrastrando = false;
    let offsetX = 0;
    let offsetY = 0;
    let seMovio = false;

    // ============================================
    // 1) QUE LA ANIMACIÓN NUNCA "DESAPAREZCA":
    //    apenas termina, se reinicia al instante.
    // ============================================

    if (video) {

        video.addEventListener('ended', () => {
            video.currentTime = 0;
            video.play();
        });

        // Si el navegador llega a pausar el video por cualquier motivo
        // (cambio de pestaña, ahorro de batería, etc.), lo reanudamos.
        video.addEventListener('pause', () => {
            video.currentTime = 0;
            video.play().catch(() => {});
        });
    }

    // ============================================
    // CAMBIO DE MASCOTA MIENTRAS SE AGARRA
    // ============================================

    function mostrarMascotaAgarrada() {
        mascota.classList.add('agarrada');

        if (videoAgarrada) {
            // siempre arranca desde el inicio al agarrarla
            videoAgarrada.currentTime = 0;
            videoAgarrada.play().catch(() => {});
        }
    }

    function mostrarMascotaNormal() {
        mascota.classList.remove('agarrada');
    }

    // ============================================
    // ARRASTRE CON MOUSE / TÁCTIL
    // ============================================

    function fijarPosicionInicial() {
        const rect = mascota.getBoundingClientRect();
        mascota.style.left = rect.left + 'px';
        mascota.style.top = rect.top + 'px';
        mascota.style.right = 'auto';
        mascota.style.bottom = 'auto';
    }

    function limitarDentroDePantalla(x, y) {
        const rect = mascota.getBoundingClientRect();
        const maxX = window.innerWidth - rect.width;
        const maxY = window.innerHeight - rect.height;

        return {
            x: Math.min(Math.max(x, 0), Math.max(maxX, 0)),
            y: Math.min(Math.max(y, 0), Math.max(maxY, 0))
        };
    }

    function iniciarArrastre(clientX, clientY) {
        const rect = mascota.getBoundingClientRect();

        if (mascota.style.left === '' || mascota.style.right !== 'auto') {
            fijarPosicionInicial();
        }

        // Si estaba cayendo, cancelamos esa animación al tomarla de nuevo
        mascota.style.transition = 'none';

        arrastrando = true;
        seMovio = false;
        offsetX = clientX - rect.left;
        offsetY = clientY - rect.top;

        mascota.classList.add('arrastrando');
        mostrarMascotaAgarrada();
    }

    function moverA(clientX, clientY) {
        if (!arrastrando) return;

        seMovio = true;

        const nuevaX = clientX - offsetX;
        const nuevaY = clientY - offsetY;

        const posicion = limitarDentroDePantalla(nuevaX, nuevaY);

        mascota.style.left = posicion.x + 'px';
        mascota.style.top = posicion.y + 'px';
    }

    function terminarArrastre() {
        if (!arrastrando) return;
        arrastrando = false;
        mascota.classList.remove('arrastrando');
        mostrarMascotaNormal();

        if (seMovio) {
            caerAlPiso();
        }
    }

    // ============================================
    // 2) SI QUEDA "EN EL AIRE", SE CAE HASTA ABAJO
    // ============================================

    function caerAlPiso() {
        const rect = mascota.getBoundingClientRect();
        const pisoY = window.innerHeight - rect.height - MARGEN_SUELO;

        // Ya está apoyada, no hace falta animar la caída
        if (rect.top >= pisoY - 1) return;

        const distancia = pisoY - rect.top;
        // Duración proporcional a la distancia, simulando gravedad
        const duracion = Math.min(0.9, Math.max(0.35, distancia / 900));

        mascota.style.transition = `top ${duracion}s cubic-bezier(.55,0,1,1)`;
        mascota.style.top = pisoY + 'px';

        mascota.addEventListener('transitionend', function limpiar() {
            mascota.style.transition = 'none';
            mascota.removeEventListener('transitionend', limpiar);
        });
    }

    // ===== MOUSE =====

    mascota.addEventListener('mousedown', (evento) => {
        evento.preventDefault();
        iniciarArrastre(evento.clientX, evento.clientY);
    });

    window.addEventListener('mousemove', (evento) => {
        if (!arrastrando) return;
        moverA(evento.clientX, evento.clientY);
    });

    window.addEventListener('mouseup', terminarArrastre);

    // ===== TÁCTIL (celulares/tablets) =====

    mascota.addEventListener('touchstart', (evento) => {
        const toque = evento.touches[0];
        iniciarArrastre(toque.clientX, toque.clientY);
    }, { passive: true });

    window.addEventListener('touchmove', (evento) => {
        if (!arrastrando) return;
        const toque = evento.touches[0];
        moverA(toque.clientX, toque.clientY);
    }, { passive: true });

    window.addEventListener('touchend', terminarArrastre);

    // si el sistema cancela el toque, también se vuelve a la mascota normal
    window.addEventListener('touchcancel', terminarArrastre);

    // Si cambia el tamaño de la ventana, evitamos que quede
    // fuera de la pantalla o flotando si ya estaba abajo.
    window.addEventListener('resize', () => {
        if (mascota.style.left === '') return;
        const rect = mascota.getBoundingClientRect();
        const posicion = limitarDentroDePantalla(rect.left, rect.top);
        mascota.style.transition = 'none';
        mascota.style.left = posicion.x + 'px';
        mascota.style.top = posicion.y + 'px';
    });

})();