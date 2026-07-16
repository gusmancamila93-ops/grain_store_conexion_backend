# DISEÑO_BACKEND.md — Grain Store

> Fase 2 — Diseño de arquitectura. Basado en [ANALISIS_BACKEND.md](ANALISIS_BACKEND.md).
> Este documento define la arquitectura, módulos, entidades, endpoints y flujo de integración.
> No contiene implementación todavía (eso es la Fase 3).

---

## 1. Arquitectura general

**Arquitectura por capas (layered architecture)**, organizada además **por módulo de negocio** (un paquete por entidad), para que cada módulo sea autocontenible y fácil de ubicar — cumpliendo el criterio de "dividir el código por módulos y paquetes".

```
Cliente (React)
      │  fetch/JSON + JWT (Authorization: Bearer <token>)
      ▼
┌─────────────────────────────────────────────┐
│                Express App                   │
│  Middlewares globales: helmet, cors, morgan,  │
│  express.json(), rate-limit (opcional)        │
├─────────────────────────────────────────────┤
│  Routes         → define endpoints y aplica   │
│                    middlewares de auth/rol    │
│  Controllers    → reciben req/res, validan     │
│                    entrada, llaman al service  │
│  Services       → lógica de negocio            │
│  Prisma Client  → acceso a datos (ORM)         │
├─────────────────────────────────────────────┤
│              MySQL (grain_store_db)           │
└─────────────────────────────────────────────┘
```

**Flujo de una petición:** `Route → Middleware (auth/rol/validación) → Controller → Service → Prisma → MySQL` y la respuesta regresa por el mismo camino, con manejo de errores centralizado en un middleware final.

---

## 2. Estructura de carpetas propuesta

```
grain_stote/
├── src/                     ← frontend existente (no se toca su diseño)
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   └── seed.js
│   ├── src/
│   │   ├── config/
│   │   │   ├── env.js           # carga y valida variables de entorno
│   │   │   ├── db.js            # instancia única de PrismaClient
│   │   │   └── cors.js          # opciones de CORS
│   │   ├── middlewares/
│   │   │   ├── authenticate.js  # verifica JWT
│   │   │   ├── authorize.js     # valida rol permitido
│   │   │   ├── validate.js      # valida body/query con esquemas zod
│   │   │   └── errorHandler.js  # captura errores y responde JSON uniforme
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   │   ├── auth.routes.js
│   │   │   │   ├── auth.controller.js
│   │   │   │   ├── auth.service.js
│   │   │   │   └── auth.schema.js
│   │   │   ├── usuarios/
│   │   │   ├── clientes/
│   │   │   ├── productos/
│   │   │   ├── ventas/
│   │   │   ├── egresos/
│   │   │   ├── reportes/
│   │   │   ├── dashboard/
│   │   │   └── configuracion/
│   │   │       (cada módulo con .routes/.controller/.service/.schema)
│   │   ├── utils/
│   │   │   ├── ApiError.js      # clase de error con statusCode
│   │   │   ├── asyncHandler.js  # wrapper para evitar try/catch repetido
│   │   │   ├── jwt.js           # firmar/verificar tokens
│   │   │   └── password.js      # hash/compare con bcrypt
│   │   ├── app.js               # configuración de Express (sin listen)
│   │   └── server.js            # arranque del servidor
│   ├── .env.example
│   └── package.json
```

El backend vive en su propia carpeta `backend/` dentro del repo actual (no se crea un repositorio nuevo), con su propio `package.json`, independiente del frontend mientras no se necesite un monorepo con workspaces.

---

## 3. Módulos del sistema

| Módulo | Responsabilidad |
|---|---|
| `auth` | Login, emisión de JWT, endpoint "quién soy" (`/me`), actualización del propio perfil |
| `usuarios` | CRUD de usuarios del sistema (solo admin) |
| `clientes` | CRUD de cartera de clientes |
| `productos` | CRUD de inventario, cálculo de estado de stock |
| `ventas` | Registro y consulta de ventas + detalle (ítems), control de stock al vender |
| `egresos` | CRUD de egresos financieros |
| `reportes` | Agregaciones: ingresos/egresos, productos más vendidos, clientes frecuentes, resumen mensual |
| `dashboard` | Estadísticas e indicadores según el rol autenticado |
| `configuracion` | Datos de la tienda, preferencias visuales, info del sistema (solo lectura) |

---

## 4. Entidades y relaciones

```mermaid
erDiagram
    USUARIO ||--o{ VENTA : "registra"
    USUARIO ||--o{ EGRESO : "es responsable de"
    CLIENTE ||--o{ VENTA : "compra"
    VENTA ||--o{ DETALLE_VENTA : "contiene"
    PRODUCTO ||--o{ DETALLE_VENTA : "aparece en"

    USUARIO {
        int id PK
        string nombre
        string correo UK
        string passwordHash
        enum rol
        enum estado
        string telefono
        text foto
    }
    CLIENTE {
        int id PK
        string documento UK
        string nombre
        string telefono
        string correo
        string direccion
        enum tipo
        enum estado
    }
    PRODUCTO {
        int id PK
        string codigo UK
        string nombre
        string categoria
        int stock
        int stockMinimo
        decimal precio
    }
    VENTA {
        int id PK
        string codigo UK
        int clienteId FK
        int usuarioId FK
        datetime fecha
        string metodoPago
        enum estado
        decimal total
    }
    DETALLE_VENTA {
        int id PK
        int ventaId FK
        int productoId FK
        int cantidad
        decimal precioUnitario
    }
    EGRESO {
        int id PK
        string codigo UK
        datetime fecha
        string categoria
        string descripcion
        decimal valor
        int usuarioId FK
    }
```

### Decisiones de normalización (resolviendo lo detectado en Fase 1)
- **Un solo `Usuario`** para autenticación y gestión (unifica `MOCK_USERS` y `seedUsers`), con `rol` en minúsculas (`admin`, `vendedor`, `contador`) para que coincida tal cual con `ROLE_HOME`/`RoleGuard` del frontend.
- **`Venta.cliente` y `DetalleVenta.producto` se vuelven relaciones reales** (`clienteId`, `productoId`) en vez de texto libre.
- **`Egreso.responsible` se vuelve `usuarioId`** (FK), tomado automáticamente del usuario autenticado al crear el egreso.
- **`Venta` permite múltiples ítems** (el modelo ya lo soportaba; en Fase 4 se ajustará `NewSalePage` para poder agregar más de un producto por venta, sin cambiar el diseño visual, solo añadiendo la posibilidad de repetir la fila de producto).
- Campos de "lista cerrada" con tildes/espacios (`categoria` de producto, `categoria` de egreso, `metodoPago`) se guardan como `String` y se validan en el backend contra listas constantes (ver `constants.js` compartido), en lugar de `enum` de base de datos — así se pueden ampliar sin migraciones. Los campos cortos y críticos para autorización (`rol`, `estado`) sí usan `enum`.
- El estado de producto (`Normal`/`Bajo stock`/`Agotado`) **no se almacena**: se calcula en el backend igual que hoy lo hace `productosService.getStatus()`.
- `ConfiguracionSistema` (idioma, notificaciones, backup, versión) es de solo lectura en toda la UI actual → se sirve desde constantes/variables de entorno, no desde una tabla.

---

## 5. Modelo de base de datos (Prisma schema — borrador de diseño)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

enum RolUsuario {
  admin
  vendedor
  contador
}

enum EstadoUsuario {
  Activo
  Inactivo
}

enum TipoCliente {
  Minorista
  Mayorista
  Empresa
  Otro
}

enum EstadoCliente {
  Activo
  Pendiente
  Inactivo
}

enum EstadoVenta {
  Pagada
  Pendiente
  Anulada
}

model Usuario {
  id           Int           @id @default(autoincrement())
  nombre       String
  correo       String        @unique
  passwordHash String        @map("password_hash")
  rol          RolUsuario
  estado       EstadoUsuario @default(Activo)
  telefono     String?
  foto         String?       @db.Text
  ventas       Venta[]
  egresos      Egreso[]
  createdAt    DateTime      @default(now()) @map("created_at")
  updatedAt    DateTime      @updatedAt @map("updated_at")

  @@map("usuarios")
}

model Cliente {
  id        Int           @id @default(autoincrement())
  documento String        @unique
  nombre    String
  telefono  String
  correo    String
  direccion String
  tipo      TipoCliente   @default(Minorista)
  estado    EstadoCliente @default(Activo)
  ventas    Venta[]
  createdAt DateTime      @default(now()) @map("created_at")
  updatedAt DateTime      @updatedAt @map("updated_at")

  @@map("clientes")
}

model Producto {
  id          Int            @id @default(autoincrement())
  codigo      String         @unique
  nombre      String
  categoria   String
  stock       Int            @default(0)
  stockMinimo Int            @default(0) @map("stock_minimo")
  precio      Decimal        @db.Decimal(12, 2)
  detalles    DetalleVenta[]
  createdAt   DateTime       @default(now()) @map("created_at")
  updatedAt   DateTime       @updatedAt @map("updated_at")

  @@map("productos")
}

model Venta {
  id         Int            @id @default(autoincrement())
  codigo     String         @unique
  clienteId  Int            @map("cliente_id")
  usuarioId  Int            @map("usuario_id")
  fecha      DateTime
  metodoPago String         @map("metodo_pago")
  estado     EstadoVenta    @default(Pagada)
  total      Decimal        @db.Decimal(12, 2)
  cliente    Cliente        @relation(fields: [clienteId], references: [id])
  usuario    Usuario        @relation(fields: [usuarioId], references: [id])
  items      DetalleVenta[]
  createdAt  DateTime       @default(now()) @map("created_at")
  updatedAt  DateTime       @updatedAt @map("updated_at")

  @@map("ventas")
}

model DetalleVenta {
  id             Int      @id @default(autoincrement())
  ventaId        Int      @map("venta_id")
  productoId     Int      @map("producto_id")
  cantidad       Int
  precioUnitario Decimal  @db.Decimal(12, 2) @map("precio_unitario")
  venta          Venta    @relation(fields: [ventaId], references: [id], onDelete: Cascade)
  producto       Producto @relation(fields: [productoId], references: [id])

  @@map("detalle_ventas")
}

model Egreso {
  id          Int      @id @default(autoincrement())
  codigo      String   @unique
  fecha       DateTime
  categoria   String
  descripcion String
  valor       Decimal  @db.Decimal(12, 2)
  usuarioId   Int      @map("usuario_id")
  usuario     Usuario  @relation(fields: [usuarioId], references: [id])
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  @@map("egresos")
}

model ConfiguracionTienda {
  id                Int      @id @default(1)
  nombre            String
  nit               String
  direccion         String
  telefono          String
  correo            String
  moneda            String   @default("COP")
  densidadDashboard String   @default("Cómoda") @map("densidad_dashboard")
  alertaStockBajo   String   @default("10 unidades") @map("alerta_stock_bajo")
  modoVisual        String   @default("Claro / Oscuro") @map("modo_visual")
  updatedAt         DateTime @updatedAt @map("updated_at")

  @@map("configuracion_tienda")
}
```

`ConfiguracionTienda` es una tabla de **una sola fila** (singleton, `id` fijo en 1) porque hoy la app no contempla múltiples tiendas/sucursales — igual que en el frontend actual (`configService` guarda un único objeto global).

---

## 6. Endpoints REST

Prefijo común: `/api`. Todas las rutas (salvo `/auth/login`) requieren `Authorization: Bearer <token>`. La columna **Rol** indica quién puede acceder, replicando `ROLE_ROUTES` del frontend.

### Auth
| Método | Ruta | Rol | Descripción |
|---|---|---|---|
| POST | `/api/auth/login` | público | Valida credenciales, retorna `{ token, user }` |
| GET | `/api/auth/me` | autenticado | Retorna el usuario de la sesión actual (a partir del token) |
| PUT | `/api/auth/me` | autenticado | Actualiza `nombre`, `telefono`, `foto` del propio perfil |

### Usuarios (gestión, pestaña "Usuarios")
| Método | Ruta | Rol | Descripción |
|---|---|---|---|
| GET | `/api/usuarios` | admin | Lista usuarios |
| POST | `/api/usuarios` | admin | Crea usuario (genera contraseña temporal o la recibe y la hashea) |
| PUT | `/api/usuarios/:id` | admin | Edita nombre, correo, rol, estado |
| DELETE | `/api/usuarios/:id` | admin | Elimina usuario |

### Clientes
| Método | Ruta | Rol | Descripción |
|---|---|---|---|
| GET | `/api/clientes?search=&tipo=&estado=` | admin, vendedor, contador | Lista con filtros |
| POST | `/api/clientes` | admin, vendedor, contador | Crea cliente |
| PUT | `/api/clientes/:id` | admin, vendedor, contador | Edita cliente |
| DELETE | `/api/clientes/:id` | admin, vendedor, contador | Elimina cliente |

### Productos
| Método | Ruta | Rol | Descripción |
|---|---|---|---|
| GET | `/api/productos?search=&categoria=&estado=` | admin, vendedor | Lista con filtros; incluye `estado` calculado |
| POST | `/api/productos` | admin, vendedor | Crea producto |
| PUT | `/api/productos/:id` | admin, vendedor | Edita producto |
| DELETE | `/api/productos/:id` | admin, vendedor | Elimina producto |

### Ventas
| Método | Ruta | Rol | Descripción |
|---|---|---|---|
| GET | `/api/ventas?search=&estado=` | admin, vendedor | Lista ventas (vendedor ve todas, igual que hoy) |
| GET | `/api/ventas/:id` | admin, vendedor | Detalle con ítems |
| POST | `/api/ventas` | admin, vendedor | Crea venta + detalle en una transacción; descuenta stock de cada producto; `usuarioId` = usuario autenticado |
| DELETE | `/api/ventas/:id` | admin, vendedor | Elimina venta y repone el stock de sus ítems (comportamiento nuevo, más consistente que el actual, que no repone stock) |

### Egresos
| Método | Ruta | Rol | Descripción |
|---|---|---|---|
| GET | `/api/egresos?search=&categoria=` | admin, contador | Lista con filtros |
| POST | `/api/egresos` | admin, contador | Crea egreso; `usuarioId` = usuario autenticado |
| PUT | `/api/egresos/:id` | admin, contador | Edita egreso |
| DELETE | `/api/egresos/:id` | admin, contador | Elimina egreso |

### Dashboard
| Método | Ruta | Rol | Descripción |
|---|---|---|---|
| GET | `/api/dashboard` | admin, vendedor, contador | Retorna `{ title, subtitle, stats[], chartTitle, chartSeries[], indicators[], tableTitle, movements[] }` calculado en tiempo real según el rol (para `vendedor`, filtrando por sus propias ventas) |

### Reportes
| Método | Ruta | Rol | Descripción |
|---|---|---|---|
| GET | `/api/reportes` | admin, contador | Retorna `{ stats[], indicators[], monthly[], topProducts[], frequentCustomers[], totals{} }` agregando `Venta`, `DetalleVenta` y `Egreso` reales |

### Configuración
| Método | Ruta | Rol | Descripción |
|---|---|---|---|
| GET | `/api/configuracion/tienda` | admin, contador | Datos de empresa + preferencias |
| PUT | `/api/configuracion/tienda` | admin, contador | Actualiza empresa + preferencias |
| GET | `/api/configuracion/sistema` | admin, contador | Info de solo lectura (idioma, notificaciones, backup, versión) desde constantes/env |

Todas las respuestas de error usan el mismo formato:
```json
{ "error": { "message": "Descripción legible", "code": "SALE_INVALID_STOCK" } }
```

---

## 7. Seguridad y middlewares

| Middleware | Función |
|---|---|
| `helmet()` | Cabeceras HTTP seguras por defecto |
| `cors({ origin: FRONTEND_URL, credentials: true })` | Restringe el origen permitido (el del frontend en Vite) |
| `morgan('dev')` | Log de peticiones en desarrollo |
| `express.json()` | Parseo de body JSON |
| `authenticate` | Verifica el JWT del header `Authorization`, adjunta `req.user = { id, rol, nombre }` |
| `authorize('admin', 'contador', ...)` | Middleware de fábrica: rechaza con `403` si `req.user.rol` no está en la lista permitida |
| `validate(schema)` | Valida `req.body`/`req.query` con esquemas [zod](https://zod.dev) por módulo; responde `400` con detalle de campos si falla |
| `errorHandler` | Middleware final: captura `ApiError` (con `statusCode`) y errores no controlados, homogeniza la respuesta JSON y evita filtrar stack traces en producción |

**Autenticación:** JWT firmado con `JWT_SECRET`, expiración configurable (`JWT_EXPIRES_IN`, ej. `8h`), payload mínimo `{ sub: usuario.id, rol, nombre }`. No se maneja refresh token (fuera de alcance académico); al expirar, el frontend redirige a `/login`.

**Contraseñas:** hash con `bcrypt` (10 salt rounds), nunca se devuelve `passwordHash` en ninguna respuesta.

---

## 8. Flujo Frontend → Backend

1. **Nuevo cliente HTTP en el frontend** (`src/services/apiClient.js`, Fase 4): wrapper sobre `fetch` que:
   - antepone `import.meta.env.VITE_API_URL` a cada ruta,
   - añade `Authorization: Bearer <token>` leyendo el token guardado tras el login,
   - si la respuesta es `401`, limpia la sesión y redirige a `/login`,
   - lanza un `Error` con el mensaje del backend si `!response.ok`.

2. **Los `*Service.js` existentes se mantienen como la única interfaz que consumen las páginas** (mismos nombres de función: `readCustomers`, `createCustomer`, etc.), pero por dentro dejan de usar `localStorage` y llaman a `apiClient`. Se vuelven `async`, así que las páginas pasan de `useState(() => service.readX())` a cargar los datos en un `useEffect` (con estado de carga), sin tocar el JSX ni las clases CSS existentes.

3. **`authService`** pasa a llamar `POST /api/auth/login`, guarda `{ token, user }` (el token en `localStorage`, no la contraseña), y `AuthProvider`/`useAuth` siguen exponiendo la misma forma de `session` que ya usan `Topbar`, `Sidebar` y `RoleGuard`.

4. **`RoleGuard` no cambia su lógica**: sigue comparando `session.role` contra `allowedRoles`; la diferencia es que ahora la autorización real (qué puede hacer cada rol) también se aplica en el backend vía `authorize(...)`, así que el frontend deja de ser la única barrera.

5. **Dashboard y Reportes**: las páginas dejan de importar `dashboardMock`/`reportesMock` y consumen `GET /api/dashboard` y `GET /api/reportes`, que devuelven exactamente la misma forma de objeto que hoy consumen `DashboardPage.jsx` y `ReportsPage.jsx` (para no tocar el JSX de esas páginas).

6. **Manejo de errores en formularios**: los `try/catch` que ya existen alrededor de `handleSubmit`/`handleCreate` (hoy casi no lanzan errores porque `localStorage` no falla) pasan a mostrar el `error.message` que venga del backend (ej. documento de cliente duplicado, código de producto repetido, stock insuficiente en una venta).

---

## 9. Variables de entorno (`backend/.env`)

```
PORT=4000
NODE_ENV=development
DATABASE_URL="mysql://usuario:password@localhost:3306/grain_store_db"
JWT_SECRET=una_clave_larga_y_secreta
JWT_EXPIRES_IN=8h
FRONTEND_URL=http://localhost:5173
```

Y en el frontend (`grain_stote/.env`):
```
VITE_API_URL=http://localhost:4000/api
```

---

## 10. Resumen de decisiones de diseño

- Backend en `backend/` dentro del mismo repositorio (monorepo simple, sin workspaces por ahora).
- Arquitectura por capas + por módulo (`routes/controller/service/schema` por entidad).
- MySQL + Prisma como única fuente de verdad; `localStorage` deja de usarse para datos de negocio (podría conservarse solo para preferencias puramente de UI como el tema claro/oscuro, que ya es un caso aparte — `useTheme`/`ThemeToggle` no forman parte del análisis de backend).
- Enums de Prisma solo para campos cortos, ASCII y críticos para autorización/flujo (`rol`, `estado`); el resto de listas cerradas (categorías, método de pago) se validan en el backend contra constantes compartidas.
- Ventas y detalle de venta normalizados con relaciones reales a `Cliente` y `Producto`; egresos con relación real a `Usuario`.
- JWT sin refresh token; expiración de 8 horas por simplicidad académica.
- `ConfiguracionTienda` como tabla singleton (una fila); `ConfiguracionSistema` sin tabla, servida desde constantes.

---

Con este diseño cerrado, la **Fase 3 — Implementación** creará el proyecto `backend/` con Node.js + Express + Prisma + JWT + bcrypt + dotenv siguiendo exactamente esta estructura, entidades y endpoints, incluyendo migraciones y seed inicial con los mismos datos de ejemplo que hoy existen como `seed*` en el frontend (para que la demo se vea igual apenas se conecte).

¿Confirmas que el diseño está aprobado para avanzar a la **Fase 3 — Implementación**?
