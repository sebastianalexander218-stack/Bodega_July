// productos-api.js

// Quicksort: ordena una lista de productos según un criterio
function quickSort(lista, criterio) {
  var arr = lista.slice(); // copia para no modificar el original

  function comparar(a, b) {
    if (criterio === "precio-asc")  return a.precio - b.precio;
    if (criterio === "precio-desc") return b.precio - a.precio;
    if (criterio === "nombre-az")   return a.nombre.localeCompare(b.nombre);
    return 0;
  }

  function partition(arr, low, high) {
    var pivot = arr[high];
    var i = low - 1;
    for (var j = low; j < high; j++) {
      if (comparar(arr[j], pivot) <= 0) {
        i++;
        var tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
      }
    }
    var tmp = arr[i + 1]; arr[i + 1] = arr[high]; arr[high] = tmp;
    return i + 1;
  }

  function qs(arr, low, high) {
    if (low < high) {
      var pi = partition(arr, low, high);
      qs(arr, low, pi - 1);
      qs(arr, pi + 1, high);
    }
  }

  qs(arr, 0, arr.length - 1);
  return arr;
}

// Construye el HTML de una card de producto
function crearCardHTML(p) {
  var agotado = p.stock === 0;
  var imgSrc = p.imagen.startsWith("http") ? p.imagen : "/static/img/" + p.imagen;
  return `<div class="card${agotado ? " card-agotado" : ""}" data-categoria="${p.categoria}">
    <button class="btn-favorito" title="Agregar a favoritos"><i class="fas fa-heart"></i></button>
    ${agotado ? '<span class="badge-agotado">Agotado</span>' : ""}
    <img src="${imgSrc}" alt="${p.nombre}" onerror="this.src='/static/img/Loader.png'">
    <div class="card-info">
      <h3>${p.nombre}</h3>
      <div class="card-footer">
        <span class="precio">S/ ${parseFloat(p.precio).toFixed(2)}</span>
        <button class="btn-agregar" aria-label="Agregar al carrito"
          data-nombre="${p.nombre}" data-precio="${p.precio}"
          data-img="${imgSrc}" data-stock="${p.stock}"
          ${agotado ? "disabled" : ""}>+</button>
      </div>
    </div>
  </div>`;
}

// Conecta los botones "+" al carrito
function conectarBotones(contenedor) {
  contenedor.querySelectorAll(".btn-agregar:not([disabled])").forEach(function(btn) {
    btn.addEventListener("click", function() {
      var id    = btn.dataset.nombre.toLowerCase().replace(/\s+/g, "-");
      var stock = parseInt(btn.dataset.stock, 10);
      carrito.agregar(id, btn.dataset.nombre, parseFloat(btn.dataset.precio), btn.dataset.img, stock);
    });
  });
}

// Pinta las cards en el contenedor según el criterio actual
function renderProductos(productos, criterio) {
  var contenedor = document.querySelector("#productos .productos-container");
  if (!contenedor) return;

  var ordenados = criterio ? quickSort(productos, criterio) : productos;
  contenedor.innerHTML = ordenados.map(crearCardHTML).join("");
  conectarBotones(contenedor);

  if (typeof pintarCorazones === "function") pintarCorazones();

  var inputBuscador = document.getElementById("input-buscador");
  if (inputBuscador) inputBuscador.dispatchEvent(new Event("input"));
}

(function () {
  var contenedor = document.querySelector("#productos .productos-container");
  if (!contenedor) return;

  fetch("/api/productos")
    .then(function(r) { return r.json(); })
    .then(function(productos) {
      if (!productos.length) return;

      // Pintado inicial
      renderProductos(productos, null);

      // Si venimos desde el inicio con una categoría en la URL (?categoria=alimentos),
      // aplicamos el filtro apenas los productos ya están pintados en el DOM,
      // y marcamos el botón correspondiente como activo.
      var params = new URLSearchParams(window.location.search);
      var cat = params.get("categoria");
      if (cat) {
        var btn = document.querySelector('.filtro-btn[data-filtro="' + cat + '"]');
        if (btn) btn.click();
      }

      // Escuchar cambios en el selector de orden
      var selector = document.getElementById("selector-orden");
      if (selector) {
        selector.addEventListener("change", function() {
          renderProductos(productos, selector.value);
        });
      }
    })
    .catch(function() {});
})();
