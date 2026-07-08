// pago.js — modal de pago con validación de dirección y envío de pedido

var pago = {
  metodoSeleccionado: null,

  abrir: function() {
    this.metodoSeleccionado = null;
    this.renderResumen();
    document.getElementById("modal-pago").classList.add("visible");
    document.getElementById("overlay-pago").classList.add("visible");
    document.querySelectorAll(".metodo-btn").forEach(function(b) { b.classList.remove("seleccionado"); });
    document.getElementById("panel-detalle-pago").innerHTML = "";
    var btnConfirmar = document.getElementById("btn-confirmar-pago");
    if (btnConfirmar) { btnConfirmar.disabled = true; btnConfirmar.innerHTML = "Confirmar pedido &#127881;"; }
    // limpiar error dirección si existe
    var errDir = document.getElementById("error-direccion");
    if (errDir) errDir.textContent = "";
    // limpiar aviso de stock insuficiente si existe
    var errStock = document.getElementById("error-stock");
    if (errStock) { errStock.style.display = "none"; errStock.innerHTML = ""; }
  },

  cerrar: function() {
    document.getElementById("modal-pago").classList.remove("visible");
    document.getElementById("overlay-pago").classList.remove("visible");
  },

  renderResumen: function() {
    var contenedor = document.getElementById("pago-resumen-items");
    var totalEl = document.getElementById("pago-total");
    if (!contenedor) return;

    var ids = Object.keys(carrito.items);
    contenedor.innerHTML = ids.map(function(id) {
      var it = carrito.items[id];
      return '<div class="pago-item">' +
        '<img src="' + it.img + '" alt="' + it.nombre + '">' +
        '<span class="pago-item-nombre">' + it.nombre + ' <em>×' + it.qty + '</em></span>' +
        '<span class="pago-item-precio">S/ ' + (it.precio * it.qty).toFixed(2) + '</span>' +
      '</div>';
    }).join("");

    if (totalEl) totalEl.textContent = "S/ " + carrito.total().toFixed(2);
  },

  seleccionarMetodo: function(metodo) {
    this.metodoSeleccionado = metodo;

    document.querySelectorAll(".metodo-btn").forEach(function(b) {
      b.classList.toggle("seleccionado", b.dataset.metodo === metodo);
    });

    var panel = document.getElementById("panel-detalle-pago");
    var total = carrito.total().toFixed(2);

    var paneles = {
      yape: '<div class="detalle-pago"><p><i class="fas fa-mobile-alt"></i> Transfiere al número:</p><p class="dato-pago"><strong>987 754 712</strong></p><p class="dato-pago nombre-pago">A nombre de: <strong>Britanny Parra</strong></p><small>Luego de pagar, envía el comprobante por WhatsApp.</small></div>',
      plin: '<div class="detalle-pago"><p><i class="fas fa-mobile-alt"></i> Transfiere al número:</p><p class="dato-pago"><strong>987 754 712</strong></p><p class="dato-pago nombre-pago">A nombre de: <strong>Britanny Parra</strong></p><small>Luego de pagar, envía el comprobante por WhatsApp.</small></div>',
      tarjeta: '<div class="detalle-pago"><p><i class="fas fa-credit-card"></i> Datos de tu tarjeta:</p><input type="text" inputmode="numeric" placeholder="Número de tarjeta" maxlength="19" class="input-pago" id="num-tarjeta"><p id="error-tarjeta" style="color:#ef4444;font-size:12px;margin-top:-8px;font-weight:600"></p><div class="input-row"><input type="text" placeholder="MM/AA" maxlength="5" class="input-pago"><input type="text" placeholder="CVV" maxlength="3" class="input-pago"></div><input type="text" placeholder="Nombre en la tarjeta" class="input-pago"></div>',
      efectivo: '<div class="detalle-pago"><p><i class="fas fa-money-bill-wave"></i> Pago contra entrega</p><p class="dato-pago">Te cobraremos cuando llegue tu pedido.</p><small>Ten el monto exacto si puedes: S/ ' + total + '</small></div>',
    };

    panel.innerHTML = paneles[metodo] || "";

    if (metodo === "tarjeta") {
      var numTarjeta = document.getElementById("num-tarjeta");
      var errTarjeta = document.getElementById("error-tarjeta");
      if (numTarjeta) {
        numTarjeta.addEventListener("input", function(e) {
          // Solo dígitos: se descarta cualquier letra, símbolo o signo negativo
          var soloDigitos = e.target.value.replace(/\D/g, "").slice(0, 19);
          e.target.value = soloDigitos.replace(/(.{4})/g, "$1 ").trim();
          if (errTarjeta) errTarjeta.textContent = "";
        });
      }
    }

    document.getElementById("btn-confirmar-pago").disabled = false;
  },

  confirmar: async function() {
    if (!this.metodoSeleccionado) return;

    // validar número de tarjeta si el método elegido es "tarjeta"
    if (this.metodoSeleccionado === "tarjeta") {
      var numTarjeta  = document.getElementById("num-tarjeta");
      var errTarjeta  = document.getElementById("error-tarjeta");
      var soloDigitos = numTarjeta ? numTarjeta.value.replace(/\s/g, "") : "";

      if (!/^\d+$/.test(soloDigitos)) {
        if (errTarjeta) errTarjeta.textContent = "El número de tarjeta solo debe contener dígitos.";
        return;
      }
      if (soloDigitos.length < 13 || soloDigitos.length > 19) {
        if (errTarjeta) errTarjeta.textContent = "Ingresa un número de tarjeta válido (13 a 19 dígitos).";
        return;
      }
      if (errTarjeta) errTarjeta.textContent = "";
    }

    // validar dirección
    var inputDir = document.getElementById("input-direccion");
    var direccion = inputDir ? inputDir.value.trim().toLowerCase() : "";
    var errDir = document.getElementById("error-direccion");
    var errStock = document.getElementById("error-stock");

    var zonas = ["san juan de lurigancho", "sjl", "22 de las flores"];
    var valida = zonas.some(function(z) { return direccion.includes(z); });

    if (!valida) {
      if (errDir) errDir.textContent = "Solo hacemos delivery en San Juan de Lurigancho (SJL - 22 de las Flores).";
      return;
    }
    if (errDir) errDir.textContent = "";
    if (errStock) { errStock.style.display = "none"; errStock.innerHTML = ""; }

    // armar el pedido
    var items = Object.keys(carrito.items).map(function(id) {
      var it = carrito.items[id];
      return { nombre: it.nombre, cantidad: it.qty, precio: it.precio };
    });

    var pedido = {
      items: items,
      total: carrito.total(),
      metodo: this.metodoSeleccionado,
      direccion: inputDir ? inputDir.value.trim() : "",
    };

    var btnConfirmar = document.getElementById("btn-confirmar-pago");
    if (btnConfirmar) { btnConfirmar.disabled = true; btnConfirmar.textContent = "Procesando…"; }

    var res, data;
    try {
      res = await fetch("/api/pedidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pedido),
      });
      data = await res.json().catch(function() { return {}; });
    } catch (e) {
      if (btnConfirmar) { btnConfirmar.disabled = false; btnConfirmar.innerHTML = "Confirmar pedido &#127881;"; }
      if (errStock) {
        errStock.style.display = "block";
        errStock.textContent = "No se pudo conectar con el servidor. Intenta de nuevo.";
      }
      return;
    }

    if (!res.ok) {
      if (btnConfirmar) { btnConfirmar.disabled = false; btnConfirmar.innerHTML = "Confirmar pedido &#127881;"; }

      if (res.status === 409 && data && data.error === "stock_insuficiente" && errStock) {
        var lineas = (data.detalle || []).map(function(d) {
          return "• " + d.nombre + ": pediste " + d.solicitado + ", solo quedan " + d.disponible + " en stock.";
        });
        errStock.style.display = "block";
        errStock.innerHTML = "⚠️ No hay stock suficiente para completar el pedido:<br>" + lineas.join("<br>") +
          "<br>Ajusta las cantidades en tu carrito e inténtalo de nuevo.";
      } else if (errStock) {
        errStock.style.display = "block";
        errStock.textContent = (data && data.error) || "No se pudo confirmar el pedido. Intenta de nuevo.";
      }
      return; // no limpiar el carrito ni cerrar el modal: el pedido NO se creó
    }

    var nombres = { yape: "Yape", plin: "Plin", tarjeta: "tarjeta", efectivo: "efectivo" };

    carrito.items = {};
    carrito.actualizarBadge();
    this.cerrar();

    var toast = document.getElementById("toast-confirmacion");
    if (toast) {
      toast.querySelector(".toast-texto").textContent = "Pedido confirmado. Pago con " + nombres[this.metodoSeleccionado];
      toast.classList.add("visible");
      setTimeout(function() { toast.classList.remove("visible"); }, 4000);
    }
  }
};

function initPago() {
  document.getElementById("overlay-pago") && document.getElementById("overlay-pago").addEventListener("click", function() { pago.cerrar(); });
  document.getElementById("btn-cerrar-pago") && document.getElementById("btn-cerrar-pago").addEventListener("click", function() { pago.cerrar(); });
  document.getElementById("btn-confirmar-pago") && document.getElementById("btn-confirmar-pago").addEventListener("click", function() { pago.confirmar(); });

  document.querySelectorAll(".metodo-btn").forEach(function(btn) {
    btn.addEventListener("click", function() { pago.seleccionarMetodo(btn.dataset.metodo); });
  });
}
