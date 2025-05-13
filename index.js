/*const productos = [
  { id: 1, nombre: "Kid Boo", precio: 360000, imagen: "./images/majinboo.jpeg" },
  { id: 2, nombre: "Cell", precio: 360000, imagen: "./images/cell.jpeg" },
  { id: 3, nombre: "Deadpool - Wolverine", precio: 260000, imagen: "./images/deadpool.jpeg" },
  { id: 4, nombre: "Mario Tortuga", precio: 260000, imagen: "./images/tortuga.jpeg" },
  { id: 5, nombre: "Pokebola", precio: 260000, imagen: "./images/pokebola.jpeg" },
  { id: 6, nombre: "Sunny - One Piece", precio: 260000, imagen: "./images/sunny.jpeg" },
  { id: 7, nombre: "One Piece", precio: 260000, imagen: "./images/onepiece.jpeg" },
  { id: 8, nombre: "Playstation", precio: 260000, imagen: "./images/play.jpeg" }
];*/
/*
let productos = [];

async function cargarProductos() {
  try {
    const response = await fetch('/productos.json');
    const data = await response.json();
    productos = data.productos;  // Ajuste aquí
    renderCatalogo();
  } catch (error) {
    console.error("Error cargando productos:", error);
  }
}

cargarProductos();
*/
let productosGlobal = [];

function cargarCatalogo() {
  fetch('/productos.json')
    .then(response => response.json())
    .then(data => {
      productosGlobal = data.productos;
      mostrarProductos(productosGlobal);
      generarSubcategorias(productosGlobal);
    });
}

function mostrarProductos(productos) {
  const contenedor = document.getElementById('catalogo');
  contenedor.innerHTML = '';

  productos.forEach(producto => {
    const card = document.createElement('div');
    card.className = 'card';

    card.innerHTML = `
      <img src="${obtenerUrlAbsoluta(producto.imagen)}" alt="${producto.nombre}" onclick="abrirModalImagen('${obtenerUrlAbsoluta(producto.imagen)}')">
      <div class="card-content">
        <h2>${producto.nombre}</h2>
        <p>$${producto.precio.toLocaleString()}</p>
        <div class="controles-cantidad">
          <button class="boton-cantidad" onclick="modificarCantidad(${producto.id}, -1)">-</button>
          <input type="text" id="cantidad-${producto.id}" class="input-cantidad" value="1" readonly>
          <button class="boton-cantidad" onclick="modificarCantidad(${producto.id}, 1)">+</button>
        </div>
        <div class="mensaje-stock" id="mensaje-stock-${producto.id}">No hay suficiente stock</div>
        <button class="btn" onclick="agregarAlCarrito(${producto.id})">Agregar al carrito</button>
      </div>
    `;

    contenedor.appendChild(card);
  });
}


function filtrarPorCategoria(categoria) {
  if (categoria === 'todos') {
    mostrarProductos(productosGlobal);
  } else {
    const filtrados = productosGlobal.filter(p => p.categoria === categoria);
    mostrarProductos(filtrados);
  }
}

function ocultarMenuCategorias() {
  document.getElementById('lista-categorias').classList.remove('mostrar');
}

function filtrarPorCategoria(categoria) {
  if (categoria === 'todos') {
    mostrarProductos(productosGlobal);
  } else {
    const filtrados = productosGlobal.filter(p => p.categoria === categoria);
    mostrarProductos(filtrados);
  }
  ocultarMenuCategorias(); // Ocultar menú al seleccionar
}

    const catalogo = document.getElementById("catalogo");
    const listaCarrito = document.getElementById("lista-carrito");
    const totalPrecio = document.getElementById("total-precio");
    const notification = document.getElementById("notification");
    let carrito = [];

    // Función reutilizable para generar la URL absoluta de una imagen
function obtenerUrlAbsoluta(ruta) {
  if (ruta.startsWith("http")) return ruta;

  const baseUrl = "https://camerinojipsandbox.netlify.app/";

  // Quita cualquier "./", "/", o nada al inicio
  ruta = ruta.replace(/^\.?\/?/, "");

  return `${baseUrl}/${ruta}`;
}

/*
    function renderCatalogo() {
      productos.forEach(producto => {
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
          <img src="${producto.imagen}" alt="${producto.nombre}">
          <div class="card-content">
            <h2>${producto.nombre}</h2>
            <p>$${producto.precio.toLocaleString()}</p>
            <button class="btn" onclick='agregarAlCarrito(${JSON.stringify(producto)})'>Agregar al carrito</button>
          </div>
        `;
        catalogo.appendChild(card);
      });
    }
*/
function agregarAlCarrito(idProducto) {
  mostrarCarrito();

  const cantidadInput = document.getElementById(`cantidad-${idProducto}`);
  const cantidad = parseInt(cantidadInput.value);

  const producto = productosGlobal.find(p => p.id === idProducto);
  if (!producto) return;

  if (cantidad > producto.stock) {
    document.getElementById(`mensaje-stock-${idProducto}`).style.display = 'block';
    return;
  }

  const productoEnCarrito = carrito.find(item => item.id === producto.id);

  if (productoEnCarrito) {
    if (productoEnCarrito.cantidad + cantidad <= producto.stock) {
      productoEnCarrito.cantidad += cantidad;
      mostrarNotificacion(`Cantidad de ${producto.nombre} aumentada a ${productoEnCarrito.cantidad}`);
    } else {
      mostrarNotificacion(`No hay suficiente stock de ${producto.nombre}`);
    }
  } else {
    carrito.push({ ...producto, cantidad });
    mostrarNotificacion(`${producto.nombre} agregado al carrito`);
  }

  actualizarCarrito();
}




    function eliminarDelCarrito(index) {
      const productoEliminado = carrito[index];
      carrito.splice(index, 1);
      actualizarCarrito();
      mostrarNotificacion(`Producto "${productoEliminado.nombre}" eliminado del carrito.`, true);
    }

  function actualizarCarrito() {
  listaCarrito.innerHTML = "";
  let total = 0;

  carrito.forEach((item, index) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <span>${item.nombre}</span>
      <span>$${item.precio.toLocaleString()} x ${item.cantidad}</span>
      <button onclick="modificarCantidadCarrito(${index}, 'incrementar')">+</button>
      <button onclick="modificarCantidadCarrito(${index}, 'decrementar')">-</button>
      <button onclick="eliminarDelCarrito(${index})" style="margin-left: 1rem; background: crimson; color: white; border: none; padding: 0.3rem 0.6rem; border-radius: 6px; cursor: pointer;">✕</button>
    `;
    listaCarrito.appendChild(li);
    total += item.precio * item.cantidad;
  });

  totalPrecio.textContent = "$" + total.toLocaleString();
}

function modificarCantidad(idProducto, cambio) {
  const input = document.getElementById(`cantidad-${idProducto}`);
  const mensaje = document.getElementById(`mensaje-stock-${idProducto}`);
  const producto = productosGlobal.find(p => p.id === idProducto);

  let cantidad = parseInt(input.value) + cambio;

  if (cantidad < 1) cantidad = 1;

  if (cantidad > producto.stock) {
    mensaje.style.display = 'block';
    setTimeout(() => mensaje.style.display = 'none', 3000);
    return;
  }

  input.value = cantidad;
}



    function toggleCarrito() {
      mostrarCarrito();
    }

    function mostrarCarrito() {
      document.getElementById('carrito-lateral').classList.remove('oculto');
      document.getElementById('carrito-lateral').classList.add('activo');
    }

    function cerrarCarrito() {
      document.getElementById('carrito-lateral').classList.remove('activo');
      document.getElementById('carrito-lateral').classList.add('oculto');
    }

    function mostrarNotificacion(mensaje, esEliminacion = false) {
      notification.textContent = mensaje;
      notification.classList.add('show');
      if (esEliminacion) notification.classList.add('remove');
      setTimeout(() => {
        notification.classList.remove('show', 'remove');
      }, 3000);
    }

    function pagarConBold() {
      if (carrito.length === 0) return alert("Tu carrito está vacío.");
      const descripcion = carrito.map(item => item.nombre).join(", ");
      const monto = carrito.reduce((sum, item) => sum + item.precio, 0);
      const imagenUrl = obtenerUrlAbsoluta(carrito[0].imagen);
      const mensaje = `Hola! Realicé el pago exitoso de: ${descripcion} por $${monto.toLocaleString('es-CO')} COP.`;
      const callback_url = `https://wa.me/+573177657335?text=${encodeURIComponent(mensaje)}`;

      const raw = JSON.stringify({
        monto,
        descripcion,
        tipo: "CLOSE",
        image_url: imagenUrl,
        callback_url
      });

      fetch("/.netlify/functions/crearLinkPago", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: raw
      })
      .then(response => response.json())
      .then(result => {
        if (result.payload && result.payload.url) {
          window.location.href = result.payload.url;
        } else {
          console.error('No se recibió un enlace de pago válido.', result);
        }
      })
      .catch(error => console.error('Error al generar enlace:', error));
    }

   function realizarAbono() {
    const descripcion = "Abono para compra de tapetes personalizados"; // Descripción general
    const imagenUrl = obtenerUrlAbsoluta("./images/camerino.jpeg"); // Imagen genérica o la que prefieras

    obtenerCotizacion(descripcion, imagenUrl); // Llamamos a la función para obtener el enlace con monto abierto
}

function obtenerCotizacion(descripcion, imagenUrl) {
    const mensaje = `Hola! Realicé el pago exitoso del abono: ${descripcion}`;
    const callback_url = `https://wa.me/+573177657335?text=${encodeURIComponent(mensaje)}`;

    const raw = JSON.stringify({
        descripcion: descripcion,
        tipo: "OPEN",
        image_url: imagenUrl,
        callback_url: callback_url
    });

    fetch("/.netlify/functions/crearLinkPago", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: raw
    })
    .then(response => response.json())
    .then(result => {
        if (result.payload && result.payload.url) {
            window.location.href = result.payload.url;
        } else {
            console.error('Error: No se recibió un enlace de pago válido.', result);
        }
    })
    .catch(error => console.log('error', error));
}

document.addEventListener("DOMContentLoaded", () => {
  cargarCatalogo();

  const toggleBtn = document.getElementById("toggle-categorias");
  const lista = document.getElementById("lista-categorias");

  if (toggleBtn && lista) {
    toggleBtn.addEventListener("click", () => {
      lista.classList.toggle("mostrar");
    });
  }

  const botonCarrito = document.getElementById("boton-carrito");
  const carritoLateral = document.getElementById("carrito-lateral");

  if (botonCarrito && carritoLateral) {
    botonCarrito.addEventListener("click", () => {
      const estaActivo = carritoLateral.classList.toggle("activo");
      carritoLateral.classList.toggle("oculto", !estaActivo);
      botonCarrito.textContent = estaActivo ? "❌" : "🛒";
    });
  }
});

// Mostrar imagen en modal
function abrirModalImagen(src) {
  const modal = document.getElementById("modal-imagen");
  const imagen = document.getElementById("imagen-modal");
  imagen.src = src;
  modal.style.display = "flex";
}

// Cerrar modal desde el botón ✕
document.getElementById("cerrar-modal").addEventListener("click", () => {
  document.getElementById("modal-imagen").style.display = "none";
});

// Cerrar modal haciendo clic en el fondo (no en la imagen)
document.getElementById("modal-imagen").addEventListener("click", (e) => {
  // Solo cerrar si se hace clic en el fondo del modal, no en la imagen
  if (e.target.id === "modal-imagen") {
    e.currentTarget.style.display = "none";
  }
});




function modificarCantidadCarrito(index, accion) {
  const item = carrito[index];
  const productoOriginal = productosGlobal.find(p => p.id === item.id);

  if (accion === 'incrementar') {
    if (item.cantidad < productoOriginal.stock) {
      item.cantidad++;
    } else {
      mostrarNotificacion(`No hay suficiente stock de ${item.nombre}`);
    }
  } else if (accion === 'decrementar') {
    if (item.cantidad > 1) {
      item.cantidad--;
    }
  }

  actualizarCarrito();
}

function generarSubcategorias(productos) {
  const categoriasMap = {};

  // Generar un mapa de categorías con sus subcategorías
  productos.forEach(producto => {
    const { categoria, subcategoria } = producto;
    if (!subcategoria) return;

    if (!categoriasMap[categoria]) {
      categoriasMap[categoria] = new Set();
    }
    categoriasMap[categoria].add(subcategoria);
  });

  // Generar las subcategorías para cada categoría
  for (const [categoria, subcats] of Object.entries(categoriasMap)) {
    const ul = document.getElementById(`subcat-${categoria}`);
    if (!ul) continue;

    ul.innerHTML = ""; // Limpiar subcategorías anteriores

    // Si la categoría tiene subcategorías, agregarlas
    if (subcats.size > 0) {
      subcats.forEach(sub => {
        const li = document.createElement("li");
        li.textContent = sub;
        li.onclick = () => filtrarPorSubcategoria(categoria, sub);
        ul.appendChild(li);
      });
    } else {
      // Si no tiene subcategorías, agregar un mensaje informativo
      const li = document.createElement("li");
      li.textContent = "Sin subcategorías";
      ul.appendChild(li);
    }
  }

  // Actualizar las categorías del menú (asegurarse de que se muestre el indicador ▾ solo si hay subcategorías)
  const categorias = document.querySelectorAll('.menu-categorias-wrapper li > span');
  categorias.forEach(span => {
    const categoria = span.textContent.split(" ▾")[0]; // Obtener el nombre de la categoría
    const ul = document.getElementById(`subcat-${categoria}`);
    if (ul && ul.innerHTML === "") {
      span.innerHTML = `${categoria} (Sin subcategorías)`; // Mostrar el texto de sin subcategorías
    } else if (ul) {
      span.innerHTML = `${categoria} ▾`; // Mostrar el indicador ▾ si tiene subcategorías
    }
  });
}


function toggleSubcategorias(categoria) {
  const ul = document.getElementById(`subcat-${categoria}`);
  if (ul) ul.classList.toggle("oculto");
}

function filtrarPorSubcategoria(categoria, subcat) {
  const filtrados = productosGlobal.filter(p =>
    p.categoria === categoria && p.subcategoria === subcat
  );
  mostrarProductos(filtrados);
  ocultarMenuCategorias();
}





    //renderCatalogo();