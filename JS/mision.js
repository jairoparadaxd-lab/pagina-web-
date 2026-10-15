/* ============================= */
/* MENÚ HAMBURGUESA */
/* ============================= */

const menuTogger = document.getElementById("menu_Togger");
const menu = document.getElementById("menu");
const fondoMenu = document.getElementById("fondo-menu");

if (menuTogger && menu) {
  menuTogger.addEventListener("click", function () {
    menu.classList.toggle("menu-abierto");
    menuTogger.classList.toggle("active");
    if (fondoMenu) fondoMenu.classList.toggle("active");
  });
}

if (fondoMenu) {
  fondoMenu.addEventListener("click", function () {
    menu.classList.remove("menu-abierto");
    menuTogger.classList.remove("active");
    fondoMenu.classList.remove("active");
  });
}

const enlacesMenu = document.querySelectorAll("#menu a");
enlacesMenu.forEach(function (enlace) {
  enlace.addEventListener("click", function () {
    menu.classList.remove("menu-abierto");
    menuTogger.classList.remove("active");
    if (fondoMenu) fondoMenu.classList.remove("active");
  });
});

/* ============================= */
/* IDIOMA */
/* ============================= */

let idiomaActual = localStorage.getItem("idioma") || "es";

const textosMision = {
  es: {
    "nav-inicio": "Inicio",
    "nav-nosotros": "Nosotros",
    "nav-mision": "Misión",
    "nav-vision": "Visión",
    "nav-truelock": "TRUE LOCK",
    "nav-actualizaciones": "Actualizaciones",
    "nav-descargar": "Descargar",
    "nav-login": "Iniciar sesión",
    "mision-h2": "Misión",
    "mision-p": "Desarrollar soluciones tecnológicas que ayuden a las personas y organizaciones a controlar las distracciones digitales, mejorar su concentración y aprovechar de una manera más eficiente las herramientas tecnológicas en entornos educativos y laborales.",
    "footer-p2": "Proyecto desarrollado por aprendices."
  },
  en: {
    "nav-inicio": "Home",
    "nav-nosotros": "About us",
    "nav-mision": "Mission",
    "nav-vision": "Vision",
    "nav-truelock": "TRUE LOCK",
    "nav-actualizaciones": "Updates",
    "nav-descargar": "Download",
    "nav-login": "Log in",
    "mision-h2": "Mission",
    "mision-p": "Develop technological solutions that help people and organizations control digital distractions, improve their concentration, and make more efficient use of technological tools in educational and work environments.",
    "footer-p2": "Project developed by apprentices."
  }
};

function aplicarTraducciones(idioma) {
  const elementos = document.querySelectorAll("[data-i18n]");
  elementos.forEach(function (elemento) {
    const clave = elemento.getAttribute("data-i18n");
    if (textosMision[idioma] && textosMision[idioma][clave]) {
      elemento.textContent = textosMision[idioma][clave];
    }
  });
}

/* ============================= */
/* BOTÓN DE IDIOMA */
/* ============================= */

const botonIdioma = document.getElementById("boton-idioma");

// Muestra siempre el idioma AL QUE SE CAMBIARÍA, no el actual.
function actualizarBotonIdioma() {
  if (!botonIdioma) return;
  const etiqueta = botonIdioma.querySelector(".btn-label");
  if (etiqueta) {
    etiqueta.textContent = idiomaActual === "es" ? "English" : "Español";
  }
}

if (botonIdioma) {
  botonIdioma.addEventListener("click", function () {
    idiomaActual = idiomaActual === "es" ? "en" : "es";
    localStorage.setItem("idioma", idiomaActual);

    aplicarTraducciones(idiomaActual);
    actualizarBotonIdioma();
    actualizarBotonTema();   // por si el tema depende del idioma
    actualizarBotonMusica(); // por si la música depende del idioma
  });
}

/* ============================= */
/* MODO CLARO / OSCURO */
/* ============================= */

const botonTema = document.getElementById("boton-tema");
const temaGuardado = localStorage.getItem("tema");

if (temaGuardado === "claro") {
  document.body.classList.add("modo-claro");
}

// Sincroniza ícono + etiqueta con el estado real del tema y el idioma actual.
function actualizarBotonTema() {
  if (!botonTema) return;
  const icono = botonTema.querySelector(".btn-icon");
  const etiqueta = botonTema.querySelector(".btn-label");
  const modoClaro = document.body.classList.contains("modo-claro");

  if (icono) icono.textContent = modoClaro ? "☀️" : "🌙";
  if (etiqueta) {
    etiqueta.textContent = modoClaro
      ? (idiomaActual === "es" ? "Modo claro" : "Light mode")
      : (idiomaActual === "es" ? "Modo oscuro" : "Dark mode");
  }
}

if (botonTema) {
  botonTema.addEventListener("click", function () {
    document.body.classList.toggle("modo-claro");
    const modoClaro = document.body.classList.contains("modo-claro");
    localStorage.setItem("tema", modoClaro ? "claro" : "oscuro");
    actualizarBotonTema();
  });
}

/* ============================= */
/* MÚSICA */
/* ============================= */

const botonMusica = document.getElementById("boton-musica");
const musica = document.getElementById("musica-fondo");
const musicaGuardada = localStorage.getItem("musica");

if (musicaGuardada === "encendida" && musica) {
  musica.volume = 0.5;
  musica.play().catch(function () {
    console.log("El navegador bloqueó la reproducción automática.");
  });
}

// Sincroniza ícono + etiqueta con el estado real de la música y el idioma actual.
function actualizarBotonMusica() {
  if (!botonMusica || !musica) return;
  const icono = botonMusica.querySelector(".btn-icon");
  const etiqueta = botonMusica.querySelector(".btn-label");
  const encendida = !musica.paused;

  if (icono) icono.textContent = encendida ? "🔊" : "🔇";
  if (etiqueta) {
    etiqueta.textContent = encendida
      ? (idiomaActual === "es" ? "Música activada" : "Music enabled")
      : (idiomaActual === "es" ? "Música desactivada" : "Music disabled");
  }
}

if (botonMusica && musica) {
  botonMusica.addEventListener("click", function () {
    if (musica.paused) {
      musica.volume = 0.5;
      musica.play();
      localStorage.setItem("musica", "encendida");
    } else {
      musica.pause();
      localStorage.setItem("musica", "apagada");
    }
    actualizarBotonMusica();
  });
}

/* ============================= */
/* INICIALIZACIÓN */
/* ============================= */

aplicarTraducciones(idiomaActual);
actualizarBotonIdioma();
actualizarBotonTema();
actualizarBotonMusica();

console.log("TRUE LOCK - Página Misión cargada correctamente.");