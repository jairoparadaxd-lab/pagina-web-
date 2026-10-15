// =============================
// GUARDIA DE SESIÓN
// Se incluye en cada panel con:
//   <script src="guardia.js" data-rol="director"></script>
// Roles: participante | director | administrador
// Si no hay sesión o el rol no coincide, vuelve al login.
// =============================

(function () {

    const LOGIN_URL = "login.html";
    const PANEL_POR_ROL = {
        participante: "participante.html",
        director: "director.html",
        administrador: "panel.html"
    };

    const script = document.currentScript;
    const rolEsperado = script ? script.getAttribute("data-rol") : "";

    let sesion = null;

    try {
        sesion = JSON.parse(localStorage.getItem("tl_sesion"));
    } catch (e) { }

    if (!sesion || !sesion.tipo) {
        location.replace(LOGIN_URL);
        return;
    }

    // Si entró al panel de otro rol, lo mandamos al suyo.
    if (sesion.tipo !== rolEsperado) {
        location.replace(PANEL_POR_ROL[sesion.tipo] || LOGIN_URL);
    }

})();
