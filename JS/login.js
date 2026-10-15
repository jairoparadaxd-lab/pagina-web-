// =============================
// NAVEGACIÓN ENTRE VISTAS
// (login / recuperar contraseña / crear cuenta / verificación)
// =============================

const vistas = document.querySelectorAll(".auth-view");

function mostrarVista(idVista) {

    vistas.forEach(function (vista) {

        vista.classList.toggle("active", vista.id === idVista);

    });

    // Llevar el scroll arriba al cambiar de vista

    window.scrollTo({ top: 0, behavior: "smooth" });

}


const enlacesNav = document.querySelectorAll(".nav-link");

enlacesNav.forEach(function (enlace) {

    enlace.addEventListener("click", function (evento) {

        evento.preventDefault();

        const destino = this.getAttribute("data-target");

        if (destino) {

            mostrarVista(destino);

        }

    });

});


// =============================
// MOSTRAR / OCULTAR CONTRASEÑA
// =============================

const botonesOjo = document.querySelectorAll(".toggle-password");

botonesOjo.forEach(function (boton) {

    boton.addEventListener("click", function () {

        const idCampo = this.getAttribute("data-target");
        const campo = document.getElementById(idCampo);

        if (!campo) {
            return;
        }

        const oculto = campo.type === "password";

        campo.type = oculto ? "text" : "password";

        this.setAttribute(
            "aria-label",
            oculto ? "Ocultar contraseña" : "Mostrar contraseña"
        );

        this.classList.toggle("activo", oculto);

    });

});


// =============================
// TIPO DE CUENTA (REGISTRO)
// =============================

const selectTipoCuenta = document.getElementById("registro-tipo");
const hintTipoCuenta = document.getElementById("registro-tipo-hint");

function actualizarHintTipoCuenta() {

    if (!selectTipoCuenta || !hintTipoCuenta) {
        return;
    }

    const opcionSeleccionada = selectTipoCuenta.options[selectTipoCuenta.selectedIndex];
    const texto = opcionSeleccionada.getAttribute("data-hint") || "";

    // Conservar el ícono del check y solo actualizar el texto

    const icono = hintTipoCuenta.querySelector("svg");

    hintTipoCuenta.textContent = "";

    if (icono) {
        hintTipoCuenta.appendChild(icono);
    }

    hintTipoCuenta.appendChild(document.createTextNode(" " + texto));

}

if (selectTipoCuenta) {

    selectTipoCuenta.addEventListener("change", actualizarHintTipoCuenta);

}


// =============================
// INSTITUCIÓN EDUCATIVA (solo Director)
// Muestra el campo únicamente cuando el tipo de cuenta es "director".
// La lista de instituciones y la opción manual las maneja institucion.js
// =============================

const grupoInstitucion = document.getElementById("grupo-institucion");

function actualizarGrupoInstitucion() {

    if (!grupoInstitucion || !selectTipoCuenta) {
        return;
    }

    grupoInstitucion.hidden = selectTipoCuenta.value !== "director";

}

if (selectTipoCuenta) {

    selectTipoCuenta.addEventListener("change", actualizarGrupoInstitucion);

    if (selectTipoCuenta.form) {

        selectTipoCuenta.form.addEventListener("reset", function () {

            setTimeout(actualizarGrupoInstitucion, 0);

        });

    }

}

actualizarGrupoInstitucion();


// =============================
// TOAST DE NOTIFICACIÓN
// =============================

const toast = document.getElementById("toast");
let toastTimeout = null;

function mostrarToast(mensaje) {

    if (!toast) {
        return;
    }

    toast.textContent = mensaje;

    toast.classList.add("mostrar");

    clearTimeout(toastTimeout);

    toastTimeout = setTimeout(function () {

        toast.classList.remove("mostrar");

    }, 3200);

}


// =============================
// CUENTAS LOCALES (sin base de datos)
// Se guardan en el localStorage del navegador.
// Solo para prototipo: la contraseña queda en texto plano.
// =============================

const CLAVE_CUENTAS = "tl_cuentas";
const CLAVE_SESION = "tl_sesion";

// Página a la que va cada rol. Ajusta los nombres si tus archivos se llaman distinto.
const PANEL_POR_ROL = {
    participante: "participante.html",
    director: "director.html",
    administrador: "panel.html"
};

// Cuentas de prueba para poder entrar sin registrarse
const CUENTAS_DEMO = [
    { email: "participante@truelock.com", password: "Demo123*", tipo: "participante", nombres: "Participante", apellidos: "Demo" },
    { email: "director@truelock.com", password: "Demo123*", tipo: "director", nombres: "Director", apellidos: "Demo" },
    { email: "admin@truelock.com", password: "Demo123*", tipo: "administrador", nombres: "Administrador", apellidos: "Demo" }
];

function leerCuentasGuardadas() {

    try {
        return JSON.parse(localStorage.getItem(CLAVE_CUENTAS)) || [];
    } catch (e) {
        return [];
    }

}

function leerCuentas() {

    return CUENTAS_DEMO.concat(leerCuentasGuardadas());

}

function guardarCuenta(cuenta) {

    const guardadas = leerCuentasGuardadas();

    guardadas.push(cuenta);

    try {
        localStorage.setItem(CLAVE_CUENTAS, JSON.stringify(guardadas));
    } catch (e) { }

}

// NUEVO: borra una cuenta guardada (solo del localStorage, nunca las demo).
// Se usa para reemplazar una cuenta que quedó sin verificar.

function eliminarCuentaGuardada(email) {

    const buscado = email.trim().toLowerCase();

    const resto = leerCuentasGuardadas().filter(function (c) {
        return c.email.toLowerCase() !== buscado;
    });

    try {
        localStorage.setItem(CLAVE_CUENTAS, JSON.stringify(resto));
    } catch (e) { }

}

function buscarCuenta(email) {

    const buscado = email.trim().toLowerCase();

    return leerCuentas().find(function (c) {
        return c.email.toLowerCase() === buscado;
    });

}

function buscarCuentaPorTelefono(telefonoCompleto) {

    return leerCuentas().find(function (c) {
        return c.telefono === telefonoCompleto;
    });

}

function buscarCuentaPorUsuario(usuario) {

    const buscado = usuario.trim().toLowerCase();

    return leerCuentas().find(function (c) {
        return c.usuario && c.usuario.toLowerCase() === buscado;
    });

}

// Llegar al login equivale a estar sin sesión
// (así el "Cerrar sesión" de los paneles limpia la sesión sin tocar sus archivos).

try {
    localStorage.removeItem(CLAVE_SESION);
} catch (e) { }


// =============================
// SELECTOR DE CÓDIGO DE PAÍS
// (con bandera + límite de dígitos por país)
// =============================

// iso: código de 2 letras usado por flagcdn.com para la imagen de la bandera
// max: cantidad de dígitos que suele tener un celular en ese país (sin el indicativo)

const PAISES_TELEFONO = [
    { codigo: "+57", iso: "co", nombre: "Colombia", max: 10 },
    { codigo: "+1", iso: "us", nombre: "Estados Unidos", max: 10 },
    { codigo: "+52", iso: "mx", nombre: "México", max: 10 },
    { codigo: "+34", iso: "es", nombre: "España", max: 9 },
    { codigo: "+54", iso: "ar", nombre: "Argentina", max: 10 },
    { codigo: "+55", iso: "br", nombre: "Brasil", max: 11 },
    { codigo: "+56", iso: "cl", nombre: "Chile", max: 9 },
    { codigo: "+51", iso: "pe", nombre: "Perú", max: 9 },
    { codigo: "+58", iso: "ve", nombre: "Venezuela", max: 10 },
    { codigo: "+593", iso: "ec", nombre: "Ecuador", max: 9 },
    { codigo: "+591", iso: "bo", nombre: "Bolivia", max: 8 },
    { codigo: "+595", iso: "py", nombre: "Paraguay", max: 9 },
    { codigo: "+598", iso: "uy", nombre: "Uruguay", max: 8 },
    { codigo: "+507", iso: "pa", nombre: "Panamá", max: 8 },
    { codigo: "+506", iso: "cr", nombre: "Costa Rica", max: 8 },
    { codigo: "+503", iso: "sv", nombre: "El Salvador", max: 8 },
    { codigo: "+502", iso: "gt", nombre: "Guatemala", max: 8 },
    { codigo: "+504", iso: "hn", nombre: "Honduras", max: 8 },
    { codigo: "+505", iso: "ni", nombre: "Nicaragua", max: 8 },
    { codigo: "+53", iso: "cu", nombre: "Cuba", max: 8 }
];

function urlBandera(iso) {

    return "https://flagcdn.com/w40/" + iso + ".png";

}

const contenedorSelectorPais = document.getElementById("phone-code-select");
const botonSelectorPais = document.getElementById("phone-code-btn");
const listaSelectorPais = document.getElementById("phone-code-list");
const banderaSeleccionada = document.getElementById("phone-flag-selected");
const etiquetaCodigoSeleccionado = document.getElementById("phone-code-selected-label");
const inputCodigoPaisOculto = document.getElementById("registro-telefono-codigo");
const inputTelefono = document.getElementById("registro-telefono");
const hintTelefono = document.getElementById("telefono-hint");

let paisTelefonoActual = PAISES_TELEFONO[0];

function actualizarHintTelefono() {

    if (!hintTelefono || !paisTelefonoActual) {
        return;
    }

    hintTelefono.textContent =
        "Máximo " + paisTelefonoActual.max + " dígitos para " + paisTelefonoActual.nombre + ".";

}

function seleccionarPaisTelefono(pais) {

    paisTelefonoActual = pais;

    if (banderaSeleccionada) {
        banderaSeleccionada.src = urlBandera(pais.iso);
        banderaSeleccionada.alt = pais.nombre;
    }

    if (etiquetaCodigoSeleccionado) {
        etiquetaCodigoSeleccionado.textContent = pais.codigo;
    }

    if (inputCodigoPaisOculto) {
        inputCodigoPaisOculto.value = pais.codigo;
    }

    if (inputTelefono) {

        inputTelefono.setAttribute("maxlength", String(pais.max));

        // Si el número ya escrito supera el nuevo límite del país
        // seleccionado, lo recortamos para que siga siendo válido.

        if (inputTelefono.value.length > pais.max) {
            inputTelefono.value = inputTelefono.value.slice(0, pais.max);
        }

    }

    actualizarHintTelefono();

}

function construirListaPaises() {

    if (!listaSelectorPais) {
        return;
    }

    listaSelectorPais.textContent = "";

    PAISES_TELEFONO.forEach(function (pais) {

        const item = document.createElement("li");
        item.className = "phone-code-option";
        item.setAttribute("role", "option");
        item.setAttribute("data-codigo", pais.codigo);

        const img = document.createElement("img");
        img.src = urlBandera(pais.iso);
        img.alt = "";

        const nombreSpan = document.createElement("span");
        nombreSpan.className = "phone-code-option-pais";
        nombreSpan.textContent = pais.nombre;

        const codigoSpan = document.createElement("span");
        codigoSpan.className = "phone-code-option-codigo";
        codigoSpan.textContent = pais.codigo;

        item.appendChild(img);
        item.appendChild(nombreSpan);
        item.appendChild(codigoSpan);

        item.addEventListener("click", function () {

            seleccionarPaisTelefono(pais);
            cerrarListaPaises();

        });

        listaSelectorPais.appendChild(item);

    });

}

function abrirListaPaises() {

    if (!listaSelectorPais || !contenedorSelectorPais || !botonSelectorPais) {
        return;
    }

    listaSelectorPais.hidden = false;

    contenedorSelectorPais.classList.add("abierto");

    botonSelectorPais.setAttribute("aria-expanded", "true");

}

function cerrarListaPaises() {

    if (!listaSelectorPais || !contenedorSelectorPais || !botonSelectorPais) {
        return;
    }

    listaSelectorPais.hidden = true;

    contenedorSelectorPais.classList.remove("abierto");

    botonSelectorPais.setAttribute("aria-expanded", "false");

}

if (botonSelectorPais && listaSelectorPais) {

    construirListaPaises();

    seleccionarPaisTelefono(PAISES_TELEFONO[0]);

    botonSelectorPais.addEventListener("click", function (evento) {

        evento.stopPropagation();

        if (listaSelectorPais.hidden) {
            abrirListaPaises();
        } else {
            cerrarListaPaises();
        }

    });

    document.addEventListener("click", function (evento) {

        if (!contenedorSelectorPais.contains(evento.target)) {
            cerrarListaPaises();
        }

    });

    document.addEventListener("keydown", function (evento) {

        if (evento.key === "Escape") {
            cerrarListaPaises();
        }

    });

}

// El campo de teléfono solo acepta dígitos y respeta el
// límite (maxlength) del país seleccionado en cada momento.

if (inputTelefono) {

    inputTelefono.addEventListener("input", function () {

        const soloDigitos = inputTelefono.value.replace(/\D/g, "");
        const limite = paisTelefonoActual ? paisTelefonoActual.max : 15;

        inputTelefono.value = soloDigitos.slice(0, limite);

    });

}


// =============================
// SELECTOR DE PAÍS REUTILIZABLE (login y recuperar)
// =============================

function iniciarSelectorTelefono(contenedor, inputTel) {

    const boton = contenedor.querySelector(".phone-code-btn");
    const lista = contenedor.querySelector(".phone-code-list");
    const bandera = contenedor.querySelector(".phone-flag");
    const etiqueta = contenedor.querySelector(".phone-code-label");
    const estado = { pais: PAISES_TELEFONO[0] };

    function cerrar() {

        lista.hidden = true;
        contenedor.classList.remove("abierto");
        boton.setAttribute("aria-expanded", "false");

    }

    function elegir(pais) {

        estado.pais = pais;

        bandera.src = urlBandera(pais.iso);
        bandera.alt = pais.iso.toUpperCase();

        etiqueta.textContent = pais.codigo;

        inputTel.setAttribute("maxlength", String(pais.max));
        inputTel.value = inputTel.value.slice(0, pais.max);

        cerrar();

    }

    PAISES_TELEFONO.forEach(function (pais) {

        const item = document.createElement("li");
        item.className = "phone-code-option";
        item.setAttribute("role", "option");

        const img = document.createElement("img");
        img.src = urlBandera(pais.iso);
        img.alt = "";

        const nombre = document.createElement("span");
        nombre.className = "phone-code-option-pais";
        nombre.textContent = pais.nombre;

        const codigo = document.createElement("span");
        codigo.className = "phone-code-option-codigo";
        codigo.textContent = pais.codigo;

        item.appendChild(img);
        item.appendChild(nombre);
        item.appendChild(codigo);

        item.addEventListener("click", function () {
            elegir(pais);
        });

        lista.appendChild(item);

    });

    boton.addEventListener("click", function (evento) {

        evento.stopPropagation();

        if (lista.hidden) {

            lista.hidden = false;
            contenedor.classList.add("abierto");
            boton.setAttribute("aria-expanded", "true");

        } else {

            cerrar();

        }

    });

    document.addEventListener("click", function (evento) {

        if (!contenedor.contains(evento.target)) {
            cerrar();
        }

    });

    document.addEventListener("keydown", function (evento) {

        if (evento.key === "Escape") {
            cerrar();
        }

    });

    inputTel.addEventListener("input", function () {

        inputTel.value = inputTel.value.replace(/\D/g, "").slice(0, estado.pais.max);

    });

    return estado;

}

const selectorLogin = iniciarSelectorTelefono(
    document.querySelector("#view-login [data-selector-telefono]"),
    document.getElementById("login-telefono")
);

const selectorRecuperar = iniciarSelectorTelefono(
    document.querySelector("#view-recuperar [data-selector-telefono]"),
    document.getElementById("recuperar-telefono")
);


// =============================
// PESTAÑAS CORREO / TELÉFONO + ALERTAS EN LÍNEA
// =============================

function metodoActivo(grupo) {

    const activa = document.querySelector(
        '.auth-tabs[data-group="' + grupo + '"] .auth-tab.activo'
    );

    return activa ? activa.getAttribute("data-tab") : "correo";

}

function mostrarAlerta(id, mensaje) {

    const caja = document.getElementById(id);

    if (!caja) {
        return;
    }

    caja.textContent = mensaje;

    caja.hidden = false;

}

function ocultarAlerta(id) {

    const caja = document.getElementById(id);

    if (caja) {
        caja.hidden = true;
    }

}

document.querySelectorAll(".auth-tabs").forEach(function (barra) {

    const grupo = barra.getAttribute("data-group");
    const tabs = barra.querySelectorAll(".auth-tab");

    tabs.forEach(function (tab) {

        tab.addEventListener("click", function () {

            const elegido = tab.getAttribute("data-tab");

            tabs.forEach(function (t) {

                const activa = t === tab;

                t.classList.toggle("activo", activa);
                t.setAttribute("aria-selected", activa ? "true" : "false");

            });

            document
                .querySelectorAll('.auth-tab-panel[data-group="' + grupo + '"]')
                .forEach(function (panel) {

                    panel.hidden = panel.getAttribute("data-tab") !== elegido;

                });

            ocultarAlerta(grupo + "-alert");

        });

    });

});


// =============================
// FORMULARIO: INICIAR SESIÓN
// (valida contra las cuentas locales y redirige según el rol)
// =============================

const formLogin = document.getElementById("form-login");

if (formLogin) {

    formLogin.addEventListener("submit", function (evento) {

        evento.preventDefault();

        ocultarAlerta("login-alert");

        const metodo = metodoActivo("login");
        const password = document.getElementById("login-password").value;

        let cuenta = null;

        if (metodo === "correo") {

            const email = document.getElementById("login-email").value.trim();

            if (!email || !password) {

                mostrarAlerta("login-alert", "Por favor completa todos los campos.");

                return;

            }

            cuenta = buscarCuenta(email);

        } else {

            const telefono = document.getElementById("login-telefono").value.trim();

            if (!telefono || !password) {

                mostrarAlerta("login-alert", "Por favor completa todos los campos.");

                return;

            }

            cuenta = buscarCuentaPorTelefono(selectorLogin.pais.codigo + telefono);

        }

        if (!cuenta || cuenta.password !== password) {

            mostrarAlerta(
                "login-alert",
                metodo === "correo"
                    ? "Correo o contraseña incorrectos."
                    : "Teléfono o contraseña incorrectos."
            );

            return;

        }

        // Cuenta creada pero sin verificar el correo: pedir el código

        if (cuenta.verificado === false) {

            mostrarToast("Primero debes verificar tu correo.");

            if (typeof abrirVerificacion === "function") {
                abrirVerificacion({ email: cuenta.email, telefono: "", codigoPais: "" });
            }

            return;

        }

        const destino = PANEL_POR_ROL[cuenta.tipo];

        if (!destino) {

            mostrarAlerta("login-alert", "Tu cuenta no tiene un rol válido.");

            return;

        }

        // Sesión activa: la leen los paneles (guardia.js)

        try {
            localStorage.setItem(CLAVE_SESION, JSON.stringify({
                email: cuenta.email,
                tipo: cuenta.tipo,
                nombres: cuenta.nombres,
                apellidos: cuenta.apellidos || "",
                usuario: cuenta.usuario || ""
            }));
        } catch (e) { }

        mostrarToast("Iniciando sesión...");

        setTimeout(function () {

            window.location.href = destino;

        }, 900);

    });

}


// =============================
// FORMULARIO: RECUPERAR CONTRASEÑA
// =============================

const formRecuperar = document.getElementById("form-recuperar");

if (formRecuperar) {

    formRecuperar.addEventListener("submit", function (evento) {

        evento.preventDefault();

        ocultarAlerta("recuperar-alert");

        const metodo = metodoActivo("recuperar");

        if (metodo === "correo") {

            const email = document.getElementById("recuperar-email").value.trim();

            if (!email) {

                mostrarAlerta("recuperar-alert", "Ingresa tu correo electrónico.");

                return;

            }

            mostrarToast("Te enviamos un enlace de recuperación a tu correo.");

        } else {

            const telefono = document.getElementById("recuperar-telefono").value.trim();

            if (telefono.length !== selectorRecuperar.pais.max) {

                mostrarAlerta(
                    "recuperar-alert",
                    "El número debe tener " + selectorRecuperar.pais.max +
                    " dígitos para " + selectorRecuperar.pais.nombre + "."
                );

                return;

            }

            mostrarToast("Te enviamos un código de verificación por SMS.");

        }

        formRecuperar.reset();

        setTimeout(function () {

            mostrarVista("view-login");

        }, 1600);

    });

}


// =============================
// FECHA DE NACIMIENTO (CREAR CUENTA)
// Se puede escribir a mano (los " / " se ponen solos) o elegir en el calendario.
// Validación de fecha real, no futura y edad mínima.
// Requiere fecha-nacimiento.css y el bloque de fecha en login.html
// =============================

(function () {

    const campo = document.getElementById("fecha-campo");
    const visible = document.getElementById("registro-fecha-visible");
    const oculto = document.getElementById("registro-fecha-nacimiento");
    const botonAbrir = document.getElementById("fecha-abrir");
    const popup = document.getElementById("fecha-popup");
    const hint = document.getElementById("fecha-hint");
    const selectTipo = document.getElementById("registro-tipo");
    const formulario = document.getElementById("form-registro");

    if (!campo || !visible || !oculto || !popup || !hint) {
        return;
    }

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

        const h = hoy();
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

            if (fecha.getTime() === h.getTime()) {
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
            vista = { y: hoy().getFullYear() - edadMinimaActual(), m: 0 };

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

    // El calendario solo se abre con el botón del ícono,
    // así no estorba cuando la persona escribe la fecha a mano.

    botonAbrir.addEventListener("click", function () {

        if (popup.hidden) {
            abrir();
        } else {
            cerrar();
        }

    });

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

    // Escribir a mano: solo dígitos, con " / " automático al completar día y mes.
    // Ejemplo: escribes 15032010 y queda "15 / 03 / 2010".

    visible.addEventListener("input", function (evento) {

        cerrar(); // el calendario no debe estorbar mientras se escribe

        const borrando = !!evento.inputType && evento.inputType.indexOf("delete") === 0;
        const digitos = visible.value.replace(/\D/g, "").slice(0, 8);

        let texto = formatear(digitos);

        // Al terminar el día (2 dígitos) o el mes (4 dígitos) se agrega el " / " solo.
        // Al borrar no se agrega, para que el retroceso funcione normal.

        if (!borrando && (digitos.length === 2 || digitos.length === 4)) {
            texto += " / ";
        }

        visible.value = texto;

        if (digitos.length < 8) {

            oculto.value = "";
            seleccion = null;

            pintarHint("");

            return;

        }

        const p = parsear(digitos);

        if (aplicar(p.y, p.m, p.d)) {
            vista = { y: p.y, m: p.m - 1 };
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

    // ---- API pública: la usa el formulario de registro al enviar ----

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


// =============================
// CAMPO "OTRO, ¿CUÁL?" EN LOS SELECT
// Cualquier <select> con data-otro="id-del-input" muestra ese
// input cuando se elige la opción value="otro".
// =============================

document.querySelectorAll("select[data-otro]").forEach(function (select) {

    const campo = document.getElementById(select.getAttribute("data-otro"));

    if (!campo) {
        return;
    }

    function actualizar() {

        const esOtro = select.value === "otro";

        campo.hidden = !esOtro;

        if (!esOtro) {
            campo.value = "";
        }

    }

    select.addEventListener("change", function () {

        actualizar();

        if (!campo.hidden) {
            campo.focus();
        }

    });

    if (select.form) {

        select.form.addEventListener("reset", function () {

            setTimeout(actualizar, 0);

        });

    }

    actualizar();

});

// Devuelve el valor del select, o lo que se escribió si eligió "otro".
// Si eligió "otro" y dejó el campo vacío, devuelve "" (queda como incompleto).

function valorConOtro(idSelect) {

    const select = document.getElementById(idSelect);

    if (!select) {
        return "";
    }

    if (select.value !== "otro") {
        return select.value;
    }

    const campo = document.getElementById(select.getAttribute("data-otro"));

    return campo ? campo.value.trim() : "";

}


// =============================
// NÚMERO DE DOCUMENTO: LETRAS SOLO EN PASAPORTE / OTRO
// Para CC, TI, CE y PPT solo se aceptan dígitos.
// Longitud permitida: mínimo 5 y máximo 20.
// =============================

(function () {

    const tipo = document.getElementById("registro-tipo-documento");
    const num = document.getElementById("registro-numero-documento");
    const hintDoc = document.getElementById("documento-hint");

    if (!tipo || !num) {
        return;
    }

    function esAlfanumerico() {

        return tipo.value === "pasaporte" || tipo.value === "otro";

    }

    function limpiar() {

        const alfa = esAlfanumerico();

        num.setAttribute("inputmode", alfa ? "text" : "numeric");
        num.value = num.value.replace(alfa ? /[^a-zA-Z0-9]/g : /\D/g, "").slice(0, 20);

    }

    if (hintDoc) {
        hintDoc.textContent = "Entre 5 y 20 caracteres.";
    }

    tipo.addEventListener("change", limpiar);

    num.addEventListener("input", limpiar);

})();


// =============================
// NOMBRE DE USUARIO
// Solo letras, números, punto, guion bajo y guion. Máx. 20.
// =============================

(function () {

    const input = document.getElementById("registro-usuario");

    if (!input) {
        return;
    }

    input.addEventListener("input", function () {

        input.value = input.value
            .replace(/[^a-zA-Z0-9._-]/g, "")
            .slice(0, 20);

    });

})();


// =============================
// VALIDACIÓN DE DOCUMENTO
// =============================

function edadDesdeISO(iso) {

    const p = iso.split("-").map(Number);
    const h = new Date();

    let edad = h.getFullYear() - p[0];

    if (h.getMonth() + 1 < p[1] || (h.getMonth() + 1 === p[1] && h.getDate() < p[2])) {
        edad--;
    }

    return edad;

}

function esNumeroFalso(num) {

    // Todos los dígitos iguales: 1111111, 0000000
    if (/^(\d)\1+$/.test(num)) {
        return true;
    }

    // Secuencias completas: 123456789, 987654321
    let asc = true;
    let desc = true;

    for (let i = 1; i < num.length; i++) {

        const diff = Number(num[i]) - Number(num[i - 1]);

        if (diff !== 1 && diff !== -9) { asc = false; }
        if (diff !== -1 && diff !== 9) { desc = false; }

    }

    if (asc || desc) {
        return true;
    }

    // Muy pocos dígitos distintos (ej. 1212121212)
    if (new Set(num.split("")).size < 3) {
        return true;
    }

    return false;

}

// Devuelve "" si es válido, o el mensaje de error.
function validarDocumento(tipo, numero, fechaNacimiento) {

    const num = numero.replace(/[\s.-]/g, "");

    // Para todos los tipos de documento: mínimo 5 y máximo 20
    if (num.length < 5 || num.length > 20) {
        return "El número de documento debe tener entre 5 y 20 caracteres.";
    }

    if (tipo === "pasaporte" || tipo === "otro") {

        if (!/^[A-Za-z0-9]+$/.test(num)) {
            return "El documento solo puede contener letras y números.";
        }

        if (/^(.)\1+$/.test(num)) {
            return "Número de documento inválido.";
        }

        return "";

    }

    if (!/^\d+$/.test(num)) {
        return "El documento solo puede contener números.";
    }

    if (num[0] === "0") {
        return "El número de documento no puede empezar por 0.";
    }

    if (esNumeroFalso(num)) {
        return "Ese número de documento no parece real. Revísalo.";
    }

    // Coherencia con la edad
    if (fechaNacimiento) {

        const edad = edadDesdeISO(fechaNacimiento);

        if (tipo === "cc" && edad < 18) {
            return "La cédula de ciudadanía es para mayores de 18 años. Usa Tarjeta de Identidad.";
        }

        if (tipo === "ti" && edad >= 18) {
            return "La tarjeta de identidad es solo para menores de 18 años.";
        }

    }

    return "";

}


// =============================
// FORMULARIO: CREAR CUENTA
// =============================

const formRegistro = document.getElementById("form-registro");

if (formRegistro) {

    formRegistro.addEventListener("submit", function (evento) {

        evento.preventDefault();

        const tipoCuenta = document.getElementById("registro-tipo").value;
        const nombres = document.getElementById("registro-nombres").value.trim().replace(/\s+/g, " ");
        const apellidos = document.getElementById("registro-apellidos").value.trim().replace(/\s+/g, " ");
        const usuario = document.getElementById("registro-usuario").value.trim();
        const fechaNacimiento = document.getElementById("registro-fecha-nacimiento").value;
        const sexo = valorConOtro("registro-sexo");
        const genero = valorConOtro("registro-genero");
        const tipoDocumento = valorConOtro("registro-tipo-documento");
        const numeroDocumento = document.getElementById("registro-numero-documento").value.trim();
        const codigoPais = inputCodigoPaisOculto ? inputCodigoPaisOculto.value : "";
        const telefono = document.getElementById("registro-telefono").value.trim();
        const email = document.getElementById("registro-email").value.trim();
        const password = document.getElementById("registro-password").value;
        const confirmar = document.getElementById("registro-confirmar").value;

        // Validar la fecha de nacimiento (fecha real, no futura y edad mínima por tipo de cuenta)

        if (typeof validarFechaNacimiento === "function") {

            const validacionFecha = validarFechaNacimiento(tipoCuenta);

            if (!validacionFecha.ok) {

                mostrarToast(validacionFecha.mensaje);

                const campoFecha = document.getElementById("registro-fecha-visible");

                if (campoFecha) {
                    campoFecha.focus();
                }

                return;

            }

        }

        // Validar el nombre de usuario (sin contenido explícito, 4 a 20 caracteres)
        // Nota: si tu validarNombreUsuario() (registro-extra.js) ignora o resta un "@"
        // al contar caracteres, quita esa lógica: el valor ya no lleva "@".

        if (typeof validarNombreUsuario === "function") {

            const validacionUsuario = validarNombreUsuario();

            if (!validacionUsuario.ok) {

                mostrarToast(validacionUsuario.mensaje);

                document.getElementById("registro-usuario").focus();

                return;

            }

        }

        if (
            !tipoCuenta ||
            !nombres ||
            !apellidos ||
            usuario.length < 4 ||
            !fechaNacimiento ||
            !sexo ||
            !genero ||
            !tipoDocumento ||
            !numeroDocumento ||
            !telefono ||
            !email ||
            !password ||
            !confirmar
        ) {

            mostrarToast("Completa todos los campos para crear tu cuenta.");

            return;

        }

        // Institución educativa (solo directores): la valida institucion.js

        let institucion = null;

        if (typeof validarInstitucion === "function") {

            const validacionInst = validarInstitucion(tipoCuenta);

            if (!validacionInst.ok) {

                mostrarToast(validacionInst.mensaje);

                const campoInst = document.getElementById(validacionInst.foco || "registro-institucion");

                if (campoInst) {
                    campoInst.focus();
                }

                return;

            }

            institucion = validacionInst.datos || null;

        }

        // Documento: formato real según el tipo + coherencia con la edad

        const tipoDocRaw = document.getElementById("registro-tipo-documento").value;
        const errorDoc = validarDocumento(tipoDocRaw, numeroDocumento, fechaNacimiento);

        if (errorDoc) {

            mostrarToast(errorDoc);

            document.getElementById("registro-numero-documento").focus();

            return;

        }

        // Validar que el teléfono tenga exactamente la cantidad
        // de dígitos esperada para el país seleccionado.

        if (paisTelefonoActual && telefono.length !== paisTelefonoActual.max) {

            mostrarToast(
                "El número debe tener " + paisTelefonoActual.max +
                " dígitos para " + paisTelefonoActual.nombre + "."
            );

            return;

        }

        if (password !== confirmar) {

            mostrarToast("Las contraseñas no coinciden.");

            return;

        }

        // CORREGIDO: una cuenta que quedó SIN VERIFICAR (por ejemplo, porque falló
        // el envío del correo) no bloquea el registro: se reemplaza por la nueva.

        const existente = buscarCuenta(email);

        if (existente && existente.verificado !== false) {

            mostrarToast("Ya existe una cuenta con ese correo.");

            return;

        }

        const porUsuario = buscarCuentaPorUsuario(usuario);

        if (porUsuario && porUsuario.email.toLowerCase() !== email.toLowerCase()) {

            mostrarToast("Ese nombre de usuario ya está en uso.");

            return;

        }

        // NUEVO: el teléfono tampoco puede repetirse en otra cuenta

        const porTelefono = buscarCuentaPorTelefono(codigoPais + telefono);

        if (porTelefono && porTelefono.email.toLowerCase() !== email.toLowerCase()) {

            mostrarToast("Ese número de teléfono ya está registrado.");

            return;

        }

        // Para crear la cuenta es obligatorio aceptar los Términos y Condiciones

        if (typeof terminosAceptados === "function" && !terminosAceptados()) {

            mostrarToast("Debes aceptar los Términos y Condiciones para crear tu cuenta.");

            if (typeof abrirTerminos === "function") {
                abrirTerminos();
            }

            return;

        }

        // NUEVO: si había una cuenta sin verificar con este correo, se borra antes de guardar la nueva

        eliminarCuentaGuardada(email);

        // Guardamos la cuenta (con su tipo/rol) para poder iniciar sesión después.

        guardarCuenta({
            email: email,
            password: password,
            verificado: false,      // se pone en true al validar el código
            tipo: tipoCuenta,
            nombres: nombres,
            apellidos: apellidos,
            usuario: usuario,
            fechaNacimiento: fechaNacimiento,
            sexo: sexo,
            genero: genero,
            tipoDocumento: tipoDocumento,
            numeroDocumento: numeroDocumento,
            telefono: codigoPais + telefono,
            institucion: institucion,
            aceptoTerminos: true,
            fechaAceptacion: new Date().toISOString()
        });

        // Guardamos los datos ANTES de limpiar el formulario,
        // porque la verificación los necesita para enmascarar el destino.

        const datosVerificacion = {
            email: email,
            telefono: telefono,
            codigoPais: codigoPais
        };

        formRegistro.reset();

        actualizarHintTipoCuenta();
        seleccionarPaisTelefono(PAISES_TELEFONO[0]);

        if (typeof abrirVerificacion === "function") {

            abrirVerificacion(datosVerificacion);

        } else {

            mostrarToast("No se pudo abrir la verificación. Revisa verificacion.js.");

        }

    });

}


// =============================
// BOTÓN DE AYUDA
// =============================

const botonAyuda = document.getElementById("help-fab");

if (botonAyuda) {

    botonAyuda.addEventListener("click", function () {

        mostrarToast("¿Necesitas ayuda? Escríbenos a soporte@truelock.com");

    });

}


// =============================
// MENSAJE DE PRUEBA
// =============================

console.log("TrueLock Login - JavaScript cargado correctamente.");