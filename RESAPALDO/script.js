// =============================
// MENÚ HAMBURGUESA
// =============================

const botonMenu = document.querySelector(".menu_Togger");
const menu = document.getElementById("menu");
const fondoMenu = document.getElementById("fondo-menu");

if (botonMenu && menu) {

    botonMenu.addEventListener("click", function () {

        menu.classList.toggle("menu-abierto");
        botonMenu.classList.toggle("active");

    });

}


// =============================
// CERRAR MENÚ CON EL FONDO
// =============================

if (fondoMenu && menu && botonMenu) {

    fondoMenu.addEventListener("click", function () {

        menu.classList.remove("menu-abierto");
        botonMenu.classList.remove("active");

    });

}


// =============================
// ENLACES DEL MENÚ
// =============================

const enlacesMenu = document.querySelectorAll("#menu a");

enlacesMenu.forEach(function (enlace) {

    enlace.addEventListener("click", function (evento) {

        const destinoID = this.getAttribute("href");

        if (destinoID === "#") {
            return;
        }

        const destino = document.querySelector(destinoID);

        if (destino) {

            evento.preventDefault();

            destino.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

            if (menu && botonMenu) {

                menu.classList.remove("menu-abierto");
                botonMenu.classList.remove("active");

            }

        }

    });

});


// =============================
// BOTÓN DE DESCARGA
// =============================

const botonDescarga = document.getElementById("boton-descarga");

if (botonDescarga) {

    botonDescarga.addEventListener("click", function (evento) {

        evento.preventDefault();

        alert("La descarga de TRUE LOCK estará disponible próximamente.");

    });

}


// =============================
// INICIO DE SESIÓN CON GOOGLE
// =============================

const botonGoogle = document.getElementById("boton-google");

if (botonGoogle) {

    botonGoogle.addEventListener("click", function () {

        alert("El inicio de sesión con Google estará disponible próximamente.");

    });

}


// =============================
// COPYRIGHT
// =============================

const copyright = document.getElementById("copyright");

if (copyright) {

    const añoActual = new Date().getFullYear();

    copyright.innerHTML =
        "&copy; " + añoActual +
        " T.S SOlUTIONS. Todos los derechos reservados.";

}


// =============================
// MODO OSCURO / MODO CLARO
// =============================

const botonTema = document.getElementById("boton-tema");


// Revisar si el usuario ya había elegido un modo

const temaGuardado = localStorage.getItem("tema");


if (temaGuardado === "claro") {

    document.body.classList.add("modo-claro");

}


// Actualizar el texto del botón

function actualizarBotonTema() {

    if (!botonTema) {
        return;
    }

    if (document.body.classList.contains("modo-claro")) {

        botonTema.innerHTML = "☀️ Modo claro";

    } else {

        botonTema.innerHTML = "🌙 Modo oscuro";

    }

}


actualizarBotonTema();


// Cambiar el modo cuando se presiona el botón

if (botonTema) {

    botonTema.addEventListener("click", function () {

        document.body.classList.toggle("modo-claro");


        // Guardar la elección del usuario

        if (document.body.classList.contains("modo-claro")) {

            localStorage.setItem("tema", "claro");

        } else {

            localStorage.setItem("tema", "oscuro");

        }


        actualizarBotonTema();

    });

}


// =============================
// MÚSICA DE FONDO
// =============================

const musicaFondo = document.getElementById("musica-fondo");
const botonMusica = document.getElementById("boton-musica");


// Revisar si el usuario había desactivado la música

const musicaGuardada = localStorage.getItem("musica");


if (musicaGuardada === "apagada") {

    if (musicaFondo) {

        musicaFondo.pause();

    }

}


// Actualizar el texto del botón

function actualizarBotonMusica() {

    if (!botonMusica) {
        return;
    }

    if (musicaFondo && !musicaFondo.paused) {

        botonMusica.innerHTML = "🔊 Música activada";

    } else {

        botonMusica.innerHTML = "🔇 Música desactivada";

    }

}


// Iniciar la música cuando el usuario interactúe con la página

if (musicaFondo) {

    document.addEventListener("click", function iniciarMusica() {

        const musicaGuardada = localStorage.getItem("musica");


        if (
            musicaGuardada !== "apagada" &&
            musicaFondo.paused
        ) {

            musicaFondo.volume = 0.5;

            musicaFondo.play()
                .then(function () {

                    actualizarBotonMusica();

                })
                .catch(function (error) {

                    console.log(
                        "No se pudo reproducir la música:",
                        error
                    );

                });

        }

    }, { once: true });

}


// Activar o desactivar música

if (botonMusica && musicaFondo) {

    botonMusica.addEventListener("click", function () {

        if (musicaFondo.paused) {

            musicaFondo.volume = 0.5;

            musicaFondo.play()
                .then(function () {

                    localStorage.setItem("musica", "encendida");

                    actualizarBotonMusica();

                })
                .catch(function (error) {

                    console.log(
                        "No se pudo reproducir la música:",
                        error
                    );

                });

        } else {

            musicaFondo.pause();

            localStorage.setItem("musica", "apagada");

            actualizarBotonMusica();

        }

    });

}


// =============================
// MENSAJE DE PRUEBA
// =============================

console.log("TRUE LOCK - JavaScript cargado correctamente.");