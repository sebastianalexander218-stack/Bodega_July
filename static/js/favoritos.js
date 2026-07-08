// favoritos.js — guarda los favoritos en localStorage

function getFavoritos() {
  return JSON.parse(localStorage.getItem("favoritos") || "[]");
}

function guardarFavoritos(lista) {
  localStorage.setItem("favoritos", JSON.stringify(lista));
}

// Pinta los corazones de las cards que ya son favoritas.
// Se llama DESPUÉS de que las cards existen en el DOM.
function pintarCorazones() {
  var favoritos = getFavoritos();
  document.querySelectorAll(".btn-favorito").forEach(function(btn) {
    var nombre = btn.closest(".card")?.querySelector("h3")?.textContent || "";
    var esFav = favoritos.find(function(f) { return f.nombre === nombre; });
    if (esFav) {
      btn.classList.add("activo");
      var icono = btn.querySelector("i");
      if (icono) icono.style.color = "#ef4444";
      btn.title = "Quitar de favoritos";
    } else {
      btn.classList.remove("activo");
      var icono = btn.querySelector("i");
      if (icono) icono.style.color = "";
      btn.title = "Agregar a favoritos";
    }
  });
}

// Registra el listener de clicks UNA SOLA VEZ en document (delegación).
// Se llama desde main.js al cargar el DOM.
function initFavoritos() {
  document.addEventListener("click", function(e) {
    var btn = e.target.closest(".btn-favorito");
    if (!btn) return;

    var nombre = btn.closest(".card")?.querySelector("h3")?.textContent || "";
    var precio = btn.closest(".card")?.querySelector(".precio")?.textContent || "";
    var img    = btn.closest(".card")?.querySelector("img")?.src || "";
    var favoritos = getFavoritos();
    var activo = btn.classList.toggle("activo");
    var icono  = btn.querySelector("i");

    if (activo) {
      if (!favoritos.find(function(f) { return f.nombre === nombre; })) {
        favoritos.push({ nombre: nombre, precio: precio, img: img });
      }
      if (icono) icono.style.color = "#ef4444";
      btn.title = "Quitar de favoritos";
    } else {
      favoritos = favoritos.filter(function(f) { return f.nombre !== nombre; });
      if (icono) icono.style.color = "";
      btn.title = "Agregar a favoritos";
    }

    guardarFavoritos(favoritos);
  });
}
