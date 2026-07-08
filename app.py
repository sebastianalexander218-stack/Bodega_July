from flask import Flask, request, render_template, redirect, url_for, session, jsonify
import os
import json

app = Flask(__name__)
app.secret_key = "mi_clave_secreta_123"

# ── Persistencia en archivos JSON ─────────────────────
DATA_DIR = os.path.join(app.root_path, "data")
os.makedirs(DATA_DIR, exist_ok=True)

RUTA_PRODUCTOS = os.path.join(DATA_DIR, "productos.json")
RUTA_USUARIOS  = os.path.join(DATA_DIR, "usuarios.json")
RUTA_OFERTAS   = os.path.join(DATA_DIR, "ofertas.json")


def _cargar_json(ruta, por_defecto):
    """Carga una lista desde un archivo JSON. Si no existe o está corrupto, usa el valor por defecto."""
    if os.path.exists(ruta):
        try:
            with open(ruta, "r", encoding="utf-8") as f:
                return json.load(f)
        except (json.JSONDecodeError, OSError):
            pass
    return por_defecto


def _guardar_json(ruta, datos):
    """Guarda una lista en un archivo JSON de forma legible."""
    with open(ruta, "w", encoding="utf-8") as f:
        json.dump(datos, f, ensure_ascii=False, indent=2)


def guardar_productos():
    _guardar_json(RUTA_PRODUCTOS, PRODUCTOS)


def guardar_usuarios():
    _guardar_json(RUTA_USUARIOS, USUARIOS_LIST)


def guardar_ofertas():
    _guardar_json(RUTA_OFERTAS, OFERTAS)


# ── Usuarios ──────────────────────────────────────────
USUARIOS_POR_DEFECTO = [
    {"id": 1, "usuario": "odin", "nombre": "Odin", "password": "1234", "rol": "admin", "email": "odin@bodegajuly.com"},
]

def _usuarios_dict():
    return {u["usuario"]: u for u in USUARIOS_LIST}

# ── Productos ─────────────────────────────────────────
PRODUCTOS_POR_DEFECTO = [
    # Bebidas
    {"id":  1, "nombre": "Agua San Luis sin gas 625 ml",       "precio":  1.50, "categoria": "bebidas",   "imagen": "AguaSanLuis.jpg",    "stock": 80},
    {"id":  2, "nombre": "Inca Kola 500 ml",                   "precio":  3.50, "categoria": "bebidas",   "imagen": "InkaCola.jpg",    "stock": 60},
    {"id":  3, "nombre": "Coca-Cola Original 500 ml",          "precio":  3.50, "categoria": "bebidas",   "imagen": "CocaCola.jpg",  "stock": 55},
    {"id":  4, "nombre": "Pepsi 500 ml",                       "precio":  3.00, "categoria": "bebidas",   "imagen": "Pepsi.jpg",    "stock": 40},
    {"id":  5, "nombre": "Fanta Naranja 500 ml",               "precio":  3.50, "categoria": "bebidas",   "imagen": "Fanta.jpg",    "stock": 35},
    {"id":  6, "nombre": "Frugos del Valle Naranja 1 L",       "precio":  5.50, "categoria": "bebidas",   "imagen": "FrugosValle.jpg",    "stock": 30},
    {"id":  7, "nombre": "Cifrut Punch 500 ml",                "precio":  2.50, "categoria": "bebidas",   "imagen": "Cifrut.jpg",    "stock": 45},
    # Lácteos
    {"id":  8, "nombre": "Leche Evaporada Gloria Azul 400 g",  "precio":  4.80, "categoria": "lacteos", "imagen": "LecheGloria.jpg",     "stock": 70},
    {"id":  9, "nombre": "Leche Evaporada Gloria Roja 400 g",  "precio":  5.20, "categoria": "lacteos", "imagen": "LecheGloriaRoja.jpg",     "stock": 65},
    {"id": 10, "nombre": "Yogurt Gloria Fresa 1 L",            "precio":  7.50, "categoria": "lacteos", "imagen": "YogurtFresa.png",     "stock": 25},
    {"id": 11, "nombre": "Yogurt Gloria Durazno 1 L",          "precio":  7.50, "categoria": "lacteos", "imagen": "YogurtDurazno.png",     "stock": 20},
    {"id": 12, "nombre": "Mantequilla Gloria 200 g",           "precio":  8.50, "categoria": "lacteos", "imagen": "MantequillaGloria.png",     "stock": 18},
    # Abarrotes
    {"id": 13, "nombre": "Arroz Costeño Extra 5 kg",           "precio": 28.00, "categoria": "alimentos", "imagen": "ArrozCosteño.jpg",    "stock": 40},
    {"id": 14, "nombre": "Azúcar Rubia Cartavio 1 kg",         "precio":  4.50, "categoria": "alimentos", "imagen": "AzucarCartavio.jpg", "stock": 50},
    {"id": 15, "nombre": "Aceite Primor Clásico 1 L",          "precio": 10.50, "categoria": "alimentos", "imagen": "AceitePrimor.jpg", "stock": 35},
    {"id": 16, "nombre": "Fideos Don Vittorio Spaghetti 950 g", "precio":  5.50, "categoria": "alimentos", "imagen": "FideosVittorio.jpg", "stock": 45},

    {"id": 17, "nombre": "Fideos Don Vittorio Tallarín 950 g", "precio":  5.50, "categoria": "alimentos", "imagen": "FideoCodo.jpg", "stock": 42},
    {"id": 18, "nombre": "Lentejas Costeño 500 g",             "precio":  4.50, "categoria": "alimentos", "imagen": "Lentejas.jpg",    "stock": 30},
    {"id": 19, "nombre": "Frijol Canario Costeño 500 g",       "precio":  5.50, "categoria": "alimentos", "imagen": "FrijolCanario.jpg",    "stock": 28},
    {"id": 20, "nombre": "Atún Florida en Agua 140 g",         "precio":  6.50, "categoria": "alimentos", "imagen": "AtunFlorida.jpg", "stock": 55},
    {"id": 21, "nombre": "Atún Florida en Aceite 140 g",       "precio":  6.50, "categoria": "alimentos", "imagen": "AtunAceite.jpeg", "stock": 50},
    {"id": 22, "nombre": "Mermelada Fanny Fresa 320 g",        "precio":  6.50, "categoria": "alimentos", "imagen": "MermeladaFanny.jpg",     "stock": 22},
    {"id": 23, "nombre": "Arvejas Costeño 425 g",              "precio":  5.50, "categoria": "alimentos", "imagen": "ArvejaCosteño.jpg",     "stock": 20},
    # Snacks y dulces
    {"id": 24, "nombre": "Galletas Soda Field",                "precio":  2.00, "categoria": "snacks",    "imagen": "GalletField.jpg",      "stock": 60},
    {"id": 25, "nombre": "Galletas Charada Field",             "precio":  2.50, "categoria": "snacks",    "imagen": "GalletaCharada.jpg",      "stock": 55},
    {"id": 26, "nombre": "Papas Lay's Clásicas 45 g",          "precio":  2.50, "categoria": "snacks",    "imagen": "PapasLays.jpg",     "stock": 70},
    {"id": 27, "nombre": "Doritos Queso 45 g",                 "precio":  2.50, "categoria": "snacks",    "imagen": "Doritos.jpg",     "stock": 48},
    {"id": 28, "nombre": "Chocolate Sublime Clásico",          "precio":  2.00, "categoria": "snacks",    "imagen": "Sublime.jpg",     "stock": 80},
    {"id": 29, "nombre": "Chocolate Princesa",                 "precio":  1.50, "categoria": "snacks",    "imagen": "Princesa.jpg",     "stock": 75},
    {"id": 30, "nombre": "Gomitas Ambrosoli Ambrosito Ácido 90g", "precio":  3.00, "categoria": "snacks",    "imagen": "Gomitas.jpg",     "stock": 100},
    # Limpieza e higiene
    {"id": 31, "nombre": "Detergente Bolívar Floral 800 g",    "precio":  8.50, "categoria": "limpieza",  "imagen": "Detergente.png", "stock": 30},
    {"id": 32, "nombre": "Lejía Clorox 819 ml",                   "precio":  4.50, "categoria": "limpieza",  "imagen": "Lejia.jpg", "stock": 25},
    {"id": 33, "nombre": "Shampoo Head & Shoulders 375 ml",    "precio": 18.50, "categoria": "limpieza",  "imagen": "HyS.jpg", "stock":  8},
    {"id": 34, "nombre": "Jabón Dove Original 90 g",           "precio":  4.50, "categoria": "limpieza",  "imagen": "JabonDove.jpg", "stock": 40},
    {"id": 35, "nombre": "Pasta Dental Colgate Triple Acción", "precio":  6.50, "categoria": "limpieza",  "imagen": "Colgate.jpg", "stock": 35},
    {"id": 36, "nombre": "Papel Higiénico Elite Hoja Doble x4","precio":  7.50, "categoria": "limpieza",  "imagen": "PapelElite.jpg",      "stock": 50},
]

# Cargar desde disco si ya existen datos guardados; si no, usar los valores por defecto
# y crear el archivo la primera vez que corre la app.
PRODUCTOS = _cargar_json(RUTA_PRODUCTOS, PRODUCTOS_POR_DEFECTO)
if not os.path.exists(RUTA_PRODUCTOS):
    guardar_productos()

USUARIOS_LIST = _cargar_json(RUTA_USUARIOS, USUARIOS_POR_DEFECTO)
if not os.path.exists(RUTA_USUARIOS):
    guardar_usuarios()

# ── Ofertas ───────────────────────────────────────────
# "dias" acepta una lista de días en minúscula ("lunes".."domingo") o ["todos"]
# para que la oferta se muestre siempre.
DIAS_SEMANA = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"]

OFERTAS_POR_DEFECTO = [
    {
        "id": 1, "titulo": "Pollo a la brasa entero + papas + ensalada",
        "descripcion": "El combo estrella del finde, recién salido de la parrilla.",
        "precio_normal": 45.00, "precio_oferta": 36.00,
        "imagen": "Loader.png", "dias": ["viernes", "sabado", "domingo"],
        "destacada": True, "activa": True,
    },
    {
        "id": 2, "titulo": "2x1 en gaseosas Coca-Cola 1.5 L",
        "descripcion": "Lleva dos gaseosas y paga solo una. Ideal para compartir.",
        "precio_normal": 15.00, "precio_oferta": 7.50,
        "imagen": "CocaCola.jpg", "dias": ["martes"],
        "destacada": False, "activa": True,
    },
    {
        "id": 3, "titulo": "Pack Desayuno: Leche Gloria + Pan + Mermelada Fanny",
        "descripcion": "Todo lo que necesitas para empezar el día bien.",
        "precio_normal": 18.50, "precio_oferta": 14.90,
        "imagen": "MermeladaFanny.jpg", "dias": ["lunes", "miercoles"],
        "destacada": False, "activa": True,
    },
    {
        "id": 4, "titulo": "Canasta de limpieza del hogar",
        "descripcion": "Detergente Bolívar + Lejía Clorox + Jabón Dove, a precio especial.",
        "precio_normal": 17.50, "precio_oferta": 13.90,
        "imagen": "Detergente.png", "dias": ["todos"],
        "destacada": False, "activa": True,
    },
]

OFERTAS = _cargar_json(RUTA_OFERTAS, OFERTAS_POR_DEFECTO)
if not os.path.exists(RUTA_OFERTAS):
    guardar_ofertas()

# ── Pedidos ───────────────────────────────────────────
PEDIDOS = []


def nuevo_id(lista):
    """Devuelve el siguiente ID basándose en el último elemento de la lista."""
    if not lista:
        return 1
    return lista[-1]["id"] + 1


# ── Helper: contexto de sesión para templates ─────────
def _ctx():
    """Devuelve el contexto de usuario para pasar a los templates."""
    return {
        "nombre": session.get("nombre", ""),
        "rol":    session.get("rol", ""),
    }


# ── Rutas principales ─────────────────────────────────

@app.route("/")
def raiz():
    return render_template("bienvenida.html")

@app.route("/inicio")
def inicio():
    return render_template("inicio.html", active_section="inicio", **_ctx())

@app.route("/productos")
def productos():
    return render_template("productos.html", active_section="productos", **_ctx())

@app.route("/ofertas")
def ofertas():
    return render_template("ofertas.html", active_section="ofertas", **_ctx())


# ── API Ofertas ───────────────────────────────────────

import datetime

def _dia_actual():
    """Nombre del día de hoy en minúscula, sin tildes, en el formato usado por DIAS_SEMANA."""
    return DIAS_SEMANA[datetime.date.today().weekday()]

def _oferta_vigente_hoy(o):
    if not o.get("activa", True):
        return False
    dias = o.get("dias") or ["todos"]
    return "todos" in dias or _dia_actual() in dias

@app.route("/api/ofertas", methods=["GET"])
def api_ofertas():
    """Devuelve las ofertas. Con ?solo_hoy=1 filtra solo las vigentes para el día actual."""
    if request.args.get("solo_hoy"):
        return jsonify([o for o in OFERTAS if _oferta_vigente_hoy(o)])
    return jsonify(OFERTAS)

@app.route("/api/ofertas", methods=["POST"])
def api_crear_oferta():
    if not session.get("logged_in") or session.get("rol") != "admin":
        return jsonify({"error": "No autorizado"}), 401
    data = request.get_json() or {}
    nueva = {
        "id": nuevo_id(OFERTAS),
        "titulo": data.get("titulo", "Sin título"),
        "descripcion": data.get("descripcion", ""),
        "precio_normal": float(data.get("precio_normal", 0)),
        "precio_oferta": float(data.get("precio_oferta", 0)),
        "imagen": data.get("imagen", "Loader.png"),
        "dias": data.get("dias") or ["todos"],
        "destacada": bool(data.get("destacada", False)),
        "activa": bool(data.get("activa", True)),
    }
    OFERTAS.append(nueva)
    guardar_ofertas()
    return jsonify(nueva), 201

@app.route("/api/ofertas/<int:oid>", methods=["PUT"])
def api_editar_oferta(oid):
    if not session.get("logged_in") or session.get("rol") != "admin":
        return jsonify({"error": "No autorizado"}), 401
    data = request.get_json() or {}
    for o in OFERTAS:
        if o["id"] == oid:
            o.update({
                "titulo": data.get("titulo", o["titulo"]),
                "descripcion": data.get("descripcion", o["descripcion"]),
                "precio_normal": float(data.get("precio_normal", o["precio_normal"])),
                "precio_oferta": float(data.get("precio_oferta", o["precio_oferta"])),
                "imagen": data.get("imagen", o["imagen"]),
                "dias": data.get("dias", o["dias"]),
                "destacada": bool(data.get("destacada", o["destacada"])),
                "activa": bool(data.get("activa", o["activa"])),
            })
            guardar_ofertas()
            return jsonify(o)
    return jsonify({"error": "No encontrado"}), 404

@app.route("/api/ofertas/<int:oid>", methods=["DELETE"])
def api_eliminar_oferta(oid):
    if not session.get("logged_in") or session.get("rol") != "admin":
        return jsonify({"error": "No autorizado"}), 401
    global OFERTAS
    antes = len(OFERTAS)
    OFERTAS = [o for o in OFERTAS if o["id"] != oid]
    if len(OFERTAS) < antes:
        guardar_ofertas()
        return jsonify({"ok": True})
    return jsonify({"error": "No encontrado"}), 404


# ── Login / Logout ────────────────────────────────────

@app.route("/login", methods=["GET", "POST"])
def login():
    if session.get("logged_in"):
        return redirect(url_for("inicio"))

    mensaje = ""
    if request.method == "POST":
        accion = request.form.get("accion", "login")

        if accion == "registro":
            usuario  = request.form.get("usuario_reg", "").strip()
            password = request.form.get("password_reg", "").strip()
            nombre   = request.form.get("nombre_reg", "").strip() or usuario
            email    = request.form.get("email_reg", "").strip()
            if not usuario or not password:
                mensaje = "Completa todos los campos."
            elif any(u["usuario"] == usuario for u in USUARIOS_LIST):
                mensaje = "Ese usuario ya existe."
            else:
                USUARIOS_LIST.append({
                    "id":       nuevo_id(USUARIOS_LIST),
                    "usuario":  usuario,
                    "nombre":   nombre,
                    "password": password,
                    "rol":      "cliente",
                    "email":    email,
                })
                guardar_usuarios()
                u = _usuarios_dict()[usuario]
                session["logged_in"] = True
                session["usuario"]   = usuario
                session["nombre"]    = nombre
                session["rol"]       = u["rol"]
                return redirect(url_for("perfil"))

        else:  # login
            usuario  = request.form.get("usuario", "").strip()
            password = request.form.get("password", "").strip()
            ud = _usuarios_dict()
            if usuario in ud and ud[usuario]["password"] == password:
                u = ud[usuario]
                session["logged_in"] = True
                session["usuario"]   = usuario
                session["nombre"]    = u.get("nombre", usuario)
                session["rol"]       = u["rol"]
                if u["rol"] == "admin":
                    return redirect(url_for("admin"))
                return redirect(url_for("inicio"))
            else:
                mensaje = "Usuario o contraseña incorrectos."

    return render_template("login.html", mensaje=mensaje)

@app.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("inicio"))

@app.route("/bienvenida")
def bienvenida():
    return render_template("bienvenida.html")

@app.route("/perfil", methods=["GET", "POST"])
def perfil():
    if not session.get("logged_in"):
        return redirect(url_for("login"))

    mensaje = ""
    if request.method == "POST":
        nuevo_nombre = request.form.get("nombre", "").strip()
        nuevo_email  = request.form.get("email", "").strip()

        # Actualizar en la lista de usuarios
        for u in USUARIOS_LIST:
            if u["usuario"] == session["usuario"]:
                if nuevo_nombre:
                    u["nombre"] = nuevo_nombre
                    session["nombre"] = nuevo_nombre
                u["email"] = nuevo_email
                break
        guardar_usuarios()

        mensaje = "✅ Datos actualizados correctamente."

    # Buscar email actual del usuario
    usuario_actual = next((u for u in USUARIOS_LIST if u["usuario"] == session["usuario"]), {})
    email = usuario_actual.get("email", "")

    return render_template("perfil.html", active_section="perfil", mensaje=mensaje, email=email, **_ctx())


# ── Admin ─────────────────────────────────────────────

@app.route("/admin")
def admin():
    if not session.get("logged_in") or session.get("rol") != "admin":
        return redirect(url_for("login"))
    return render_template("admin.html", productos=PRODUCTOS)


# ── API Productos ─────────────────────────────────────

import os
from werkzeug.utils import secure_filename

EXTENSIONES_PERMITIDAS = {"png", "jpg", "jpeg", "gif", "webp"}

def extension_permitida(nombre):
    return "." in nombre and nombre.rsplit(".", 1)[1].lower() in EXTENSIONES_PERMITIDAS

@app.route("/api/upload-imagen", methods=["POST"])
def api_upload_imagen():
    if not session.get("logged_in") or session.get("rol") != "admin":
        return jsonify({"error": "No autorizado"}), 401
    if "imagen" not in request.files:
        return jsonify({"error": "No se envió imagen"}), 400
    archivo = request.files["imagen"]
    if not archivo.filename or not extension_permitida(archivo.filename):
        return jsonify({"error": "Tipo de archivo no permitido"}), 400
    nombre = secure_filename(archivo.filename)
    ruta = os.path.join(app.root_path, "static", "img", nombre)
    archivo.save(ruta)
    return jsonify({"nombre": nombre}), 201



@app.route("/api/productos", methods=["GET"])
def api_productos():
    return jsonify(PRODUCTOS)

@app.route("/api/productos", methods=["POST"])
def api_crear():
    if not session.get("logged_in"): return jsonify({"error": "No autorizado"}), 401
    data  = request.get_json()
    nuevo = {"id": nuevo_id(PRODUCTOS), "nombre": data.get("nombre","Sin nombre"),
            "precio": float(data.get("precio",0)), "categoria": data.get("categoria","otros"),
            "imagen": data.get("imagen","Gaseosa.jpg"), "stock": int(data.get("stock",0))}
    PRODUCTOS.append(nuevo)
    guardar_productos()
    return jsonify(nuevo), 201

@app.route("/api/productos/<int:pid>", methods=["PUT"])
def api_editar(pid):
    if not session.get("logged_in"): return jsonify({"error": "No autorizado"}), 401
    data = request.get_json()
    for p in PRODUCTOS:
        if p["id"] == pid:
            p.update({"nombre": data.get("nombre",p["nombre"]), "precio": float(data.get("precio",p["precio"])),
                    "categoria": data.get("categoria",p["categoria"]), "imagen": data.get("imagen",p["imagen"]),
                    "stock": int(data.get("stock",p["stock"]))})
            guardar_productos()
            return jsonify(p)
    return jsonify({"error": "No encontrado"}), 404

@app.route("/api/productos/<int:pid>", methods=["DELETE"])
def api_eliminar(pid):
    if not session.get("logged_in"): return jsonify({"error": "No autorizado"}), 401
    global PRODUCTOS
    antes = len(PRODUCTOS)
    PRODUCTOS = [p for p in PRODUCTOS if p["id"] != pid]
    if len(PRODUCTOS) < antes:
        guardar_productos()
        return jsonify({"ok": True})
    return jsonify({"error": "No encontrado"}), 404


# ── API Usuarios ──────────────────────────────────────

def _usuario_seguro(u):
    return {"id": u["id"], "usuario": u["usuario"], "nombre": u.get("nombre",""),
            "rol": u["rol"], "email": u.get("email","")}

@app.route("/api/usuarios", methods=["GET"])
def api_usuarios():
    if not session.get("logged_in"): return jsonify({"error": "No autorizado"}), 401
    return jsonify([_usuario_seguro(u) for u in USUARIOS_LIST])

@app.route("/api/usuarios", methods=["POST"])
def api_crear_usuario():
    if not session.get("logged_in"): return jsonify({"error": "No autorizado"}), 401
    data    = request.get_json()
    usuario = data.get("usuario","").strip()
    if not usuario: return jsonify({"error": "Usuario requerido"}), 400
    if any(u["usuario"] == usuario for u in USUARIOS_LIST):
        return jsonify({"error": "El usuario ya existe"}), 409
    nuevo = {"id": nuevo_id(USUARIOS_LIST), "usuario": usuario, "nombre": data.get("nombre", usuario),
            "password": data.get("password","1234"), "rol": data.get("rol","cliente"),
            "email": data.get("email","")}
    USUARIOS_LIST.append(nuevo)
    guardar_usuarios()
    return jsonify(_usuario_seguro(nuevo)), 201

@app.route("/api/usuarios/<int:uid>", methods=["PUT"])
def api_editar_usuario(uid):
    if not session.get("logged_in"): return jsonify({"error": "No autorizado"}), 401
    data = request.get_json()
    for u in USUARIOS_LIST:
        if u["id"] == uid:
            nuevo_user = data.get("usuario", u["usuario"]).strip()
            if any(x["usuario"] == nuevo_user and x["id"] != uid for x in USUARIOS_LIST):
                return jsonify({"error": "Ese nombre de usuario ya existe"}), 409
            u["usuario"] = nuevo_user
            u["nombre"]  = data.get("nombre",  u.get("nombre",""))
            u["email"]   = data.get("email",   u.get("email",""))
            u["rol"]     = data.get("rol",     u["rol"])
            if data.get("password"):
                u["password"] = data["password"]
            guardar_usuarios()
            return jsonify(_usuario_seguro(u))
    return jsonify({"error": "No encontrado"}), 404

@app.route("/api/usuarios/<int:uid>", methods=["DELETE"])
def api_eliminar_usuario(uid):
    if not session.get("logged_in"): return jsonify({"error": "No autorizado"}), 401
    activo = session.get("usuario")
    target = next((u for u in USUARIOS_LIST if u["id"] == uid), None)
    if not target: return jsonify({"error": "No encontrado"}), 404
    if target["usuario"] == activo:
        return jsonify({"error": "No puedes eliminarte a ti mismo"}), 403
    USUARIOS_LIST.remove(target)
    guardar_usuarios()
    return jsonify({"ok": True})


# ── API Pedidos ───────────────────────────────────────

def _buscar_producto_por_nombre(nombre):
    """Busca en el catálogo un producto cuyo nombre coincida (sin distinguir mayúsculas/espacios)."""
    nombre_norm = (nombre or "").strip().lower()
    for p in PRODUCTOS:
        if p["nombre"].strip().lower() == nombre_norm:
            return p
    return None


@app.route("/api/pedidos", methods=["GET"])
def api_pedidos():
    if not session.get("logged_in"): return jsonify({"error": "No autorizado"}), 401
    return jsonify(PEDIDOS)

@app.route("/api/pedidos", methods=["POST"])
def api_crear_pedido():
    data  = request.get_json() or {}
    items = data.get("items", [])

    # Sumar la cantidad solicitada por producto (por si aparece repetido en el pedido)
    solicitado_por_producto = {}
    for it in items:
        try:
            cantidad = int(it.get("cantidad", 0))
        except (TypeError, ValueError):
            cantidad = 0
        producto = _buscar_producto_por_nombre(it.get("nombre", ""))
        if producto is not None and cantidad > 0:
            solicitado_por_producto[producto["id"]] = solicitado_por_producto.get(producto["id"], 0) + cantidad

    # Verificar que haya stock suficiente antes de crear el pedido
    errores = []
    for pid, cantidad in solicitado_por_producto.items():
        producto = next(p for p in PRODUCTOS if p["id"] == pid)
        if cantidad > producto["stock"]:
            errores.append({
                "nombre":     producto["nombre"],
                "disponible": producto["stock"],
                "solicitado": cantidad,
            })

    if errores:
        return jsonify({"error": "stock_insuficiente", "detalle": errores}), 409

    # Recién ahora, con todo validado, se descuenta el stock
    for pid, cantidad in solicitado_por_producto.items():
        producto = next(p for p in PRODUCTOS if p["id"] == pid)
        producto["stock"] -= cantidad

    pedido = {"id": nuevo_id(PEDIDOS), "items": items, "total": data.get("total",0),
            "metodo": data.get("metodo",""), "direccion": data.get("direccion",""), "estado": "pendiente"}
    PEDIDOS.append(pedido)
    return jsonify(pedido), 201

@app.route("/api/pedidos/<int:pid>", methods=["PUT"])
def api_actualizar_pedido(pid):
    if not session.get("logged_in"): return jsonify({"error": "No autorizado"}), 401
    data = request.get_json()
    for p in PEDIDOS:
        if p["id"] == pid:
            p["estado"] = data.get("estado", p["estado"])
            return jsonify(p)
    return jsonify({"error": "No encontrado"}), 404


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
