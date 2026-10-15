document.addEventListener("DOMContentLoaded", function () {


    /* ============================= */
    /* ELEMENTOS */
    /* ============================= */

    const botonEspanol =
        document.getElementById("boton-espanol");

    const botonIngles =
        document.getElementById("boton-ingles");

    const botonContinuar =
        document.getElementById("boton-continuar");

    const musica =
        document.getElementById("musica-fondo");

    const tituloPrivacidad =
        document.getElementById("titulo-privacidad");

    const subtituloPrivacidad =
        document.getElementById("subtitulo-privacidad");

    const textoPrivacidad =
        document.getElementById("texto-privacidad");

    const tituloIdioma =
        document.getElementById("titulo-idioma");

    const avisoPrivacidad =
        document.getElementById("aviso-privacidad");

    const privacidadPie =
        document.getElementById("privacidad-pie");


    /* ============================= */
    /* IDIOMA SELECCIONADO */
    /* ============================= */

    let idiomaSeleccionado = null;


    /* ============================= */
    /* TEXTOS DE LA PÁGINA */
    /* ============================= */

    const textos = {

        es: {

            titulo:
                "Bienvenido a TRUE LOCK",

            subtitulo:
                "Antes de continuar, selecciona tu idioma.",

            texto:
                "TRUE LOCK puede utilizar datos proporcionados por el usuario para determinadas funciones de la plataforma. La información correspondiente será tratada de acuerdo con las políticas establecidas para el proyecto.",

            enlacePoliticas:
                "Políticas de privacidad",

            tituloIdioma:
                "Selecciona tu idioma",

            aviso:
                "Al continuar, podrás acceder al sitio principal de TRUE LOCK y utilizar sus diferentes funciones.",

            continuar:
                "Continuar",

            pie:
                "© 2026 T.S SOLUTIONS."

        },


        en: {

            titulo:
                "Welcome to TRUE LOCK",

            subtitulo:
                "Before continuing, select your language.",

            texto:
                "TRUE LOCK may use information provided by the user for certain platform functions. The corresponding information will be handled according to the policies established for the project.",

            enlacePoliticas:
                "Privacy Policy",

            tituloIdioma:
                "Select your language",

            aviso:
                "By continuing, you will be able to access the TRUE LOCK main site and use its different features.",

            continuar:
                "Continue",

            pie:
                "© 2026 T.S SOLUTIONS."

        }

    };


    /* ============================= */
    /* CAMBIAR TEXTOS */
    /* ============================= */

    function cambiarIdioma(idioma) {

        const contenido =
            textos[idioma];

        if (!contenido) {
            return;
        }


        document.documentElement.lang =
            idioma;


        /* ============================= */
        /* TÍTULO */
        /* ============================= */

        if (tituloPrivacidad) {

            tituloPrivacidad.textContent =
                contenido.titulo;

        }


        /* ============================= */
        /* SUBTÍTULO */
        /* ============================= */

        if (subtituloPrivacidad) {

            subtituloPrivacidad.textContent =
                contenido.subtitulo;

        }


        /* ============================= */
        /* TEXTO + ENLACE */
        /* ============================= */

        if (textoPrivacidad) {

            textoPrivacidad.innerHTML =
                `${contenido.texto}
                <a
                    href="politicas.html"
                    class="enlace-privacidad">
                    ${contenido.enlacePoliticas}
                </a>`;

        }


        /* ============================= */
        /* TÍTULO DE IDIOMA */
        /* ============================= */

        if (tituloIdioma) {

            tituloIdioma.textContent =
                contenido.tituloIdioma;

        }


        /* ============================= */
        /* AVISO */
        /* ============================= */

        if (avisoPrivacidad) {

            avisoPrivacidad.textContent =
                contenido.aviso;

        }


        /* ============================= */
        /* CONTINUAR */
        /* ============================= */

        if (botonContinuar) {

            botonContinuar.textContent =
                contenido.continuar;

        }


        /* ============================= */
        /* PIE */
        /* ============================= */

        if (privacidadPie) {

            privacidadPie.textContent =
                contenido.pie;

        }

    }


    /* ============================= */
    /* SELECCIONAR ESPAÑOL */
    /* ============================= */

    if (botonEspanol) {

        botonEspanol.addEventListener(
            "click",
            function () {

                idiomaSeleccionado = "es";


                cambiarIdioma(
                    "es"
                );


                if (botonContinuar) {

                    botonContinuar.disabled =
                        false;

                }


                botonEspanol.classList.add(
                    "idioma-seleccionado"
                );


                if (botonIngles) {

                    botonIngles.classList.remove(
                        "idioma-seleccionado"
                    );

                }

            }
        );

    }


    /* ============================= */
    /* SELECCIONAR INGLÉS */
    /* ============================= */

    if (botonIngles) {

        botonIngles.addEventListener(
            "click",
            function () {

                idiomaSeleccionado = "en";


                cambiarIdioma(
                    "en"
                );


                if (botonContinuar) {

                    botonContinuar.disabled =
                        false;

                }


                botonIngles.classList.add(
                    "idioma-seleccionado"
                );


                if (botonEspanol) {

                    botonEspanol.classList.remove(
                        "idioma-seleccionado"
                    );

                }

            }
        );

    }


    /* ============================= */
    /* BOTÓN CONTINUAR */
    /* ============================= */

    if (botonContinuar) {

        botonContinuar.addEventListener(
            "click",
            function () {

                if (!idiomaSeleccionado) {

                    return;

                }


                /* ============================= */
                /* GUARDAR IDIOMA */
                /* ============================= */

                localStorage.setItem(
                    "idioma",
                    idiomaSeleccionado
                );


                /* ============================= */
                /* ACTIVAR MÚSICA */
                /* ============================= */

                localStorage.setItem(
                    "musica",
                    "encendida"
                );


                /* ============================= */
                /* REPRODUCIR MÚSICA */
                /* ============================= */

                if (musica) {

                    musica.volume = 0.5;


                    const reproduccion =
                        musica.play();


                    if (
                        reproduccion !== undefined
                    ) {

                        reproduccion.catch(
                            function (error) {

                                console.log(
                                    "La reproducción automática fue bloqueada:",
                                    error
                                );

                            }
                        );

                    }

                }


                /* ============================= */
                /* REDIRECCIÓN */
                /* ============================= */

                window.location.href =
                    "index.html";

            }
        );

    }


    /* ============================= */
    /* IDIOMA GUARDADO */
/* ============================= */

    const idiomaGuardado =
        localStorage.getItem("idioma");


    if (
        idiomaGuardado === "es" ||
        idiomaGuardado === "en"
    ) {

        idiomaSeleccionado =
            idiomaGuardado;


        cambiarIdioma(
            idiomaGuardado
        );


        if (botonContinuar) {

            botonContinuar.disabled =
                false;

        }


        if (idiomaGuardado === "es") {

            if (botonEspanol) {

                botonEspanol.classList.add(
                    "idioma-seleccionado"
                );

            }

            if (botonIngles) {

                botonIngles.classList.remove(
                    "idioma-seleccionado"
                );

            }

        } else {

            if (botonIngles) {

                botonIngles.classList.add(
                    "idioma-seleccionado"
                );

            }

            if (botonEspanol) {

                botonEspanol.classList.remove(
                    "idioma-seleccionado"
                );

            }

        }

    }

});

