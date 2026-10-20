// ============================================================
// MEDIDOR DE CONTRASEÑA CON CANDADO
// Cargar DESPUÉS de login.js
//
// No usa @property, color-mix() ni transform de CSS sobre SVG.
// El arco se mueve con el atributo "transform" del SVG, animado
// desde JS, así que funciona en cualquier navegador.
// ============================================================

(function () {

    const inputPassword = document.getElementById("registro-password");
    const meter = document.getElementById("pw-meter");

    if (!inputPassword || !meter) {
        console.warn("[pw] Falta #registro-password o #pw-meter en el HTML.");
        return;
    }

    // Nivel mínimo para poder crear la cuenta:
    // 0 = sin contraseña, 1 = débil, 2 = media, 3 = fuerte, 4 = muy segura
    const NIVEL_MINIMO = 2;

    const BITS_MAX = 90;           // a partir de aquí el candado ya es 100% azul
    const LIMITES = [34, 60, 80];  // bits donde cambia de nivel

    const BITS_CIERRE = 60;        // bits a los que el arco queda del todo abajo
    const ARCO_ABIERTO = -9;       // desplazamiento del arco con el candado abierto

    const COLOR_REPOSO = [110, 118, 129];   // #6e7681
    const COLOR_BORDE = [33, 38, 45];       // #21262d
    const COLOR_FONDO_BASE = [225, 6, 0];   // #e10600

    // ----- Tema claro: tonos más profundos para que se noten sobre fondo claro -----
    const COLOR_REPOSO_CLARO = [140, 128, 130];
    const COLOR_BORDE_CLARO = [214, 196, 192];
    const COLOR_FONDO_BASE_CLARO = [224, 92, 80];   // coral cálido (no rojo sangre)
    const COLOR_ESQUINA_CLARO = [168, 78, 88];      // rosa vino suave para la esquina

    const PARADAS_CLARO = [
        [0, [214, 40, 40]],     // rojo
        [28, [214, 40, 40]],
        [40, [232, 138, 0]],    // ámbar
        [56, [232, 138, 0]],
        [66, [22, 163, 88]],    // verde
        [76, [22, 163, 88]],
        [88, [30, 100, 235]]    // azul
    ];

    // Paradas de color: [bits, [r, g, b]]. Entre paradas se interpola.
    const PARADAS = [
        [0, [229, 37, 42]],     // rojo
        [28, [229, 37, 42]],
        [40, [245, 184, 0]],    // amarillo
        [56, [245, 184, 0]],
        [66, [46, 204, 113]],   // verde
        [76, [46, 204, 113]],
        [88, [47, 128, 255]]    // azul
    ];

    const NIVELES = [
        { nombre: "Sin contraseña", mensaje: "El candado está abierto." },
        { nombre: "Débil", mensaje: "Se puede adivinar con facilidad." },
        { nombre: "Media", mensaje: "Añade longitud o símbolos para mejorarla." },
        { nombre: "Fuerte", mensaje: "Buena contraseña. Un poco más y es máxima." },
        { nombre: "Muy segura", mensaje: "Candado sellado. Nivel máximo." }
    ];

    const COMUNES = [
        "password", "contrasena", "contraseña", "123456", "12345678", "123456789",
        "qwerty", "abc123", "admin", "letmein", "iloveyou", "truelock",
        "111111", "000000", "colombia", "password1", "qwerty123"
    ];

    const SECUENCIAS = [
        "abcdefghijklmnopqrstuvwxyz", "0123456789", "qwertyuiop", "asdfghjkl", "zxcvbnm"
    ];

    const elBody = document.body;
    const elCard = meter.closest(".auth-card");
    const elLabel = document.getElementById("pw-label");
    const elBits = document.getElementById("pw-bits");
    const elMsg = document.getElementById("pw-msg");
    const elFill = document.getElementById("pw-fill");
    const elShackle = document.getElementById("pw-shackle");
    const elSvg = meter.querySelector(".pw-lock svg");
    const elCuerpo = meter.querySelector(".pw-body");
    const elReqs = meter.querySelectorAll("[data-req]");

    if (!elShackle) {
        console.warn("[pw] No se encontró #pw-shackle: el candado no se podrá animar.");
    }

    const REQUISITOS = {
        largo: function (p) { return p.length >= 8; },
        mayus: function (p) { return /[A-ZÁÉÍÓÚÑ]/.test(p); },
        minus: function (p) { return /[a-záéíóúñ]/.test(p); },
        numero: function (p) { return /\d/.test(p); },
        simbolo: function (p) { return /[^A-Za-z0-9ÁÉÍÓÚÑáéíóúñ]/.test(p); }
    };


    // ---------- Utilidades de color ----------

    function rgb(c) {
        return "rgb(" + c[0] + ", " + c[1] + ", " + c[2] + ")";
    }

    function rgba(c, alfa) {
        return "rgba(" + c[0] + ", " + c[1] + ", " + c[2] + ", " + alfa + ")";
    }

    function mezclar(a, b, t) {
        return [
            Math.round(a[0] + (b[0] - a[0]) * t),
            Math.round(a[1] + (b[1] - a[1]) * t),
            Math.round(a[2] + (b[2] - a[2]) * t)
        ];
    }


    // ---------- Cálculo de la fuerza ----------

    function contarSecuencias(pw) {

        const min = pw.toLowerCase();
        let total = 0;

        for (let i = 0; i <= min.length - 3; i++) {

            const trio = min.slice(i, i + 3);
            const inverso = trio.split("").reverse().join("");

            const esSecuencia = SECUENCIAS.some(function (s) {
                return s.indexOf(trio) !== -1 || s.indexOf(inverso) !== -1;
            });

            if (esSecuencia) {
                total++;
            }

        }

        return total;

    }

    function calcularBits(pw) {

        if (!pw) {
            return 0;
        }

        const min = pw.toLowerCase();

        const esComun = COMUNES.some(function (c) {
            return min === c || min.replace(/\d+$/, "") === c;
        });

        if (esComun) {
            return Math.min(10, pw.length);
        }

        let pool = 0;

        if (/[a-záéíóúñ]/.test(pw)) { pool += 27; }
        if (/[A-ZÁÉÍÓÚÑ]/.test(pw)) { pool += 27; }
        if (/\d/.test(pw)) { pool += 10; }
        if (/[^A-Za-z0-9ÁÉÍÓÚÑáéíóúñ]/.test(pw)) { pool += 33; }

        if (pool <= 1) {
            return 0;
        }

        // Los caracteres repetidos aportan muy poco
        const unicos = new Set(pw.split("")).size;
        const efectivos = unicos + (pw.length - unicos) * 0.25;

        let bits = efectivos * Math.log2(pool) * 0.85;

        // Penalización por secuencias tipo "abc", "123", "qwe"
        bits -= contarSecuencias(pw) * 6;

        return Math.max(0, bits);

    }

    function nivelDeBits(bits) {

        if (bits <= 0) { return 0; }
        if (bits < LIMITES[0]) { return 1; }
        if (bits < LIMITES[1]) { return 2; }
        if (bits < LIMITES[2]) { return 3; }

        return 4;

    }

    function esClaro() {
        return document.documentElement.getAttribute("data-tema") === "light";
    }

    function colorBase() {
        return esClaro() ? COLOR_FONDO_BASE_CLARO : COLOR_FONDO_BASE;
    }

    function colorDeBits(bits) {

        const paradas = esClaro() ? PARADAS_CLARO : PARADAS;

        if (bits <= paradas[0][0]) {
            return paradas[0][1];
        }

        for (let i = 1; i < paradas.length; i++) {

            const a = paradas[i - 1];
            const b = paradas[i];

            if (bits <= b[0]) {
                return mezclar(a[1], b[1], (bits - a[0]) / (b[0] - a[0]));
            }

        }

        return paradas[paradas.length - 1][1];

    }


    // ---------- Movimiento del arco ----------
    // Se anima el atributo "transform" del SVG desde JS.
    // Es la única forma que se comporta igual en todos los navegadores.

    let arcoActual = ARCO_ABIERTO;
    let arcoObjetivo = ARCO_ABIERTO;
    let animacion = null;

    function pintarArco() {

        if (!elShackle) {
            return;
        }

        elShackle.setAttribute("transform", "translate(0 " + arcoActual.toFixed(2) + ")");

    }

    function pasoAnimacion() {

        const diferencia = arcoObjetivo - arcoActual;

        if (Math.abs(diferencia) < 0.05) {

            arcoActual = arcoObjetivo;
            pintarArco();

            animacion = null;

            return;

        }

        arcoActual += diferencia * 0.2;

        pintarArco();

        animacion = requestAnimationFrame(pasoAnimacion);

    }

    function moverArco(destino) {

        arcoObjetivo = destino;

        if (animacion === null) {
            animacion = requestAnimationFrame(pasoAnimacion);
        }

    }


    // ---------- Fondo de la página ----------
    // El color se anima en JS (los degradados no se pueden transicionar con CSS),
    // así el cambio entre rojo, ámbar, verde y azul se ve fluido.

    let fondoActual = null;
    let fondoObjetivo = null;
    let animFondo = null;

    function renderFondo(c) {

        const color = [Math.round(c[0]), Math.round(c[1]), Math.round(c[2])];

        if (esClaro()) {

            const esquina = mezclar(COLOR_ESQUINA_CLARO, color, 0.45);

            elBody.style.backgroundImage =
                "radial-gradient(circle at 0% 100%, " + rgba(color, 0.62) + ", transparent 62%)," +
                "radial-gradient(circle at 100% 0%, " + rgba(color, 0.46) + ", transparent 58%)," +
                "radial-gradient(circle at 100% 100%, " + rgba(color, 0.56) + ", transparent 62%)," +
                "radial-gradient(circle at 0% 0%, " + rgba(esquina, 0.42) + ", transparent 55%)";

        } else {

            elBody.style.backgroundImage =
                "radial-gradient(circle at 0% 100%, " + rgba(color, 0.3) + ", transparent 55%)," +
                "radial-gradient(circle at 100% 0%, " + rgba(color, 0.18) + ", transparent 50%)," +
                "radial-gradient(circle at 100% 100%, " + rgba(color, 0.24) + ", transparent 55%)," +
                "radial-gradient(circle at 0% 0%, rgba(0, 0, 0, 0.6), transparent 45%)";

        }

    }

    function pasoFondo() {

        let falta = 0;

        for (let k = 0; k < 3; k++) {

            const d = fondoObjetivo[k] - fondoActual[k];

            fondoActual[k] += d * 0.14;

            falta = Math.max(falta, Math.abs(d));

        }

        if (falta < 0.6) {

            fondoActual = fondoObjetivo.slice();
            renderFondo(fondoActual);

            animFondo = null;

            return;

        }

        renderFondo(fondoActual);

        animFondo = requestAnimationFrame(pasoFondo);

    }

    function pintarFondo(color) {

        fondoObjetivo = color.slice();

        if (!fondoActual) {

            fondoActual = color.slice();
            renderFondo(fondoActual);

            return;

        }

        if (animFondo === null) {
            animFondo = requestAnimationFrame(pasoFondo);
        }

    }


    // ---------- Pintar todo ----------

    let nivelActual = 0;

    function actualizar() {

        const pw = inputPassword.value;
        const bits = calcularBits(pw);
        const nivel = nivelDeBits(bits);
        const progreso = Math.min(bits / BITS_MAX, 1);

        nivelActual = nivel;

        const claro = esClaro();
        const color = nivel === 0
            ? (claro ? COLOR_REPOSO_CLARO : COLOR_REPOSO)
            : colorDeBits(bits);
        const colorTexto = rgb(color);

        // En tema claro el texto va más oscuro para mantener el contraste
        const colorLetra = rgb(claro ? mezclar(color, [0, 0, 0], 0.32) : color);

        // Candado

        if (elShackle) {
            elShackle.style.stroke = colorTexto;
        }

        if (elCuerpo) {
            elCuerpo.style.fill = colorTexto;
        }

        if (elSvg) {

            const brillo = nivel === 0 ? 0 : Math.round(progreso * progreso * 16);

            elSvg.style.filter =
                brillo > 0 ? "drop-shadow(0 0 " + brillo + "px " + colorTexto + ")" : "none";

        }

        moverArco(ARCO_ABIERTO * (1 - Math.min(bits / BITS_CIERRE, 1)));

        // Borde de la tarjeta

        meter.style.borderColor = rgb(
            mezclar(claro ? COLOR_BORDE_CLARO : COLOR_BORDE, color, claro ? 0.9 : 0.45)
        );

        // Solo en tema claro: la tarjeta del medidor y la tarjeta principal se tiñen
        meter.style.backgroundColor = claro
            ? rgba(color, nivel === 0 ? 0.06 : 0.16)
            : "";

        if (elCard) {
            elCard.style.boxShadow = claro
                ? "0 25px 60px " + rgba(color, nivel === 0 ? 0.14 : 0.38)
                : "";
        }

        // Barra y textos

        if (elFill) {
            elFill.style.width = (progreso * 100).toFixed(1) + "%";
            elFill.style.backgroundColor = colorTexto;
        }

        if (elLabel) {
            elLabel.textContent = NIVELES[nivel].nombre;
            elLabel.style.color = colorLetra;
        }

        if (elMsg) {
            elMsg.textContent = NIVELES[nivel].mensaje;
        }

        if (elBits) {
            elBits.textContent = Math.round(bits) + " bits";
        }

        meter.classList.toggle("maximo", nivel === 4);

        // Requisitos

        elReqs.forEach(function (li) {

            const prueba = REQUISITOS[li.getAttribute("data-req")];
            const cumple = !!prueba && prueba(pw);

            li.classList.toggle("ok", cumple);

            if (cumple) {
                li.style.color = colorLetra;
                li.style.borderColor = rgba(color, claro ? 0.85 : 0.55);
                li.style.backgroundColor = rgba(color, claro ? 0.2 : 0.12);
            } else {
                li.style.color = "";
                li.style.borderColor = "";
                li.style.backgroundColor = "";
            }

        });

        // Fondo de la página

        pintarFondo(nivel === 0 ? colorBase() : color);

    }

    function restablecerFondo() {

        pintarFondo(colorBase());

        if (elCard) {
            elCard.style.boxShadow = "";
        }

    }

    inputPassword.addEventListener("input", actualizar);

    // "change" cubre el autocompletado y los gestores de contraseñas,
    // que a veces no disparan "input".

    inputPassword.addEventListener("change", actualizar);


    // ---------- Integración con el resto de la página ----------

    document.querySelectorAll(".nav-link").forEach(function (enlace) {

        enlace.addEventListener("click", function () {

            if (enlace.getAttribute("data-target") === "view-registro") {
                actualizar();
            } else {
                restablecerFondo();
            }

        });

    });

    const formRegistro = document.getElementById("form-registro");

    if (formRegistro) {

        formRegistro.addEventListener("reset", function () {
            setTimeout(actualizar, 0);
        });

        // Bloquea el registro si la contraseña no llega al nivel mínimo.
        // Se ejecuta antes que el envío original de login.js.

        formRegistro.addEventListener("submit", function (evento) {

            if (inputPassword.value && nivelActual < NIVEL_MINIMO) {

                evento.preventDefault();
                evento.stopImmediatePropagation();

                if (typeof mostrarToast === "function") {
                    mostrarToast("Tu contraseña es muy débil. Hazla más larga o añade símbolos.");
                }

            }

        }, true);

    }

    // Al cambiar de tema se repinta todo con los colores del tema nuevo

    new MutationObserver(function () {

        const vistaRegistro = document.getElementById("view-registro");

        if (vistaRegistro && vistaRegistro.classList.contains("active")) {
            actualizar();
        } else {
            restablecerFondo();
        }

    }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-tema"] });

    pintarArco();
    actualizar();

    console.log("[pw] Medidor de contraseña activo.");

})();