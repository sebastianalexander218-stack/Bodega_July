// marcas.js — carrusel infinito de logos de marcas (sin salto visual)

function initMarcas() {
  const wrapper = document.querySelector(".marcas-wrapper");
  const slider  = document.querySelector(".marcas-slider");
  if (!wrapper || !slider) return;

  // necesitamos que el wrapper sea block para que la pista controle el layout
  wrapper.style.overflow = "hidden";
  wrapper.style.display  = "block";

  // clonamos ANTES de mover el slider al nuevo contenedor
  const clon = slider.cloneNode(true);
  clon.setAttribute("aria-hidden", "true");
  clon.style.gap = "80px";
  clon.style.flexShrink = "0";

  // pista: ambos sliders lado a lado
  const pista = document.createElement("div");
  pista.style.cssText = "display:flex;gap:80px;will-change:transform;width:max-content;";

  slider.style.gap = "80px";
  slider.style.flexShrink = "0";

  pista.appendChild(slider);
  pista.appendChild(clon);
  wrapper.appendChild(pista);

  // esperamos un frame para que el DOM pinte y podamos medir
  requestAnimationFrame(() => {
    const anchoPista = slider.scrollWidth + 80;
    let pos = 0;

    function mover() {
      pos -= 0.6;
      if (pos <= -anchoPista) pos = 0;
      pista.style.transform = `translateX(${pos}px)`;
      requestAnimationFrame(mover);
    }
    mover();
  });
}
