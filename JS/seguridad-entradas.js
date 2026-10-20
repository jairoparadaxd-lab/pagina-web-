(function () {

    /* ============================================================ */
    /* CONFIGURACIÓN                                                */
    /* ============================================================ */

    // Sonido que suena cuando bloquean un carácter o intentan un comando.
    // Si tu archivo no es .mp3, cambia la extensión aquí.
    const RUTA_SONIDO_MAL = "MUSICA/mal.mp3";

    // Volumen de 0 (silencio) a 1 (máximo)
    const VOLUMEN_MAL = 0.6;

    // A dónde se saca al usuario cuando intenta una inyección o comando
    const URL_EXPULSION = "https://www.google.com";

    // Milisegundos máximos que se espera a que termine el sonido
    // antes de sacarlo de la página
    const ESPERA_MAX_EXPULSION = 1800;


    /* ============================================================ */
    /* SONIDO "MAL"                                                 */
    /* ============================================================ */

    const sonidoMal = new Audio(RUTA_SONIDO_MAL);
    sonidoMal.preload = "auto";
    sonidoMal.volume = VOLUMEN_MAL;

    function sonarMal() {

        try {

            sonidoMal.currentTime = 0;

            const promesa = sonidoMal.play();

            // el navegador puede bloquear el audio; se ignora en silencio
            if (promesa && promesa.catch) {
                promesa.catch(function () { });
            }

        } catch (e) { }

    }


    /* ============================================================ */
    /* CARACTERES PROHIBIDOS                                        */
    /* ============================================================ */

    // Comillas de cualquier tipo (rectas, curvas, angulares, tildes y acento grave)
    const COMILLAS = "\"'`´‘’‚‛“”„‟«»‹›′″˝＂＇";

    // Caracteres de comandos: < > { } \ ; | $ &
    const COMANDOS = "<>{}\\;|$&";

    const PROHIBIDOS = new RegExp(
        "[" + (COMILLAS + COMANDOS).replace(/[\]\\^-]/g, "\\$&") + "]",
        "g"
    );

    // Frases típicas de comandos. Se revisan en todos los campos menos la contraseña.
    const PATRONES_COMANDO = [
        /\b(drop|delete|insert|update|truncate|alter|create)\s+(table|from|into|database|user)\b/i,
        /\bselect\b[\s\S]+\bfrom\b/i,
        /\bunion\s+(all\s+)?select\b/i,
        /\b(or|and)\s+\d+\s*=\s*\d+/i,
        /\/\*|\*\//,
        /\b(rm\s+-|sudo\s|chmod\s|wget\s|curl\s|bash\s|sh\s+-c|nc\s+-)/i,
        /\b(powershell|cmd\.exe|cmd\s+\/c|regedit|taskkill|netsh)\b/i,
        /\b(shutdown\s+[-\/]|format\s+[a-z]:|del\s+\/|rmdir\s+\/)/i,
        /\b(eval|exec|alert|prompt|confirm|setTimeout|setInterval)\s*\(/i,
        /\b(console|document|window|localStorage|sessionStorage)\s*\./i,
        /javascript\s*:|data\s*:text\/html|vbscript\s*:/i,
        /<\s*\/?\s*(script|iframe|img|svg|object|embed|body|link|style)/i,
        // solo eventos reales (onerror=, onclick=...), para no confundir con
        // textos normales como "?online=1" en una dirección web
        /\bon(error|load|click|dblclick|mouse\w*|focus|blur|change|submit|key\w*|input|toggle|animation\w*)\s*=/i
    ];

    // Estos se revisan TAMBIÉN en las contraseñas (firmas claras de ataque,
    // que una contraseña legítima no tiene)
    const PATRONES_ESTRICTOS = [
        /\bunion\s+(all\s+)?select\b/i,
        /\b(drop|truncate)\s+(table|database)\b/i,
        /<\s*\/?\s*(script|iframe|img|svg|object|embed|body|link|style)/i,
        /javascript\s*:|vbscript\s*:/i,
        /\b(powershell|cmd\.exe)\b/i
    ];

    let ultimoAviso = 0;

    function avisar(mensaje) {

        const ahora = Date.now();

        if (ahora - ultimoAviso < 1500) {
            return;
        }

        ultimoAviso = ahora;

        if (typeof mostrarToast === "function") {
            mostrarToast(mensaje);
        }

    }

    function esCampoDeTexto(el) {

        if (!el || !el.tagName) {
            return false;
        }

        const tag = el.tagName.toLowerCase();

        if (tag === "textarea") {
            return true;
        }

        if (tag !== "input") {
            return false;
        }

        const tipo = (el.type || "text").toLowerCase();

        return ["text", "email", "password", "tel", "search", "url", "number"].indexOf(tipo) !== -1;

    }

    function esContrasena(el) {

        return el.type === "password" || /password|confirmar/i.test(el.id || "");

    }

    function coincide(patrones, texto) {

        return patrones.some(function (patron) {
            return patron.test(texto);
        });

    }

    // true si el texto parece un intento de inyección o comando
    function tieneInyeccion(texto, esPass) {

        if (!texto) {
            return false;
        }

        let decodificado = texto;

        try {
            decodificado = decodeURIComponent(texto);
        } catch (e) { }

        const patrones = esPass ? PATRONES_ESTRICTOS : PATRONES_COMANDO;

        return coincide(patrones, texto) || coincide(patrones, decodificado);

    }


    /* ============================================================ */
    /* EXPULSIÓN DE LA PÁGINA                                       */
    /* ============================================================ */

    let expulsando = false;
    let yaSalio = false;

    function vaciarTodosLosCampos() {

        document.querySelectorAll("input, textarea").forEach(function (campo) {

            try {
                campo.value = "";
            } catch (e) { }

        });

    }

    function salir() {

        if (yaSalio) {
            return;
        }

        yaSalio = true;

        window.location.replace(URL_EXPULSION);

    }

    function expulsar() {

        if (expulsando) {
            return;
        }

        expulsando = true;

        vaciarTodosLosCampos();

        if (typeof mostrarToast === "function") {
            mostrarToast("Actividad sospechosa detectada. Saliendo de la página...");
        }

        // congela la página mientras suena
        document.body.style.pointerEvents = "none";
        document.body.style.opacity = "0.4";

        sonidoMal.addEventListener("ended", salir, { once: true });

        sonarMal();

        // por si el audio no carga, está bloqueado o dura demasiado
        setTimeout(salir, ESPERA_MAX_EXPULSION);

    }


    /* ============================================================ */
    /* LIMPIEZA DE CAMPOS                                           */
    /* ============================================================ */

    // Deja el campo limpio. Devuelve true si cambió algo.

    function limpiarCampo(el) {

        if (expulsando) {
            return false;
        }

        const original = el.value;

        if (!original) {
            return false;
        }

        const esPass = esContrasena(el);

        let posicion = null;

        try {
            posicion = el.selectionStart;
        } catch (e) { }

        let limpio = original.replace(PROHIBIDOS, "");

        // 1) Intento de inyección o comando: se revisa el texto original
        //    y el ya limpio (así no se esquiva pegando <script>alert(1)</script>)
        //    → suena "mal" y se saca al usuario de la página

        if (tieneInyeccion(original, esPass) || tieneInyeccion(limpio, esPass)) {

            expulsar();

            return true;

        }

        // 2) Comillas o caracteres de comandos: se eliminan, suena "mal"

        if (limpio === original) {
            return false;
        }

        el.value = limpio;

        try {

            if (posicion !== null) {

                const antes = original.slice(0, posicion).replace(PROHIBIDOS, "").length;
                const nueva = Math.min(antes, limpio.length);

                el.setSelectionRange(nueva, nueva);

            }

        } catch (e) { }

        sonarMal();

        avisar("No se permiten comillas ni caracteres de comandos.");

        return true;

    }

    // 1) Al teclear: se bloquea la letra antes de que aparezca

    document.addEventListener("beforeinput", function (evento) {

        if (expulsando) {
            evento.preventDefault();
            return;
        }

        const el = evento.target;

        if (!esCampoDeTexto(el)) {
            return;
        }

        const dato = evento.data || "";

        PROHIBIDOS.lastIndex = 0;

        if (dato && PROHIBIDOS.test(dato)) {

            evento.preventDefault();

            sonarMal();

            avisar("No se permiten comillas ni caracteres de comandos.");

        }

        PROHIBIDOS.lastIndex = 0;

    }, true);

    // 2) Al pegar, arrastrar, autocompletar o cualquier cambio: se limpia el valor.
    //    Va en fase de captura para correr antes que los demás archivos JS.

    document.addEventListener("input", function (evento) {

        if (esCampoDeTexto(evento.target)) {
            limpiarCampo(evento.target);
        }

    }, true);

    document.addEventListener("change", function (evento) {

        if (esCampoDeTexto(evento.target)) {
            limpiarCampo(evento.target);
        }

    }, true);

    // 3) Antes de enviar cualquier formulario se revisan todos los campos

    document.addEventListener("submit", function (evento) {

        const form = evento.target;

        if (!form || !form.querySelectorAll) {
            return;
        }

        form.querySelectorAll("input, textarea").forEach(function (el) {

            if (esCampoDeTexto(el)) {
                limpiarCampo(el);
            }

        });

        // si se detectó una inyección, el formulario no se envía
        if (expulsando) {
            evento.preventDefault();
            evento.stopImmediatePropagation();
        }

    }, true);

    // 4) Los campos que se llenan solos al cargar (autocompletado del navegador)

    window.addEventListener("load", function () {

        document.querySelectorAll("input, textarea").forEach(function (el) {

            if (esCampoDeTexto(el)) {
                limpiarCampo(el);
            }

        });

    });

})();