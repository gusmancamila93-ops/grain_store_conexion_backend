# ANÁLISIS_BACKEND.md — Grain Store

> Fase 1 — Análisis del frontend existente antes de diseñar e implementar el backend.
> Este documento NO contiene código. Es la base para la Fase 2 (diseño de arquitectura).

---

## 1. Stack actual (frontend)

| Aspecto | Detalle |
|---|---|
| Framework | React 19 + Vite 8 |
| Enrutamiento | React Router DOM 7 (`createBrowserRouter`) |
| Estilos | Tailwind CSS 4 + CSS propio (`index.css`), Radix UI, shadcn |
| Iconos | lucide-react |
| Persistencia actual | **`window.localStorage`** (no hay backend, ni API, ni base de datos real) |
| Autenticación actual | Simulada: arreglo `MOCK_USERS` en memoria + sesión guardada en `localStorage` |
| Gestión de estado | `useState`/`useMemo` locales por página + un `AuthContext` global |

No existe ninguna llamada `fetch`/`axios` en el proyecto: **toda la "persistencia" se hace leyendo y escribiendo JSON en `localStorage`** a través de los archivos en `src/services/*Service.js`.

---

## 2. Rutas de la aplicación

Definidas en [src/routes/router.jsx](src/routes/router.jsx) y [src/routes/routeConfig.js](src/routes/routeConfig.js).

### Rutas públicas (AuthLayout)
| Ruta | Página | Estado |
|---|---|---|
| `/login` | `LoginPage` | Funcional (contra `MOCK_USERS`) |
| `/registro` | `RegisterPage` | **Placeholder**, sin formulario ni lógica real |

### Rutas protegidas por rol (`RoleGuard` + `AppLayout`)
El `RoleGuard` valida `isAuthenticated` y que `session.role` esté en `allowedRoles`; si no, redirige a `/login` o al home del rol.

| Rol | Rutas disponibles |
|---|---|
| **admin** | `/admin/dashboard`, `/admin/ventas`, `/admin/ventas/nueva`, `/admin/clientes`, `/admin/productos`, `/admin/egresos`, `/admin/reportes`, `/admin/configuracion` |
| **vendedor** | `/vendedor/dashboard`, `/vendedor/ventas`, `/vendedor/ventas/nueva`, `/vendedor/clientes`, `/vendedor/productos` (sin egresos, reportes ni configuración) |
| **contador** | `/contador/dashboard`, `/contador/clientes`, `/contador/egresos`, `/contador/reportes`, `/contador/configuracion` (sin ventas ni productos) |

Los 3 roles comparten los **mismos componentes de página** (`DashboardPage`, `SalesPage`, etc.); el comportamiento cambia según `role` (pasado por `useOutletContext`), no según rutas distintas por rol. Esto implica que la autorización de operaciones (crear/editar/eliminar) debe reforzarse en el backend, ya que en el frontend solo se ocultan enlaces del menú.

---

## 3. Pantallas identificadas

| Página | Archivo | Rol(es) | Funcionalidad |
|---|---|---|---|
| Login | [LoginPage.jsx](src/pages/auth/LoginPage.jsx) | Todos | Formulario rol+correo+contraseña, botones de "usuario demo" |
| Registro | [RegisterPage.jsx](src/pages/auth/RegisterPage.jsx) | — | Placeholder vacío |
| Dashboard | [DashboardPage.jsx](src/pages/dashboard/DashboardPage.jsx) | admin, vendedor, contador | KPIs, gráfico de barras, indicadores, tabla de movimientos recientes (contenido distinto según rol) |
| Ventas | [SalesPage.jsx](src/pages/sales/SalesPage.jsx) | admin, vendedor | Listado, filtros (código/cliente, estado), KPIs, modal de detalle, eliminar venta |
| Nueva venta | [NewSalePage.jsx](src/pages/sales/NewSalePage.jsx) | admin, vendedor | Formulario de registro de venta (1 producto por venta actualmente) |
| Clientes | [CustomersPage.jsx](src/pages/customers/CustomersPage.jsx) | admin, vendedor, contador | CRUD completo (crear, listar, filtrar, buscar, editar en modal, eliminar) |
| Productos | [ProductsPage.jsx](src/pages/products/ProductsPage.jsx) | admin, vendedor | CRUD completo + estado calculado (Normal/Bajo stock/Agotado) |
| Egresos | [ExpensesPage.jsx](src/pages/expenses/ExpensesPage.jsx) | admin, contador | CRUD completo, filtros por categoría/búsqueda |
| Reportes | [ReportsPage.jsx](src/pages/reports/ReportsPage.jsx) | admin, contador | KPIs calculados desde ventas+egresos reales de localStorage, combinados con datos mock estáticos (mensuales) |
| Configuración | [SettingsPage.jsx](src/pages/settings/SettingsPage.jsx) | admin, contador | Tabs: Perfil (con foto en base64), Sistema (solo lectura), Mi Tienda (empresa+preferencias), Usuarios (CRUD, solo admin) |

---

## 4. Componentes reutilizables

`src/components/common/`: `EmptyState`, `FormCard`, `Modal`, `StatCard`, `TableCard`, `SearchInput`, `Tabs`, `ChartCard`, `AvatarUploader`.
`src/components/layout/`: `Sidebar`, `Topbar`, `MobileOverlay`, `ThemeToggle`.
`src/components/ui/`: `button.jsx` (shadcn).

Todos son de presentación (reciben `props`/`children`), no contienen lógica de datos propia — la lógica vive en cada página + los `*Service.js`. **No es necesario modificarlos** para la integración con la API; solo cambiará el origen de los datos que reciben.

---

## 5. Entidades del sistema (a persistir en base de datos)

### 5.1 Usuario / Autenticación — **inconsistencia detectada**
Actualmente existen **dos fuentes distintas** para "usuarios" que deberán unificarse en el backend:

- `authService.MOCK_USERS` ([authService.js](src/services/authService.js)): `id, name, email, password (texto plano), role (admin|vendedor|contador)`. Se usa para el login.
- `usuariosService.seedUsers` ([usuariosService.js](src/services/usuariosService.js)): `id, name, email, role (Administrador|Vendedor|Contador), status (Activo|Inactivo)`. Se usa en la pestaña "Usuarios" de Configuración (CRUD, solo visible para admin), **pero no está conectado con el login** — son datos completamente independientes.

→ En el backend deben convertirse en **una sola entidad `Usuario`** con rol normalizado (enum) y estado, contraseña con hash (bcrypt) y usada tanto para autenticación (JWT) como para el CRUD de usuarios.

### 5.2 Cliente
`id, document (NIT/documento), name, phone, email, address, type (Minorista|Mayorista|Empresa|Otro), status (Activo|Pendiente|Inactivo)`.
Fuente: [clientesService.js](src/services/clientesService.js).

### 5.3 Producto
`id, code, name, category, stock, minStock, price`. Estado (`Normal`/`Bajo stock`/`Agotado`) se **calcula**, no se almacena (comparando `stock` con `minStock`).
Categorías usadas en el formulario: Arroz, Frijol, Maíz, Lenteja, Garbanzo, Trigo, Quinoa, Avena, Soya, Dulcería, Bebida, Otro.
Fuente: [productosService.js](src/services/productosService.js).

### 5.4 Venta + Detalle de Venta
`Venta: id, code, customer (nombre, hoy texto libre), date, paymentMethod (Contado|Crédito), status (Pagada|Pendiente|Anulada), total (calculado)`.
`items[]: product (nombre, texto libre), quantity, unitPrice`.
Fuente: [ventasService.js](src/services/ventasService.js).
**Nota:** actualmente `customer` y `items[].product` se guardan como **texto libre**, no como relación por id — deberán normalizarse a `clienteId` y `productoId` (FK) en el backend, y el `NewSalePage` solo permite 1 producto por venta (aunque el modelo soporta varios ítems).

### 5.5 Egreso
`id, code, date, category, description, value, responsible (nombre en texto libre)`.
Categorías: Compra de mercancía, Transporte, Nómina, Servicios, Mantenimiento, Otros.
Fuente: [egresosService.js](src/services/egresosService.js).
`responsible` debería normalizarse a `usuarioId` (FK).

### 5.6 Configuración (por instancia/tienda, y por usuario)
- `profile` (por usuario): `name, email, phone, photo (base64)`.
- `company` (global/tienda): `name, nit, address, phone, email`.
- `preferences` (global): `currency, dashboardDensity, lowStockAlert, visualMode`.
- `system` (global, solo lectura en UI): `language, notifications, backup, version`.
Fuente: [configService.js](src/services/configService.js).

### 5.7 Dashboard / Reportes (datos derivados, no entidades propias)
- `dashboardMock` ([mockData.js](src/data/mockData.js)): stats, series de gráfico e indicadores **totalmente estáticos**, distintos por rol (admin/vendedor/contador). No se recalculan a partir de datos reales.
- `dashboardMovements`: arreglo estático de 4 movimientos (fecha, cliente, monto) — debería sustituirse por las ventas reales más recientes.
- `reportesService.getReports()` ([reportesService.js](src/services/reportesService.js)): es **híbrido** — combina datos estáticos (`reportesMock.stats/indicators/monthly`) con agregados reales calculados en el cliente a partir de `ventasService.readSales()` y `egresosService.readExpenses()` (ingresos, egresos, utilidad, productos más vendidos, clientes frecuentes).

En el backend, todo esto debe convertirse en **endpoints de agregación** (reales, calculados en servidor) en lugar de mezclarse con mocks.

---

## 6. Almacenamiento actual (localStorage) — claves usadas

De [storage.js](src/services/storage.js):

```
usuarios_gs, clientes_gs, deudores_gs (no usado en ningún service), productos_gs,
ventas, egresos_gs, session_gs, theme, userPhoto (no usado, la foto real va dentro de config_perfil),
config_perfil, config_sistema, config_tienda, tienda_logo (no usado)
```

Nota: `configService.js` en realidad usa una clave propia `"config_grain_store"` (no las de `STORAGE_KEYS.perfil/sistema/tienda`), y varias claves de `STORAGE_KEYS` (`deudores`, `userPhoto`, `tiendaLogo`) están declaradas pero **no se usan en ningún lado** — código muerto/planeado pero no implementado.

---

## 7. Código muerto / stubs sin implementar (a tener en cuenta, no a "arreglar" en Fase 1)

- [src/utils/idGenerator.js](src/utils/idGenerator.js) — función vacía, retorna `""`, no se usa.
- [src/utils/presentaciones.js](src/utils/presentaciones.js) — objeto vacío, no se usa.
- [src/hooks/useLocalStorageList.js](src/hooks/useLocalStorageList.js) — hook vacío, retorna `[]`, no se usa (las páginas usan los `*Service.js` directamente, no este hook).
- `RegisterPage` — placeholder, sin campos ni lógica.
- Actualmente los IDs se generan con `` `prefijo-${Date.now()}` `` directamente en cada service (no hay un generador de UUID centralizado).

---

## 8. Funcionalidades por pantalla (resumen operativo)

| Módulo | Crear | Leer/Listar | Actualizar | Eliminar | Filtros/Búsqueda | KPIs propios |
|---|---|---|---|---|---|---|
| Clientes | ✅ | ✅ | ✅ (modal) | ✅ | texto + tipo + estado | ✅ (total/activos/pendientes/inactivos) |
| Productos | ✅ | ✅ | ✅ (modal) | ✅ | texto + categoría + estado | ✅ (total/normal/bajo/agotado) |
| Ventas | ✅ (página aparte) | ✅ | ❌ (no hay edición, solo ver detalle) | ✅ | texto + estado | ✅ (total vendido/registros/pagadas/pendientes) |
| Egresos | ✅ | ✅ | ✅ (modal) | ✅ | texto + categoría | ✅ (total/registros/mercancía) |
| Usuarios (config) | ✅ | ✅ | ✅ (modal) | ✅ | — | — |
| Configuración perfil/tienda | — | ✅ | ✅ | — | — | — |
| Reportes | — | ✅ (agregado) | — | — | — | ✅ |
| Dashboard | — | ✅ (mock) | — | — | — | ✅ |
| Autenticación | login | sesión actual | — | logout | — | — |

---

## 9. Información que debe persistirse en base de datos (resumen para Fase 2)

1. **Usuarios** (unificando auth + gestión de usuarios): credenciales con hash, rol, estado, perfil (nombre, correo, teléfono, foto).
2. **Clientes**: datos completos de cartera.
3. **Productos**: inventario con stock y precio.
4. **Ventas** y **Detalle de venta** (relación 1:N con Producto y N:1 con Cliente y Usuario-vendedor).
5. **Egresos** (relación N:1 con Usuario-responsable).
6. **Configuración de tienda/empresa** (probablemente una sola fila/global, o por tenant si se contempla multi-tienda a futuro — no es el caso aquí).
7. **Configuración de preferencias** (probablemente global, ya que hoy no está separada por usuario, salvo `profile`).

Datos que **no** requieren tabla propia (se calculan on-the-fly en endpoints de agregación): stats de dashboard, indicadores, "productos más vendidos", "clientes frecuentes", resumen mensual de reportes, estado de stock del producto (Normal/Bajo/Agotado).

---

## 10. Preguntas abiertas antes de pasar a Fase 2

Ninguna bloqueante detectada — el frontend tiene suficiente información (formularios, servicios y mocks) para inferir el modelo de datos completo. Un par de decisiones de diseño que definiré en la Fase 2 y que se pueden ajustar si lo prefieres:

- Unificar `MOCK_USERS` (auth) y `seedUsers` (gestión) en una sola tabla `usuarios`, con rol normalizado en minúsculas (`admin`, `vendedor`, `contador`) para que coincida con `ROLE_HOME`/`RoleGuard`.
- Normalizar `Venta.customer` → `clienteId` y `VentaItem.product` → `productoId` (FK reales en lugar de texto libre), y permitir múltiples ítems por venta en `NewSalePage` (el modelo de datos ya lo soporta; hoy la UI solo captura uno).
- Tratar `Egreso.responsible` como `usuarioId` (FK) en lugar de texto libre.
- Los "datos mock" de Dashboard y Reportes se sustituirán por cálculos reales sobre la base de datos, respetando la misma forma de los objetos que ya consume la UI (para no tocar el diseño).

Quedo a la espera de tu confirmación para cerrar la Fase 1 y avanzar a la **Fase 2 — Diseño de arquitectura** (Node.js + Express + MySQL + Prisma + JWT + bcrypt + dotenv).
