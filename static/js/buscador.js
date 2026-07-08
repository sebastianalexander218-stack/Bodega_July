// buscador.js — buscador global con panel de sugerencias y resultados
//
// Funciona igual en cualquier página (inicio, productos, ofertas) porque
// trae el catálogo completo desde /api/productos en vez de depender de
// las cards que ya estén pintadas en el HTML de la página actual.
//
// Además, si estamos en /productos, sigue filtrando en vivo las cards
// de la grilla principal (comportamiento que ya existía).

var CATEGORIAS_BUSCADOR = [
  { slug: "alimentos", label: "Alimentos", icon: "fa-apple-alt" },
  { slug: "bebidas", label: "Bebidas", icon: "fa-wine-bottle" },
  { slug: "snacks", label: "Snacks", icon: "fa-cookie-bite" },
  { slug: "limpieza", label: "Limpieza", icon: "fa-spray-can" },
  { slug: "lacteos", label: "Lácteos", icon: "fa-cheese" }
];

var _catalogoCache = null;
var _catalogoPromise = null;

function _getCatalogoBuscador() {
  if (_catalogoCache) return Promise.resolve(_catalogoCache);
  if (!_catalogoPromise) {
    _catalogoPromise = fetch("/api/productos")
      .then(function (r) { return r.json(); })
      .then(function (data) { _catalogoCache = data; return data; })
      .catch(function () { return []; });
  }
  return _catalogoPromise;
}

function _escapeHtmlBuscador(s) {
  return String(s).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
}

function initBuscador() {
  var input = document.getElementById("input-buscador");
  if (!input) return;

  var contenedor = input.closest(".buscador");
  var panel = null;

  if (contenedor) {
    panel = document.createElement("div");
    panel.className = "buscador-panel";
    panel.id = "buscador-panel";
    contenedor.appendChild(panel);
  }

  function mostrarPanel() { if (panel) panel.classList.add("abierto"); }
  function ocultarPanel() { if (panel) panel.classList.remove("abierto"); }

  function renderChips(texto) {
    var cats = texto
      ? CATEGORIAS_BUSCADOR.filter(function (c) { return c.label.toLowerCase().indexOf(texto) !== -1; })
      : CATEGORIAS_BUSCADOR;
    if (!cats.length) return "";
    return '<div class="bp-categorias">' + cats.map(function (c) {
      return '<a class="bp-chip" href="/productos?categoria=' + c.slug + '">' +
        '<i class="fas ' + c.icon + '"></i> ' + c.label + '</a>';
    }).join("") + '</div>';
  }

  function renderResultados(texto, productos) {
    if (!texto) return "";

    var coincidencias = productos.filter(function (p) {
      return p.nombre.toLowerCase().indexOf(texto) !== -1 || p.categoria.toLowerCase().indexOf(texto) !== -1;
    }).slice(0, 4);

    if (!coincidencias.length) {
      return '<p class="bp-sin-resultados">No encontramos resultados para "' + _escapeHtmlBuscador(texto) + '"</p>';
    }

    return '<p class="bp-resultados-titulo">Resultados para "' + _escapeHtmlBuscador(texto) + '"</p>' +
      '<div class="bp-lista">' + coincidencias.map(function (p) {
        var img = "/static/img/" + p.imagen;
        var agotado = p.stock === 0;
        return '<div class="bp-item">' +
          '<img src="' + img + '" alt="' + _escapeHtmlBuscador(p.nombre) + '" onerror="this.src=\'/static/img/Loader.png\'">' +
          '<span class="bp-item-nombre">' + _escapeHtmlBuscador(p.nombre) + '</span>' +
          '<span class="bp-item-precio">S/ ' + parseFloat(p.precio).toFixed(2) + '</span>' +
          '<button class="bp-item-agregar" data-nombre="' + _escapeHtmlBuscador(p.nombre) + '" data-precio="' + p.precio + '" data-img="' + img + '"' +
            (agotado ? ' disabled' : '') + '>' + (agotado ? 'Agotado' : 'Agregar') + '</button>' +
        '</div>';
      }).join("") + '</div>';
  }

  function renderFooter(texto) {
    var href = texto ? "/productos?buscar=" + encodeURIComponent(texto) : "/productos";
    var label = texto ? 'Ver todos los resultados para "' + _escapeHtmlBuscador(texto) + '" &rarr;' : "Ver todo el catálogo &rarr;";
    return '<a class="bp-vertodos" href="' + href + '">' + label + '</a>';
  }

  function pintarPanel(texto, productos) {
    if (!panel) return;
    panel.innerHTML = renderChips(texto) + renderResultados(texto, productos) + renderFooter(texto);

    panel.querySelectorAll(".bp-item-agregar:not([disabled])").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        var id = btn.dataset.nombre.toLowerCase().replace(/\s+/g, "-");
        carrito.agregar(id, btn.dataset.nombre, parseFloat(btn.dataset.precio), btn.dataset.img);
        var original = btn.textContent;
        btn.textContent = "✓";
        setTimeout(function () { btn.textContent = original; }, 800);
      });
    });
  }

  function renderPanel(textoOriginal) {
    if (!panel) return;
    var texto = (textoOriginal || "").trim().toLowerCase();
    if (_catalogoCache) {
      pintarPanel(texto, _catalogoCache);
    } else {
      panel.innerHTML = '<div class="bp-cargando">Buscando…</div>';
      _getCatalogoBuscador().then(function (productos) { pintarPanel(texto, productos); });
    }
  }

  input.addEventListener("focus", function () {
    renderPanel(input.value);
    mostrarPanel();
  });

  document.addEventListener("click", function (e) {
    if (contenedor && !contenedor.contains(e.target)) ocultarPanel();
  });

  input.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      ocultarPanel();
      input.blur();
    }
    // Al presionar Enter, siempre va a /productos con la búsqueda
    if (e.key === "Enter") {
      var texto = input.value.trim();
      if (texto) window.location.href = "/productos?buscar=" + encodeURIComponent(texto);
    }
  });

  input.addEventListener("input", function () {
    var texto = input.value.trim().toLowerCase();

    // Panel de sugerencias + resultados (funciona en cualquier página)
    renderPanel(input.value);
    if (document.activeElement === input) mostrarPanel();

    // Solo filtra en tiempo real las cards de la grilla si estamos en /productos
    var enProductos = window.location.pathname === "/productos";
    if (!enProductos) return;

    var cards = document.querySelectorAll("#productos .card");
    var hayResultados = false;

    cards.forEach(function (card) {
      var nombre = card.querySelector("h3") ? card.querySelector("h3").textContent.toLowerCase() : "";
      var coincide = !texto || nombre.includes(texto);
      card.style.display = coincide ? "" : "none";
      if (coincide) hayResultados = true;
    });

    // Mostrar mensaje si no hay resultados
    var msg = document.getElementById("busqueda-msg");
    if (!msg) {
      msg = document.createElement("p");
      msg.id = "busqueda-msg";
      msg.style.cssText = "text-align:center;color:#6b5e82;font-size:14px;margin-top:16px;";
      var cont = document.querySelector(".productos-container");
      if (cont) cont.after(msg);
    }
    msg.textContent = (!hayResultados && texto) ? 'No encontramos "' + input.value.trim() + '"' : "";
  });
}

// En /productos, lee el parámetro ?buscar= de la URL y pre-filtra
document.addEventListener("DOMContentLoaded", function () {
  if (window.location.pathname !== "/productos") return;
  var params = new URLSearchParams(window.location.search);
  var buscar = params.get("buscar");
  if (!buscar) return;

  var input = document.getElementById("input-buscador");
  if (input) {
    input.value = buscar;
    // Disparar el filtro cuando los productos ya estén en el DOM
    // (productos-api.js también lo vuelve a disparar cuando termina de
    // renderizar, por si la API tarda más que este timeout).
    setTimeout(function () { input.dispatchEvent(new Event("input")); }, 300);
  }
});
