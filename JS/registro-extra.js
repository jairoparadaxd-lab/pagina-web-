// =============================
// REGISTRO: NOMBRE DE USUARIO + NÚMERO DE DOCUMENTO
// - Usuario: 4 a 20 caracteres, sin contenido explícito
// - Documento: máximo 20 caracteres
// =============================

(function () {

    // ---------- NOMBRE DE USUARIO ----------

    const inputUsuario = document.getElementById("registro-usuario");
    const hintUsuario = document.getElementById("usuario-hint");

    const USUARIO_MIN = 4;
    const USUARIO_MAX = 20;
    const TEXTO_BASE = "De " + USUARIO_MIN + " a " + USUARIO_MAX +
        " caracteres: letras, números, punto o guion bajo.";

    // Palabras que se bloquean si aparecen dentro del usuario (palabras largas y específicas)
    const PROHIBIDAS_CONTENIDO = [
        "mierda", "pendejo", "pendeja", "hijueputa", "hijoeputa", "malparido",
        "gonorrea", "follar", "porno", "pornografia", "pornhub", "fuck", "shit",
        "bitch", "pussy", "whore", "slut", "nigger", "nigga", "maricon",
        "cabron", "vagina", "desnud", "pedofilo", "pedophile", "violador", "rapist",
        "hitler", "nazi", "masturb", "orgasm", "erotic", "hentai"
    ];

    // Palabras cortas: solo se bloquean si son TODO el usuario o una parte separada por . o _
    // (así no se bloquean palabras normales como "computadora" o "classic")
    const PROHIBIDAS_EXACTAS = [
        "puta", "putas", "puto", "putos", "verga", "culo", "pene", "sexo", "sexy", "sex", "porn",
        "anal", "cum", "dick", "cock", "nude", "nudes", "rape", "hdp", "zorra", "perra",
        "coño", "cono", "tetas", "teta", "nalgas", "semen", "orgia", "nsfw"
    ];

    const LEET = { "0": "o", "1": "i", "3": "e", "4": "a", "5": "s", "7": "t", "8": "b", "@": "a", "$": "s" };

    function normalizar(texto) {

        return texto
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[0134578@$]/g, function (c) { return LEET[c]; })
            .replace(/(.)\1+/g, "$1");     // "puuuta" -> "puta"

    }

    function contieneExplicito(valor) {

        // 1) Palabras específicas dentro del usuario completo (sin separadores)

        const junto = normalizar(valor).replace(/[._]/g, "");

        const hayPalabra = PROHIBIDAS_CONTENIDO.some(function (p) {
            return junto.indexOf(normalizar(p)) !== -1;
        });

        if (hayPalabra) {
            return true;
        }

        // 2) Palabras cortas como parte completa del usuario
        //    (también con las letras separadas: "p.u.t.a" -> "puta")

        if (/x{3,}/i.test(valor)) {
            return true;
        }

        const partes = valor.toLowerCase().split(/[._]+/).concat(valor.toLowerCase().replace(/[._]/g, ""));

        return partes.some(function (parte) {

            const limpia = normalizar(parte.replace(/\d+$/, "")); // "puta123" -> "puta"

            return PROHIBIDAS_EXACTAS.some(function (p) {
                return normalizar(p) === limpia;
            });

        });

    }

    // Devuelve "" si es válido o el mensaje de error

    function evaluarUsuario(valor, completo) {

        if (!valor) {
            return completo ? "Escribe un nombre de usuario." : "";
        }

        if (!/^[a-zA-Z0-9._]+$/.test(valor)) {
            return "Solo se permiten letras, números, punto y guion bajo.";
        }

        if (contieneExplicito(valor)) {
            return "Ese nombre de usuario no está permitido. Elige uno sin contenido explícito u ofensivo.";
        }

        if (completo) {

            if (valor.length < USUARIO_MIN) {
                return "El nombre de usuario debe tener al menos " + USUARIO_MIN + " caracteres.";
            }

            if (!/^[a-zA-Z]/.test(valor)) {
                return "El nombre de usuario debe empezar con una letra.";
            }

        }

        return "";

    }

    function pintarUsuario(mensaje) {

        if (!inputUsuario || !hintUsuario) {
            return;
        }

        const grupo = inputUsuario.closest(".form-group");

        if (mensaje) {

            hintUsuario.textContent = mensaje;
            hintUsuario.classList.add("form-hint-error");
            grupo.classList.add("campo-invalido");

        } else {

            hintUsuario.textContent = TEXTO_BASE;
            hintUsuario.classList.remove("form-hint-error");
            grupo.classList.remove("campo-invalido");

        }

    }

    if (inputUsuario) {

        inputUsuario.setAttribute("maxlength", String(USUARIO_MAX));

        // Quita al instante los caracteres no permitidos (espacios, símbolos, emojis)

        inputUsuario.addEventListener("input", function () {

            inputUsuario.value = inputUsuario.value
                .replace(/[^a-zA-Z0-9._]/g, "")
                .slice(0, USUARIO_MAX);

            pintarUsuario(evaluarUsuario(inputUsuario.value, false));

        });

        inputUsuario.addEventListener("blur", function () {

            if (inputUsuario.value) {
                pintarUsuario(evaluarUsuario(inputUsuario.value, true));
            }

        });

        const formulario = document.getElementById("form-registro");

        if (formulario) {

            formulario.addEventListener("reset", function () {

                setTimeout(function () { pintarUsuario(""); }, 0);

            });

        }

        pintarUsuario("");

    }

    // La usa el formulario de registro al enviar

    window.validarNombreUsuario = function () {

        if (!inputUsuario) {
            return { ok: true, mensaje: "" };
        }

        const mensaje = evaluarUsuario(inputUsuario.value.trim(), true);

        pintarUsuario(mensaje);

        return { ok: !mensaje, mensaje: mensaje };

    };


    // ---------- NÚMERO DE DOCUMENTO (máx. 20) ----------

    const inputDocumento = document.getElementById("registro-numero-documento");
    const selectTipoDoc = document.getElementById("registro-tipo-documento");
    const hintDocumento = document.getElementById("documento-hint");

    const DOCUMENTO_MAX = 20;

    // Pasaporte y "Otro" pueden llevar letras; el resto solo números

    function permiteLetras() {

        return selectTipoDoc && (selectTipoDoc.value === "pasaporte" || selectTipoDoc.value === "otro");

    }

    function filtrarDocumento() {

        if (!inputDocumento) {
            return;
        }

        const letras = permiteLetras();

        let valor = inputDocumento.value.replace(letras ? /[^a-zA-Z0-9]/g : /\D/g, "");

        if (letras) {
            valor = valor.toUpperCase();
        }

        inputDocumento.value = valor.slice(0, DOCUMENTO_MAX);

        inputDocumento.setAttribute("inputmode", letras ? "text" : "numeric");

        if (hintDocumento) {

            hintDocumento.textContent =
                "Máximo " + DOCUMENTO_MAX + (letras ? " caracteres" : " dígitos") +
                " (" + inputDocumento.value.length + "/" + DOCUMENTO_MAX + ").";

        }

    }

    if (inputDocumento) {

        inputDocumento.setAttribute("maxlength", String(DOCUMENTO_MAX));

        inputDocumento.addEventListener("input", filtrarDocumento);

        if (selectTipoDoc) {
            selectTipoDoc.addEventListener("change", filtrarDocumento);
        }

        const formulario = document.getElementById("form-registro");

        if (formulario) {

            formulario.addEventListener("reset", function () {

                setTimeout(filtrarDocumento, 0);

            });

        }

        filtrarDocumento();

    }

})();
