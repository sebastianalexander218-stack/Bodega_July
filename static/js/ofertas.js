// ofertas.js — carga las ofertas vigentes hoy desde la API y conecta sus botones

const NOMBRES_DIA = {
  lunes: "lunes", martes: "martes", miercoles: "miércoles", jueves: "jueves",
  viernes: "viernes", sabado: "sábado", domingo: "domingo",
};

function textoVigencia(dias) {
  if (!dias || dias.includes("todos")) return "Disponible todos los días";
  const nombres = dias.map(d => NOMBRES_DIA[d] || d);
  return "Disponible: " + nombres.join(", ");
}

function crearOfertaCardHTML(o) {
  const imgSrc = o.imagen.startsWith("http") ? o.imagen : "/static/img/" + o.imagen;
  const descuento = o.precio_normal > 0
    ? Math.round(((o.precio_normal - o.precio_oferta) / o.precio_normal) * 100)
    : 0;
  return `<div class="oferta-card${o.destacada ? " oferta-destacada" : ""}">
    <span class="oferta-badge">-${descuento}%</span>
    <img src="${imgSrc}" alt="${o.titulo}" onerror="this.src='/static/img/Loader.png'">
    <div class="oferta-info">
      <h3>${o.titulo}</h3>
      ${o.descripcion ? `<p class="oferta-descripcion">${o.descripcion}</p>` : ""}
      <div class="oferta-precios">
        <span class="precio-tachado">S/ ${parseFloat(o.precio_normal).toFixed(2)}</span>
        <span class="precio-oferta">S/ ${parseFloat(o.precio_oferta).toFixed(2)}</span>
      </div>
      <span class="oferta-vence"><i class="fas fa-clock"></i> ${textoVigencia(o.dias)}</span>
    </div>
    <button class="btn-agregar-oferta" data-nombre="${o.titulo}" data-precio="${o.precio_oferta}" data-img="${imgSrc}">
      Agregar al carrito
    </button>
  </div>`;
}

// Trae las ofertas del día desde la API, las pinta y conecta sus botones.
function cargarOfertasDelDia() {
  const contenedor = document.getElementById("ofertas-container");
  if (!contenedor) return; // no estamos en /ofertas

  fetch("/api/ofertas?solo_hoy=1")
    .then(r => r.json())
    .then(ofertas => {
      const vacio = document.getElementById("ofertas-vacio");
      if (!ofertas.length) {
        contenedor.innerHTML = "";
        if (vacio) vacio.style.display = "block";
        return;
      }
      if (vacio) vacio.style.display = "none";
      contenedor.innerHTML = ofertas.map(crearOfertaCardHTML).join("");
      bindBotonesOferta();
    })
    .catch(() => {});
}

// Conecta los botones "Agregar al carrito" que ya existen en el DOM (ofertas dinámicas
// y las secciones estáticas "Más vendidos" / "Recomendados" de la página de inicio).
function bindBotonesOferta() {
  document.querySelectorAll(".btn-agregar-oferta, .btn-agregar-nuevo").forEach(btn => {
    if (btn.dataset.bound === "1") return; // evita registrar el listener dos veces
    btn.dataset.bound = "1";

    const textoOriginal = btn.textContent.trim();

    btn.addEventListener("click", () => {
      const nombre = btn.dataset.nombre;
      const precio = parseFloat(btn.dataset.precio);
      const img    = btn.dataset.img;
      const id     = nombre.toLowerCase().replace(/\s+/g, "-");
      carrito.agregar(id, nombre, precio, img);

      // feedback visual en el botón
      btn.textContent = "¡Agregado! ✓";
      btn.style.background = "#22c55e";
      setTimeout(() => {
        btn.textContent = textoOriginal;
        btn.style.background = "";
      }, 1200);
    });
  });
}

// Punto de entrada que llama main.js en cada página
function initOfertas() {
  bindBotonesOferta();
  cargarOfertasDelDia();
}
