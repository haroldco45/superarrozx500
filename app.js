/* =========================================================
   SUPERARROZ - APP DE PEDIDOS (Distrileco)
   Almacenamiento local (IndexedDB simple vía localStorage)
   Desarrollada por Vibras Positivas HM
   ========================================================= */

const DB_KEY = 'superarroz_pedidos';
const CFG_KEY = 'superarroz_config';
const AUTH_KEY = 'superarroz_admin_token';

const CONFIG_DEFAULT = {
  nombreProducto: 'SuperArroz - Paca x25 libras de 500g',
  descripcion: '$43.000 c/u · Toca la imagen para pedir',
  precio: 43000,
  empresa: 'DISTRILECO',
  imagen: 'icons/placeholder.png',
  whatsapp: '3117700431'
};

let cantidadActual = 1;
let gpsActual = null;
let pedidoEditandoId = null;

/* ---------------- UTILIDADES STORAGE ---------------- */
function getConfig(){
  const c = localStorage.getItem(CFG_KEY);
  return c ? JSON.parse(c) : {...CONFIG_DEFAULT};
}
function saveConfig(cfg){
  localStorage.setItem(CFG_KEY, JSON.stringify(cfg));
}
function getPedidos(){
  const p = localStorage.getItem(DB_KEY);
  return p ? JSON.parse(p) : [];
}
function savePedidos(arr){
  localStorage.setItem(DB_KEY, JSON.stringify(arr));
}
function getToken(){
  return localStorage.getItem(AUTH_KEY) || '1234';
}
function formatoMoneda(valor){
  return '$' + Number(valor).toLocaleString('es-CO');
}

/* ---------------- INICIO ---------------- */
window.addEventListener('DOMContentLoaded', () => {
  cargarConfigEnHome();
  if(window.location.hash === '#admin'){
    abrirAdmin();
  }
  // registrar service worker
  if('serviceWorker' in navigator){
    navigator.serviceWorker.register('sw.js').catch(()=>{});
  }
});

function cargarConfigEnHome(){
  const cfg = getConfig();
  document.getElementById('nombreEmpresa').textContent = cfg.empresa;
  document.getElementById('nombreProducto').textContent = cfg.nombreProducto;
  document.getElementById('precioProducto').textContent = cfg.descripcion;
  document.getElementById('imgProducto').src = cfg.imagen;
  document.getElementById('nombreResumen').textContent = cfg.nombreProducto;
  document.getElementById('imgResumen').src = cfg.imagen;
  document.getElementById('precioUnitResumen').textContent = `${formatoMoneda(cfg.precio)} c/u · 500 gramos c/u`;
  actualizarTotal();
}

function actualizarTotal(){
  const cfg = getConfig();
  const total = (cfg.precio || 0) * cantidadActual;
  document.getElementById('totalVal').textContent = formatoMoneda(total);
}

/* ---------------- NAVEGACION ---------------- */
function mostrarPantalla(id){
  document.querySelectorAll('.pantalla').forEach(p => p.classList.remove('activa'));
  document.getElementById(id).classList.add('activa');
  if(id !== 'admin' && id !== 'login') window.location.hash = '';
}

function irAFormulario(){
  cantidadActual = 1;
  document.getElementById('qtyVal').textContent = '1';
  gpsActual = null;
  document.getElementById('gpsStatus').textContent = 'No se ha obtenido ubicación todavía.';
  document.getElementById('gpsStatus').classList.remove('gps-ok');
  document.getElementById('f_nombre').value = '';
  document.getElementById('f_direccion').value = '';
  document.getElementById('f_celular').value = '';
  document.getElementById('f_obs').value = '';
  actualizarTotal();
  mostrarPantalla('formulario');
}

function cambiarCantidad(delta){
  cantidadActual = Math.max(1, cantidadActual + delta);
  document.getElementById('qtyVal').textContent = cantidadActual;
  actualizarTotal();
}

/* ---------------- GPS ---------------- */
function obtenerGPS(){
  const status = document.getElementById('gpsStatus');
  if(!navigator.geolocation){
    status.textContent = '⚠️ Tu navegador no soporta geolocalización.';
    return;
  }
  status.textContent = '📡 Obteniendo ubicación...';
  navigator.geolocation.getCurrentPosition(
    pos => {
      gpsActual = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude
      };
      status.innerHTML = `✅ Ubicación obtenida (lat: ${gpsActual.lat.toFixed(5)}, lng: ${gpsActual.lng.toFixed(5)})`;
      status.classList.add('gps-ok');
    },
    err => {
      status.textContent = '⚠️ No se pudo obtener la ubicación. Verifica permisos del GPS.';
    },
    { enableHighAccuracy: true, timeout: 10000 }
  );
}

/* ---------------- ENVIAR PEDIDO ---------------- */
function enviarPedido(){
  const nombre = document.getElementById('f_nombre').value.trim();
  const direccion = document.getElementById('f_direccion').value.trim();
  const celular = document.getElementById('f_celular').value.trim();
  const pago = document.getElementById('f_pago').value;
  const obs = document.getElementById('f_obs').value.trim();

  if(!nombre || !direccion || !celular){
    alert('Por favor completa los campos obligatorios: Nombre, Dirección y Celular.');
    return;
  }

  const cfg = getConfig();
  const total = (cfg.precio || 0) * cantidadActual;

  const mapaLink = gpsActual ? `https://www.google.com/maps?q=${gpsActual.lat},${gpsActual.lng}` : 'No proporcionada';

  let mensaje =
`🛒 NUEVO PEDIDO - SUPERARROZ
📦 Producto: ${cfg.nombreProducto}
🔢 Cantidad: ${cantidadActual} paca(s)
💵 Precio unitario: ${formatoMoneda(cfg.precio)}
💰 Total: ${formatoMoneda(total)}

👤 Cliente: ${nombre}
📍 Dirección: ${direccion}
📱 Celular: ${celular}
🗺️ Ubicación GPS: ${mapaLink}
💳 Forma de pago: ${pago}`;

  if(obs){
    mensaje += `\n📝 Observaciones: ${obs}`;
  }

  const numero = (cfg.whatsapp || '3117700431').replace(/\D/g,'');
  const numeroFinal = numero.length === 10 ? '57' + numero : numero;
  const url = `https://wa.me/${numeroFinal}?text=${encodeURIComponent(mensaje)}`;

  abrirEnlace(url);
  mostrarPantalla('exito');
}

/* ---------------- LOGIN ADMIN ---------------- */
function abrirAdmin(e){
  if(e) e.preventDefault();
  mostrarPantalla('login');
}

function validarLogin(){
  const t = document.getElementById('loginToken').value.trim();
  if(t === getToken()){
    document.getElementById('loginToken').value = '';
    cargarAdmin();
    mostrarPantalla('admin');
  } else {
    alert('Token incorrecto.');
  }
}

function cerrarSesionAdmin(){
  mostrarPantalla('home');
}

/* ---------------- TABS ADMIN ---------------- */
function cambiarTab(tab){
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('activo'));
  document.querySelectorAll('.seccion').forEach(s => s.classList.remove('activa'));
  document.querySelector(`.tab[data-tab="${tab}"]`).classList.add('activo');
  document.getElementById('tab-' + tab).classList.add('activa');
}

function cargarAdmin(){
  renderPedidos();
  const cfg = getConfig();
  document.getElementById('cfgNombre').value = cfg.nombreProducto;
  document.getElementById('cfgDescripcion').value = cfg.descripcion;
  document.getElementById('cfgPrecio').value = cfg.precio;
  document.getElementById('cfgEmpresa').value = cfg.empresa;
  document.getElementById('cfgImgPreview').src = cfg.imagen;
  document.getElementById('cfgWhatsapp').value = cfg.whatsapp;
}

/* ---------------- RENDER PEDIDOS ---------------- */
function renderPedidos(){
  const cont = document.getElementById('listaPedidos');
  const pedidos = getPedidos();
  if(pedidos.length === 0){
    cont.innerHTML = '<div class="empty-msg">No hay pedidos registrados todavía.</div>';
    return;
  }
  cont.innerHTML = pedidos.map(p => {
    const fecha = new Date(p.fecha).toLocaleString('es-CO', {timeZone:'America/Bogota'});
    const mapaLink = p.gps ? `https://www.google.com/maps?q=${p.gps.lat},${p.gps.lng}` : null;
    return `
      <div class="pedido-card">
        <div class="fila"><b>${escapeHtml(p.nombre)}</b><span>${escapeHtml(p.estado.toUpperCase())}</span></div>
        <div class="fila"><span>📦 ${p.cantidad} x ${escapeHtml(p.producto)}</span></div>
        <div class="fila"><span>📍 ${escapeHtml(p.direccion)}</span></div>
        <div class="fila"><span>📱 ${escapeHtml(p.celular)}</span></div>
        <div class="fila"><span>💰 ${escapeHtml(p.pago)}</span></div>
        ${p.obs ? `<div class="fila"><span>📝 ${escapeHtml(p.obs)}</span></div>` : ''}
        <div class="fila"><span style="color:#aaa;font-size:11px;">${fecha}</span></div>
        <div class="pedido-acciones">
          <button class="btn-editar" onclick="abrirEditar(${p.id})">Editar</button>
          ${mapaLink ? `<button class="btn-mapa" onclick="abrirEnlace('${mapaLink}')">Mapa</button>` : ''}
          <button class="btn-whatsapp" onclick="contactarCliente(${p.id})">WhatsApp</button>
          <button class="btn-eliminar" onclick="eliminarPedido(${p.id})">Eliminar</button>
        </div>
      </div>
    `;
  }).join('');
}

function escapeHtml(str){
  return String(str ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

/* ---------------- PEGAR PEDIDO DESDE WHATSAPP ---------------- */
function abrirPegarPedido(){
  document.getElementById('textoPegado').value = '';
  document.getElementById('modalPegar').classList.add('activo');
}

function cerrarModalPegar(){
  document.getElementById('modalPegar').classList.remove('activo');
}

function procesarPegarPedido(){
  const texto = document.getElementById('textoPegado').value;
  if(!texto.trim()){
    alert('Pega el texto del pedido primero.');
    return;
  }

  const extraer = (regex) => {
    const m = texto.match(regex);
    return m ? m[1].trim() : '';
  };

  const producto = extraer(/Producto:\s*(.+)/i);
  const cantidadStr = extraer(/Cantidad:\s*(\d+)/i);
  const nombre = extraer(/Cliente:\s*(.+)/i);
  const direccion = extraer(/Dirección:\s*(.+)/i) || extraer(/Direccion:\s*(.+)/i);
  const celular = extraer(/Celular:\s*(.+)/i);
  const pago = extraer(/Forma de pago:\s*(.+)/i);
  const obs = extraer(/Observaciones:\s*(.+)/i);
  const gpsLinea = extraer(/Ubicación GPS:\s*(.+)/i) || extraer(/Ubicacion GPS:\s*(.+)/i);

  if(!nombre || !direccion || !celular){
    alert('No se pudo interpretar el mensaje. Verifica que sea el texto completo del pedido (debe incluir Cliente, Dirección y Celular).');
    return;
  }

  let gps = null;
  const gpsMatch = gpsLinea.match(/q=([-\d.]+),([-\d.]+)/);
  if(gpsMatch){
    gps = { lat: parseFloat(gpsMatch[1]), lng: parseFloat(gpsMatch[2]) };
  }

  const cfg = getConfig();
  const pedidos = getPedidos();
  pedidos.unshift({
    id: Date.now(),
    fecha: new Date().toISOString(),
    producto: producto || cfg.nombreProducto,
    cantidad: parseInt(cantidadStr) || 1,
    nombre, direccion, celular,
    pago: pago || 'Por confirmar',
    obs: obs || '',
    gps,
    estado: 'pendiente'
  });
  savePedidos(pedidos);
  cerrarModalPegar();
  renderPedidos();
  alert('✅ Pedido agregado a tu historial.');
}

/* ---------------- EDITAR / AGREGAR PEDIDO (registro manual) ---------------- */
function abrirNuevoPedido(){
  pedidoEditandoId = null;
  document.getElementById('modalTitulo').textContent = '➕ Agregar pedido';
  document.getElementById('e_nombre').value = '';
  document.getElementById('e_direccion').value = '';
  document.getElementById('e_celular').value = '';
  document.getElementById('e_cantidad').value = 1;
  document.getElementById('e_pago').value = 'Efectivo';
  document.getElementById('e_obs').value = '';
  document.getElementById('e_estado').value = 'pendiente';
  document.getElementById('modalEditar').classList.add('activo');
}

function abrirEditar(id){
  const pedidos = getPedidos();
  const p = pedidos.find(x => x.id === id);
  if(!p) return;
  pedidoEditandoId = id;
  document.getElementById('modalTitulo').textContent = '✏️ Editar pedido';
  document.getElementById('e_nombre').value = p.nombre;
  document.getElementById('e_direccion').value = p.direccion;
  document.getElementById('e_celular').value = p.celular;
  document.getElementById('e_cantidad').value = p.cantidad;
  document.getElementById('e_pago').value = p.pago;
  document.getElementById('e_obs').value = p.obs;
  document.getElementById('e_estado').value = p.estado;
  document.getElementById('modalEditar').classList.add('activo');
}

function cerrarModal(){
  document.getElementById('modalEditar').classList.remove('activo');
  pedidoEditandoId = null;
}

function guardarEdicion(){
  const nombre = document.getElementById('e_nombre').value.trim();
  const direccion = document.getElementById('e_direccion').value.trim();
  const celular = document.getElementById('e_celular').value.trim();
  if(!nombre || !direccion || !celular){
    alert('Completa al menos Nombre, Dirección y Celular.');
    return;
  }
  const cfg = getConfig();
  const pedidos = getPedidos();

  if(pedidoEditandoId === null){
    // crear nuevo
    pedidos.unshift({
      id: Date.now(),
      fecha: new Date().toISOString(),
      producto: cfg.nombreProducto,
      cantidad: parseInt(document.getElementById('e_cantidad').value) || 1,
      nombre, direccion, celular,
      pago: document.getElementById('e_pago').value,
      obs: document.getElementById('e_obs').value.trim(),
      gps: null,
      estado: document.getElementById('e_estado').value
    });
  } else {
    const idx = pedidos.findIndex(x => x.id === pedidoEditandoId);
    if(idx === -1) return;
    pedidos[idx].nombre = nombre;
    pedidos[idx].direccion = direccion;
    pedidos[idx].celular = celular;
    pedidos[idx].cantidad = parseInt(document.getElementById('e_cantidad').value) || 1;
    pedidos[idx].pago = document.getElementById('e_pago').value;
    pedidos[idx].obs = document.getElementById('e_obs').value.trim();
    pedidos[idx].estado = document.getElementById('e_estado').value;
  }
  savePedidos(pedidos);
  cerrarModal();
  renderPedidos();
}

function eliminarPedido(id){
  if(!confirm('¿Eliminar este pedido?')) return;
  let pedidos = getPedidos();
  pedidos = pedidos.filter(x => x.id !== id);
  savePedidos(pedidos);
  renderPedidos();
}

function contactarCliente(id){
  const pedidos = getPedidos();
  const p = pedidos.find(x => x.id === id);
  if(!p) return;
  let num = p.celular.replace(/\D/g,'');
  if(num.length === 10) num = '57' + num;
  const msg = encodeURIComponent(`Hola ${p.nombre}, te contactamos de Distrileco por tu pedido de ${p.cantidad} x ${p.producto}.`);
  abrirEnlace(`https://wa.me/${num}?text=${msg}`);
}

/* ---------------- CONFIG PRODUCTO ---------------- */
function cargarImagen(e){
  const file = e.target.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = function(ev){
    document.getElementById('cfgImgPreview').src = ev.target.result;
  };
  reader.readAsDataURL(file);
}

function guardarConfig(){
  const cfg = getConfig();
  cfg.nombreProducto = document.getElementById('cfgNombre').value.trim() || cfg.nombreProducto;
  cfg.descripcion = document.getElementById('cfgDescripcion').value.trim() || cfg.descripcion;
  const precioInput = parseFloat(document.getElementById('cfgPrecio').value);
  if(!isNaN(precioInput) && precioInput >= 0) cfg.precio = precioInput;
  cfg.empresa = document.getElementById('cfgEmpresa').value.trim() || cfg.empresa;
  cfg.imagen = document.getElementById('cfgImgPreview').src;
  saveConfig(cfg);
  cargarConfigEnHome();
  alert('✅ Configuración guardada correctamente.');
}

function guardarWhatsapp(){
  const num = document.getElementById('cfgWhatsapp').value.trim();
  if(!num){ alert('Ingresa un número válido.'); return; }
  const cfg = getConfig();
  cfg.whatsapp = num;
  saveConfig(cfg);
  alert('✅ Número de WhatsApp actualizado.');
}

function cambiarToken(){
  const t = document.getElementById('nuevoToken').value.trim();
  if(!t){ alert('Ingresa un nuevo token.'); return; }
  localStorage.setItem(AUTH_KEY, t);
  document.getElementById('nuevoToken').value = '';
  alert('✅ Token actualizado.');
}

/* ---------------- BACKUP / RESTAURAR ---------------- */
function descargarBackup(){
  const data = {
    config: getConfig(),
    pedidos: getPedidos(),
    fechaBackup: new Date().toISOString()
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `backup_superarroz_${formatoFecha()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function restaurarBackup(e){
  const file = e.target.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = function(ev){
    try{
      const data = JSON.parse(ev.target.result);
      if(data.config) saveConfig(data.config);
      if(data.pedidos) savePedidos(data.pedidos);
      cargarAdmin();
      cargarConfigEnHome();
      alert('✅ Backup restaurado correctamente.');
    }catch(err){
      alert('⚠️ Archivo de backup inválido.');
    }
  };
  reader.readAsText(file);
  e.target.value = '';
}

function borrarTodo(){
  if(!confirm('Esto eliminará TODOS los pedidos guardados. ¿Continuar?')) return;
  savePedidos([]);
  renderPedidos();
  alert('🗑️ Pedidos eliminados.');
}

/* ---------------- EXPORTAR EXCEL (CSV) ---------------- */
function exportarExcel(){
  const pedidos = getPedidos();
  if(pedidos.length === 0){ alert('No hay pedidos para exportar.'); return; }
  let csv = 'Fecha,Nombre,Direccion,Celular,Cantidad,Producto,FormaPago,Observaciones,Estado,GPS_Lat,GPS_Lng\n';
  pedidos.forEach(p => {
    const fecha = new Date(p.fecha).toLocaleString('es-CO', {timeZone:'America/Bogota'});
    const fila = [
      fecha, p.nombre, p.direccion, p.celular, p.cantidad, p.producto,
      p.pago, (p.obs||'').replace(/\n/g,' '), p.estado,
      p.gps ? p.gps.lat : '', p.gps ? p.gps.lng : ''
    ].map(v => `"${String(v).replace(/"/g,'""')}"`).join(',');
    csv += fila + '\n';
  });
  const blob = new Blob(['\uFEFF' + csv], {type:'text/csv;charset=utf-8;'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `pedidos_superarroz_${formatoFecha()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/* ---------------- TOKEN POR WHATSAPP (HISTORICO) ---------------- */
function generarToken(){
  const pedidos = getPedidos();
  const cfg = getConfig();
  if(pedidos.length === 0){
    alert('No hay pedidos en el histórico para enviar.');
    return;
  }
  let total = 0;
  let resumen = pedidos.slice(0, 15).map(p => {
    total += p.cantidad;
    const fecha = new Date(p.fecha).toLocaleDateString('es-CO', {timeZone:'America/Bogota'});
    return `• ${fecha} - ${p.nombre} - ${p.cantidad} paca(s) - ${p.celular} (${p.estado})`;
  }).join('\n');

  const extra = pedidos.length > 15 ? `\n...y ${pedidos.length - 15} pedidos más.` : '';

  const mensaje =
`📊 HISTÓRICO DE VENTAS - SUPERARROZ
🏢 Distrileco - Caucasia

Total de pedidos: ${pedidos.length}
Total de pacas vendidas: ${total}

Últimos pedidos:
${resumen}${extra}

🕒 Generado: ${new Date().toLocaleString('es-CO', {timeZone:'America/Bogota'})}`;

  const numero = (cfg.whatsapp || '3117700431').replace(/\D/g,'');
  const numeroFinal = numero.length === 10 ? '57' + numero : numero;
  const url = `https://wa.me/${numeroFinal}?text=${encodeURIComponent(mensaje)}`;
  abrirEnlace(url);
}

function abrirEnlace(url){
  const a = document.createElement('a');
  a.href = url;
  a.target = '_blank';
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function formatoFecha(){
  const d = new Date();
  return `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}_${String(d.getHours()).padStart(2,'0')}${String(d.getMinutes()).padStart(2,'0')}`;
}
