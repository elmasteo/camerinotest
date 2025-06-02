let productosGlobal = [];

function cargarCatalogo() {
  fetch('/productos.json')
    .then(response => response.json())
    .then(data => {
      productosGlobal = data.productos;
      mostrarProductos(productosGlobal);
    });
}

function mostrarProductos(productos) {
  const contenedor = document.getElementById('catalogo');
  contenedor.innerHTML = '';

  productos.forEach(producto => {
    const card = document.createElement('div');
    card.className = 'card';

    card.innerHTML = `
      <img
        src="https://imagecdn.app/v2/image/${encodeURIComponent(obtenerUrlAbsoluta(producto.imagen))}?w=400&auto=webp"
        alt="${producto.nombre}"
        loading="lazy"
        onclick="abrirModalImagen('${obtenerUrlAbsoluta(producto.imagen)}')"
      />
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

/*
  productos.forEach(producto => {
    const card = document.createElement('div');
    card.className = 'card';

    card.innerHTML = `
      <img loading="lazy" src="${obtenerUrlAbsoluta(producto.imagen)}" alt="${producto.nombre}" onclick="abrirModalImagen('${obtenerUrlAbsoluta(producto.imagen)}')">
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
  */
}


function filtrarPorCategoria(categoria) {
  ocultarSubcategorias();           // ✅ Asegura que desaparezcan todas
  contraerTodosLosSubmenus();       // ✅ Cierra cualquier submenú abierto

  const tieneSubcategorias = productosGlobal.some(p => p.categoria === categoria && p.subcategoria);

  if (!tieneSubcategorias) {
    ocultarMenuCategorias();        // ✅ Oculta menú si no hay subcategorías
  }

  if (tieneSubcategorias) {
    mostrarSubcategoriasEnMenu(categoria);
  }

  const productosFiltrados = categoria === 'todos'
    ? productosGlobal
    : productosGlobal.filter(p => p.categoria === categoria);

  mostrarProductos(productosFiltrados);
}

// Suponiendo que ya tienes este fragmento para el filtrado
document.querySelectorAll('.subcategoria').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const subcategoriaSeleccionada = e.target.dataset.subcategoria;

    // 1. Filtrar productos (esto ya lo haces)
    filtrarProductosPorSubcategoria(subcategoriaSeleccionada);

    // 2. Contraer todas las subcategorías abiertas
    cerrarSubcategorias();
  });
});

// Función que colapsa todas las subcategorías
function cerrarSubcategorias() {
  document.querySelectorAll('.subcategorias-container').forEach(container => {
    container.style.display = 'none';
  });
}

function cerrarMenuHamburguesa() {
  // Oculta el menú completo
  const menuCategorias = document.getElementById('lista-categorias');
  menuCategorias.classList.remove('mostrar');

  // Opcional: si tu botón hamburguesa cambia de estado visual (ej. animación)
  const botonHamburguesa = document.getElementById('toggle-categorias');
  botonHamburguesa.classList.remove('activo');
}


function mostrarSubcategorias(categoriaPadre) {
  const contenedor = document.getElementById('subcategorias-container');
  contenedor.innerHTML = ''; // Limpiar antes

  // Filtrar productos solo de la categoría principal
  const productosCategoria = productosGlobal.filter(p => p.categoria === categoriaPadre && p.subcategoria);
  
  // Obtener subcategorías únicas
  const subcategorias = [...new Set(productosCategoria.map(p => p.subcategoria))];

  // Crear botones
  subcategorias.forEach(sub => {
    const boton = document.createElement('button');
    boton.textContent = sub;
    boton.onclick = () => filtrarPorSubcategoria(categoriaPadre, sub);
    contenedor.appendChild(boton);
  });

  contenedor.classList.remove('oculto');
}

function ocultarSubcategorias() {
  const contenedor = document.getElementById('subcategorias-container');
  contenedor.innerHTML = '';
  contenedor.classList.add('oculto');
}

function filtrarPorSubcategoria(subcategoria) {
  ocultarSubcategorias();         // Oculta subcategorías externas
  contraerTodosLosSubmenus();     // Oculta submenús internos personalizados
  cerrarMenuHamburguesa();        // Cierra el menú hamburguesa completo

  const productosFiltrados = productosGlobal.filter(
    p => p.subcategoria === subcategoria
  );
  mostrarProductos(productosFiltrados);
}



function volverAlMenuCategorias() {
  const submenu = document.getElementById(`submenu-${categoria}`);
  submenu.classList.add('oculto');
}

function ocultarMenuCategorias() {
  document.getElementById('lista-categorias').classList.remove('mostrar');
}

function mostrarSubcategoriasEnMenu(categoria) {
  const submenu = document.getElementById(`submenu-${categoria}`);
  if (!submenu) return;

  // Si ya está visible, ocultarlo
  if (!submenu.classList.contains('oculto')) {
    submenu.classList.add('oculto');
    return;
  }

  // Contrae todos los submenús antes de mostrar uno
  contraerTodosLosSubmenus();

  const subcategoriasSet = new Set(
    productosGlobal
      .filter(p => p.categoria === categoria && p.subcategoria)
      .map(p => p.subcategoria)
  );

  submenu.innerHTML = '';
  subcategoriasSet.forEach(subcat => {
    const li = document.createElement('li');
    li.textContent = subcat;
    li.onclick = () => filtrarPorSubcategoria(subcat);
    submenu.appendChild(li);
  });

  submenu.classList.remove('oculto');
}


    const catalogo = document.getElementById("catalogo");
    const listaCarrito = document.getElementById("lista-carrito");
    const totalPrecio = document.getElementById("total-precio");
    const notification = document.getElementById("notification");
    let carrito = [];

    // Función reutilizable para generar la URL absoluta de una imagen
function obtenerUrlAbsoluta(ruta) {
  if (ruta.startsWith("http")) return ruta;

  const baseUrl = "https://camerinojipsandbox.netlify.app";

  // Quita cualquier "./", "/", o nada al inicio
  ruta = ruta.replace(/^\.?\/?/, "");

  return `${baseUrl}/${ruta}`;
}

/*
function mostrarVistaPrevia(producto) {
  const preview = document.getElementById('preview-panel');
  document.getElementById('preview-image').src = producto.imagen;
  document.getElementById('preview-name').textContent = producto.nombre;
  
  preview.classList.remove('hidden');

  clearTimeout(preview._timeout);
  preview._timeout = setTimeout(() => {
    preview.classList.add('hidden');
  }, 3000);
}
*/

function mostrarVistaPrevia(producto) {
  const preview = document.getElementById('preview-panel');
  const imgElement = document.getElementById('preview-image');
  const nombreElement = document.getElementById('preview-name');

  const cdnUrl = `https://imagecdn.app/v2/image/${encodeURIComponent(obtenerUrlAbsoluta(producto.imagen))}?w=200&auto=webp`;

  const preload = new Image();
  preload.onload = () => {
    imgElement.src = cdnUrl;
    nombreElement.textContent = producto.nombre;
    preview.classList.remove('hidden');

    clearTimeout(preview._timeout);
    preview._timeout = setTimeout(() => {
      preview.classList.add('hidden');
    }, 3000);
  };
  preload.src = cdnUrl;
}

document.addEventListener("DOMContentLoaded", () => {
  const carritoLateral = document.getElementById("carrito-lateral");

  let startX = 0;
  let endX = 0;

  if (carritoLateral) {
    carritoLateral.addEventListener("touchstart", (e) => {
      startX = e.touches[0].clientX;
    });

    carritoLateral.addEventListener("touchmove", (e) => {
      endX = e.touches[0].clientX;
    });

    carritoLateral.addEventListener("touchend", () => {
      const deltaX = endX - startX;
      const umbral = 80; // cantidad mínima de deslizamiento en píxeles

      if (deltaX > umbral) {
        cerrarCarrito();
      }

      // Reset
      startX = 0;
      endX = 0;
    });
  }
});

/*

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
      mostrarNotificacion(`Cantidad de ${producto.nombre} aumentada a ${productoEnCarrito.cantidad}`, 'success');
      mostrarVistaPrevia(producto);
    } else {
      mostrarNotificacion(`No hay suficiente stock de ${producto.nombre}`, 'warning');
      return;
    }
  } else {
    carrito.push({ ...producto, cantidad });
    mostrarNotificacion(`${producto.nombre} agregado al carrito`, 'success');
    mostrarVistaPrevia(producto);
  }

  actualizarCarrito();

  // Asegura que el botón del carrito muestre ❌ al abrirse
  const carritoLateral = document.getElementById("carrito-lateral");
  const botonCarrito = document.getElementById("boton-carrito");

  if (carritoLateral && botonCarrito) {
    carritoLateral.classList.add("activo");
    carritoLateral.classList.remove("oculto");
    botonCarrito.textContent = "❌";
  }
}
*/
function agregarAlCarrito(idProducto) {

  const cantidadInput = document.getElementById(`cantidad-${idProducto}`);
  const cantidad = parseInt(cantidadInput.value);

  const producto = productosGlobal.find(p => p.id === idProducto);
  if (!producto) return;

  if (cantidad > producto.stock) {
    document.getElementById(`mensaje-stock-${idProducto}`).style.display = 'block';
    return; // ⛔ Salida temprana, NO muestra vista previa ni carrito
  }

  const productoEnCarrito = carrito.find(item => item.id === producto.id);

  if (productoEnCarrito) {
    if (productoEnCarrito.cantidad + cantidad <= producto.stock) {
      productoEnCarrito.cantidad += cantidad;
      mostrarNotificacion(`Cantidad de ${producto.nombre} aumentada a ${productoEnCarrito.cantidad}`, 'success');
      mostrarVistaPrevia(producto);
    } else {
      mostrarNotificacion(`No hay suficiente stock de ${producto.nombre}`, 'warning');
      return;
    }
  } else {
    carrito.push({ ...producto, cantidad });
    mostrarNotificacion(`${producto.nombre} agregado al carrito`, 'success');
    mostrarVistaPrevia(producto);
  }

  actualizarCarrito();

  // ✅ Solo mostrar carrito si todo fue exitoso
  mostrarCarrito();
  const carritoLateral = document.getElementById("carrito-lateral");
  const botonCarrito = document.getElementById("boton-carrito");

  if (carritoLateral && botonCarrito) {
    carritoLateral.classList.add("activo");
    carritoLateral.classList.remove("oculto");
    botonCarrito.textContent = "❌";
  }
}


    function eliminarDelCarrito(index) {
      const productoEliminado = carrito[index];
      carrito.splice(index, 1);
      actualizarCarrito();
      mostrarNotificacion(`Producto "${productoEliminado.nombre}" eliminado del carrito.`, 'remove');
    }

function actualizarCarrito() {
  listaCarrito.innerHTML = "";
  let total = 0;

  carrito.forEach((item, index) => {
    const li = document.createElement("li");
    li.className = "item-carrito";

    li.innerHTML = `
      <div class="detalle-producto">
        <p class="nombre">${item.nombre}</p>
        <p class="precio">$${item.precio.toLocaleString()} x ${item.cantidad}</p>
      </div>
      <div class="acciones-producto">
        <button onclick="modificarCantidadCarrito(${index}, 'decrementar')">-</button>
        <span>${item.cantidad}</span>
        <button onclick="modificarCantidadCarrito(${index}, 'incrementar')">+</button>
        <button class="eliminar" onclick="eliminarDelCarrito(${index})">✕</button>
      </div>
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
/*
    function cerrarCarrito() {
      document.getElementById('carrito-lateral').classList.remove('activo');
      document.getElementById('carrito-lateral').classList.add('oculto');
    }
*/
    function cerrarCarrito() {
  const carritoLateral = document.getElementById("carrito-lateral");
  const botonCarrito = document.getElementById("boton-carrito");

  carritoLateral.classList.remove("activo");
  carritoLateral.classList.add("oculto");
  if (botonCarrito) {
    botonCarrito.textContent = "🛒";
  }
}

    function mostrarNotificacion(mensaje, tipo = 'info') {
  const notification = document.getElementById('notification');
  notification.textContent = mensaje;

  notification.classList.remove('success', 'warning', 'remove');
  notification.classList.add('show');

  if (tipo === 'success') {
    notification.classList.add('success');
  } else if (tipo === 'warning') {
    notification.classList.add('warning');
  } else if (tipo === 'remove') {
    notification.classList.add('remove');
  }

  setTimeout(() => {
    notification.classList.remove('show', 'success', 'warning', 'remove');
  }, 3000);
}

function mostrarLoader() {
  document.getElementById("loader").style.display = "flex";
}

function ocultarLoader() {
  document.getElementById("loader").style.display = "none";
}

async function pagarConBold() {
  if (carrito.length === 0) return alert("Tu carrito está vacío.");

  const nombre = document.getElementById("nombre")?.value.trim();
  const telefono = document.getElementById("telefono")?.value.trim();
  const ciudad = document.getElementById("ciudad")?.value.trim();
  const direccion = document.getElementById("direccion")?.value.trim();
  const referencia = crypto.randomUUID();

  if (!nombre || !telefono || !ciudad || !direccion) {
    alert("Por favor completa todos los campos del formulario.");
    return;
  }

  const total = carrito.reduce((sum, p) => sum + p.precio * p.cantidad, 0);

  const pedido = {
    nombre,
    telefono,
    ciudad,
    direccion,
    referencia,
    carrito,
    total
  };

  try {
    // Enviar datos a función serverless para guardar pedido y enviar correo
    const response = await fetch("/.netlify/functions/guardarPedido", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pedido)
    });

    const result = await response.json();

    if (response.ok) {
      cerrarModalFormulario();
      mostrarLoader();

      const productosResumen = carrito.map(p => (
        `${p.nombre} x${p.cantidad} - $${p.precio.toLocaleString("es-CO")}`
      )).join('\n');

      const mensaje = `🧾 *Resumen de tu pedido:*\n\n${productosResumen}\n\n💰 *Total:* $${total.toLocaleString("es-CO")}\n\nGracias por tu compra en Camerino JIP 🎉`;
      const callback_url = `https://wa.me/+573177657335?text=${encodeURIComponent(mensaje)}`;
      const descripcion = "Pedido Camerino JIP";
      const imagenUrl = obtenerUrlAbsoluta(carrito[0].imagen);

      const raw = JSON.stringify({
        monto: total,
        descripcion,
        tipo: "CLOSE",
        image_url: imagenUrl,
        callback_url
      });

      const pagoResponse = await fetch("/.netlify/functions/crearLinkPago", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: raw
      });

      const pagoResult = await pagoResponse.json();

      if (pagoResponse.ok && pagoResult.payload?.url) {
        window.location.href = pagoResult.payload.url;
      } else {
        console.error('No se recibió un enlace de pago válido.', pagoResult);
        ocultarLoader();
      }
    } else {
      alert("Error al procesar el pedido: " + (result.error || "Intenta de nuevo más tarde."));
    }
  } catch (error) {
    alert("Error en la conexión: " + error.message);
    ocultarLoader();
  }
}

document.getElementById("checkout-form").addEventListener("submit", function(e) {
  e.preventDefault();
  pagarConBold();
});




/*
function pagarConBold() {
  if (carrito.length === 0) return alert("Tu carrito está vacío.");

  mostrarLoader(); // <-- Se muestra aquí, antes del fetch

  const productosResumen = carrito.map(p => (
    `${p.nombre} x${p.cantidad} - $${p.precio.toLocaleString("es-CO")}`
  )).join('\n');

  const total = carrito.reduce((sum, p) => sum + p.precio * p.cantidad, 0);

  const mensaje = `🧾 *Resumen de tu pedido:*\n\n${productosResumen}\n\n💰 *Total:* $${total.toLocaleString("es-CO")}\n\nGracias por tu compra en Camerino JIP 🎉`;
  const callback_url = `https://wa.me/+573177657335?text=${encodeURIComponent(mensaje)}`;
  const descripcion = "Pedido Camerino JIP";
  const monto = total;
  const imagenUrl = obtenerUrlAbsoluta(carrito[0].imagen);

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
      // loader sigue visible antes de redirigir
      window.location.href = result.payload.url;
    } else {
      console.error('No se recibió un enlace de pago válido.', result);
      ocultarLoader(); // sólo si hubo error
    }
  })
  .catch(error => {
    console.error('Error al generar enlace:', error);
    ocultarLoader(); // en caso de fallo
  });
}
*/
/*
    function pagarConBold() {
      if (carrito.length === 0) return alert("Tu carrito está vacío.");

      mostrarLoader();

      const productosResumen = carrito.map(p => (
        `${p.nombre} x${p.cantidad} - $${p.precio.toLocaleString("es-CO")}`
      )).join('\n');

      const total = carrito.reduce((sum, p) => sum + p.precio * p.cantidad, 0);

      const mensaje = `🧾 *Resumen de tu pedido:*\n\n${productosResumen}\n\n💰 *Total:* $${total.toLocaleString("es-CO")}\n\nGracias por tu compra en Camerino JIP 🎉`;

      const callback_url = `https://wa.me/+573177657335?text=${encodeURIComponent(mensaje)}`;

      const descripcion = "Pedido Camerino JIP";

      const monto = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
      const imagenUrl = obtenerUrlAbsoluta(carrito[0].imagen);

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
          ocultarLoader();
        }
      })
      .catch(error => console.error('Error al generar enlace:', error));
      ocultarLoader();
    }
*/
   function realizarAbono() {
    const descripcion = "Abono para curso tufting o compra de tapetes personalizados"; // Descripción general
    const imagenUrl = obtenerUrlAbsoluta("./images/camerino.jpeg"); // Imagen genérica o la que prefieras

    obtenerCotizacion(descripcion, imagenUrl); // Llamamos a la función para obtener el enlace con monto abierto
}
/*
function obtenerCotizacion(descripcion, imagenUrl) {
    mostrarLoader();
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
          ocultarLoader();
            console.error('Error: No se recibió un enlace de pago válido.', result);
        }
    })
    .catch(error => console.log('error', error));
    ocultarLoader();
}
*/
function obtenerCotizacion(descripcion, imagenUrl) {
  mostrarLoader();

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
      ocultarLoader();
    }
  })
  .catch(error => {
    console.log('error', error);
    ocultarLoader();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  cargarCatalogo();

  const toggleBtn = document.getElementById("toggle-categorias");
  const lista = document.getElementById("lista-categorias");

  if (toggleBtn && lista) {
   toggleBtn.addEventListener("click", () => {
  lista.classList.toggle("mostrar");

  if (lista.classList.contains("mostrar")) {
    contraerTodosLosSubmenus();
    ocultarSubcategorias(); // <-- Esta línea es clave
  }
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

// Cierra el menú hamburguesa si el clic es fuera del menú
document.addEventListener('click', function (event) {
  const menu = document.getElementById('lista-categorias');
  const toggle = document.getElementById('toggle-categorias');

  if (!menu || !toggle) return;

  const hizoClickDentroDelMenu = menu.contains(event.target);
  const hizoClickEnElBoton = toggle.contains(event.target);

  if (!hizoClickDentroDelMenu && !hizoClickEnElBoton) {
    menu.classList.remove('mostrar');
    toggle.classList.remove('activo');
  }
});


// Mostrar imagen en modal
function abrirModalImagen(src) {
  const modal = document.getElementById("modal-imagen");
  const imagen = document.getElementById("imagen-modal");

  const cdnUrl = `https://imagecdn.app/v2/image/${encodeURIComponent(src)}?w=400&auto=webp`;

  const preload = new Image();
  preload.onload = () => {
    imagen.src = cdnUrl;
    modal.style.display = "flex";
  };
  preload.src = cdnUrl;
}

function contraerTodosLosSubmenus() {
  document.querySelectorAll('.submenu').forEach(submenu => {
    submenu.classList.add('oculto');
  });
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
      mostrarNotificacion(`No hay suficiente stock de ${item.nombre}`, 'warning');
    }
  } else if (accion === 'decrementar') {
    if (item.cantidad > 1) {
      item.cantidad--;
    } else {
      eliminarDelCarrito(index);
      return; 
    }
}

  actualizarCarrito();
}

/*probando ando*/
const categoriasDisponibles = [
  { id: 'tapetes', icon: '/icons/tapete.svg', label: 'Tapetes' },
  { id: 'impresion3d', icon: '/icons/impresion.svg', label: 'Impresión 3D' },
  { id: 'indumentaria', icon: '/icons/camisa.svg', label: 'Indumentaria Deportiva' },
  { id: 'accesorios', icon: '/icons/accesorios.svg', label: 'Accesorios' }
];

let categoriaActiva = null;

async function crearBotonesFlotantes() {
  const contenedor = document.getElementById('botones-flotantes');
  if (!contenedor) return;

  const svgTexts = await Promise.all(
    categoriasDisponibles.map(cat => fetch(cat.icon).then(res => res.text()))
  );

  categoriasDisponibles.forEach((cat, i) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'boton-categoria-wrapper';
    wrapper.dataset.categoria = cat.id;
    wrapper.onclick = () => {
      filtrarPorCategoria(cat.id);
      marcarCategoriaActiva(cat.id);
    };

    const boton = document.createElement('div');
    boton.className = 'boton-categoria';
    boton.title = cat.id;
    boton.innerHTML = svgTexts[i];

    const etiqueta = document.createElement('span');
    etiqueta.className = 'boton-etiqueta';
    etiqueta.textContent = cat.label;

    wrapper.appendChild(boton);
    wrapper.appendChild(etiqueta);
    contenedor.appendChild(wrapper);
  });
}

function marcarCategoriaActiva(id) {
  const botones = document.querySelectorAll('.boton-categoria-wrapper');
  botones.forEach(btn => {
    if (btn.dataset.categoria === id) {
      btn.classList.add('activo');
    } else {
      btn.classList.remove('activo');
    }
  });
  categoriaActiva = id;
}

document.addEventListener('DOMContentLoaded', crearBotonesFlotantes);

window.addEventListener("pageshow", () => {
  ocultarLoader();
});

setTimeout(() => {
  ocultarLoader();
}, 5000); // fuerza ocultar después de 5 segundos

function mostrarModalFormulario() {
  document.getElementById('modal-formulario').classList.remove('oculto');
}

function cerrarModalFormulario() {
  document.getElementById('modal-formulario').classList.add('oculto');
}

// Oculta el modal si se vuelve desde la página de pago (por ejemplo usando botón "Volver")
window.addEventListener("pageshow", function(event) {
  if (event.persisted || performance.getEntriesByType("navigation")[0]?.type === "back_forward") {
    cerrarModalFormulario();
    ocultarLoader();
  }
});
