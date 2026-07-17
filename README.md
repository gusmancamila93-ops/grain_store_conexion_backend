# Grain Store

Sistema de gestión Full Stack para una tienda de granos (arroz, fríjol, maíz,
lenteja, etc.), con control de clientes, inventario, ventas, egresos y reportes
financieros, con acceso diferenciado por rol (**Administrador**, **Vendedor**,
**Contador**).

Proyecto académico desarrollado para el SENA como evidencia de las competencias
**GA8-220501096-AA1-EV01 — Desarrollar software a partir de la integración de sus
módulos y componentes** y **GA8-220501096-AA1-EV02 — Módulos integrados**. Partió de
un frontend React ya funcional (con datos simulados en `localStorage`) al que se le
construyó un backend real (Node.js + Express + Prisma + MySQL), se integró sin
alterar el diseño ni la experiencia de usuario existente, y finalmente se **desplegó
en producción** (frontend en Vercel, backend en Render, base de datos en Aiven).

**El sistema está en vivo:** https://grain-store-conexion-backend.vercel.app
(ver la sección [Despliegue](#despliegue) para el detalle completo).

> Este README documenta el sistema completo (frontend + backend). Para el detalle
> específico del backend, ver [README_BACKEND.md](README_BACKEND.md). Para la
> evidencia formal de módulos integrados y despliegue, ver
> [GA8-220501096-AA1-EV02/](GA8-220501096-AA1-EV02/).

---

## Características principales

### Frontend (React)
- **Autenticación por rol** con selección de perfil (Administrador / Vendedor /
  Contador) y accesos rápidos con usuarios de demostración.
- **Dashboard** con estadísticas, gráficas e indicadores que cambian según el rol
  autenticado.
- **Gestión de clientes**: alta, edición, eliminación, búsqueda y filtros por tipo y
  estado.
- **Gestión de productos**: alta, edición, eliminación, y estado de inventario
  calculado automáticamente (`Normal` / `Bajo stock` / `Agotado`).
- **Ventas**: listado con filtros, registro de nuevas ventas, detalle de una venta
  con sus ítems, y eliminación.
- **Egresos**: alta, edición, eliminación y filtros por categoría.
- **Reportes**: ventas totales, egresos, utilidad, productos más vendidos, clientes
  frecuentes y resumen financiero mensual.
- **Configuración**: edición del perfil propio (nombre, teléfono, foto), datos de la
  tienda, preferencias visuales, información de sistema (solo lectura) y gestión de
  usuarios (solo Administrador).
- **Modo claro/oscuro** persistente.
- **Diseño responsive** con menú lateral colapsable en móvil.

### Backend (Node.js + Express + Prisma + MySQL)
- **Autenticación con JWT** y contraseñas cifradas con **bcrypt**.
- **Autorización por rol** en cada endpoint (middleware `authorize`), replicando
  exactamente los permisos que ya mostraba/ocultaba el menú del frontend.
- **CRUD completo** de usuarios, clientes, productos y egresos.
- **Registro de ventas transaccional**: descuenta stock de cada producto vendido
  dentro de una transacción de base de datos; al eliminar una venta, repone el stock.
- **Validación de datos** de entrada con `zod` en cada endpoint, con mensajes de
  error detallados por campo.
- **Agregaciones en tiempo real** para el dashboard y los reportes (ya no son datos
  de ejemplo estáticos: se calculan sobre los datos reales de la base de datos).
- **Seguridad HTTP**: `helmet`, `cors` restringido al origen del frontend, manejo
  centralizado de errores sin filtrar detalles internos.
- **Migraciones y seed** con Prisma para reproducir el esquema y cargar datos de
  ejemplo en cualquier entorno.

---

## Arquitectura del proyecto

El sistema está dividido en dos aplicaciones independientes dentro del mismo
repositorio:

**En desarrollo local:**
```
Usuario ── navegador ──▶ Frontend (React + Vite, puerto 5173)
                              │
                              │  fetch + JWT (Authorization: Bearer <token>)
                              ▼
                         Backend (Express, puerto 4000)
                              │
                              │  Prisma Client
                              ▼
                         MySQL (grain_store_db, local)
```

**En producción** (arquitectura lógica del despliegue real — detalle completo en [Despliegue](#despliegue)):
```
┌─────────────────────────┐        ┌────────────────────────────┐        ┌───────────────────┐
│   Vercel (Frontend)      │        │   Render (Backend)          │        │   Aiven (MySQL)    │
│   React + Vite            │──────▶│   Node.js + Express          │──────▶│   Base de datos      │
│   build estático, CDN     │ HTTPS  │   Root Directory: backend/   │ Prisma │   administrada        │
└─────────────────────────┘        └────────────────────────────┘        └───────────────────┘
 grain-store-conexion-               grain-store-conexion-
 backend.vercel.app                  backend.onrender.com
```

- **Frontend:** SPA en React, con capas de páginas → componentes compartidos →
  contextos → servicios (`src/services/*.js`), donde los servicios son la única capa
  que sabe que existe una API HTTP.
- **Backend:** arquitectura por capas y por módulo (un paquete
  `routes/controller/service/schema` por entidad) bajo `backend/src/modules/`.
- **Comunicación:** REST sobre JSON, con JWT en el header `Authorization` en cada
  petición autenticada.

### Estructura de carpetas

```
grain_stote/
├── backend/                       # API REST (Node.js + Express + Prisma)
│   ├── prisma/
│   │   ├── schema.prisma          # Modelo de datos
│   │   ├── migrations/            # Migraciones generadas por Prisma
│   │   └── seed.js                # Datos iniciales de ejemplo
│   ├── src/
│   │   ├── config/                # env, conexión a Prisma, CORS
│   │   ├── middlewares/           # authenticate, authorize, validate, errorHandler
│   │   ├── modules/                # un paquete por entidad (routes/controller/service/schema)
│   │   │   ├── auth/
│   │   │   ├── usuarios/
│   │   │   ├── clientes/
│   │   │   ├── productos/
│   │   │   ├── ventas/
│   │   │   ├── egresos/
│   │   │   ├── dashboard/
│   │   │   ├── reportes/
│   │   │   └── configuracion/
│   │   ├── utils/                  # ApiError, asyncHandler, jwt, password, constants, monthly
│   │   ├── app.js                  # Configuración de Express
│   │   └── server.js               # Arranque del servidor
│   ├── .env.example
│   └── package.json
├── public/                         # Estáticos del frontend (favicon, iconos)
├── src/                             # Frontend (React)
│   ├── components/
│   │   ├── common/                 # Tarjetas, tablas, modal, tabs, etc. reutilizables
│   │   ├── layout/                 # Sidebar, Topbar, overlay móvil, toggle de tema
│   │   └── ui/                     # Primitivas de UI (shadcn)
│   ├── contexts/                   # AuthContext / AuthProvider
│   ├── data/                       # Datos de ejemplo históricos (ya no usados tras la Fase 4)
│   ├── hooks/                      # useAuth y hooks compartidos
│   ├── layouts/                    # AuthLayout (login/registro) y AppLayout (app autenticada)
│   ├── pages/                      # Una carpeta por módulo funcional (auth, dashboard, sales, ...)
│   ├── routes/                     # Definición de rutas, RoleGuard, configuración por rol
│   ├── services/                   # Capa de acceso a la API (apiClient + un servicio por entidad)
│   └── utils/                      # Formateadores (moneda, fecha)
├── GA8-220501096-AA1-EV02/          # Evidencia de módulos integrados y despliegue
│   ├── README_EVIDENCIA.md
│   ├── DOCUMENTACION_MODULOS.md
│   ├── PRUEBAS_SISTEMA.md
│   ├── URLS_DESPLIEGUE.md
│   ├── EJECUCION_SISTEMA.md
│   ├── CONTROL_VERSIONES.md
│   └── INFORME_FINAL.md
├── ANALISIS_BACKEND.md              # Fase 1 — Análisis del frontend original
├── DISENO_BACKEND.md                # Fase 2 — Diseño de arquitectura del backend
├── README_BACKEND.md                # Documentación específica del backend
├── API_DOCUMENTATION.md             # Referencia completa de endpoints
├── MANUAL_INSTALACION.md            # Guía de instalación paso a paso
├── DOCUMENTACION_TECNICA.md         # Decisiones técnicas, seguridad, limitaciones
├── vercel.json                      # Configuración de despliegue del frontend en Vercel (rewrite de SPA)
├── package.json                     # Dependencias del frontend
└── vite.config.js
```

---

## Tecnologías utilizadas

### Frontend
- **React** 19
- **Vite** 8 (servidor de desarrollo y build)
- **React Router DOM** 7 (enrutamiento y guardas por rol)
- **Tailwind CSS** 4 (`@tailwindcss/vite`)
- **Radix UI** / **shadcn** (primitivas de UI, configuradas en `components.json`)
- **lucide-react** (íconos)
- **class-variance-authority**, **clsx**, **tailwind-merge**, **tailwindcss-animate**, **tw-animate-css** (utilidades de estilos)
- **@fontsource** (Geist, Montserrat, Oswald — tipografías autoalojadas)
- **ESLint** (lint), con `eslint-plugin-react-hooks` y `eslint-plugin-react-refresh`

### Backend
- **Node.js** (ESM)
- **Express** 4
- **Prisma** (ORM) + **@prisma/client**
- **MySQL**
- **JWT** (`jsonwebtoken`)
- **bcrypt**
- **zod** (validación de esquemas)
- **helmet** (cabeceras HTTP seguras)
- **cors**
- **morgan** (logging de peticiones)
- **dotenv** (variables de entorno)
- **nodemon** (recarga en desarrollo)

---

## Requisitos

- **Node.js** — el proyecto no declara una versión mínima en `package.json` (sin
  campo `engines`). Se desarrolló y probó con **Node.js v25.2.1** y **npm 11.6.2**;
  se recomienda Node.js 20 LTS o superior por compatibilidad general.
- **npm** (incluido con Node.js).
- **MySQL** 8.x (puede ser standalone o vía XAMPP/WAMP).
- **Git**.

---

## Instalación

Guía resumida; el detalle paso a paso con solución de problemas está en
[MANUAL_INSTALACION.md](MANUAL_INSTALACION.md).

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd grain_stote
```

> **Importante:** la ruta donde clones el proyecto no debe contener el carácter `#`
> (ni otros caracteres especiales de URL). Vite tiene un bug conocido que rompe el
> servidor de desarrollo y el build cuando la ruta absoluta del proyecto lo incluye.

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env      # ajustar DATABASE_URL si tu MySQL no es el de XAMPP por defecto
npx prisma migrate dev    # crea la base de datos y las tablas
npm run seed               # carga usuarios, clientes, productos, ventas y egresos de ejemplo
```

### 3. Frontend

```bash
cd ..                      # volver a la raíz del proyecto
npm install
cp .env.example .env       # define VITE_API_URL
```

---

## Ejecución local

Backend y frontend se ejecutan como dos procesos independientes (dos terminales).

### Backend

```bash
cd backend
npm run dev        # http://localhost:4000, con recarga automática
# o en modo producción:
npm start
```

### Frontend

```bash
npm run dev         # http://localhost:5173
```

Con ambos corriendo, abre `http://localhost:5173/login` e inicia sesión con
cualquiera de los usuarios de prueba del seed (ver [README_BACKEND.md](README_BACKEND.md#usuarios-de-prueba-seed)).

---

## Despliegue

El sistema está desplegado y verificado funcionando en producción, en tres
plataformas distintas — una por componente:

| Componente | Plataforma | Configuración real |
|---|---|---|
| Frontend | **Vercel** | Root Directory `.` (raíz del repo) · Build Command `npm run build` (default de Vite) · Output Directory `dist` |
| Backend | **Render** | Root Directory `backend` · Build Command `npm install && npx prisma generate` · Start Command `npx prisma migrate deploy && npm start` |
| Base de datos | **Aiven** | MySQL administrado, accesible solo desde el backend (no se expone públicamente) |

Ambos despliegues (Vercel y Render) se redespliegan **automáticamente** ante cada
push a la rama `main` del repositorio.

**Variables de entorno de producción** (nombres, sin valores — ver [Variables de entorno](#variables-de-entorno) más abajo para el detalle completo):
- Render: `DATABASE_URL`, `JWT_SECRET`, `NODE_ENV=production`, `FRONTEND_URL` (apuntando al dominio de Vercel).
- Vercel: `VITE_API_URL` (apuntando al dominio de Render + `/api`).

**Nota técnica real, encontrada y corregida durante el despliegue:** al desplegar una
SPA de React Router en Vercel, es necesario un `vercel.json` con un *rewrite* de
`/(.*)` → `/index.html` para que las rutas internas (ej. `/admin/dashboard`) no
devuelvan `404` al navegar directo o refrescar la página — sin este archivo, Vercel
busca un archivo físico en esa ruta y no lo encuentra. Este ajuste ya está aplicado
y verificado (ver [`GA8-220501096-AA1-EV02/PRUEBAS_SISTEMA.md`](GA8-220501096-AA1-EV02/PRUEBAS_SISTEMA.md) para el detalle de cómo se detectó y confirmó la corrección).

Guía completa de configuración de despliegue en
[`GA8-220501096-AA1-EV02/EJECUCION_SISTEMA.md`](GA8-220501096-AA1-EV02/EJECUCION_SISTEMA.md).

## URLs públicas

| Componente | URL |
|---|---|
| **Frontend** (aplicación completa) | https://grain-store-conexion-backend.vercel.app |
| **Backend / API** | https://grain-store-conexion-backend.onrender.com |
| **Health check** del backend | https://grain-store-conexion-backend.onrender.com/api/health |
| **Repositorio** | https://github.com/gusmancamila93-ops/grain_store_conexion_backend |

Puedes iniciar sesión directamente en el frontend desplegado con cualquiera de los
usuarios de prueba (ver [README_BACKEND.md](README_BACKEND.md#usuarios-de-prueba-seed)).
Detalle de la función de cada URL en
[`GA8-220501096-AA1-EV02/URLS_DESPLIEGUE.md`](GA8-220501096-AA1-EV02/URLS_DESPLIEGUE.md).

---

## Configuración

La configuración del sistema se maneja íntegramente por **variables de entorno**
(ver la sección siguiente) — no hay archivos de configuración adicionales que editar
a mano. En local se definen en los archivos `.env` de cada aplicación; en producción
se definen en el panel de Render (backend) y de Vercel (frontend).

## Variables de entorno

Ningún valor sensible real se versiona en el repositorio; los archivos `.env` están
en `.gitignore` del lado del backend. Se documentan aquí solo los **nombres** y
ejemplos no sensibles.

### `backend/.env`

```
PORT=4000
NODE_ENV=development

# Cadena de conexión a MySQL: usuario:contraseña@host:puerto/nombre_base_datos
DATABASE_URL="mysql://root:@localhost:3306/grain_store_db"

# Clave usada para firmar los JWT — usa una cadena larga y aleatoria propia, nunca la de ejemplo
JWT_SECRET=cambia_esta_clave_por_una_larga_y_secreta
JWT_EXPIRES_IN=8h

# Origen permitido por CORS (debe coincidir con la URL donde corre el frontend)
FRONTEND_URL=http://localhost:5173
```

### `.env` (raíz del proyecto, frontend)

```
# URL base de la API que consume el frontend
VITE_API_URL=http://localhost:4000/api
```

Plantillas sin valores reales disponibles en `backend/.env.example` y `.env.example`.

---

## Estructura del proyecto

| Carpeta | Función |
|---|---|
| `backend/prisma/` | Esquema de base de datos, migraciones y seed |
| `backend/src/config/` | Carga de variables de entorno, cliente de Prisma, opciones de CORS |
| `backend/src/middlewares/` | Autenticación JWT, autorización por rol, validación con zod, manejo de errores |
| `backend/src/modules/` | Un paquete por entidad de negocio (rutas, controlador, servicio y esquema de validación) |
| `backend/src/utils/` | Utilidades compartidas del backend (errores, hashing, JWT, constantes, agregación mensual) |
| `public/` | Archivos estáticos servidos tal cual por el frontend |
| `src/components/common/` | Componentes de UI reutilizables entre módulos (tarjetas, tablas, modal, tabs, buscador) |
| `src/components/layout/` | Estructura visual compartida (Sidebar, Topbar, overlay móvil, selector de tema) |
| `src/components/ui/` | Primitivas de interfaz basadas en shadcn/Radix |
| `src/contexts/` | Contexto de autenticación (sesión activa) |
| `src/hooks/` | Hooks compartidos, principalmente `useAuth` |
| `src/layouts/` | `AuthLayout` (login/registro) y `AppLayout` (shell de la app autenticada) |
| `src/pages/` | Una carpeta por módulo funcional visible al usuario |
| `src/routes/` | Definición de rutas, `RoleGuard` y configuración de accesos por rol |
| `src/services/` | Capa de acceso a datos: `apiClient.js` (cliente HTTP con JWT) y un servicio por entidad |
| `src/utils/` | Formateadores de moneda y fecha |

---

## Módulos del sistema

### Autenticación
- **Objetivo:** identificar al usuario y determinar su rol (Administrador, Vendedor,
  Contador).
- **Responsabilidades:** login, cierre de sesión, edición del propio perfil,
  protección de rutas según el rol.
- **Componentes involucrados:** `LoginPage.jsx`, `AuthProvider.jsx`, `useAuth.js`,
  `RoleGuard.jsx`, `authService.js` (frontend); módulo `auth` (backend).
- **Endpoints relacionados:** `POST /api/auth/login`, `GET /api/auth/me`, `PUT /api/auth/me`.

### Dashboard
- **Objetivo:** dar una vista general del estado del negocio, adaptada al rol.
- **Responsabilidades:** mostrar estadísticas, gráfica de actividad, indicadores y
  movimientos recientes calculados en tiempo real.
- **Componentes involucrados:** `DashboardPage.jsx`, `dashboardService.js`
  (frontend); módulo `dashboard` (backend).
- **Endpoints relacionados:** `GET /api/dashboard`.

### Clientes
- **Objetivo:** administrar la cartera de clientes de la tienda.
- **Responsabilidades:** alta, edición, eliminación, búsqueda y filtros por tipo y
  estado.
- **Componentes involucrados:** `CustomersPage.jsx`, `clientesService.js`
  (frontend); módulo `clientes` (backend).
- **Endpoints relacionados:** `GET/POST /api/clientes`, `PUT/DELETE /api/clientes/:id`.

### Productos
- **Objetivo:** administrar el inventario.
- **Responsabilidades:** alta, edición, eliminación, cálculo automático del estado
  de stock (`Normal` / `Bajo stock` / `Agotado`).
- **Componentes involucrados:** `ProductsPage.jsx`, `productosService.js`
  (frontend); módulo `productos` (backend).
- **Endpoints relacionados:** `GET/POST /api/productos`, `PUT/DELETE /api/productos/:id`.

### Ventas
- **Objetivo:** registrar operaciones comerciales y mantener el inventario
  consistente.
- **Responsabilidades:** listar, ver detalle, registrar una venta nueva (descuenta
  stock dentro de una transacción), eliminar una venta (repone el stock).
- **Componentes involucrados:** `SalesPage.jsx`, `NewSalePage.jsx`,
  `ventasService.js` (frontend); módulo `ventas` (backend).
- **Endpoints relacionados:** `GET /api/ventas`, `GET /api/ventas/:id`,
  `POST /api/ventas`, `DELETE /api/ventas/:id`.

### Egresos
- **Objetivo:** llevar control de los gastos del negocio.
- **Responsabilidades:** alta, edición, eliminación y filtros por categoría; el
  responsable se toma automáticamente del usuario autenticado.
- **Componentes involucrados:** `ExpensesPage.jsx`, `egresosService.js` (frontend);
  módulo `egresos` (backend).
- **Endpoints relacionados:** `GET/POST /api/egresos`, `PUT/DELETE /api/egresos/:id`.

### Reportes
- **Objetivo:** dar visibilidad financiera agregada del negocio.
- **Responsabilidades:** calcular ingresos, egresos, utilidad, productos más
  vendidos, clientes frecuentes y resumen financiero mensual, todo sobre datos
  reales.
- **Componentes involucrados:** `ReportsPage.jsx`, `reportesService.js` (frontend);
  módulo `reportes` (backend).
- **Endpoints relacionados:** `GET /api/reportes`.

### Configuración
- **Objetivo:** administrar el perfil propio, los datos de la tienda y (solo
  Administrador) los usuarios del sistema.
- **Responsabilidades:** editar nombre/teléfono/foto propios; editar datos de la
  empresa y preferencias visuales; consultar información de sistema (solo lectura);
  CRUD de usuarios.
- **Componentes involucrados:** `SettingsPage.jsx`, `configService.js`,
  `usuariosService.js`, `authService.js` (frontend); módulos `configuracion` y
  `usuarios` (backend).
- **Endpoints relacionados:** `GET/PUT /api/configuracion/tienda`,
  `GET /api/configuracion/sistema`, `GET/POST /api/usuarios`,
  `PUT/DELETE /api/usuarios/:id`.

---

## Flujo general del sistema

```
Usuario
  │  interactúa con la interfaz
  ▼
Frontend (React)
  │  el servicio correspondiente arma la petición y adjunta el JWT guardado
  ▼
API REST (Express, /api/...)
  │  middlewares: autenticación → autorización por rol → validación (zod)
  ▼
Backend (controller → service)
  │  Prisma Client
  ▼
Base de datos (MySQL)
  │  la respuesta regresa por el mismo camino
  ▼
Frontend actualiza el estado de la página y renderiza el resultado
```

Toda petición autenticada viaja con el header `Authorization: Bearer <token>`. Si el
token falta o expira, el backend responde `401`, el cliente HTTP del frontend
(`apiClient.js`) limpia la sesión guardada y redirige a `/login`.

---

## Base de datos

7 tablas en MySQL, gestionadas con Prisma:

| Entidad | Descripción |
|---|---|
| `usuarios` | Cuentas del sistema (login + gestión), con rol, estado y credenciales |
| `clientes` | Cartera de clientes de la tienda |
| `productos` | Inventario, con stock y stock mínimo |
| `ventas` | Encabezado de cada venta (cliente, vendedor, fecha, método de pago, estado, total) |
| `detalle_ventas` | Ítems de cada venta (producto, cantidad, precio unitario) |
| `egresos` | Gastos del negocio, con el usuario responsable |
| `configuracion_tienda` | Datos de la empresa y preferencias visuales (fila única) |

**Relaciones principales:**
- `Usuario 1—N Venta` (vendedor que registra la venta) y `Usuario 1—N Egreso` (responsable).
- `Cliente 1—N Venta`.
- `Venta 1—N DetalleVenta` (se elimina en cascada junto con la venta).
- `Producto 1—N DetalleVenta`.

Modelo completo, con tipos y valores por defecto, en
[backend/prisma/schema.prisma](backend/prisma/schema.prisma) y explicado con las
decisiones de diseño en [DISENO_BACKEND.md](DISENO_BACKEND.md) y
[DOCUMENTACION_TECNICA.md](DOCUMENTACION_TECNICA.md).

---

## API

La API expone endpoints REST bajo el prefijo `/api`, organizados por módulo:
`auth`, `usuarios`, `clientes`, `productos`, `ventas`, `egresos`, `dashboard`,
`reportes` y `configuracion`. Todas las rutas —salvo el login— requieren un JWT
válido en el header `Authorization`, y cada una valida el rol del usuario antes de
ejecutar la acción.

La referencia detallada de **cada endpoint** (método, ruta, rol requerido, cuerpo de
la petición y ejemplo de respuesta) está en
**[API_DOCUMENTATION.md](API_DOCUMENTATION.md)**.

---

## Seguridad

- **JWT:** cada sesión se identifica con un token firmado (`JWT_SECRET`) que expira
  a las 8 horas (`JWT_EXPIRES_IN`). El token viaja en el header `Authorization:
  Bearer <token>` y el middleware `authenticate` lo verifica en cada petición
  protegida.
- **Hash de contraseñas:** las contraseñas se almacenan con `bcrypt` (10 salt
  rounds); el hash nunca se incluye en ninguna respuesta de la API.
- **Validaciones:** cada endpoint que recibe datos valida el cuerpo/consulta con
  esquemas de `zod` antes de tocar la base de datos; los errores de validación
  responden `400` con el detalle de qué campo falló y por qué.
- **Middleware de autorización:** `authorize(...roles)` verifica que el rol del
  usuario autenticado esté permitido para ese endpoint, devolviendo `403` en caso
  contrario — la misma restricción que ya aplicaba el menú del frontend, ahora
  también forzada en el servidor.
- **Manejo de errores:** un middleware centralizado homogeniza el formato de todos
  los errores (`{ error: { message, code, details? } }`) y evita filtrar detalles
  internos (stack traces) fuera de desarrollo.
- **Otras medidas:** `helmet` para cabeceras HTTP seguras, `cors` restringido a un
  único origen permitido (`FRONTEND_URL`), y datos sensibles como el `usuarioId` de
  una venta o un egreso siempre se toman del token, nunca de un campo enviado por el
  cliente.

Detalle ampliado, incluyendo limitaciones conocidas (por ejemplo, no hay *refresh
token*), en [DOCUMENTACION_TECNICA.md](DOCUMENTACION_TECNICA.md).

---

## Evidencia SENA

Este proyecto fue desarrollado para cumplir dos evidencias del programa ADSO:

- **GA8-220501096-AA1-EV01 — Desarrollar software a partir de la integración de sus
  módulos y componentes.**
- **GA8-220501096-AA1-EV02 — Módulos integrados**, con el sistema ya desplegado en
  producción. Documentación completa, con pruebas reales ejecutadas contra las URLs
  públicas, en [`GA8-220501096-AA1-EV02/`](GA8-220501096-AA1-EV02/).

Ambas evidencias comparten el mismo cumplimiento base:

- ✔ **Desarrollo modular:** cada entidad de negocio (auth, usuarios, clientes,
  productos, ventas, egresos, dashboard, reportes, configuración) es un paquete
  independiente en el backend, y un módulo de páginas/servicio propio en el
  frontend.
- ✔ **Integración de frontend y backend:** el frontend, originalmente basado en
  datos simulados en `localStorage`, quedó conectado a una API REST real con base
  de datos, sin alterar su diseño ni su experiencia de usuario.
- ✔ **Uso de Git para control de versiones:** todo el desarrollo quedó registrado en
  commits por fase (análisis, diseño, implementación, integración, documentación).
- ✔ **Uso de frameworks adecuados:** React en el frontend; Node.js, Express y
  Prisma en el backend; MySQL como motor de base de datos.
- ✔ **Organización del código por módulos:** arquitectura por capas y por entidad
  tanto en el backend (`backend/src/modules/`) como en el frontend
  (`src/pages/`, `src/services/`).
- ✔ **Documentación del ambiente de desarrollo:** ver
  [MANUAL_INSTALACION.md](MANUAL_INSTALACION.md) (instalación paso a paso) y
  [DOCUMENTACION_TECNICA.md](DOCUMENTACION_TECNICA.md) (decisiones técnicas,
  seguridad y pruebas realizadas).

---

## Autor

**Camila Guzman** — autora identificada a partir del historial de commits de Git de
este repositorio (`git log`). No se encontró información adicional del autor (perfil,
contacto, institución) dentro de los archivos del proyecto.

## Licencia

El repositorio no incluye un archivo de licencia (`LICENSE`). Este es un
**proyecto académico desarrollado para el SENA** (evidencia GA8-220501096-AA1-EV01);
no se declara una licencia de código abierto formal. Si se desea publicar o
reutilizar el código fuera del contexto académico, se recomienda agregar
explícitamente una licencia (por ejemplo, MIT) antes de hacerlo.
