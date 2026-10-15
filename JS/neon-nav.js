/* ============================= */
/* ANILLO NEÓN - AUTODETECCIÓN DE PÁGINA */
/* Enlazar este archivo en TODAS las páginas, */
/* después de tu script.js / mision.js, etc.: */
/* <script src="neon-nav.js"></script>        */
/* ============================= */

(function () {

  const nav = document.getElementById("menu");
  if (!nav) return;

  const enlaces = nav.querySelectorAll("a[data-color]");
  if (!enlaces.length) return;

  /* ============================= */
  /* CREAR EL ANILLO */
  /* ============================= */

  const anillo = document.createElement("div");
  anillo.className = "anillo-neon";
  nav.appendChild(anillo);


  /* ============================= */
  /* DETECTAR PÁGINA ACTUAL */
  /* ============================= */

  let archivoActual =
    location.pathname.split("/").pop();

  if (archivoActual === "") {
    archivoActual = "index.html";
  }

  let activo = null;

  enlaces.forEach(function (enlace) {

    // el href puede traer un ancla (#inicio), comparamos solo el archivo
    const archivoEnlace =
      enlace.getAttribute("href").split("#")[0];

    if (archivoEnlace === archivoActual) {
      enlace.classList.add("activo");
      activo = enlace;
    } else {
      enlace.classList.remove("activo");
    }

  });

  // si ninguno coincidió (ej. index.html con ancla #inicio), usa el primero
  if (!activo) {
    activo = enlaces[0];
    activo.classList.add("activo");
  }


  /* ============================= */
  /* COLOCAR EL ANILLO */
  /* ============================= */

  const colores = {
    rojo: "var(--neon-rojo)",
    azul: "var(--neon-azul)",
    morado: "var(--neon-morado)",
    amarillo: "var(--neon-amarillo)"
  };

  function moverAnillo(enlace, animar) {

    const rNav = nav.getBoundingClientRect();
    const rEnlace = enlace.getBoundingClientRect();

    const izquierda =
      rEnlace.left - rNav.left + rEnlace.width / 2 - 19;

    if (!animar) {
      anillo.style.transition = "none";
    }

    anillo.style.left = izquierda + "px";

    document.documentElement.style.setProperty(
      "--neon-glow",
      colores[enlace.dataset.color] || colores.rojo
    );

    if (!animar) {
      requestAnimationFrame(function () {
        anillo.style.transition = "";
        anillo.classList.add("listo");
      });
    }

  }

  // esperar a que las fuentes/layout estén listas para medir bien
  window.addEventListener("load", function () {
    moverAnillo(activo, false);
  });

  window.addEventListener("resize", function () {
    const actual = nav.querySelector("a.activo");
    if (actual) moverAnillo(actual, false);
  });

})();
