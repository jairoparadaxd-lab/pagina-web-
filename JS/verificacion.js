// =============================
// VERIFICACIÓN DE CUENTA (OTP por correo con Resend)
// Cargar DESPUÉS de login.js (usa mostrarVista y mostrarToast)
// =============================

(function () {

    const vista = document.getElementById("view-verificacion");

    if (!vista) {
        return;
    }

    // ---- Configuración ----

    // En producción cambia esta URL por la de tu servidor desplegado
    const API = "http://localhost:3000";

    const LONGITUD = 4;
    const SEGUNDOS_REENVIO = 62; // el servidor exige 60 s entre códigos

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

    // Caja de SMS simulado: ya no se usa, se oculta
    const cajaSms = document.getElementById("ver-sms");

    if (cajaSms) {
        cajaSms.hidden = true;
        cajaSms.style.display = "none";
    }

    // ---- Estado ----

    let datos = { email: "", telefono: "", codigoPais: "" };
    let metodo = "email";
    let intervalo = null;
    let ocupado = false;
    let enviando = false;

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

    async function post(ruta, cuerpo) {

        const r = await fetch(API + ruta, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(cuerpo)
        });

        return r.json();

    }

    function marcarCuentaVerificada(email) {

        try {

            const cuentas = JSON.parse(localStorage.getItem("tl_cuentas")) || [];

            cuentas.forEach(function (c) {

                if (c.email && c.email.toLowerCase() === email.toLowerCase()) {
                    c.verificado = true;
                }

            });

            localStorage.setItem("tl_cuentas", JSON.stringify(cuentas));

        } catch (e) { }

    }

    // ---- API pública: la llama login.js ----

    window.abrirVerificacion = function (nuevosDatos) {

        datos = {
            email: ((nuevosDatos && nuevosDatos.email) || "").trim().toLowerCase(),
            telefono: (nuevosDatos && nuevosDatos.telefono) || "",
            codigoPais: (nuevosDatos && nuevosDatos.codigoPais) || ""
        };

        metodo = "email";

        destinoEmail.textContent = enmascararEmail(datos.email);
        destinoTelefono.textContent = datos.telefono
            ? enmascararTelefono(datos.codigoPais, datos.telefono)
            : "";

        elegirMetodo("email");
        reiniciarEscenario();
        detenerTemporizador();

        botonEnviar.disabled = false;

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

            if (metodo === "telefono") {
                mostrarToast("La verificación por SMS aún no está disponible. Usa el correo.");
            }

        });

    });

    botonEnviar.addEventListener("click", async function () {

        if (metodo !== "email") {
            mostrarToast("La verificación por SMS aún no está disponible. Usa el correo.");
            return;
        }

        const ok = await enviarCodigo();

        if (!ok) {
            return;
        }

        subtitulo.textContent =
            "Ingresa el código de " + LONGITUD + " dígitos que enviamos a " + destinoActual() + ".";

        mostrarPaso("codigo");
        reiniciarEscenario();

        slots[0].focus();

    });

    // ---- Envío del código (servidor + Resend) ----
    // Devuelve true si el correo se envió bien.

    async function enviarCodigo() {

        if (enviando) {
            return false;
        }

        enviando = true;
        botonEnviar.disabled = true;
        botonReenviar.disabled = true;

        try {

            const data = await post("/api/enviar-codigo", { email: datos.email });

            if (!data.ok) {

                mostrarToast(data.mensaje || "No se pudo enviar el código.");
                ponerEstado(data.mensaje || "No se pudo enviar el código.", "error");

                botonEnviar.disabled = false;
                botonReenviar.disabled = false;
                enviando = false;

                return false;

            }

            mostrarToast("Código enviado a tu correo: " + enmascararEmail(datos.email));

            iniciarTemporizador();

            botonEnviar.disabled = false;
            enviando = false;

            return true;

        } catch (e) {

            mostrarToast("No se pudo conectar con el servidor. ¿Está encendido?");
            ponerEstado("No se pudo conectar con el servidor.", "error");

            botonEnviar.disabled = false;
            botonReenviar.disabled = false;
            enviando = false;

            return false;

        }

    }

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

    botonReenviar.addEventListener("click", async function () {

        reiniciarEscenario();

        const ok = await enviarCodigo();

        if (ok) {
            slots[0].focus();
        }

    });

    botonCambiar.addEventListener("click", function () {

        detenerTemporizador();
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

    // ---- Verificación (la valida el servidor) ----

    async function revisar() {

        if (ocupado || leerCodigo().length < LONGITUD) {
            return;
        }

        ocupado = true;

        slots.forEach(function (s) {
            s.disabled = true;
        });

        ponerEstado("Verificando...");

        try {

            const data = await post("/api/verificar-codigo", {
                email: datos.email,
                codigo: leerCodigo()
            });

            if (data.ok) {
                exito();
            } else {
                fallo(data.mensaje);
            }

        } catch (e) {

            ponerEstado("No se pudo conectar con el servidor.", "error");

            slots.forEach(function (s) {
                s.disabled = false;
            });

            ocupado = false;

        }

    }

    function fallo(mensaje) {

        stage.classList.add("error");

        ponerEstado(mensaje || "El código no es correcto. Inténtalo de nuevo.", "error");

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

        detenerTemporizador();

        marcarCuentaVerificada(datos.email);

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