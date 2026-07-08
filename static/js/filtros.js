// filtros.js — filtra las cards de productos por categoría

function initFiltros() {
  const botones = document.querySelectorAll(".filtro-btn");
  if (!botones.length) return;

  botones.forEach(btn => {
    btn.addEventListener("click", () => {
      // marcar activo
      botones.forEach(b => b.classList.remove("activo"));
      btn.classList.add("activo");

      const filtro = btn.dataset.filtro;
      const cards  = document.querySelectorAll("#productos .card");

      cards.forEach(card => {
        const cat = card.dataset.categoria || "";
        const mostrar = filtro === "todos" || cat === filtro;

        card.style.transition = "opacity .25s, transform .25s";
        if (mostrar) {
          card.style.opacity = "1";
          card.style.transform = "";
          card.style.display = "";
        } else {
          card.style.opacity = "0";
          card.style.transform = "scale(0.95)";
          // pequeño delay para que la transición se vea antes de ocultar
          setTimeout(() => {
            if (btn.dataset.filtro !== "todos" && card.dataset.categoria !== btn.dataset.filtro) {
              card.style.display = "none";
            }
          }, 250);
        }
      });
    });
  });
}
