// main.js — arranca los módulos comunes cuando el DOM está listo
// Los módulos específicos de cada página se cargan en el bloque extra_scripts
// del template correspondiente (inicio.html, productos.html, ofertas.html).

document.addEventListener("DOMContentLoaded", () => {
  // Módulos presentes en TODAS las páginas (cargados desde base.html)
  if (typeof initCarrito  === "function") initCarrito();
  if (typeof initPago     === "function") initPago();
  if (typeof initBuscador === "function") initBuscador();
  if (typeof initFavoritos=== "function") initFavoritos();
  initCuenta();

  // Módulos opcionales — solo existen en las páginas que los incluyen
  if (typeof initSlider   === "function") initSlider();
  if (typeof initMarcas   === "function") initMarcas();
  if (typeof initOfertas  === "function") initOfertas();
  if (typeof initFiltros  === "function") initFiltros();
});

// Dropdown de cuenta de usuario en el nav
function initCuenta() {
  const contenedor = document.querySelector(".cuenta-contenedor");
  if (!contenedor) return;

  const btn      = contenedor.querySelector(".btn-cuenta");
  const dropdown = contenedor.querySelector(".cuenta-dropdown");

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    dropdown.classList.toggle("abierto");
  });

  document.addEventListener("click", () => {
    dropdown.classList.remove("abierto");
  });
}
