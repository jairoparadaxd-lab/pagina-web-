/* ============================= */
/* MENÚ HAMBURGUESA */
/* ============================= */

const menuTogger = document.getElementById("menu_Togger");
const menu = document.getElementById("menu");
const fondoMenu = document.getElementById("fondo-menu");

function cerrarMenu() {
    if (menu) menu.classList.remove("menu-abierto");
    if (menuTogger) menuTogger.classList.remove("active");
    if (fondoMenu) fondoMenu.classList.remove("active");
}

if (menuTogger && menu) {
    menuTogger.addEventListener("click", function () {
        menu.classList.toggle("menu-abierto");
        menuTogger.classList.toggle("active");
        if (fondoMenu) fondoMenu.classList.toggle("active");
    });
}

if (fondoMenu) {
    fondoMenu.addEventListener("click", cerrarMenu);
}


/* ============================= */
/* DICCIONARIO DE TRADUCCIONES (fusión de todas las páginas) */
/* ============================= */

const traducciones = {

    es: {

        "nav-inicio": "Inicio",
        "nav-mision": "Misión",
        "nav-vision": "Visión",
        "nav-actualizaciones": "Actualizaciones",
        "nav-descargar": "Descargar",
        "nav-registro": "Registrarse",

        "btn-modo-oscuro": "Modo oscuro",
        "btn-modo-claro": "Modo claro",

        "btn-musica-off": "Música desactivada",
        "btn-musica-on": "Música activada",

        "inicio-h2": "Controla tu entorno. Enfócate en lo importante.",
        "inicio-p":
            "Bienvenido al sitio oficial de TRUE LOCK, un proyecto desarrollado por aprendices con el propósito de ayudar a mejorar la concentración, la productividad y el control sobre las distracciones digitales.",
        "inicio-btn1": "Conocer TRUE LOCK",
        "inicio-btn2": "Descargar",

        "nosotros-h2": "¿Quiénes somos?",
        "nosotros-p1":
            "Somos un grupo de aprendices de una de las instituciones más reconocidas a nivel nacional en el desarrollo de software, enfocados en la creación de soluciones tecnológicas para problemas presentes en nuestro entorno. Así nace T.S Solutions.",
        "nosotros-p2": "TRUE LOCK nace como uno de nuestros proyectos insignia.",
        "nosotros-p3":
            "Nace con el fin de velar por una necesidad presente en un entorno digital tan amplio como el actual: la posibilidad de poner un límite o restricción a las herramientas del ámbito laboral y educativo, eliminando páginas y programas inútiles para dichos ámbitos, como la IA, juegos, redes sociales, etc.",

        "mision-h2": "Misión",
        "mision-p":
            "Desarrollar soluciones tecnológicas que ayuden a las personas y organizaciones a controlar las distracciones digitales, mejorar su concentración y aprovechar de una manera más eficiente las herramientas tecnológicas en entornos educativos y laborales.",

        "vision-h2": "Visión",

        "actualizaciones-titulo": "Actualizaciones",
        "actualizaciones-subtitulo": "Conoce las versiones disponibles de TRUE LOCK.",
        "beta": "Beta",
        "actualizaciones-version": "V1.0",
        "actualizaciones-descripcion":
            "El inicio de todo, una versión más con varias funciones, como el bloqueo, la creación de roles y el manejo de las páginas web.",
        "actualizaciones-boton": "Descargar V1.0",

        "descargar-h2": "Descargar TRUE LOCK",
        "descargar-btn": "Descargar TRUE LOCK",

        "footer-p2": "Proyecto desarrollado por aprendices.",
        "alert-descarga": "La descarga de TRUE LOCK estará disponible próximamente."

    },

    en: {

        "nav-inicio": "Home",
        "nav-mision": "Mission",
        "nav-vision": "Vision",
        "nav-actualizaciones": "Updates",
        "nav-descargar": "Download",
        "nav-registro": "Register",

        "btn-modo-oscuro": "Dark mode",
        "btn-modo-claro": "Light mode",

        "btn-musica-off": "Music disabled",
        "btn-musica-on": "Music enabled",

        "inicio-h2": "Control your environment. Focus on what matters.",
        "inicio-p":
            "Welcome to the official TRUE LOCK website, a project developed by apprentices with the purpose of helping improve concentration, productivity, and control over digital distractions.",
        "inicio-btn1": "Learn about TRUE LOCK",
        "inicio-btn2": "Download",

        "nosotros-h2": "Who are we?",
        "nosotros-p1":
            "We are a group of apprentices from one of the most recognized institutions in software development nationwide, focused on creating technological solutions for problems present in our environment. This is how T.S Solutions was born.",
        "nosotros-p2": "TRUE LOCK was created as one of our flagship projects.",
        "nosotros-p3":
            "It was created to address a need present in today's broad digital environment: the possibility of setting limits or restrictions on tools used in work and educational environments, removing unnecessary websites and programs such as AI, games, social networks, etc.",

        "mision-h2": "Mission",
        "mision-p":
            "Develop technological solutions that help people and organizations control digital distractions, improve their concentration, and make more efficient use of technological tools in educational and work environments.",

        "vision-h2": "Vision",

        "actualizaciones-titulo": "Updates",
        "actualizaciones-subtitulo": "Check the available versions of TRUE LOCK.",
        "beta": "Beta",
        "actualizaciones-version": "V1.0",
        "actualizaciones-descripcion":
            "The beginning of everything, a version with several features, such as blocking, role creation, and web page management.",
        "actualizaciones-boton": "Download V1.0",

        "descargar-h2": "Download TRUE LOCK",
        "descargar-btn": "Download TRUE LOCK",

        "footer-p2": "Project developed by apprentices.",
        "alert-descarga": "The TRUE LOCK download will be available soon."

    }

};

/* la visión tiene una etiqueta <strong> incrustada, por eso va aparte
   con innerHTML en vez de textContent como el resto del diccionario */
const visionTextos = {

    es:
        "Ser reconocidos en <strong>2030</strong> como el software ejecutable líder en gestión de productividad digital y control de accesos web para el sector educativo y empresarial en el país, destacándonos por nuestra seguridad, adaptabilidad y por transformar entornos hiperconectados en espacios de máxima concentración y eficiencia.",

    en:
        "To be recognized by <strong>2030</strong> as the leading executable software for digital productivity management and web access control for the educational and business sectors in the country, standing out for our security, adaptability, and for transforming hyperconnected environments into spaces of maximum concentration and efficiency."

};


/* ============================= */
/* IDIOMA ACTUAL */
/* ============================= */

let idiomaActual = localStorage.getItem("idioma") || "es";


function actualizarBotonIdioma() {
    const botonIdioma = document.getElementById("boton-idioma");
    if (!botonIdioma) return;
    const etiqueta = botonIdioma.querySelector(".btn-label");
    if (!etiqueta) return;
    etiqueta.textContent = idiomaActual === "es" ? "English" : "Español";
}

function aplicarVision(idioma) {
    const vision = document.getElementById("vision-p");
    if (vision && visionTextos[idioma]) {
        vision.innerHTML = visionTextos[idioma];
    }
}

function aplicarTraducciones(idioma) {
    if (!traducciones[idioma]) return;

    const elementos = document.querySelectorAll("[data-i18n]");
    elementos.forEach(function (elemento) {
        const clave = elemento.getAttribute("data-i18n");
        if (traducciones[idioma][clave] !== undefined) {
            elemento.textContent = traducciones[idioma][clave];
        }
    });

    aplicarVision(idioma);
    actualizarBotonIdioma();
}

const botonIdioma = document.getElementById("boton-idioma");

if (botonIdioma) {
    botonIdioma.addEventListener("click", function () {
        idiomaActual = idiomaActual === "es" ? "en" : "es";
        localStorage.setItem("idioma", idiomaActual);
        aplicarTraducciones(idiomaActual);
        actualizarBotonTema();
        actualizarBotonMusica();
    });
}


/* ============================= */
/* TEMA */
/* ============================= */

const botonTema = document.getElementById("boton-tema");
const temaGuardado = localStorage.getItem("tema");

if (temaGuardado === "claro") {
    document.body.classList.add("modo-claro");
}

function actualizarBotonTema() {
    if (!botonTema) return;

    const etiqueta = botonTema.querySelector(".btn-label");
    const modoClaro = document.body.classList.contains("modo-claro");

    // los iconos de sol/luna son SVG propios (ver CSS .switch-tema-icono-*),
    // esta clase decide cuál de los dos se muestra
    botonTema.classList.toggle("tema-oscuro", !modoClaro);

    if (etiqueta) {
        etiqueta.textContent = modoClaro
            ? traducciones[idiomaActual]["btn-modo-claro"]
            : traducciones[idiomaActual]["btn-modo-oscuro"];
    }
}


/* ============================= */
/* ANIMACIÓN DEL SWITCH: muñequito que camina y cae en el */
/* agujero al pasar a oscuro, y que sale y vuelve caminando */
/* al pasar a claro (igual que en el video de referencia) */
/* ============================= */

(function () {

    const canvas = document.getElementById("switch-tema-canvas");
    if (!canvas || !botonTema) return;

    const ctx = canvas.getContext("2d");

    // resolución interna del canvas (nítido en pantallas retina)
    const DPR = window.devicePixelRatio || 1;

    // debe coincidir EXACTO con el tamaño de .switch-tema-pista en el CSS
    const ANCHO = 50;
    const ALTO = 26;

    canvas.width = ANCHO * DPR;
    canvas.height = ALTO * DPR;
    canvas.style.width = ANCHO + "px";
    canvas.style.height = ALTO + "px";
    ctx.scale(DPR, DPR);

    // la perilla ocupa de x=0 a x=26 (ver .switch-tema-perilla, width:26px);
    // el muñequito camina justo después, para no quedar tapado por ella
    const INICIO_X = 29;

    // el "agujero" está pegado al borde derecho (ver .switch-tema-hueco,
    // width:16px, right:0) → su centro queda en ANCHO - 8
    const HUECO_X = ANCHO - 8;
    const SUELO_Y = 13;
    const FONDO_Y = 21;

    // duraciones en milisegundos: pausadas a propósito, igual de lentas
    // que la caminata del video (no son frames, así que se ven igual
    // de fluidas sin importar el dispositivo)
    const DUR_CAMINATA = 950;
    const DUR_CAIDA = 420;
    const DUR_EMERGER = 380;
    const DUR_HUNDIDA = 380;

    let animando = false;
    let fase = null;
    let inicioFase = 0;
    let colorMuneco = "#1c2530";

    function easeInOut(t) {
        return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    }

    // en fondo oscuro el muñequito se dibuja claro, y al revés,
    // para que siempre se distinga sobre el switch
    function colorParaFondo(modoOscuro) {
        return modoOscuro ? "#e7ecf3" : "#1c2530";
    }

    function dibujarStickman(x, y, opacidad, paso, brazosArriba) {
        if (opacidad <= 0) return;

        ctx.save();
        ctx.globalAlpha = Math.max(opacidad, 0);
        ctx.translate(x, y);

        ctx.strokeStyle = colorMuneco;
        ctx.fillStyle = colorMuneco;
        ctx.lineWidth = 1.1;
        ctx.lineCap = "round";

        // cabeza
        ctx.beginPath();
        ctx.arc(0, -6, 1.6, 0, Math.PI * 2);
        ctx.fill();

        // cuerpo
        ctx.beginPath();
        ctx.moveTo(0, -4.5);
        ctx.lineTo(0, 1);
        ctx.stroke();

        // piernas (balanceo para simular la caminata)
        ctx.beginPath();
        ctx.moveTo(0, 1);
        ctx.lineTo(-1.6 + paso, 4.5);
        ctx.moveTo(0, 1);
        ctx.lineTo(1.6 - paso, 4.5);
        ctx.stroke();

        // brazos: arriba al emerger del agujero (como en el video),
        // balanceados al caminar
        ctx.beginPath();
        if (brazosArriba) {
            ctx.moveTo(0, -3);
            ctx.lineTo(-1.8, -5.8);
            ctx.moveTo(0, -3);
            ctx.lineTo(1.8, -5.8);
        } else {
            ctx.moveTo(0, -3);
            ctx.lineTo(-1.8 - paso, -0.5);
            ctx.moveTo(0, -3);
            ctx.lineTo(1.8 + paso, -0.5);
        }
        ctx.stroke();

        ctx.restore();
    }

    function aplicarTema(modoClaroNuevo) {
        document.body.classList.toggle("modo-claro", modoClaroNuevo);
        localStorage.setItem("tema", modoClaroNuevo ? "claro" : "oscuro");
        actualizarBotonTema();

        botonTema.classList.add("tema-cayendo");
        setTimeout(function () {
            botonTema.classList.remove("tema-cayendo");
        }, 350);
    }

    function cuadro(ahora) {
        const t = ahora - inicioFase;
        ctx.clearRect(0, 0, ANCHO, ALTO);

        if (fase === "camina_a_hueco") {
            const p = Math.min(t / DUR_CAMINATA, 1);
            const x = INICIO_X + (HUECO_X - INICIO_X) * easeInOut(p);
            const paso = Math.sin(t / 90) * 2;
            dibujarStickman(x, SUELO_Y, 1, paso, false);

            if (p >= 1) {
                fase = "cae";
                inicioFase = ahora;
                // el muñequito llega al agujero: aquí se dispara
                // el cambio real de tema del sitio, hacia oscuro
                aplicarTema(false);
            }

        } else if (fase === "cae") {
            const p = Math.min(t / DUR_CAIDA, 1);
            const y = SUELO_Y + (FONDO_Y - SUELO_Y) * p;
            dibujarStickman(HUECO_X, y, 1 - p, 0, false);

            if (p >= 1) {
                animando = false;
                fase = null;
                return;
            }

        } else if (fase === "emerge") {
            const p = Math.min(t / DUR_EMERGER, 1);
            const y = FONDO_Y + (SUELO_Y - FONDO_Y) * p;
            dibujarStickman(HUECO_X, y, p, 0, true);

            if (p >= 1) {
                fase = "camina_a_perilla";
                inicioFase = ahora;
            }

        } else if (fase === "camina_a_perilla") {
            const p = Math.min(t / DUR_CAMINATA, 1);
            const x = HUECO_X - (HUECO_X - INICIO_X) * easeInOut(p);
            const paso = Math.sin(t / 90) * 2;
            dibujarStickman(x, SUELO_Y, 1, paso, false);

            if (p >= 1) {
                fase = "hunde";
                inicioFase = ahora;
            }

        } else if (fase === "hunde") {
            const p = Math.min(t / DUR_HUNDIDA, 1);
            const y = SUELO_Y + (FONDO_Y - SUELO_Y) * 0.4 * p;
            dibujarStickman(INICIO_X, y, 1 - p, 0, false);

            if (p >= 1) {
                // el muñequito termina de esconderse junto a la perilla:
                // aquí se dispara el cambio real de tema, hacia claro
                aplicarTema(true);
                animando = false;
                fase = null;
                return;
            }
        }

        requestAnimationFrame(cuadro);
    }

    function iniciarAnimacion(modoClaroActual) {
        animando = true;
        inicioFase = performance.now();

        if (modoClaroActual) {
            // va de claro a oscuro: el muñequito camina desde la
            // perilla y cae en el agujero
            colorMuneco = colorParaFondo(false);
            fase = "camina_a_hueco";
        } else {
            // va de oscuro a claro: el muñequito sale del agujero
            // y camina de regreso a la perilla
            colorMuneco = colorParaFondo(true);
            fase = "emerge";
        }

        requestAnimationFrame(cuadro);
    }

    botonTema.addEventListener("click", function () {
        if (animando) return;
        iniciarAnimacion(document.body.classList.contains("modo-claro"));
    });
})();


/* ============================= */
/* MÚSICA (ya no se corta al cambiar de "página") */
/* ============================= */

const botonMusica = document.getElementById("boton-musica");
const musica = document.getElementById("musica-fondo");
const musicaGuardada = localStorage.getItem("musica");

function actualizarBotonMusica() {
    if (!botonMusica) return;

    const etiqueta = botonMusica.querySelector(".btn-label");
    const musicaActiva = musica && !musica.paused;

    // el ícono ahora es un SVG (altavoz + ondas), no un emoji:
    // estas clases controlan qué partes del SVG se ven y disparan
    // las animaciones (ondas pulsando / tachón al silenciar)
    botonMusica.classList.toggle("reproduciendo", musicaActiva);

    if (!musicaActiva) {
        // se reinicia la animación de "silenciado" cada vez que se
        // pausa, incluso si ya estaba silenciado antes
        botonMusica.classList.remove("silenciado");
        void botonMusica.offsetWidth; // fuerza el reflow para poder repetir la animación
        botonMusica.classList.add("silenciado");
    } else {
        botonMusica.classList.remove("silenciado");
    }

    if (etiqueta) {
        etiqueta.textContent = musicaActiva
            ? traducciones[idiomaActual]["btn-musica-on"]
            : traducciones[idiomaActual]["btn-musica-off"];
    }
}

if (musicaGuardada === "encendida" && musica) {
    musica.volume = 0.5;
    musica.play()
        .then(actualizarBotonMusica)
        .catch(function () {
            actualizarBotonMusica();
            console.log("El navegador bloqueó la reproducción automática.");
        });
} else {
    actualizarBotonMusica();
}

if (botonMusica && musica) {
    botonMusica.addEventListener("click", function () {
        if (musica.paused) {
            musica.volume = 0.5;
            musica.play()
                .then(function () {
                    localStorage.setItem("musica", "encendida");
                    actualizarBotonMusica();
                })
                .catch(function () {
                    console.log("No fue posible reproducir la música.");
                });
        } else {
            musica.pause();
            localStorage.setItem("musica", "apagada");
            actualizarBotonMusica();
        }
    });
}


/* ============================= */
/* BOTÓN DE DESCARGA (página Descargar) */
/* ============================= */

const botonDescarga = document.getElementById("boton-descarga");

if (botonDescarga) {
    botonDescarga.addEventListener("click", function (evento) {
        evento.preventDefault();
        alert(traducciones[idiomaActual]["alert-descarga"]);
    });
}


/* ============================= */
/* COPYRIGHT */
/* ============================= */

function actualizarCopyright() {
    const copyright = document.getElementById("copyright");
    if (!copyright) return;

    const año = new Date().getFullYear();
    copyright.innerHTML =
        `&copy; ${año} T.S SOLUTIONS. ${
            idiomaActual === "es"
                ? "Todos los derechos reservados."
                : "All rights reserved."
        }`;
}


/* ============================= */
/* SISTEMA DE PÁGINAS (SPA) */
/* ============================= */

const paginas = document.querySelectorAll(".pagina");
const enlacesNav = document.querySelectorAll('#menu a[data-pagina]');
const todosLosEnlacesPagina = document.querySelectorAll('[data-pagina]');

const paginasValidas = ["inicio", "mision", "vision", "actualizaciones", "descargar"];

const anillo = document.getElementById("anillo-neon");

const coloresNeon = {
    rojo: "var(--neon-rojo)",
    azul: "var(--neon-azul)",
    morado: "var(--neon-morado)",
    amarillo: "var(--neon-amarillo)"
};

function moverAnillo(enlace, animar) {
    if (!anillo || !enlace || !menu) return;

    const rNav = menu.getBoundingClientRect();
    const rEnlace = enlace.getBoundingClientRect();
    const izquierda = rEnlace.left - rNav.left;

    if (!animar) anillo.style.transition = "none";

    anillo.style.left = izquierda + "px";
    anillo.style.width = rEnlace.width + "px";
    anillo.style.height = rEnlace.height + "px";

    document.documentElement.style.setProperty(
        "--neon-glow",
        coloresNeon[enlace.dataset.color] || coloresNeon.rojo
    );

    if (!animar) {
        requestAnimationFrame(function () {
            anillo.style.transition = "";
            anillo.classList.add("listo");
        });
    }
}

function mostrarPagina(id, animarAnillo) {

    if (!paginasValidas.includes(id)) {
        id = "inicio";
    }

    paginas.forEach(function (seccion) {
        seccion.classList.toggle(
            "pagina-activa",
            seccion.id === "pagina-" + id
        );
    });

    enlacesNav.forEach(function (enlace) {
        enlace.classList.toggle("activo", enlace.dataset.pagina === id);
    });

    const enlaceActivo = document.querySelector(
        '#menu a[data-pagina="' + id + '"]'
    );

    if (enlaceActivo) {
        moverAnillo(enlaceActivo, animarAnillo);
    }

    // llevar el scroll arriba al cambiar de "página"
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function navegarA(id, agregarHistorial) {
    if (agregarHistorial) {
        history.pushState(null, "", "#" + id);
    }
    mostrarPagina(id, true);
    cerrarMenu();
}

todosLosEnlacesPagina.forEach(function (enlace) {
    enlace.addEventListener("click", function (evento) {
        evento.preventDefault();
        navegarA(enlace.dataset.pagina, true);
    });
});

window.addEventListener("popstate", function () {
    const id = location.hash.replace("#", "") || "inicio";
    mostrarPagina(id, true);
});


/* ============================= */
/* INICIALIZACIÓN */
/* ============================= */

aplicarTraducciones(idiomaActual);
actualizarBotonTema();
actualizarCopyright();

const paginaInicial = location.hash.replace("#", "") || "inicio";
mostrarPagina(paginaInicial, false);

// reposicionar el anillo si cambia el tamaño de ventana
window.addEventListener("resize", function () {
    const enlaceActivo = document.querySelector("#menu a.activo");
    if (enlaceActivo) moverAnillo(enlaceActivo, false);
});

console.log("TRUE LOCK - SPA cargada correctamente.");