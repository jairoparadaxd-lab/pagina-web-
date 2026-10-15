// =============================
// FECHA DE NACIMIENTO (CREAR CUENTA)
// Calendario personalizado + validación de fecha y edad mínima.
// Cargar DESPUÉS de login.js
//
// - Se puede escribir: solo números, y las " / " se agregan solas (DD / MM / AAAA).
// - Se puede elegir en el calendario: se abre al entrar en la casilla
//   (clic o foco) o con el botón de la derecha.
// =============================

(function () {

    const campo = document.getElementById("fecha-campo");
    const visibleOriginal = document.getElementById("registro-fecha-visible");
    const oculto = document.getElementById("registro-fecha-nacimiento");
    const botonOriginal = document.getElementById("fecha-abrir");
    const popupOriginal = document.getElementById("fecha-popup");
    const hint = document.getElementById("fecha-hint");
    const selectTipo = document.getElementById("registro-tipo");
    const formulario = document.getElementById("form-registro");

    if (!campo || !visibleOriginal || !oculto || !botonOriginal || !popupOriginal || !hint) {
        return;
    }

    // login.js trae una copia de este mismo bloque. Para que los eventos no se dupliquen
    // (el botón abría y cerraba el calendario a la vez), se reemplazan los elementos por
    // copias limpias y este archivo queda como único responsable de la fecha.

    function sinEventos(nodo) {

        const copia = nodo.cloneNode(true);

        nodo.parentNode.replaceChild(copia, nodo);

        return copia;

    }

    const visible = sinEventos(visibleOriginal);
    const botonAbrir = sinEventos(botonOriginal);
    const popup = sinEventos(popupOriginal);

    popup.hidden = true;

    const grupo = visible.closest(".form-group");

    // ---- Configuración ----

    const EDAD_MINIMA = { participante: 5, director: 18, administrador: 18 };

    const ROL_TEXTO = {
        participante: "los participantes",
        director: "los directores",
        administrador: "los administradores"
    };

    const ANIO_MINIMO = 1900;
    const ANIOS_EN_CHIPS = 100;

    const MESES = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    const DIAS_SEMANA = ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sá"];

    // ---- Estado ----

    let seleccion = null;   // { y, m (1-12), d }
    let vista = { y: 0, m: 0 };   // m: 0-11

    // ---- Utilidades de fecha ----

    function hoy() {

        const h = new Date();

        return new Date(h.getFullYear(), h.getMonth(), h.getDate());

    }

    function dos(n) {

        return String(n).padStart(2, "0");

    }

    function aISO(y, m, d) {

        return y + "-" + dos(m) + "-" + dos(d);

    }

    function fechaExiste(y, m, d) {

        const f = new Date(y, m - 1, d);

        return f.getFullYear() === y && f.getMonth() === m - 1 && f.getDate() === d;

    }

    function calcularEdad(y, m, d) {

        const h = hoy();

        let edad = h.getFullYear() - y;

        const aunNoCumple =
            h.getMonth() + 1 < m || (h.getMonth() + 1 === m && h.getDate() < d);

        if (aunNoCumple) {
            edad--;
        }

        return edad;

    }

    function tipoActual() {

        return selectTipo ? selectTipo.value : "participante";

    }

    function edadMinimaActual() {

        return EDAD_MINIMA[tipoActual()] || 5;

    }

    // Fecha de nacimiento más reciente permitida: hoy menos la edad mínima del tipo de cuenta
    // (participante 5 años, director y administrador 18 años).

    function fechaLimite() {

        const h = hoy();
        const anio = h.getFullYear() - edadMinimaActual();

        let f = new Date(anio, h.getMonth(), h.getDate());

        // 29 de febrero en un año no bisiesto: usar el último día de febrero
        if (f.getMonth() !== h.getMonth()) {
            f = new Date(anio, h.getMonth() + 1, 0);
        }

        return f;

    }

    // ¿Estos dígitos pueden llegar a ser una fecha real y permitida?
    // Se usa al escribir para no dejar pasar días, meses o años imposibles,
    // fechas futuras ni fechas que no cumplan la edad mínima.

    function prefijoValido(dg) {

        const n = dg.length;

        if (n === 0) {
            return true;
        }

        if (Number(dg[0]) > 3) {
            return false;
        }

        if (n >= 2) {
            const d = Number(dg.slice(0, 2));
            if (d < 1 || d > 31) { return false; }
        }

        if (n >= 3 && Number(dg[2]) > 1) {
            return false;
        }

        if (n >= 4) {

            const d = Number(dg.slice(0, 2));
            const m = Number(dg.slice(2, 4));
            const maxDia = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

            if (m < 1 || m > 12 || d > maxDia[m - 1]) {
                return false;
            }

        }

        if (n >= 5) {

            const d = Number(dg.slice(0, 2));
            const m = Number(dg.slice(2, 4));
            const prefijo = dg.slice(4);
            const limite = fechaLimite();

            // Debe existir algún año que empiece así y dé una fecha real y permitida
            for (let y = limite.getFullYear(); y >= ANIO_MINIMO; y--) {

                if (String(y).indexOf(prefijo) !== 0) { continue; }

                if (fechaExiste(y, m, d) && new Date(y, m - 1, d) <= limite) {
                    return true;
                }

            }

            return false;

        }

        return true;

    }

    // Se queda con los dígitos válidos y corta en el primero que no lo es

    function recortarValidos(dg) {

        let ok = "";

        for (let i = 0; i < dg.length; i++) {

            if (!prefijoValido(ok + dg[i])) {
                break;
            }

            ok += dg[i];

        }

        return ok;

    }

    function textoLimite() {

        const f = fechaLimite();

        return dos(f.getDate()) + " / " + dos(f.getMonth() + 1) + " / " + f.getFullYear();

    }

    function formatear(digitos) {

        let texto = digitos.slice(0, 2);

        if (digitos.length > 2) {
            texto += " / " + digitos.slice(2, 4);
        }

        if (digitos.length > 4) {
            texto += " / " + digitos.slice(4, 8);
        }

        return texto;

    }

    function parsear(digitos) {

        return {
            d: parseInt(digitos.slice(0, 2), 10),
            m: parseInt(digitos.slice(2, 4), 10),
            y: parseInt(digitos.slice(4, 8), 10)
        };

    }

    // Devuelve "" si la fecha es válida, o el mensaje de error.

    function evaluar(y, m, d, tipo) {

        if (y < ANIO_MINIMO || !fechaExiste(y, m, d)) {
            return "Fecha inválida. Revisa el día, el mes y el año.";
        }

        if (new Date(y, m - 1, d) > hoy()) {
            return "Fecha inválida: no puede ser posterior a hoy.";
        }

        const minimo = EDAD_MINIMA[tipo] || 5;

        if (calcularEdad(y, m, d) < minimo) {
            return "Edad mínima para " + (ROL_TEXTO[tipo] || "este tipo de cuenta") +
                ": " + minimo + " años.";
        }

        return "";

    }

    // ---- Mensaje bajo el campo ----

    function pintarHint(mensaje) {

        if (mensaje) {

            hint.textContent = mensaje;
            hint.classList.add("form-hint-error");
            grupo.classList.add("campo-invalido");

        } else {

            hint.textContent = "Edad mínima: " + edadMinimaActual() + " años.";
            hint.classList.remove("form-hint-error");
            grupo.classList.remove("campo-invalido");

        }

    }

    // Guarda (o descarta) la fecha según sea válida. Devuelve true si es válida.

    function aplicar(y, m, d) {

        const mensaje = evaluar(y, m, d, tipoActual());

        if (mensaje) {

            oculto.value = "";
            seleccion = null;

            pintarHint(mensaje);

            return false;

        }

        seleccion = { y: y, m: m, d: d };

        oculto.value = aISO(y, m, d);

        pintarHint("");

        return true;

    }

    function limpiar() {

        visible.value = "";
        oculto.value = "";
        seleccion = null;

        pintarHint("");
        cerrar();

    }

    // ---- Calendario ----

    function crear(etiqueta, clase) {

        const nodo = document.createElement(etiqueta);

        if (clase) {
            nodo.className = clase;
        }

        return nodo;

    }

    function cambiarMes(delta) {

        let m = vista.m + delta;
        let y = vista.y;

        if (m < 0) { m = 11; y--; }
        if (m > 11) { m = 0; y++; }

        vista = { y: y, m: m };

        render();

    }

    function elegirDia(d) {

        const y = vista.y;
        const m = vista.m + 1;

        visible.value = formatear(dos(d) + dos(m) + String(y));

        aplicar(y, m, d);

        cerrar();

    }

    function render() {

        const h = fechaLimite();
        const anioMax = h.getFullYear();

        popup.textContent = "";

        // Chips de años

        const chips = crear("div", "fecha-anios");

        for (let a = anioMax; a >= Math.max(ANIO_MINIMO, anioMax - ANIOS_EN_CHIPS); a--) {

            const chip = crear("button", "fecha-anio");

            chip.type = "button";
            chip.textContent = a;

            if (a === vista.y) {
                chip.classList.add("activo");
            }

            chip.addEventListener("click", function () {

                vista.y = a;

                // No permitir quedarse en un mes futuro del año actual
                if (a === anioMax && vista.m > h.getMonth()) {
                    vista.m = h.getMonth();
                }

                render();

            });

            chips.appendChild(chip);

        }

        popup.appendChild(chips);

        // Encabezado: mes y año con flechas

        const cabecera = crear("div", "fecha-cabecera");

        const anterior = crear("button", "fecha-nav");
        anterior.type = "button";
        anterior.textContent = "‹";
        anterior.setAttribute("aria-label", "Mes anterior");
        anterior.disabled = vista.y <= ANIO_MINIMO && vista.m === 0;
        anterior.addEventListener("click", function () { cambiarMes(-1); });

        const titulo = crear("strong", "fecha-titulo");
        titulo.textContent = MESES[vista.m] + " " + vista.y;

        const siguiente = crear("button", "fecha-nav");
        siguiente.type = "button";
        siguiente.textContent = "›";
        siguiente.setAttribute("aria-label", "Mes siguiente");
        siguiente.disabled = vista.y >= anioMax && vista.m >= h.getMonth();
        siguiente.addEventListener("click", function () { cambiarMes(1); });

        cabecera.appendChild(anterior);
        cabecera.appendChild(titulo);
        cabecera.appendChild(siguiente);

        popup.appendChild(cabecera);

        // Cuadrícula de días

        const grilla = crear("div", "fecha-grilla");

        DIAS_SEMANA.forEach(function (nombre) {

            const celda = crear("span", "fecha-semana");
            celda.textContent = nombre;
            grilla.appendChild(celda);

        });

        const primerDia = new Date(vista.y, vista.m, 1).getDay();
        const totalDias = new Date(vista.y, vista.m + 1, 0).getDate();

        for (let i = 0; i < primerDia; i++) {
            grilla.appendChild(crear("span", "fecha-vacio"));
        }

        for (let d = 1; d <= totalDias; d++) {

            const boton = crear("button", "fecha-dia");
            const fecha = new Date(vista.y, vista.m, d);

            boton.type = "button";
            boton.textContent = d;

            if (fecha > h) {

                boton.disabled = true;

            } else {

                boton.addEventListener("click", function () { elegirDia(d); });

            }

            if (fecha.getTime() === hoy().getTime()) {
                boton.classList.add("hoy");
            }

            if (seleccion && seleccion.y === vista.y && seleccion.m === vista.m + 1 && seleccion.d === d) {
                boton.classList.add("elegido");
            }

            grilla.appendChild(boton);

        }

        popup.appendChild(grilla);

        // Dejar visible el año elegido dentro de la fila de chips

        const activo = chips.querySelector(".activo");

        if (activo) {
            chips.scrollLeft = activo.offsetLeft - chips.clientWidth / 2 + activo.offsetWidth / 2;
        }

    }

    function abrir() {

        if (!popup.hidden) {
            return;
        }

        if (seleccion) {

            vista = { y: seleccion.y, m: seleccion.m - 1 };

        } else {

            // Abre cerca de una edad válida para el tipo de cuenta elegido
            vista = { y: fechaLimite().getFullYear(), m: 0 };

        }

        popup.hidden = false;
        botonAbrir.setAttribute("aria-expanded", "true");

        render();

    }

    function cerrar() {

        popup.hidden = true;
        botonAbrir.setAttribute("aria-expanded", "false");

    }

    // ---- Eventos ----

    // Botón de la derecha: abre / cierra el calendario

    botonAbrir.addEventListener("click", function () {

        if (popup.hidden) {
            abrir();
        } else {
            cerrar();
        }

    });

    // Al entrar en la casilla (clic o foco) se abre el calendario;
    // aun así se puede seguir escribiendo.

    visible.addEventListener("focus", abrir);
    visible.addEventListener("click", abrir);

    // Los clics dentro del calendario no deben cerrarlo (los botones se re-dibujan)

    popup.addEventListener("click", function (evento) {

        evento.stopPropagation();

    });

    document.addEventListener("click", function (evento) {

        if (!campo.contains(evento.target)) {
            cerrar();
        }

    });

    document.addEventListener("keydown", function (evento) {

        if (evento.key === "Escape") {
            cerrar();
        }

    });

    // Escribir a mano: solo dígitos, con las " / " puestas automáticamente

    visible.addEventListener("input", function (evento) {

        const crudos = visible.value.replace(/\D/g, "").slice(0, 8);
        const digitos = recortarValidos(crudos);
        const rechazado = digitos.length < crudos.length;
        const borrando = evento.inputType && evento.inputType.indexOf("delete") === 0;

        let texto = formatear(digitos);

        // Al completar el día o el mes, la barra se agrega sola

        if (!borrando && (digitos.length === 2 || digitos.length === 4)) {
            texto += " / ";
        }

        visible.value = texto;

        // Se escribió algo imposible, futuro o que no cumple la edad mínima: no se deja pasar

        if (rechazado) {

            oculto.value = "";
            seleccion = null;

            pintarHint(
                "Fecha no permitida. Edad mínima: " + edadMinimaActual() +
                " años (fecha más reciente: " + textoLimite() + ")."
            );

            return;

        }

        if (digitos.length < 8) {

            oculto.value = "";
            seleccion = null;

            pintarHint("");

            return;

        }

        const p = parsear(digitos);

        if (aplicar(p.y, p.m, p.d)) {

            vista = { y: p.y, m: p.m - 1 };

            if (!popup.hidden) {
                render();
            }

        }

    });

    // Si cambia el tipo de cuenta, se vuelve a revisar la edad mínima

    if (selectTipo) {

        selectTipo.addEventListener("change", function () {

            const digitos = visible.value.replace(/\D/g, "");

            if (digitos.length === 8) {

                const p = parsear(digitos);

                aplicar(p.y, p.m, p.d);

            } else {

                pintarHint("");

            }

        });

    }

    if (formulario) {

        formulario.addEventListener("reset", function () {

            setTimeout(limpiar, 0);

        });

    }

    // ---- API pública: la usa login.js al enviar el formulario ----

    window.validarFechaNacimiento = function (tipo) {

        const digitos = visible.value.replace(/\D/g, "");

        let mensaje = "";

        if (!digitos.length) {

            mensaje = "Selecciona tu fecha de nacimiento.";

        } else if (digitos.length < 8) {

            mensaje = "Fecha inválida. Usa el formato DD / MM / AAAA.";

        } else {

            const p = parsear(digitos);

            mensaje = evaluar(p.y, p.m, p.d, tipo || tipoActual());

        }

        if (mensaje) {

            pintarHint(mensaje);

            return { ok: false, mensaje: mensaje };

        }

        return { ok: true, mensaje: "" };

    };

    pintarHint("");

})();