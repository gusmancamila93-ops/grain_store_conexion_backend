# DOCUMENTACIÓN POR MÓDULO — Grain Store

Cada módulo se documenta con base en el código real del repositorio (`backend/src/modules/*` y `src/pages/*`) y fue verificado funcionando contra la implementación desplegada (Vercel + Render + Aiven).

---

## 1. Autenticación

- **Objetivo:** identificar al usuario del sistema y su rol, y mantener la sesión activa.
- **Descripción funcional:** permite iniciar sesión con correo, contraseña y rol; consultar los datos del usuario autenticado; editar el propio perfil (nombre, teléfono, foto); cerrar sesión.
- **Componentes involucrados:** `src/pages/auth/LoginPage.jsx`, `src/contexts/AuthProvider.jsx`, `src/hooks/useAuth.js`, `src/services/authService.js`, `src/routes/RoleGuard.jsx` (frontend); `backend/src/modules/auth/*` (`auth.routes.js`, `auth.controller.js`, `auth.service.js`, `auth.schema.js`), `backend/src/middlewares/authenticate.js` (backend).
- **Endpoints relacionados:**
  | Método | Ruta | Rol |
  |---|---|---|
  | POST | `/api/auth/login` | público |
  | GET | `/api/auth/me` | autenticado |
  | PUT | `/api/auth/me` | autenticado |
- **Datos de entrada:** `email`, `password`, `role` (login); `name`, `phone`, `photo` (edición de perfil, todos opcionales).
- **Datos de salida:** `{ token, user }` en login, donde `user` incluye `id, name, email, role, status, phone, photo`; objeto de usuario actualizado en `PUT /me`.
- **Validaciones implementadas:** formato de correo, contraseña obligatoria, rol dentro de `admin|vendedor|contador` (Zod); verificación de contraseña con `bcrypt.compare`; verificación de que el rol enviado coincida con el rol real del usuario; verificación de `estado = Activo`.
- **Flujo general:** el usuario envía credenciales → el backend valida contra la tabla `usuarios` en MySQL → si es válido, firma un JWT (`jsonwebtoken`, 8h de expiración) → el frontend guarda `{ token, ...user }` en `localStorage` → cada petición posterior adjunta `Authorization: Bearer <token>`.
- **Observaciones:** verificado en producción con los 3 roles (`admin@grainstore.com`, `vendedor@grainstore.com`, `contador@grainstore.com`); el cierre de sesión ("Salir") se probó y limpia la sesión correctamente, devolviendo al login.

---

## 2. Dashboard

- **Objetivo:** dar una vista general del estado del negocio, con contenido distinto según el rol.
- **Descripción funcional:** muestra estadísticas del día/mes, una gráfica de actividad de 12 meses, indicadores y una tabla de movimientos recientes, todo calculado en tiempo real (no son datos de ejemplo estáticos).
- **Componentes involucrados:** `src/pages/dashboard/DashboardPage.jsx`, `src/services/dashboardService.js` (frontend); `backend/src/modules/dashboard/*` (backend).
- **Endpoints relacionados:** `GET /api/dashboard` (roles: `admin`, `vendedor`, `contador`).
- **Datos de entrada:** ninguno explícito — el rol se obtiene del token JWT.
- **Datos de salida:** objeto `{ title, subtitle, stats[], chartTitle, chartSeries[], indicators[], tableTitle, movements[] }`. Para `contador`, cada elemento de `chartSeries` incluye además `secondary` (para el gráfico de barras dobles ingresos/egresos).
- **Validaciones implementadas:** requiere JWT válido; el contenido se filtra por rol en el backend (`vendedor` solo ve sus propias ventas).
- **Flujo general:** el frontend pide `/api/dashboard` al entrar → el backend agrega datos reales de `ventas`, `productos`, `clientes` y/o `egresos` según el rol → responde un objeto con la misma forma para las 3 variantes de rol, lo que permite reutilizar el mismo componente de React.
- **Observaciones:** verificado con los 3 roles; los datos mostrados (ej. "Clientes Activos: 2", "Bajo stock: 1") corresponden exactamente a los datos reales en la base de datos de Aiven en el momento de la verificación.

---

## 3. Clientes

- **Objetivo:** administrar la cartera de clientes de la tienda.
- **Descripción funcional:** listar, crear, editar y eliminar clientes; buscar por documento/nombre/teléfono/correo/dirección; filtrar por tipo y estado.
- **Componentes involucrados:** `src/pages/customers/CustomersPage.jsx`, `src/services/clientesService.js` (frontend); `backend/src/modules/clientes/*` (backend).
- **Endpoints relacionados:**
  | Método | Ruta | Rol |
  |---|---|---|
  | GET | `/api/clientes` | admin, vendedor, contador |
  | POST | `/api/clientes` | admin, vendedor, contador |
  | PUT | `/api/clientes/:id` | admin, vendedor, contador |
  | DELETE | `/api/clientes/:id` | admin, vendedor, contador |
- **Datos de entrada:** `document`, `name`, `phone`, `email`, `address`, `type` (Minorista/Mayorista/Empresa/Otro), `status` (Activo/Pendiente/Inactivo).
- **Datos de salida:** listado y ficha de cliente con los mismos campos de entrada más `id`.
- **Validaciones implementadas:** campos obligatorios (document, name, phone, email, address); formato de correo; `document` único (rechaza duplicados con `409`); `type`/`status` restringidos a las listas cerradas anteriores (Zod).
- **Flujo general:** formulario del frontend → validación Zod en el backend → Prisma persiste en la tabla `clientes` de MySQL → respuesta reflejada de inmediato en la tabla de la UI sin recargar la página.
- **Observaciones:** verificado en producción — 4 clientes reales cargados (2 activos, 1 pendiente, 1 inactivo), coincidentes entre lo mostrado en la UI y lo consultado directamente por API.

---

## 4. Productos

- **Objetivo:** control de inventario de la tienda.
- **Descripción funcional:** listar, crear, editar y eliminar productos; el estado de stock (`Normal`/`Bajo stock`/`Agotado`) se calcula automáticamente, no se captura manualmente.
- **Componentes involucrados:** `src/pages/products/ProductsPage.jsx`, `src/services/productosService.js` (frontend); `backend/src/modules/productos/*` (backend).
- **Endpoints relacionados:**
  | Método | Ruta | Rol |
  |---|---|---|
  | GET | `/api/productos` | admin, vendedor |
  | POST | `/api/productos` | admin, vendedor |
  | PUT | `/api/productos/:id` | admin, vendedor |
  | DELETE | `/api/productos/:id` | admin, vendedor |
- **Datos de entrada:** `code`, `name`, `category`, `stock`, `minStock`, `price`.
- **Datos de salida:** listado/ficha de producto, incluyendo `status` calculado en el servidor (no almacenado).
- **Validaciones implementadas:** `code` único; `stock`/`minStock`/`price` numéricos no negativos; `category` restringida a una lista cerrada de 12 valores (Zod).
- **Flujo general:** al leer productos, el backend compara `stock` contra `minStock` en cada respuesta para derivar `status`; el frontend solo pinta el badge correspondiente, no hace el cálculo.
- **Observaciones:** verificado en producción — 4 productos reales, con "Frijol Cargamanto" mostrando correctamente "Bajo stock" (8 unidades / mínimo 12).

---

## 5. Ventas

- **Objetivo:** registrar operaciones comerciales manteniendo el inventario consistente.
- **Descripción funcional:** listar ventas (con filtros por código/cliente/estado), ver el detalle de una venta con sus ítems, registrar una venta nueva, eliminar una venta.
- **Componentes involucrados:** `src/pages/sales/SalesPage.jsx`, `src/pages/sales/NewSalePage.jsx`, `src/services/ventasService.js` (frontend); `backend/src/modules/ventas/*` (backend).
- **Endpoints relacionados:**
  | Método | Ruta | Rol |
  |---|---|---|
  | GET | `/api/ventas` | admin, vendedor |
  | GET | `/api/ventas/:id` | admin, vendedor |
  | POST | `/api/ventas` | admin, vendedor |
  | DELETE | `/api/ventas/:id` | admin, vendedor |
- **Datos de entrada:** `customerId`, `date`, `paymentMethod` (Contado/Crédito), `status` (Pagada/Pendiente/Anulada), `items[]` (`productId`, `quantity`, `unitPrice`).
- **Datos de salida:** venta creada con `code` (`VEN-00X`) y `total` calculados por el servidor; en el listado, resumen sin ítems; en el detalle, incluye `items[]` con nombre de producto resuelto.
- **Validaciones implementadas:** al menos un ítem por venta; existencia de cada producto (`PRODUCT_NOT_FOUND` si no existe); stock suficiente por ítem (`INSUFFICIENT_STOCK` si no alcanza, con el stock disponible en el mensaje); `usuarioId` (vendedor) siempre tomado del token, nunca del body.
- **Flujo general:** el backend valida stock de todos los ítems **antes** de crear nada → dentro de una **transacción de Prisma** crea la venta + el detalle y descuenta el stock de cada producto → si la venta se elimina, otra transacción repone el stock.
- **Observaciones:** verificado en producción — 3 ventas reales (2 pagadas, 1 pendiente), total vendido `$859.800` coincidente entre Dashboard, listado de Ventas y Reportes. El formulario "Nueva Venta" cargó clientes y productos reales desde la API.

---

## 6. Egresos

- **Objetivo:** llevar control de los gastos del negocio.
- **Descripción funcional:** listar (con filtro por categoría/búsqueda), crear, editar y eliminar egresos.
- **Componentes involucrados:** `src/pages/expenses/ExpensesPage.jsx`, `src/services/egresosService.js` (frontend); `backend/src/modules/egresos/*` (backend).
- **Endpoints relacionados:**
  | Método | Ruta | Rol |
  |---|---|---|
  | GET | `/api/egresos` | admin, contador |
  | POST | `/api/egresos` | admin, contador |
  | PUT | `/api/egresos/:id` | admin, contador |
  | DELETE | `/api/egresos/:id` | admin, contador |
- **Datos de entrada:** `date`, `category` (6 valores posibles), `description`, `value`.
- **Datos de salida:** listado/ficha de egreso, con `code` (`EGR-00X`) generado por el servidor y `responsible` resuelto desde el usuario autenticado.
- **Validaciones implementadas:** `category` restringida a lista cerrada; `value` numérico no negativo; descripción obligatoria; el responsable **nunca** se toma de un campo del formulario (por seguridad), aunque el formulario del frontend todavía muestra un campo "Responsable" heredado del diseño original — ese valor se ignora en el backend.
- **Flujo general:** formulario → validación → Prisma persiste en `egresos`, ligado por `usuarioId` al usuario autenticado.
- **Observaciones:** verificado en producción — 3 egresos reales (`$4.350.000` total), con "Responsable" mostrando correctamente Administrador/Vendedor/Contador según quién los creó en el seed.

---

## 7. Reportes

- **Objetivo:** dar visibilidad financiera agregada e histórica del negocio.
- **Descripción funcional:** ingresos, egresos, utilidad, clientes con deuda, margen neto, producto líder, ticket promedio, productos más vendidos, clientes frecuentes, resumen financiero mensual (12 meses).
- **Componentes involucrados:** `src/pages/reports/ReportsPage.jsx`, `src/services/reportesService.js` (frontend); `backend/src/modules/reportes/*` (backend).
- **Endpoints relacionados:** `GET /api/reportes` (roles: `admin`, `contador`).
- **Datos de entrada:** ninguno explícito.
- **Datos de salida:** objeto `{ stats[], indicators[], monthly[], topProducts[], frequentCustomers[], totals{} }`.
- **Validaciones implementadas:** requiere JWT válido y rol autorizado.
- **Flujo general:** el backend agrega **todo el histórico** de `ventas`, `detalle_ventas` y `egresos` (no solo el mes actual), agrupa por mes y por producto/cliente.
- **Observaciones:** verificado en producción — los montos del "Resumen Financiero" mensual están en pesos reales y coinciden exactamente con lo que muestran Ventas y Egresos (`Jun: $859.800 ingresos / $4.350.000 egresos`), confirmando que el bug histórico de escala (`×1.000.000`) documentado en fases previas sigue corregido en producción.

---

## 8. Usuarios

- **Objetivo:** administración de las cuentas del sistema (solo Administrador).
- **Descripción funcional:** listar, crear y editar usuarios con nombre, correo, contraseña, rol y estado (accesible desde la pestaña "Usuarios" de Configuración).
- **Componentes involucrados:** `src/pages/settings/SettingsPage.jsx` (pestaña Usuarios), `src/services/usuariosService.js` (frontend); `backend/src/modules/usuarios/*` (backend).
- **Endpoints relacionados:**
  | Método | Ruta | Rol |
  |---|---|---|
  | GET | `/api/usuarios` | admin |
  | POST | `/api/usuarios` | admin |
  | PUT | `/api/usuarios/:id` | admin |
  | DELETE | `/api/usuarios/:id` | admin |
- **Datos de entrada:** `name`, `email`, `password` (mínimo 6 caracteres), `role`, `status`, `phone`.
- **Datos de salida:** listado/ficha de usuario — **nunca** incluye el hash de la contraseña.
- **Validaciones implementadas:** correo único; contraseña con longitud mínima; `role` restringido a `admin|vendedor|contador`; hash con `bcrypt` (10 salt rounds) antes de persistir.
- **Flujo general:** formulario (visible solo si el rol autenticado es `admin`, tanto en el menú del frontend como reforzado por el middleware `authorize` del backend) → hash de contraseña → Prisma persiste en `usuarios`.
- **Observaciones:** verificado en producción — listado real con los 3 usuarios del sistema (Administrador, Vendedor, Contador), roles mostrados correctamente en español mediante el mapeo `ROLES` del frontend.

---

## 9. Configuración

- **Objetivo:** datos generales de la tienda, preferencias del sistema y perfil propio.
- **Descripción funcional:** 4 pestañas — **Mi Perfil** (editar nombre/teléfono/foto propios), **Mi Tienda** (datos de la empresa y preferencias visuales, solo admin/contador), **Sistema** (información de solo lectura), **Usuarios** (ver módulo 8, solo admin).
- **Componentes involucrados:** `src/pages/settings/SettingsPage.jsx`, `src/services/configService.js`, `src/services/authService.js` (frontend); `backend/src/modules/configuracion/*` (backend).
- **Endpoints relacionados:**
  | Método | Ruta | Rol |
  |---|---|---|
  | GET/PUT | `/api/auth/me` | autenticado (Mi Perfil, ver módulo Autenticación) |
  | GET/PUT | `/api/configuracion/tienda` | admin, contador |
  | GET | `/api/configuracion/sistema` | admin, contador |
- **Datos de entrada:** perfil: `name`, `phone`, `photo`; tienda: `company{name,nit,address,phone,email}`, `preferences{currency,dashboardDensity,lowStockAlert,visualMode}`.
- **Datos de salida:** perfil actualizado (con sincronización inmediata del nombre en el Topbar, sin recargar); `{ company, preferences }`; `{ language, notifications, backup, version }` (solo lectura, sin endpoint de escritura).
- **Validaciones implementadas:** formato de correo/campos de la empresa (Zod); "Sistema" no tiene endpoint `PUT`, por diseño es de solo lectura.
- **Flujo general:** `configuracion_tienda` es una tabla de una sola fila (patrón *singleton*, no hay múltiples tiendas); el frontend anida `company`/`preferences` en un solo objeto para la pestaña "Mi Tienda".
- **Observaciones:** verificadas en producción las 4 pestañas — Mi Perfil, Mi Tienda y Sistema cargan datos reales de la empresa (Grain Store, NIT 900123456-1) sin errores.
