// slider.js — hero slider con autoplay cada 4 segundos

const diapositivas = [
  {
    tag: "Todo lo que necesitas",
    titulo: "Todo para tu hogar,<br><span>en un solo lugar</span>",
    desc: "Compra rápido, fácil y sin salir de casa.",
    btn: "Comprar ahora",
    link: "/productos",
    fondo: "linear-gradient(135deg, #f5f0ff 0%, #ede0ff 100%)"
  },
  {
    tag: "Ofertas de temporada",
    titulo: "Las mejores marcas,<br><span>al mejor precio</span>",
    desc: "Alicorp, Gloria, Bimbo y más con descuentos especiales.",
    btn: "Ver ofertas",
    link: "/ofertas",
    fondo: "linear-gradient(135deg, #e8f4ff 0%, #d4eaff 100%)"
  },
  {
    tag: "Delivery rápido",
    titulo: "Recibe tu pedido<br><span>en menos de 1 hora</span>",
    desc: "Cobertura en todo el distrito, sin costo adicional.",
    btn: "Pedir ahora",
    link: "/productos",
    fondo: "linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)"
  }
];

let diapositivaActual = 0;
let timer;

function initSlider() {
  const hero = document.getElementById("hero");
  const contenido = hero?.querySelector(".hero-contenido");
  const dots = hero?.querySelectorAll(".dot");
  if (!hero || !contenido) return;

  contenido.style.transition = "opacity 0.25s ease";
  hero.style.transition = "background 0.5s ease";

  const btnPrincipal = contenido.querySelector(".btn-principal");

  // Aplica el contenido de una diapositiva (texto + destino del botón) sin animación.
  // Se usa tanto en la carga inicial como, con fundido, al cambiar de slide.
  function aplicarContenido(d) {
    contenido.querySelector(".hero-tag").textContent = d.tag;
    contenido.querySelector("h1").innerHTML = d.titulo;
    contenido.querySelector("p").textContent = d.desc;
    if (btnPrincipal) {
      btnPrincipal.textContent = d.btn + " ›";
      btnPrincipal.onclick = () => { window.location.href = d.link; };
    }
    hero.style.background = d.fondo;
  }

  function irA(idx) {
    diapositivaActual = (idx + diapositivas.length) % diapositivas.length;
    const d = diapositivas[diapositivaActual];

    contenido.style.opacity = "0";
    setTimeout(() => {
      aplicarContenido(d);
      contenido.style.opacity = "1";
    }, 250);

    dots?.forEach((dot, i) => dot.classList.toggle("active", i === diapositivaActual));
  }

  function reiniciarTimer() {
    clearInterval(timer);
    timer = setInterval(() => irA(diapositivaActual + 1), 4000);
  }

  hero.querySelector(".slider-arrow.prev")?.addEventListener("click", () => { irA(diapositivaActual - 1); reiniciarTimer(); });
  hero.querySelector(".slider-arrow.next")?.addEventListener("click", () => { irA(diapositivaActual + 1); reiniciarTimer(); });
  dots?.forEach((dot, i) => dot.addEventListener("click", () => { irA(i); reiniciarTimer(); }));

  // Deja el botón del primer slide (visible desde el HTML) con su destino correcto
  // antes de arrancar el autoplay, sin animación de fundido.
  aplicarContenido(diapositivas[0]);

  reiniciarTimer();
}
