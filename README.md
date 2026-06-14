# SuperArroz App - Distrileco 🌾

App web autoinstalable (PWA) para tomar pedidos de **SuperArroz - Paca x25 libras de 500g** en Caucasia y zona de Bajo Cauca.

## 🚀 Cómo usarla

1. **Subir a GitHub Pages**: sube todos los archivos a un repositorio (ej. `superarroz-app`) y activa GitHub Pages.
2. **Link al cliente**: comparte la URL (ej. `https://haroldco45.github.io/superarroz-app/`). El cliente verá la foto del arroz como botón único.
3. **Instalar como app**: el navegador (Chrome/Safari) mostrará la opción "Agregar a pantalla de inicio" — el cliente o tú pueden instalarla como app.

## 🛒 Flujo del cliente

1. Toca la imagen del producto (botón único).
2. Llena: nombre, dirección, celular, cantidad, observaciones.
3. Presiona "Obtener mi ubicación" para que el GPS quede registrado (ayuda al repartidor).
4. Elige forma de pago (solo informativo, no procesa pagos).
5. Confirma el pedido.

## 🔐 Panel de administrador

Accede tocando el enlace pequeño "admin" en la esquina inferior derecha, o entrando a:
`tuapp.com/#admin`

**Token inicial: `1234`** — Cámbialo de inmediato en la pestaña **Datos**.

### Funciones del panel:
- **Pedidos**: ver, editar, eliminar pedidos. Ver ubicación en mapa (Google Maps). Contactar cliente por WhatsApp.
- **Producto**: cambiar nombre, descripción, empresa y **subir tu propia foto** del arroz.
- **Datos**:
  - 📥 Backup completo (JSON) — descarga toda la info.
  - 📤 Restaurar backup — sube un JSON previo.
  - 🗑️ Borrar todos los pedidos.
  - 📊 Exportar pedidos a Excel (CSV, abre en Excel).
  - 📲 Enviar histórico de ventas por WhatsApp (al número configurado, por defecto **3117700431**).
  - Cambiar token de acceso del admin.

## 📲 Imagen para compartir

Al compartir el link por WhatsApp, se mostrará la imagen de `icons/placeholder.png`. **Reemplázala** subiendo tu propia foto del producto desde el panel admin (pestaña Producto) — recuerda también reemplazar el archivo `icons/placeholder.png` en GitHub para que la vista previa de WhatsApp muestre tu foto real.

## 💾 Almacenamiento

Todo se guarda **localmente en el navegador** (localStorage) — no requiere servidor ni base de datos externa. Los pedidos quedan en el dispositivo donde se administra (ideal: el celular o PC del vendedor/repartidor).

⚠️ Importante: haz **backups regulares** desde el panel admin para no perder información si se borra la caché del navegador.

## 🔒 Privacidad (Habeas Data - Ley 1581 de 2012)

Los datos personales (nombre, dirección, celular) solo son visibles en el panel de administrador protegido por token. El formulario incluye aviso de uso de datos.

---
**Desarrollada por Vibras Positivas HM — Derechos de Autor Reservados**
