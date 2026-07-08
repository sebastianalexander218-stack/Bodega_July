// preloader.js — oculta el loader cuando la página termina de cargar

(function () {
  document.documentElement.classList.add("loading");
  document.body.classList.add("loading");

  function ocultar() {
    const loader = document.getElementById("preloader");
    if (!loader) return;
    loader.classList.add("oculto");
    document.body.classList.remove("loading");
    document.documentElement.classList.remove("loading");
    setTimeout(() => { loader.style.display = "none"; }, 650);
  }

  if (document.readyState === "complete") {
    setTimeout(ocultar, 1500);
  } else {
    window.addEventListener("load", () => setTimeout(ocultar, 1500));
    setTimeout(ocultar, 4000); // fallback por si acaso
  }
})();
