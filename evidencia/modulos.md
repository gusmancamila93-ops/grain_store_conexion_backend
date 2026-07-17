# Documentación detallada por módulo — Grain Store

Ficha completa de cada módulo del sistema. Para el detalle exacto de cada endpoint
(cuerpos de petición, respuestas de ejemplo, códigos de error), ver
[`../API_DOCUMENTATION.md`](../API_DOCUMENTATION.md).

---

## 1. Auth (Autenticación)

| | |
|---|---|
| **Objetivo** | Identificar al usuario y su rol; mantener la sesión activa. |
| **Funcionalidad** | Login, cierre de sesión, consulta y edición del propio perfil. |
| **Tecnologías** | JWT (`jsonwebtoken`), bcrypt, zod, Express Router, React Context (`AuthProvider`) |
| **Entradas** | Formulario de login: `correo`, `contraseña`, `rol`. Formulario de perfil: `nombre`, `teléfono`, `foto` (base64). |
| **Procesamiento** | Verifica credenciales (`bcrypt.compare`), valida que el rol coincida con el registrado, firma JWT `{ id, rol, nombre }` con expiración de 8h. |
| **Salidas** | `{ token, user }` en login. Objeto de usuario en `/me`. |
| **Dependencias** | Tabla `usuarios`. Su token es requisito de todos los demás módulos. |

| Endpoint | Rol |
|---|---|
| `POST /api/auth/login` | público |
| `GET /api/auth/me` | cualquier rol autenticado |
| `PUT /api/auth/me` | cualquier rol autenticado |

---

## 2. Usuarios

| | |
|---|---|
| **Objetivo** | Administración de las cuentas del sistema. |
| **Funcionalidad** | Listar, crear, editar, eliminar usuarios. |
| **Tecnologías** | Express, Prisma, bcrypt, zod |
| **Entradas** | `nombre`, `correo`, `contraseña`, `rol`, `estado`, `teléfono` |
| **Procesamiento** | Valida unicidad de correo; hashea la contraseña si se provee; en edición, la contraseña es opcional (si se omite, no cambia). |
| **Salidas** | Listado/ficha de usuario, sin exponer nunca el hash de la contraseña. |
| **Dependencias** | Tabla `usuarios`; consumido por `auth` para el login. |

| Endpoint | Rol |
|---|---|
| `GET /api/usuarios` | `admin` |
| `POST /api/usuarios` | `admin` |
| `PUT /api/usuarios/:id` | `admin` |
| `DELETE /api/usuarios/:id` | `admin` |

---

## 3. Clientes

| | |
|---|---|
| **Objetivo** | Mantener la cartera de clientes de la tienda. |
| **Funcionalidad** | CRUD completo, búsqueda y filtros por tipo/estado. |
| **Tecnologías** | Express, Prisma, zod |
| **Entradas** | `documento`, `nombre`, `teléfono`, `correo`, `dirección`, `tipo`, `estado` |
| **Procesamiento** | Valida unicidad de documento; aplica filtros de búsqueda (`LIKE`) sobre documento/nombre/teléfono/correo/dirección. |
| **Salidas** | Listado y ficha de cliente. |
| **Dependencias** | Tabla `clientes`; referenciada por `ventas`. |

| Endpoint | Rol |
|---|---|
| `GET /api/clientes` | `admin`, `vendedor`, `contador` |
| `POST /api/clientes` | `admin`, `vendedor`, `contador` |
| `PUT /api/clientes/:id` | `admin`, `vendedor`, `contador` |
| `DELETE /api/clientes/:id` | `admin`, `vendedor`, `contador` |

---

## 4. Productos

| | |
|---|---|
| **Objetivo** | Control de inventario. |
| **Funcionalidad** | CRUD completo; estado de stock calculado automáticamente. |
| **Tecnologías** | Express, Prisma, zod |
| **Entradas** | `código`, `nombre`, `categoría`, `stock`, `stock mínimo`, `precio` |
| **Procesamiento** | Valida unicidad de código; calcula `status` (`Normal` / `Bajo stock` / `Agotado`) en cada respuesta, comparando `stock` contra `stockMinimo` (no se almacena en la base de datos). |
| **Salidas** | Listado y ficha de producto, incluyendo `status` calculado. |
| **Dependencias** | Tabla `productos`; referenciada por `detalle_ventas`. |

| Endpoint | Rol |
|---|---|
| `GET /api/productos` | `admin`, `vendedor` |
| `POST /api/productos` | `admin`, `vendedor` |
| `PUT /api/productos/:id` | `admin`, `vendedor` |
| `DELETE /api/productos/:id` | `admin`, `vendedor` |

---

## 5. Ventas

| | |
|---|---|
| **Objetivo** | Registrar operaciones comerciales manteniendo el inventario consistente. |
| **Funcionalidad** | Listar (con filtros), ver detalle con ítems, crear una venta, eliminar una venta. |
| **Tecnologías** | Express, Prisma (`$transaction`), zod |
| **Entradas** | `cliente`, `fecha`, `método de pago`, `estado`, `producto(s)`, `cantidad(es)`, `precio(s) unitario(s)` |
| **Procesamiento** | Verifica existencia y stock suficiente de cada producto **antes** de crear la venta; dentro de una transacción de base de datos crea la venta + sus ítems (`detalle_ventas`) y descuenta el stock; al eliminar, repone el stock en otra transacción. El código (`VEN-00X`) y el `total` se calculan en el servidor; el vendedor se toma del token JWT. |
| **Salidas** | Venta creada con `code`/`total` calculados; listado (resumen, sin ítems); detalle (con ítems). |
| **Dependencias** | Tablas `ventas` y `detalle_ventas`; depende de `clientes` y `productos`; alimenta `dashboard` y `reportes`. |

| Endpoint | Rol |
|---|---|
| `GET /api/ventas` | `admin`, `vendedor` |
| `GET /api/ventas/:id` | `admin`, `vendedor` |
| `POST /api/ventas` | `admin`, `vendedor` |
| `DELETE /api/ventas/:id` | `admin`, `vendedor` |

**Errores de negocio propios de este módulo:** `PRODUCT_NOT_FOUND` (producto
inexistente), `INSUFFICIENT_STOCK` (stock insuficiente, indica el disponible).

---

## 6. Egresos

| | |
|---|---|
| **Objetivo** | Control de gastos del negocio. |
| **Funcionalidad** | CRUD completo, filtro por categoría y búsqueda. |
| **Tecnologías** | Express, Prisma, zod |
| **Entradas** | `fecha`, `categoría`, `descripción`, `valor` |
| **Procesamiento** | Genera el código (`EGR-00X`) en el servidor; asigna el responsable automáticamente desde el usuario autenticado (nunca desde el body, por seguridad). |
| **Salidas** | Listado y ficha de egreso, con el nombre del responsable resuelto. |
| **Dependencias** | Tabla `egresos`; depende de `usuarios`; alimenta `dashboard` (rol contador) y `reportes`. |

| Endpoint | Rol |
|---|---|
| `GET /api/egresos` | `admin`, `contador` |
| `POST /api/egresos` | `admin`, `contador` |
| `PUT /api/egresos/:id` | `admin`, `contador` |
| `DELETE /api/egresos/:id` | `admin`, `contador` |

---

## 7. Dashboard

| | |
|---|---|
| **Objetivo** | Visibilidad inmediata del estado del negocio, adaptada al rol. |
| **Funcionalidad** | Estadísticas del día/mes, gráfica de actividad (12 meses), indicadores, movimientos recientes. |
| **Tecnologías** | Express, Prisma |
| **Entradas** | Ninguna explícita; usa el rol del token. |
| **Procesamiento** | `admin`: agrega todas las ventas/productos/clientes. `vendedor`: filtra solo sus propias ventas. `contador`: agrega ventas y egresos del mes con balance. Todo calculado en tiempo real (sin datos mock). |
| **Salidas** | Objeto `{ title, subtitle, stats, chartTitle, chartSeries, indicators, tableTitle, movements }`, con forma distinta según el rol. |
| **Dependencias** | Lee `ventas`, `productos`, `clientes`, `egresos`. |

| Endpoint | Rol |
|---|---|
| `GET /api/dashboard` | `admin`, `vendedor`, `contador` |

---

## 8. Reportes

| | |
|---|---|
| **Objetivo** | Análisis financiero histórico del negocio. |
| **Funcionalidad** | Ingresos, egresos, utilidad, clientes con deuda, margen neto, producto líder, ticket promedio, productos más vendidos, clientes frecuentes, resumen mensual de 12 meses. |
| **Tecnologías** | Express, Prisma |
| **Entradas** | Ninguna explícita; restringido por rol. |
| **Procesamiento** | Agrega **todo el histórico** de ventas y egresos (no solo el mes actual); agrupa por mes y por producto/cliente. |
| **Salidas** | Objeto `{ stats, indicators, monthly, topProducts, frequentCustomers, totals }`. |
| **Dependencias** | Lee `ventas`, `detalle_ventas`, `egresos`. |

| Endpoint | Rol |
|---|---|
| `GET /api/reportes` | `admin`, `contador` |

---

## 9. Configuración

| | |
|---|---|
| **Objetivo** | Datos generales de la tienda y del sistema. |
| **Funcionalidad** | Consultar/editar datos de la empresa y preferencias visuales; consultar información de sistema (solo lectura). |
| **Tecnologías** | Express, Prisma, zod |
| **Entradas** | `nombre`, `NIT`, `dirección`, `teléfono`, `correo`, `moneda`, `densidad del dashboard`, `alerta de bajo stock`, `modo visual` |
| **Procesamiento** | Lee/actualiza la única fila de `configuracion_tienda` (patrón *singleton*: no hay múltiples tiendas). |
| **Salidas** | `{ company, preferences }`; `{ language, notifications, backup, version }` (solo lectura). |
| **Dependencias** | Tabla `configuracion_tienda`. |

| Endpoint | Rol |
|---|---|
| `GET /api/configuracion/tienda` | `admin`, `contador` |
| `PUT /api/configuracion/tienda` | `admin`, `contador` |
| `GET /api/configuracion/sistema` | `admin`, `contador` |

---

## 10. Utilidad

| Endpoint | Rol |
|---|---|
| `GET /api/health` | público (verificación de disponibilidad del servidor) |
