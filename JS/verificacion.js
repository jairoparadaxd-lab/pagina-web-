// =============================
// VERIFICACIÓN DE CUENTA (OTP)
// Cargar DESPUÉS de login.js (usa mostrarVista y mostrarToast)
// =============================

(function () {

    const vista = document.getElementById("view-verificacion");

    if (!vista) {
        return;
    }

    // ---- Configuración ----

    // MODO_DEMO = true: el código se genera aquí y se muestra en una
    // notificación simulada. Al conectar el backend, ponlo en false y
    // reemplaza enviarCodigoAlServidor() y validarCodigoEnServidor().
    const MODO_DEMO = true;

    const LONGITUD = 4;
    const SEGUNDOS_REENVIO = 30;

    // ---- Elementos ----

    const pasoMetodo = document.getElementById("ver-paso-metodo");
    const pasoCodigo = document.getElementById("ver-paso-codigo");
    const subtitulo = document.getElementById("ver-subtitulo");
    const botonesMetodo = vista.querySelectorAll(".ver-metodo");
    const destinoEmail = document.getElementById("ver-destino-email");
    const destinoTelefono = document.getElementById("ver-destino-telefono");
    const botonEnviar = document.getElementById("ver-enviar");

    const stage = document.getElementById("ver-stage");
    const slots = Array.from(document.querySelectorAll("#ver-slots .ver-slot"));
    const estado = document.getElementById("ver-estado");
    const temporizadorTxt = document.getElementById("ver-temporizador");
    const botonReenviar = document.getElementById("ver-btn-reenviar");
    const botonCambiar = document.getElementById("ver-cambiar");

    const cajaSms = document.getElementById("ver-sms");
    const smsOrigen = document.getElementById("ver-sms-origen");
    const smsTexto = document.getElementById("ver-sms-texto");
    const smsRellenar = document.getElementById("ver-sms-rellenar");

    // ---- Estado ----

    let datos = { email: "", telefono: "", codigoPais: "" };
    let metodo = "email";
    let codigoGenerado = "";
    let intervalo = null;
    let timeoutSms = null;
    let ocupado = false;

    const reducirMovimiento =
        window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // ---- Utilidades ----

    function enmascararEmail(email) {

        const partes = email.split("@");

        if (partes.length !== 2) {
            return email;
        }

        return partes[0].slice(0, 2) + "•••@" + partes[1];

    }

    function enmascararTelefono(codigoPais, telefono) {

        return codigoPais + " ••• " + telefono.slice(-4);

    }

    function destinoActual() {

        return metodo === "email"
            ? enmascararEmail(datos.email)
            : enmascararTelefono(datos.codigoPais, datos.telefono);

    }

    function mostrarPaso(paso) {

        pasoMetodo.classList.toggle("active", paso === "metodo");
        pasoCodigo.classList.toggle("active", paso === "codigo");

    }

    function ponerEstado(texto, tipo) {

        estado.textContent = texto || "";
        estado.className = "ver-estado" + (tipo ? " " + tipo : "");

    }

    function leerCodigo() {

        return slots.map(function (s) { return s.value; }).join("");

    }

    // ---- API pública: la llama login.js al crear la cuenta ----

    window.abrirVerificacion = function (nuevosDatos) {

        datos = nuevosDatos;
        metodo = "email";

        destinoEmail.textContent = enmascararEmail(datos.email);
        destinoTelefono.textContent = enmascararTelefono(datos.codigoPais, datos.telefono);

        elegirMetodo("email");
        reiniciarEscenario();
        detenerTemporizador();
        cajaSms.classList.remove("visible");

        subtitulo.textContent = "Elige dónde quieres recibir tu código de verificación.";

        mostrarPaso("metodo");
        mostrarVista("view-verificacion");

    };

    // ---- Paso 1: elegir método ----

    function elegirMetodo(nuevo) {

        metodo = nuevo;

        botonesMetodo.forEach(function (b) {

            const activo = b.getAttribute("data-metodo") === nuevo;

            b.classList.toggle("seleccionado", activo);
            b.setAttribute("aria-checked", activo ? "true" : "false");

        });

    }

    botonesMetodo.forEach(function (b) {

        b.addEventListener("click", function () {
            elegirMetodo(b.getAttribute("data-metodo"));
        });

    });

    botonEnviar.addEventListener("click", function () {

        enviarCodigo();

        subtitulo.textContent =
            "Ingresa el código de " + LONGITUD + " dígitos que enviamos a " + destinoActual() + ".";

        mostrarPaso("codigo");
        reiniciarEscenario();

        slots[0].focus();

    });

    // ---- Envío del código ----

    function enviarCodigo() {

        // Genera un código de LONGITUD dígitos (solo para la demo).
        codigoGenerado = "";

        for (let i = 0; i < LONGITUD; i++) {
            codigoGenerado += Math.floor(Math.random() * 10);
        }

        // TODO backend: enviar el código real por el canal elegido
        // (metodo === "email" o "telefono") y NO generarlo en el cliente.
        // enviarCodigoAlServidor(metodo, datos);

        mostrarToast(
            (metodo === "email" ? "Código enviado a tu correo: " : "Código enviado por SMS a: ") +
            destinoActual()
        );

        iniciarTemporizador();

        // Notificación simulada, como en el video de referencia.
        clearTimeout(timeoutSms);
        cajaSms.classList.remove("visible");

        if (MODO_DEMO) {

            timeoutSms = setTimeout(function () {

                smsOrigen.textContent =
                    "DEMO · " + (metodo === "email" ? "Correo" : "SMS") + " · TrueLock";
                smsTexto.textContent = codigoGenerado + " es tu código de verificación.";

                cajaSms.classList.add("visible");

            }, 1200);

        }

    }

    smsRellenar.addEventListener("click", function () {

        rellenar(codigoGenerado);

    });

    // ---- Temporizador de reenvío ----

    function detenerTemporizador() {

        clearInterval(intervalo);
        intervalo = null;

    }

    function iniciarTemporizador() {

        let restante = SEGUNDOS_REENVIO;

        detenerTemporizador();

        botonReenviar.disabled = true;
        temporizadorTxt.textContent = "Reenviar en " + restante + " s";
        botonReenviar.hidden = true;

        intervalo = setInterval(function () {

            restante--;

            if (restante <= 0) {

                detenerTemporizador();

                temporizadorTxt.textContent = "";
                botonReenviar.hidden = false;
                botonReenviar.disabled = false;

                return;

            }

            temporizadorTxt.textContent = "Reenviar en " + restante + " s";

        }, 1000);

    }

    botonReenviar.addEventListener("click", function () {

        reiniciarEscenario();
        enviarCodigo();

        slots[0].focus();

    });

    botonCambiar.addEventListener("click", function () {

        detenerTemporizador();
        clearTimeout(timeoutSms);
        cajaSms.classList.remove("visible");
        reiniciarEscenario();

        subtitulo.textContent = "Elige dónde quieres recibir tu código de verificación.";

        mostrarPaso("metodo");

    });

    // ---- Paso 2: cuadros del código ----

    function reiniciarEscenario() {

        ocupado = false;

        stage.classList.remove("girando", "ok", "error");

        slots.forEach(function (s) {

            s.value = "";
            s.disabled = false;
            s.classList.remove("lleno");
            s.style.transform = "";
            s.style.opacity = "";

        });

        ponerEstado("");

    }

    function rellenar(texto) {

        if (ocupado) {
            return;
        }

        const digitos = String(texto).replace(/\D/g, "").slice(0, LONGITUD);

        slots.forEach(function (s, i) {

            s.value = digitos[i] || "";
            s.classList.toggle("lleno", !!s.value);

        });

        const siguiente = slots.find(function (s) { return !s.value; }) || slots[LONGITUD - 1];

        siguiente.focus();

        revisar();

    }

    slots.forEach(function (slot, i) {

        slot.addEventListener("input", function () {

            const digitos = slot.value.replace(/\D/g, "");

            // Si escriben o autocompletan varios dígitos de golpe, los repartimos.
            if (digitos.length > 1) {
                rellenar(digitos);
                return;
            }

            slot.value = digitos;
            slot.classList.toggle("lleno", !!digitos);

            stage.classList.remove("error");
            ponerEstado("");

            if (digitos && slots[i + 1]) {
                slots[i + 1].focus();
            }

            revisar();

        });

        slot.addEventListener("keydown", function (evento) {

            if (evento.key === "Backspace" && !slot.value && slots[i - 1]) {

                slots[i - 1].value = "";
                slots[i - 1].classList.remove("lleno");
                slots[i - 1].focus();

                evento.preventDefault();

            } else if (evento.key === "ArrowLeft" && slots[i - 1]) {

                slots[i - 1].focus();

            } else if (evento.key === "ArrowRight" && slots[i + 1]) {

                slots[i + 1].focus();

            }

        });

        slot.addEventListener("focus", function () {

            slot.select();

        });

        slot.addEventListener("paste", function (evento) {

            const texto = (evento.clipboardData || window.clipboardData).getData("text");

            evento.preventDefault();

            rellenar(texto);

        });

    });

    // ---- Verificación ----

    function revisar() {

        if (ocupado || leerCodigo().length < LONGITUD) {
            return;
        }

        ocupado = true;

        slots.forEach(function (s) {
            s.disabled = true;
        });

        // TODO backend: reemplazar esta comparación por la validación real
        // (validarCodigoEnServidor(metodo, datos, leerCodigo())).
        const correcto = leerCodigo() === codigoGenerado;

        if (correcto) {
            exito();
        } else {
            fallo();
        }

    }

    function fallo() {

        stage.classList.add("error");

        ponerEstado("El código no es correcto. Inténtalo de nuevo.", "error");

        setTimeout(function () {

            slots.forEach(function (s) {

                s.value = "";
                s.disabled = false;
                s.classList.remove("lleno");

            });

            stage.classList.remove("error");

            ocupado = false;

            slots[0].focus();

        }, 900);

    }

    function exito() {

        cajaSms.classList.remove("visible");

        detenerTemporizador();

        document.activeElement && document.activeElement.blur();

        animarOrbita(function () {

            stage.classList.add("ok");

            ponerEstado("¡Cuenta verificada!", "ok");

            setTimeout(function () {

                mostrarToast("Cuenta verificada. Ya puedes iniciar sesión.");

                mostrarVista("view-login");

                reiniciarEscenario();

            }, 1100);

        });

    }

    // ---- Animación: los cuadros giran en círculo y se juntan en el centro ----

    function suavizar(t) {

        return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

    }

    function animarOrbita(alTerminar) {

        if (reducirMovimiento) {
            alTerminar();
            return;
        }

        const RADIO = 68;

        const T_JUNTAR = 550;    // los cuadros se acomodan sobre el círculo
        const T_GIRAR = 1400;    // una vuelta completa
        const T_COLAPSAR = 550;  // se recogen hacia el centro

        const rectStage = stage.getBoundingClientRect();
        const cx = rectStage.left + rectStage.width / 2;
        const cy = rectStage.top + rectStage.height / 2;

        stage.classList.add("girando");

        // Posición inicial de cada cuadro respecto al centro del escenario.
        const info = slots.map(function (s, i) {

            const r = s.getBoundingClientRect();

            return {
                el: s,
                x0: r.left + r.width / 2 - cx,
                y0: r.top + r.height / 2 - cy,
                // Ángulo de partida en el círculo: 4 cuadros separados 90°
                ang: -Math.PI / 2 + i * (Math.PI / 2)
            };

        });

        const inicio = performance.now();

        function pintar(item, x, y, rotGrados, escala, opacidad) {

            item.el.style.transform =
                "translate(" + (x - item.x0) + "px," + (y - item.y0) + "px) " +
                "rotate(" + rotGrados + "deg) scale(" + escala + ")";

            item.el.style.opacity = opacidad;

        }

        function cuadro(ahora) {

            const t = ahora - inicio;

            info.forEach(function (item) {

                if (t < T_JUNTAR) {

                    // Fase 1: de su lugar en la fila al círculo
                    const p = suavizar(t / T_JUNTAR);
                    const xf = RADIO * Math.cos(item.ang);
                    const yf = RADIO * Math.sin(item.ang);

                    pintar(
                        item,
                        item.x0 + (xf - item.x0) * p,
                        item.y0 + (yf - item.y0) * p,
                        45 * p, 1, 1
                    );

                } else if (t < T_JUNTAR + T_GIRAR) {

                    // Fase 2: giran una vuelta completa alrededor del centro
                    const q = suavizar((t - T_JUNTAR) / T_GIRAR);
                    const a = item.ang + Math.PI * 2 * q;

                    pintar(
                        item,
                        RADIO * Math.cos(a),
                        RADIO * Math.sin(a),
                        45 + (a - item.ang) * 180 / Math.PI,
                        1, 1
                    );

                } else {

                    // Fase 3: siguen girando mientras se recogen en el centro
                    const q = Math.min(1, (t - T_JUNTAR - T_GIRAR) / T_COLAPSAR);
                    const e = suavizar(q);
                    const a = item.ang + Math.PI * 2 + e * Math.PI * 0.5;
                    const r = RADIO * (1 - e);

                    pintar(
                        item,
                        r * Math.cos(a),
                        r * Math.sin(a),
                        45 + (a - item.ang) * 180 / Math.PI,
                        1 - e * 0.85,
                        1 - e
                    );

                }

            });

            if (t < T_JUNTAR + T_GIRAR + T_COLAPSAR) {
                requestAnimationFrame(cuadro);
            } else {
                alTerminar();
            }

        }

        requestAnimationFrame(cuadro);

    }

})();
