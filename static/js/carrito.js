// carrito.js — maneja el sidebar y los productos en el carrito

const carrito = {
  items: {}, // guardamos cada producto como { nombre, precio, qty, img }

  abrir() {
    document.getElementById("carrito-sidebar").classList.add("abierto");
    document.getElementById("overlay-carrito").classList.add("visible");
    this.render();
  },

  cerrar() {
    document.getElementById("carrito-sidebar").classList.remove("abierto");
    document.getElementById("overlay-carrito").classList.remove("visible");
  },

  agregar(id, nombre, precio, img, stock) {
    const hayLimite = typeof stock === "number" && !isNaN(stock);

    if (this.items[id]) {
      // si conocemos el stock, no dejamos superar lo disponible
      if (hayLimite && this.items[id].qty >= stock) {
        this.mostrarToast(
          stock > 0
            ? `Ya agregaste el máximo disponible (${stock}) de "${nombre}".`
            : `"${nombre}" no tiene stock disponible.`,
          "error"
        );
        return;
      }
      this.items[id].qty++;
      if (hayLimite) this.items[id].stock = stock;
    } else {
      if (hayLimite && stock <= 0) {
        this.mostrarToast(`"${nombre}" no tiene stock disponible.`, "error");
        return;
      }
      this.items[id] = { nombre, precio, qty: 1, img, stock: hayLimite ? stock : undefined };
    }
    this.actualizarBadge();
    this.render();
    this.feedback(id);
  },

  quitar(id) {
    if (!this.items[id]) return;
    this.items[id].qty--;
    if (this.items[id].qty <= 0) delete this.items[id];
    this.actualizarBadge();
    this.render();
  },

  eliminar(id) {
    delete this.items[id];
    this.actualizarBadge();
    this.render();
  },

  total() {
    return Object.values(this.items).reduce((acc, item) => acc + item.precio * item.qty, 0);
  },

  count() {
    return Object.values(this.items).reduce((acc, item) => acc + item.qty, 0);
  },

  actualizarBadge() {
    const badge = document.querySelector(".carrito-badge");
    const n = this.count();
    if (!badge) return;
    badge.textContent = n;
    badge.style.display = n > 0 ? "flex" : "none";
  },

  // animación rápida en el botón "+" al agregar
  feedback(id) {
    const idSeguro = window.CSS && CSS.escape ? CSS.escape(id) : id;
    const btn = document.querySelector(`[data-producto-id="${idSeguro}"] .btn-agregar`);
    if (!btn) return;
    btn.textContent = "✓";
    btn.style.background = "#22c55e";
    setTimeout(() => { btn.textContent = "+"; btn.style.background = ""; }, 800);
  },

  // muestra un aviso flotante reutilizando el toast global del sitio
  mostrarToast(msg, tipo) {
    const toast = document.getElementById("toast-confirmacion");
    if (!toast) return;
    const texto = toast.querySelector(".toast-texto");
    if (texto) texto.textContent = msg;
    toast.classList.toggle("error", tipo === "error");
    toast.classList.add("visible");
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => {
      toast.classList.remove("visible");
      toast.classList.remove("error");
    }, 3000);
  },

  // escapa caracteres especiales para poder interpolar de forma segura en HTML
  _esc(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  },

  render() {
    const lista = document.getElementById("carrito-lista");
    const totalEl = document.getElementById("carrito-total");
    if (!lista) return;

    const ids = Object.keys(this.items);

    if (ids.length === 0) {
      lista.innerHTML = `
        <div class="carrito-vacio">
          <i class="fas fa-shopping-basket" style="font-size:40px;color:#d8cef0;margin-bottom:8px"></i>
          <p>Tu carrito está vacío</p>
          <small>Agrega productos desde la tienda</small>
        </div>`;
      if (totalEl) totalEl.textContent = "S/ 0.00";
      return;
    }

    // Nota: los botones usan data-id (no onclick="...") para que nombres de
    // producto con apóstrofes u otros caracteres especiales (p. ej. "Papas Lay's")
    // no rompan el HTML generado. Los clics se manejan por delegación en initCarrito().
    lista.innerHTML = ids.map(id => {
      const it = this.items[id];
      const idSeguro = this._esc(id);
      const nombreSeguro = this._esc(it.nombre);
      const limiteAlcanzado = typeof it.stock === "number" && it.qty >= it.stock;
      return `
        <div class="carrito-item">
          <img src="${this._esc(it.img)}" alt="${nombreSeguro}" class="carrito-item-img">
          <div class="carrito-item-info">
            <p class="carrito-item-nombre">${nombreSeguro}</p>
            <p class="carrito-item-precio">S/ ${it.precio.toFixed(2)}</p>
            <div class="carrito-qty">
              <button class="btn-restar" data-id="${idSeguro}">−</button>
              <span>${it.qty}</span>
              <button class="btn-sumar" data-id="${idSeguro}" ${limiteAlcanzado ? 'disabled title="Alcanzaste el stock disponible"' : ""}>+</button>
            </div>
          </div>
          <button class="carrito-eliminar" data-id="${idSeguro}" title="Eliminar">✕</button>
        </div>`;
    }).join("");

    if (totalEl) totalEl.textContent = `S/ ${this.total().toFixed(2)}`;
  }
};

function initCarrito() {
  document.querySelector(".btn-carrito")?.addEventListener("click", () => carrito.abrir());
  document.getElementById("btn-cerrar-carrito")?.addEventListener("click", () => carrito.cerrar());
  document.getElementById("overlay-carrito")?.addEventListener("click", () => carrito.cerrar());

  // botón "Proceder al pago" abre el modal de pago
  document.querySelector(".btn-pagar")?.addEventListener("click", () => {
    if (carrito.count() === 0) return;
    carrito.cerrar();
    pago.abrir();
  });

  carrito.actualizarBadge();

  // Delegación de eventos para +/−/eliminar dentro del carrito.
  // Usa data-id en vez de onclick inline, así funciona sin importar
  // qué caracteres tenga el nombre del producto (apóstrofes, comillas, etc.)
  const listaCarrito = document.getElementById("carrito-lista");
  listaCarrito?.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-id]");
    if (!btn) return;
    const id = btn.dataset.id;

    if (btn.classList.contains("btn-sumar")) {
      const it = carrito.items[id];
      if (it) carrito.agregar(id, it.nombre, it.precio, it.img, it.stock);
    } else if (btn.classList.contains("btn-restar")) {
      carrito.quitar(id);
    } else if (btn.classList.contains("carrito-eliminar")) {
      carrito.eliminar(id);
    }
  });

  // bind a los productos que ya están en el HTML (sin API)
  document.querySelectorAll(".card").forEach(card => {
    const btn = card.querySelector(".btn-agregar");
    if (!btn) return;
    const nombre = card.querySelector(".card-info h3")?.textContent.trim();
    const precio = parseFloat(card.querySelector(".precio")?.textContent.replace("S/", "")) || 0;
    const img = card.querySelector("img")?.src || "";
    const id = nombre.toLowerCase().replace(/\s+/g, "-");
    card.dataset.productoId = id;
    btn.addEventListener("click", () => carrito.agregar(id, nombre, precio, img));
  });
}
