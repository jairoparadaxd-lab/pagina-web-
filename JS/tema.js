// =============================
// CAMBIO DE TEMA (oscuro / claro)
// Guarda la elección en localStorage y la aplica antes de pintar.
// =============================

(function () {

    const CLAVE_TEMA = "tl_tema";
    const raiz = document.documentElement;
    const boton = document.getElementById("tema-toggle");

    function leerTema() {

        try {
            const guardado = localStorage.getItem(CLAVE_TEMA);

            if (guardado === "light" || guardado === "dark") {
                return guardado;
            }
        } catch (e) { }

        return "dark";

    }

    function aplicarTema(tema) {

        raiz.setAttribute("data-tema", tema);

        if (boton) {

            boton.setAttribute(
                "aria-label",
                tema === "dark" ? "Cambiar a tema claro" : "Cambiar a tema oscuro"
            );

            boton.setAttribute("aria-pressed", tema === "light" ? "true" : "false");

        }

    }

    aplicarTema(leerTema());

    if (boton) {

        boton.addEventListener("click", function () {

            const nuevo = raiz.getAttribute("data-tema") === "light" ? "dark" : "light";

            aplicarTema(nuevo);

            try {
                localStorage.setItem(CLAVE_TEMA, nuevo);
            } catch (e) { }

        });

    }

})();


// =============================
// INSTITUCIÓN EDUCATIVA: visibilidad garantizada para Director
// Se ejecuta al final, así que tiene la última palabra sobre
// cualquier otro script que oculte el campo.
// =============================

(function () {

    const select = document.getElementById("registro-tipo");
    const grupo = document.getElementById("grupo-institucion");

    if (!select || !grupo) {
        return;
    }

    function sincronizar() {

        const esDirector = select.value === "director";

        grupo.hidden = !esDirector;

        // Quita cualquier display:none en línea que haya dejado otro script
        grupo.style.display = esDirector ? "block" : "none";

    }

    select.addEventListener("change", sincronizar);

    if (select.form) {

        select.form.addEventListener("reset", function () {
            setTimeout(sincronizar, 0);
        });

    }

    // Si otro script cambia el atributo hidden, se corrige.
    new MutationObserver(function () {

        const debeVerse = select.value === "director";

        if (debeVerse === grupo.hidden) {
            sincronizar();
        }

    }).observe(grupo, { attributes: true, attributeFilter: ["hidden", "style"] });

    sincronizar();

})();
