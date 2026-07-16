# API_DOCUMENTATION.md — Grain Store

Referencia completa de la API REST del backend. Todas las rutas están montadas bajo
el prefijo `/api` (ej. `http://localhost:4000/api/clientes`).

## Convenciones generales

- **Formato:** JSON en cuerpo de petición y respuesta.
- **Autenticación:** todas las rutas, salvo `POST /api/auth/login`, requieren el header:
  ```
  Authorization: Bearer <token>
  ```
- **Errores:** formato uniforme en todas las rutas:
  ```json
  { "error": { "message": "Descripción legible", "code": "CODIGO_DE_ERROR", "details": [] } }
  ```
  `details` solo aparece en errores de validación (`code: "VALIDATION_ERROR"`), con
  un arreglo `[{ field, message }]` por cada campo inválido.
- **Códigos HTTP usados:** `200` OK, `201` creado, `204` sin contenido (eliminar),
  `400` datos inválidos / regla de negocio violada, `401` no autenticado, `403` sin
  permiso para el rol actual, `404` no encontrado, `409` conflicto (valor único
  duplicado).
- **Roles:** `admin`, `vendedor`, `contador`. Cada endpoint indica qué roles pueden
  usarlo; el resto recibe `403`.

---

## Auth (`/api/auth`)

### `POST /api/auth/login`
Público (no requiere token).

**Body**
```json
{ "email": "admin@grainstore.com", "password": "admin123", "role": "admin" }
```

**Respuesta 200**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1, "name": "Administrador", "email": "admin@grainstore.com",
    "role": "admin", "status": "Activo", "phone": "300 123 4567", "photo": null
  }
}
```

**Errores:** `401` credenciales inválidas o rol no coincide; `403` usuario inactivo.

### `GET /api/auth/me`
Roles: cualquiera autenticado. Retorna el usuario de la sesión actual.

### `PUT /api/auth/me`
Roles: cualquiera autenticado. Actualiza el propio perfil.

**Body** (todos los campos opcionales)
```json
{ "name": "Nuevo nombre", "phone": "300 000 0000", "photo": "data:image/png;base64,..." }
```

---

## Usuarios (`/api/usuarios`) — solo `admin`

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/usuarios` | Lista todos los usuarios |
| POST | `/api/usuarios` | Crea un usuario |
| PUT | `/api/usuarios/:id` | Edita un usuario |
| DELETE | `/api/usuarios/:id` | Elimina un usuario |

**Body de creación**
```json
{
  "name": "Nuevo Vendedor", "email": "nuevo@grainstore.com", "password": "clave123",
  "role": "vendedor", "status": "Activo", "phone": "300 111 2222"
}
```
`role` ∈ `admin | vendedor | contador`. `status` ∈ `Activo | Inactivo` (por defecto `Activo`).
`password` mínimo 6 caracteres.

**Body de edición:** los mismos campos, todos opcionales. Si `password` se omite o
viene vacío, la contraseña actual no cambia.

**Respuesta (creación/edición/list item)**
```json
{ "id": 4, "name": "Nuevo Vendedor", "email": "nuevo@grainstore.com", "role": "vendedor", "status": "Activo", "phone": "300 111 2222" }
```

---

## Clientes (`/api/clientes`) — `admin`, `vendedor`, `contador`

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/clientes?search=&tipo=&estado=` | Lista con filtros opcionales |
| POST | `/api/clientes` | Crea un cliente |
| PUT | `/api/clientes/:id` | Edita un cliente |
| DELETE | `/api/clientes/:id` | Elimina un cliente |

**Body**
```json
{
  "document": "900123456-1", "name": "Mercado El Trigal", "phone": "300 123 4567",
  "email": "compras@eltrigal.com", "address": "Cra 5 #12-34, Ibagué",
  "type": "Mayorista", "status": "Activo"
}
```
`type` ∈ `Minorista | Mayorista | Empresa | Otro`. `status` ∈ `Activo | Pendiente | Inactivo`.
`document` es único.

---

## Productos (`/api/productos`) — `admin`, `vendedor`

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/productos?search=&categoria=&estado=` | Lista con filtros; incluye `status` calculado |
| POST | `/api/productos` | Crea un producto |
| PUT | `/api/productos/:id` | Edita un producto |
| DELETE | `/api/productos/:id` | Elimina un producto |

**Body**
```json
{ "code": "ARR-001", "name": "Arroz Diana", "category": "Arroz", "stock": 48, "minStock": 10, "price": 4200 }
```
`category` ∈ `Arroz | Frijol | Maíz | Lenteja | Garbanzo | Trigo | Quinoa | Avena | Soya | Dulcería | Bebida | Otro`.
`code` es único.

**Respuesta** (incluye `status` calculado, no almacenado)
```json
{ "id": 1, "code": "ARR-001", "name": "Arroz Diana", "category": "Arroz", "stock": 48, "minStock": 10, "price": 4200, "status": "Normal" }
```
`status` es `Normal`, `Bajo stock` (cuando `stock <= minStock`) o `Agotado` (`stock <= 0`).

---

## Ventas (`/api/ventas`) — `admin`, `vendedor`

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/ventas?search=&estado=` | Lista de ventas (resumen, sin ítems) |
| GET | `/api/ventas/:id` | Detalle de una venta, con sus ítems |
| POST | `/api/ventas` | Crea una venta (transacción: descuenta stock) |
| DELETE | `/api/ventas/:id` | Elimina una venta (repone el stock de sus ítems) |

**Body de creación**
```json
{
  "customerId": 1,
  "date": "2026-07-16",
  "paymentMethod": "Contado",
  "status": "Pagada",
  "items": [
    { "productId": 1, "quantity": 2, "unitPrice": 4200 }
  ]
}
```
`paymentMethod` ∈ `Contado | Crédito`. `status` ∈ `Pagada | Pendiente | Anulada`.
`items` debe tener al menos un elemento. El `code` (`VEN-001`, `VEN-002`, ...) y el
`total` se calculan en el servidor; `usuarioId` se toma del token (el vendedor
autenticado que registra la venta).

**Errores de negocio (`400`)**
- `PRODUCT_NOT_FOUND`: algún `productId` no existe.
- `INSUFFICIENT_STOCK`: no hay stock suficiente para algún ítem (el mensaje indica el
  stock disponible).

**Respuesta (detalle)**
```json
{
  "id": 5, "code": "VEN-005", "customerId": 1, "customer": "Mercado El Trigal",
  "date": "2026-07-16", "paymentMethod": "Contado", "status": "Pagada", "total": 8400,
  "seller": "Vendedor",
  "items": [
    { "productId": 1, "product": "Arroz Diana", "quantity": 2, "unitPrice": 4200 }
  ]
}
```
La respuesta de `GET /api/ventas` (lista) trae los mismos campos **sin** `items`.

---

## Egresos (`/api/egresos`) — `admin`, `contador`

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/egresos?search=&categoria=` | Lista con filtros |
| POST | `/api/egresos` | Crea un egreso |
| PUT | `/api/egresos/:id` | Edita un egreso |
| DELETE | `/api/egresos/:id` | Elimina un egreso |

**Body**
```json
{ "date": "2026-07-16", "category": "Transporte", "description": "Flete proveedor regional", "value": 420000 }
```
`category` ∈ `Compra de mercancía | Transporte | Nómina | Servicios | Mantenimiento | Otros`.
El `code` (`EGR-001`, ...) se genera en el servidor, y `responsible` se toma del
usuario autenticado (no se recibe por body).

**Respuesta**
```json
{ "id": 4, "code": "EGR-004", "date": "2026-07-16", "category": "Transporte", "description": "Flete proveedor regional", "value": 420000, "responsible": "Administrador" }
```

---

## Dashboard (`/api/dashboard`) — `admin`, `vendedor`, `contador`

### `GET /api/dashboard`
Retorna estadísticas calculadas en tiempo real, con una forma distinta según el rol
del token (el `vendedor` solo ve sus propias ventas):

```json
{
  "title": "Bienvenido, Administrador",
  "subtitle": "...",
  "stats": [ { "label": "Ventas del Dia", "value": 0, "type": "currency", "badge": "Hoy", "icon": "sales", "tone": "green" } ],
  "chartTitle": "Resumen de Actividad",
  "chartSeries": [ { "label": "Ene", "value": 0 } ],
  "indicators": [ { "label": "Ventas registradas", "value": "3", "detail": "Operaciones del mes" } ],
  "tableTitle": "Movimientos Recientes",
  "movements": [ { "id": 3, "date": "2026-06-22", "customer": "Distribuidora La Cosecha", "amount": 609000 } ]
}
```
Para `contador`, cada elemento de `chartSeries` incluye además `secondary` (egresos
del mes, para el gráfico de barras dobles).

---

## Reportes (`/api/reportes`) — `admin`, `contador`

### `GET /api/reportes`
Agregación financiera calculada sobre **todos** los registros históricos de ventas y
egresos.

```json
{
  "stats": [ { "label": "Ventas Totales", "value": 859800, "type": "currency", "badge": "Histórico", "tone": "green" } ],
  "indicators": [ { "label": "Margen neto", "value": "61%", "detail": "..." } ],
  "monthly": [ { "label": "Ene", "income": 0, "expenses": 0 } ],
  "topProducts": [ { "name": "Arroz Diana", "quantity": 110 } ],
  "frequentCustomers": [ { "name": "Mercado El Trigal", "count": 1 } ],
  "totals": { "income": 859800, "expenses": 4350000, "profit": -3490200, "salesCount": 3 }
}
```
`monthly[].income` / `monthly[].expenses` están en pesos colombianos reales (no
escalados).

---

## Configuración (`/api/configuracion`) — `admin`, `contador`

### `GET /api/configuracion/tienda`
```json
{
  "company": { "name": "Grain Store", "nit": "900123456-1", "address": "Cra 5 #12-34, Ibagué", "phone": "300 123 4567", "email": "contacto@grainstore.com" },
  "preferences": { "currency": "COP", "dashboardDensity": "Cómoda", "lowStockAlert": "10 unidades", "visualMode": "Claro / Oscuro" }
}
```

### `PUT /api/configuracion/tienda`
**Body** (ambos grupos opcionales, campos dentro de cada grupo también opcionales)
```json
{ "company": { "phone": "300 999 8888" }, "preferences": { "currency": "COP" } }
```
Respuesta: el mismo objeto de `GET`, ya actualizado.

### `GET /api/configuracion/sistema`
Solo lectura (no tiene `PUT`); valores fijos de la aplicación.
```json
{ "language": "Español", "notifications": "Activas", "backup": "Semanal", "version": "1.0 académico" }
```

---

## Utilidad

### `GET /api/health`
Público. Usado para verificar que el servidor está arriba: `{ "status": "ok" }`.
