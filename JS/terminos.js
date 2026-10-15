// =============================
// TÉRMINOS Y CONDICIONES
// - Modal con scroll, casilla y botones Aceptar / Rechazar
// - Se abre desde el login (subtítulo) y desde el registro
// - Para crear la cuenta es obligatorio haberlos aceptado
// Requiere terminos.css
// =============================

(function () {

    const SECCIONES = [
        {
            titulo: "1. Uso del Software",
            texto: "TrueLock es una solución de control y monitoreo de actividad digital. Al usar este software, aceptas utilizarlo únicamente para fines legales y con el consentimiento de las personas monitoreadas cuando así lo exija la ley aplicable."
        },
        {
            titulo: "2. Privacidad y Datos",
            texto: "Recopilamos datos de actividad del dispositivo para las funcionalidades del sistema. No vendemos ni compartimos tus datos con terceros sin tu consentimiento. Los datos se almacenan de forma segura y encriptada. Tienes derecho a solicitar la eliminación de tus datos en cualquier momento."
        },
        {
            titulo: "3. Política de Uso Aceptable",
            texto: "Queda prohibido el uso de TrueLock para actividades ilegales, espionaje no autorizado, o cualquier actividad que viole los derechos de privacidad de terceros. El administrador es responsable del uso adecuado del software en su organización."
        },
        {
            titulo: "4. Limitación de Responsabilidad",
            texto: "TrueLock se provee \"tal cual\". No garantizamos disponibilidad ininterrumpida del servicio. No somos responsables por pérdidas de datos ni daños derivados del uso del software más allá de lo permitido por la ley."
        },
        {
            titulo: "5. Modificaciones",
            texto: "Nos reservamos el derecho de modificar estos términos con previo aviso. El uso continuado del servicio implica la aceptación de los términos actualizados."
        },
        {
            id: "terminos-privacidad",
            titulo: "Privacy Policy / Política de Privacidad",
            texto: "Tratamos tus datos personales (nombre, fecha de nacimiento, documento, teléfono y correo) únicamente para crear y proteger tu cuenta y para el funcionamiento del servicio. Los menores de edad solo pueden usar TrueLock bajo la supervisión de un adulto responsable. Puedes consultar, corregir o eliminar tus datos escribiendo a soporte@truelock.com."
        }
    ];

    let aceptado = false;
    let elementoPrevio = null;

    // ---- Construcción del modal ----

    function crear(etiqueta, clase, texto) {

        const nodo = document.createElement(etiqueta);

        if (clase) {
            nodo.className = clase;
        }

        if (texto) {
            nodo.textContent = texto;
        }

        return nodo;

    }

    const overlay = crear("div", "terminos-overlay");
    overlay.hidden = true;

    const modal = crear("div", "terminos-modal");
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-labelledby", "terminos-titulo");
    modal.tabIndex = -1;

    // Cabecera

    const cabecera = crear("div", "terminos-cabecera");

    cabecera.innerHTML =
        '<svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">' +
        '<path d="M12 3l7 3v5.5c0 4.2-2.8 7.6-7 9.5-4.2-1.9-7-5.3-7-9.5V6l7-3z" ' +
        'fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>';

    const bloqueTitulo = crear("div");
    const titulo = crear("h2", "", "Términos y Condiciones / Terms & Conditions");
    titulo.id = "terminos-titulo";

    bloqueTitulo.appendChild(titulo);
    bloqueTitulo.appendChild(crear("p", "", "TrueLock Pro Edition"));
    cabecera.appendChild(bloqueTitulo);

    // Cuerpo con scroll

    const cuerpo = crear("div", "terminos-cuerpo");

    SECCIONES.forEach(function (seccion) {

        const h = crear("h3", "", seccion.titulo);

        if (seccion.id) {
            h.id = seccion.id;
        }

        cuerpo.appendChild(h);
        cuerpo.appendChild(crear("p", "", seccion.texto));

    });

    // Pie: casilla + botones

    const pie = crear("div", "terminos-pie");

    const etiquetaCheck = crear("label", "terminos-modal-check");

    const checkModal = document.createElement("input");
    checkModal.type = "checkbox";
    checkModal.id = "terminos-modal-check";

    const textoCheck = crear("span");

    textoCheck.appendChild(document.createTextNode("He leído y acepto los "));
    textoCheck.appendChild(crear("strong", "", "Términos y Condiciones"));
    textoCheck.appendChild(document.createTextNode(" y la "));
    textoCheck.appendChild(crear("strong", "", "Política de Privacidad"));
    textoCheck.appendChild(document.createTextNode(" de TrueLock."));

    etiquetaCheck.appendChild(checkModal);
    etiquetaCheck.appendChild(textoCheck);

    const acciones = crear("div", "terminos-acciones");

    const botonAceptar = crear("button", "terminos-aceptar", "✓ Aceptar / Accept");
    botonAceptar.type = "button";
    botonAceptar.disabled = true;

    const botonRechazar = crear("button", "terminos-rechazar", "✕ Rechazar / Reject");
    botonRechazar.type = "button";

    acciones.appendChild(botonAceptar);
    acciones.appendChild(botonRechazar);

    pie.appendChild(etiquetaCheck);
    pie.appendChild(acciones);

    modal.appendChild(cabecera);
    modal.appendChild(cuerpo);
    modal.appendChild(pie);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // ---- Casilla del formulario de registro ----

    const checkRegistro = document.getElementById("registro-terminos");

    function sincronizar() {

        if (checkRegistro) {
            checkRegistro.checked = aceptado;
        }

    }

    // ---- Abrir / cerrar ----

    function abrir(irAPrivacidad) {

        elementoPrevio = document.activeElement;

        checkModal.checked = aceptado;
        botonAceptar.disabled = !aceptado;

        overlay.hidden = false;
        document.body.style.overflow = "hidden";

        cuerpo.scrollTop = 0;

        if (irAPrivacidad) {

            const destino = document.getElementById("terminos-privacidad");

            if (destino) {
                cuerpo.scrollTop = destino.offsetTop - cuerpo.offsetTop;
            }

        }

        modal.focus();

    }

    function cerrar() {

        overlay.hidden = true;
        document.body.style.overflow = "";

        if (elementoPrevio && typeof elementoPrevio.focus === "function") {
            elementoPrevio.focus();
        }

    }

    // ---- Eventos ----

    checkModal.addEventListener("change", function () {

        botonAceptar.disabled = !checkModal.checked;

    });

    botonAceptar.addEventListener("click", function () {

        if (!checkModal.checked) {
            return;
        }

        aceptado = true;

        sincronizar();
        cerrar();

        if (typeof mostrarToast === "function") {
            mostrarToast("Términos y Condiciones aceptados.");
        }

    });

    botonRechazar.addEventListener("click", function () {

        aceptado = false;

        sincronizar();
        cerrar();

        if (typeof mostrarToast === "function") {
            mostrarToast("Debes aceptar los Términos y Condiciones para crear tu cuenta.");
        }

    });

    // Clic fuera de la ventana = cerrar sin cambiar la decisión

    overlay.addEventListener("click", function (evento) {

        if (evento.target === overlay) {
            cerrar();
        }

    });

    document.addEventListener("keydown", function (evento) {

        if (evento.key === "Escape" && !overlay.hidden) {
            cerrar();
        }

    });

    // Enlaces "Términos y Condiciones" / "Política de Privacidad"

    document.querySelectorAll("[data-abrir-terminos]").forEach(function (enlace) {

        enlace.addEventListener("click", function (evento) {

            evento.preventDefault();

            abrir(enlace.getAttribute("data-abrir-terminos") === "privacidad");

        });

    });

    // Marcar la casilla del registro abre la ventana (hay que leerlos y aceptar ahí).
    // Desmarcarla sí se puede hacer directamente.

    if (checkRegistro) {

        checkRegistro.addEventListener("click", function (evento) {

            if (checkRegistro.checked) {

                evento.preventDefault();

                abrir(false);

            } else {

                aceptado = false;

            }

        });

    }

    // Al limpiar el formulario de registro se vuelve a pedir la aceptación

    const formRegistro = document.getElementById("form-registro");

    if (formRegistro) {

        formRegistro.addEventListener("reset", function () {

            aceptado = false;

        });

    }

    // ---- API pública ----

    window.terminosAceptados = function () {

        return aceptado;

    };

    window.abrirTerminos = function () {

        abrir(false);

    };

})();
