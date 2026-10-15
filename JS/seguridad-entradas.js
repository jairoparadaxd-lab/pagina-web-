// ============================================================
// BLOQUEO DE COMILLAS Y COMANDOS EN TODOS LOS CAMPOS
// Cargar ANTES de login.js
//
// - No deja escribir, pegar ni autocompletar comillas de ningún tipo.
// - Bloquea los caracteres usados para ejecutar o encadenar comandos.
// - Borra el campo si detecta un comando (SQL, shell, JavaScript).
// ============================================================

(function () {

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
        /\bon[a-z]+\s*=/i
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

    function tieneComando(texto) {

        return PATRONES_COMANDO.some(function (patron) {
            return patron.test(texto);
        });

    }

    // Deja el campo limpio. Devuelve true si cambió algo.

    function limpiarCampo(el) {

        const original = el.value;

        if (!original) {
            return false;
        }

        let posicion = null;

        try {
            posicion = el.selectionStart;
        } catch (e) { }

        let limpio = original.replace(PROHIBIDOS, "");

        let aviso = "";

        if (limpio !== original) {
            aviso = "No se permiten comillas ni caracteres de comandos.";
        }

        if (!esContrasena(el) && tieneComando(limpio)) {

            limpio = "";
            aviso = "No se permiten comandos en este campo.";

        }

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

        avisar(aviso);

        return true;

    }

    // 1) Al teclear: se bloquea la letra antes de que aparezca

    document.addEventListener("beforeinput", function (evento) {

        const el = evento.target;

        if (!esCampoDeTexto(el)) {
            return;
        }

        const dato = evento.data || "";

        PROHIBIDOS.lastIndex = 0;

        if (dato && PROHIBIDOS.test(dato)) {

            evento.preventDefault();

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
