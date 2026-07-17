# Evidencia GA8-220501096-AA1-EV02 — Módulos Integrados

**Proyecto:** Grain Store — Sistema de gestión Full Stack para tienda de granos
**Programa:** SENA — ADSO
**Evidencia:** GA8-220501096-AA1-EV02 "Módulos integrados"
**Autor:** Camila Guzman (identificado a partir del historial de Git; ver sección 1)
**Fecha del análisis:** 2026-07-16
**Elaborado por:** Análisis automatizado del repositorio real (Claude Code), sin datos inventados. Todo dato aquí presentado se obtuvo ejecutando comandos reales (`git`, `npm`, `curl`, navegador) sobre el proyecto.

> Este documento cumple los 5 elementos exigidos por la evidencia oficial del SENA:
> repositorio de control de versiones, archivos ejecutables, URLs de despliegue,
> documentación por módulo con datos de entrada/salida, y pruebas realizadas con su
> resultado.

---

## Índice

1. [Repositorio de control de versiones](#1-repositorio-de-control-de-versiones)
2. [Código fuente](#2-código-fuente)
3. [Archivos ejecutables](#3-archivos-ejecutables)
4. [URLs del despliegue](#4-urls-del-despliegue)
5. [Documentación por módulo](#5-documentación-por-módulo)
6. [Registro de datos](#6-registro-de-datos)
7. [Pruebas](#7-pruebas)
8. [Arquitectura](#8-arquitectura)
9. [Conclusiones](#9-conclusiones)
10. [Anexos](#10-anexos)

---

## 1. Repositorio de control de versiones

### 1.1 URL del repositorio

```
https://github.com/gusmancamila93-ops/grain_store_conexion_backend
```

Verificado el 2026-07-16: el repositorio es **público** y accesible sin autenticación
(README, estructura de archivos e historial de commits visibles desde el navegador).
El `HEAD` remoto (`origin/main`) está **exactamente sincronizado** con la rama local
`main` (0 commits de diferencia en ambos sentidos, verificado con `git fetch` +
`git rev-list --left-right --count origin/main...main`).

### 1.2 Ramas existentes

| Rama | Ubicación | Estado |
|---|---|---|
| `main` | local y remota (`origin/main`) | Rama única del proyecto; todo el desarrollo se hizo directamente sobre ella |

No existen otras ramas (ni de feature, ni `develop`, ni `release`). Todo el historial
(11 commits) está en `main`.

### 1.3 Estructura del proyecto

El repositorio es un **monorepo simple** con dos aplicaciones independientes:

```
grain_stote/                 ← raíz del repositorio (frontend)
├── backend/                 ← API REST independiente (Node.js + Express + Prisma)
├── src/                     ← código fuente del frontend (React)
├── public/                  ← estáticos del frontend
├── *.md                     ← documentación (análisis, diseño, manuales, API, esta evidencia)
├── package.json             ← dependencias y scripts del frontend
└── vite.config.js
```

El árbol completo, carpeta por carpeta, está en el
[Anexo 10.1](#101-árbol-completo-del-proyecto) y en
[`/evidencia/estructura.md`](evidencia/estructura.md).

### 1.4 Historial de commits (control de versiones real, no simulado)

```
3f64224 Reemplaza el README genérico de Vite por documentación profesional del sistema
cf17258 Agrega documentación final del backend (Fase 5)
e2d3db4 Corrige bugs detectados en verificación de navegador (Fase 4)
50e9b3c Integra el frontend con la API real del backend (Fase 4)
ec03197 Implementa el backend de Grain Store (Fase 3)
8fb1dc7 Agrega diseño de arquitectura del backend (Fase 2)
847141e Completa módulo de egresos y funcionalidades CRUD del frontend; agrega análisis de backend
5c0cc20 Fase 3 completada - sistema visual global
3f06728 Respaldo antes de limpieza de carpetas antiguas
538e1cb feat: análisis inicial y arquitectura base de Grain Store
7d0c226 Configuración inicial del proyecto con Vite y Tailwind funcionando
```

Se observa una progresión clara y verificable por fases: configuración inicial →
maquetado del frontend → análisis → diseño de arquitectura del backend →
implementación del backend → integración frontend-backend → documentación → pulido
del README. Esto demuestra uso real de Git como herramienta de control de versiones
a lo largo de todo el desarrollo, no como un paso final.

### 1.5 Cómo clonar y ejecutar el proyecto

```bash
# 1. Clonar
git clone https://github.com/gusmancamila93-ops/grain_store_conexion_backend.git
cd grain_stote

# 2. Backend
cd backend
npm install
cp .env.example .env        # ajustar DATABASE_URL a tu MySQL local
npx prisma migrate dev      # crea la base de datos y las tablas
npm run seed                 # carga datos de ejemplo
npm run dev                  # backend en http://localhost:4000

# 3. Frontend (en otra terminal, desde la raíz del proyecto)
cd ..
npm install
cp .env.example .env         # define VITE_API_URL=http://localhost:4000/api
npm run dev                   # frontend en http://localhost:5173
```

Guía detallada con solución de problemas en [`MANUAL_INSTALACION.md`](MANUAL_INSTALACION.md).

> **Advertencia verificada durante el desarrollo:** la carpeta del proyecto no debe
> contener el carácter `#` en su ruta absoluta; Vite 8 falla al compilar y al servir
> en desarrollo si lo tiene. Se documentó y solucionó este problema real durante la
> Fase 4 (ver [`DOCUMENTACION_TECNICA.md`](DOCUMENTACION_TECNICA.md), sección 4).

---

## 2. Código fuente

### 2.1 Verificación de que el código está completo

Se verificó el árbol de archivos del repositorio (excluyendo `node_modules`, `dist`
y `.git`, que son artefactos generados y no código fuente): **frontend y backend
están 100 % versionados en Git**, incluyendo:

- Los 9 módulos del backend (`backend/src/modules/*`), cada uno con sus 4 capas
  (`routes`, `controller`, `service`, `schema`).
- Las 10 páginas funcionales del frontend (`src/pages/*`).
- Los 10 servicios del frontend que consumen la API (`src/services/*`).
- El esquema de base de datos y su migración (`backend/prisma/`).
- Los archivos de configuración de ambas aplicaciones (`vite.config.js`,
  `backend/src/config/*`, `.env.example` en ambos lados).
- 9 documentos Markdown de análisis, diseño, manuales y referencia de API.

No se encontró código fuente relevante fuera del repositorio ni módulos a medio
escribir sin commitear (`git status` reporta *working tree clean* al momento de este
análisis).

### 2.2 Qué hace cada módulo (resumen — detalle completo en la sección 5)

| Módulo | Función |
|---|---|
| `auth` | Login, sesión (JWT), edición del propio perfil |
| `usuarios` | CRUD de usuarios del sistema (solo Administrador) |
| `clientes` | CRUD de la cartera de clientes |
| `productos` | CRUD de inventario, estado de stock calculado |
| `ventas` | Registro transaccional de ventas con descuento/reposición de stock |
| `egresos` | CRUD de gastos del negocio |
| `dashboard` | Estadísticas agregadas en tiempo real, distintas por rol |
| `reportes` | Agregación financiera histórica (ingresos, egresos, utilidad, top productos/clientes) |
| `configuracion` | Datos de la tienda, preferencias visuales, información de sistema |

### 2.3 Tecnologías utilizadas (detectadas en `package.json`)

**Frontend** (`package.json`, raíz):
React 19, Vite 8, React Router DOM 7, Tailwind CSS 4 (`@tailwindcss/vite`), Radix UI /
shadcn, lucide-react, class-variance-authority, clsx, tailwind-merge,
tailwindcss-animate, tw-animate-css, @fontsource (Geist, Montserrat, Oswald), ESLint.

**Backend** (`backend/package.json`):
Node.js (ESM), Express 4, Prisma + @prisma/client, MySQL, jsonwebtoken, bcrypt, zod,
helmet, cors, morgan, dotenv, nodemon.

Detalle exacto de versiones en el [Anexo 10.2](#102-dependencias-exactas).

---

## 3. Archivos ejecutables

### 3.1 Ejecutar el frontend

```bash
npm run dev
```
Levanta el servidor de desarrollo de Vite en `http://localhost:5173`, con
recarga en caliente (HMR).

### 3.2 Ejecutar el backend

```bash
cd backend
npm run dev     # con recarga automática (nodemon)
# o
npm start        # modo producción, sin recarga
```
Levanta la API Express en `http://localhost:4000`. Verificación rápida:
`curl http://localhost:4000/api/health` → `{"status":"ok"}`.

### 3.3 Scripts npm disponibles

**Raíz (frontend)** — `package.json`:

| Script | Comando | Descripción |
|---|---|---|
| `npm run dev` | `vite` | Servidor de desarrollo |
| `npm run build` | `vite build` | Genera el build de producción en `dist/` |
| `npm run lint` | `eslint .` | Analiza el código con ESLint |
| `npm run preview` | `vite preview` | Sirve localmente el build de producción para probarlo |

**`backend/`** — `backend/package.json`:

| Script | Comando | Descripción |
|---|---|---|
| `npm run dev` | `nodemon src/server.js` | Servidor con recarga automática |
| `npm start` | `node src/server.js` | Servidor en modo producción |
| `npm run seed` | `node prisma/seed.js` | Carga los datos de ejemplo |
| `npm run prisma:generate` | `prisma generate` | Genera el cliente de Prisma |
| `npm run prisma:migrate` | `prisma migrate dev` | Crea/aplica una migración en desarrollo |
| `npm run prisma:deploy` | `prisma migrate deploy` | Aplica migraciones pendientes (producción) |
| `npm run prisma:studio` | `prisma studio` | Explorador visual de la base de datos |

### 3.4 Proceso de construcción (build)

**Frontend:** `npm run build` invoca Vite, que transpila y empaqueta React/JSX,
procesa Tailwind CSS, optimiza fuentes e imágenes, y genera archivos con hash de
contenido (`dist/assets/...`) listos para servir como estáticos.

Se ejecutó realmente este comando durante la elaboración de esta evidencia; el
resultado fue exitoso:

```
vite v8.1.0 building client environment for production...
✓ 114 modules transformed.
dist/index.html                                  0.46 kB
dist/assets/index-Cj1Qp6lM.css                   38.68 kB │ gzip:  7.63 kB
dist/assets/index-wE6EdGrD.js                   361.39 kB │ gzip: 107.45 kB
✓ built in 404ms
```

**Backend:** Node.js/Express no requiere un paso de "build" — se ejecuta
directamente con `node src/server.js` (el proyecto usa ES Modules nativos, sin
transpilación). El único paso de "construcción" equivalente es `prisma generate`
(genera el cliente tipado de acceso a datos a partir de `schema.prisma`), que corre
automáticamente después de cada `npm install` y de cada `prisma migrate`.

### 3.5 Cómo generar la versión de producción

```bash
# Frontend
npm run build          # genera ./dist (estáticos listos para servir)
npm run preview         # opcional: sirve ./dist localmente para verificarlo

# Backend
cd backend
npx prisma migrate deploy   # aplica migraciones en el servidor de producción
npm start                    # NODE_ENV=production node src/server.js
```

El contenido de `dist/` (frontend) debe publicarse en un hosting de estáticos; el
backend debe ejecutarse en un servidor Node.js con acceso a una base de datos MySQL
accesible por red. Ninguno de estos pasos se ha ejecutado contra un proveedor de
hosting real todavía — ver sección 4.

---

## 4. URLs del despliegue

**PENDIENTE DE DESPLIEGUE**

Se revisó el repositorio completo en busca de evidencia de despliegue
(`vercel.json`, `netlify.toml`, `railway.json`, `Dockerfile`, `docker-compose*`,
`Procfile`, `render.yaml`, `fly.toml`, workflows de `.github/`) y **no se encontró
ningún archivo de configuración de despliegue ni pipeline de CI/CD**. El proyecto
actualmente solo se ejecuta en local (`localhost:5173` / `localhost:4000`).

| Componente | URL pública | Estado |
|---|---|---|
| Frontend | — | PENDIENTE DE DESPLIEGUE |
| Backend / API | — | PENDIENTE DE DESPLIEGUE |
| Base de datos | — | PENDIENTE DE DESPLIEGUE |

### Qué falta exactamente para publicarlo

1. **Base de datos MySQL accesible por red** — hoy corre en XAMPP local
   (`localhost:3306`), no accesible desde internet. Opciones típicas: Railway,
   Clever Cloud, PlanetScale (compatible MySQL), un VPS con MySQL, o el MySQL
   administrado de cualquier proveedor cloud.
2. **Hosting del backend (Node.js)** — ej. Railway, Render, Fly.io o un VPS. Requiere
   configurar ahí las variables de entorno de producción (`DATABASE_URL` apuntando a
   la base de datos pública del punto 1, `JWT_SECRET` propio y secreto,
   `FRONTEND_URL` apuntando al dominio real del frontend) y ejecutar
   `npx prisma migrate deploy` + `npm run seed` (opcional) contra esa base de datos.
3. **Hosting del frontend (estáticos)** — ej. Vercel, Netlify o Cloudflare Pages.
   Requiere configurar `VITE_API_URL` apuntando a la URL pública del backend
   (punto 2) **antes** de correr `npm run build`, ya que Vite incrusta esa variable
   en el bundle en tiempo de compilación.
4. **Actualizar CORS** — una vez se conozca el dominio real del frontend, actualizar
   `FRONTEND_URL` en el backend desplegado (el CORS del backend solo permite ese
   origen).
5. Una vez desplegado, completar esta tabla con las 3 URLs reales.

Detalle ampliado de esta misma pendiente en
[`/evidencia/urls.md`](evidencia/urls.md).

---

## 5. Documentación por módulo

Para cada módulo: objetivo, funcionalidad, tecnologías, entradas, procesamiento,
salidas y dependencias. Versión aún más detallada (con ejemplos de payloads) en
[`/evidencia/modulos.md`](evidencia/modulos.md) y en
[`API_DOCUMENTATION.md`](API_DOCUMENTATION.md).

### 5.1 Módulo `auth` (Autenticación)

- **Objetivo:** identificar al usuario y su rol; mantener la sesión.
- **Funcionalidad:** login, cierre de sesión, consulta y edición del propio perfil.
- **Tecnologías:** JWT (`jsonwebtoken`), bcrypt, zod, Express Router; en frontend:
  React Context (`AuthProvider`), `localStorage` para persistir la sesión.
- **Entradas:** formulario de login (`correo`, `contraseña`, `rol`); formulario de
  perfil (`nombre`, `teléfono`, `foto` en base64).
- **Procesamiento:** verifica credenciales contra la base de datos (`bcrypt.compare`),
  firma un JWT con `{ id, rol, nombre }`, valida el rol contra `RolUsuario`.
- **Salidas:** `{ token, user }` en login; objeto de usuario actualizado en edición
  de perfil.
- **Dependencias:** tabla `usuarios`; consumido por todos los demás módulos (el
  token que emite se usa en cada petición autenticada).

### 5.2 Módulo `usuarios`

- **Objetivo:** administración de las cuentas del sistema.
- **Funcionalidad:** listar, crear, editar y eliminar usuarios. Solo accesible por
  el rol `admin`.
- **Tecnologías:** Express, Prisma, bcrypt (hash de contraseña nueva), zod.
- **Entradas:** formulario "Crear/Editar Usuario" (`nombre`, `correo`, `contraseña`,
  `rol`, `estado`, `teléfono`).
- **Procesamiento:** valida unicidad de correo, hashea la contraseña si viene, aplica
  el rol/estado.
- **Salidas:** listado de usuarios (sin `passwordHash`); usuario creado/editado.
- **Dependencias:** tabla `usuarios`; usado por el módulo `auth` para login.

### 5.3 Módulo `clientes`

- **Objetivo:** mantener la cartera de clientes de la tienda.
- **Funcionalidad:** CRUD completo, búsqueda por documento/nombre/teléfono/correo/
  dirección, filtro por tipo y estado.
- **Tecnologías:** Express, Prisma, zod.
- **Entradas:** formulario de cliente (`documento`, `nombre`, `teléfono`, `correo`,
  `dirección`, `tipo`, `estado`).
- **Procesamiento:** valida unicidad de documento, aplica filtros de búsqueda en la
  consulta a MySQL.
- **Salidas:** listado y ficha de cliente.
- **Dependencias:** tabla `clientes`; referenciado por `ventas` (una venta pertenece
  a un cliente).

### 5.4 Módulo `productos`

- **Objetivo:** control de inventario.
- **Funcionalidad:** CRUD completo, cálculo automático del estado de stock.
- **Tecnologías:** Express, Prisma, zod.
- **Entradas:** formulario de producto (`código`, `nombre`, `categoría`, `stock`,
  `stock mínimo`, `precio`).
- **Procesamiento:** valida unicidad de código; calcula `status` (`Normal` /
  `Bajo stock` / `Agotado`) comparando `stock` vs `stockMinimo` en cada respuesta
  (no se almacena, se deriva).
- **Salidas:** listado y ficha de producto con `status` calculado.
- **Dependencias:** tabla `productos`; referenciado por `detalle_ventas` (ítems de
  venta).

### 5.5 Módulo `ventas`

- **Objetivo:** registrar operaciones comerciales manteniendo el inventario
  consistente.
- **Funcionalidad:** listar (con filtros), ver detalle con ítems, crear una venta
  nueva, eliminar una venta.
- **Tecnologías:** Express, Prisma (`$transaction`), zod.
- **Entradas:** formulario de venta (`cliente`, `fecha`, `método de pago`, `estado`,
  `producto`, `cantidad`, `precio unitario`).
- **Procesamiento:** valida existencia y stock suficiente de cada producto; dentro de
  una **transacción de base de datos** crea la venta + sus ítems y descuenta el
  stock de cada producto; al eliminar, repone el stock dentro de otra transacción.
  El código de venta (`VEN-00X`) y el total se calculan en el servidor; el vendedor
  se toma del token, nunca del body.
- **Salidas:** venta creada (con `code` y `total` calculados); listado de ventas;
  detalle con ítems.
- **Dependencias:** tablas `ventas`, `detalle_ventas`; depende de `clientes` y
  `productos`; alimenta a `dashboard` y `reportes`.

### 5.6 Módulo `egresos`

- **Objetivo:** control de gastos del negocio.
- **Funcionalidad:** CRUD completo, filtro por categoría y búsqueda.
- **Tecnologías:** Express, Prisma, zod.
- **Entradas:** formulario de egreso (`fecha`, `categoría`, `descripción`, `valor`).
- **Procesamiento:** genera el código (`EGR-00X`) en el servidor; el responsable se
  asigna automáticamente desde el usuario autenticado (medida de seguridad: nunca se
  confía en un campo enviado por el cliente para esto).
- **Salidas:** listado y ficha de egreso, con el nombre del responsable resuelto.
- **Dependencias:** tabla `egresos`; depende de `usuarios`; alimenta a `dashboard`
  (rol contador) y `reportes`.

### 5.7 Módulo `dashboard`

- **Objetivo:** dar visibilidad inmediata del estado del negocio, adaptada al rol.
- **Funcionalidad:** estadísticas del día/mes, gráfica de actividad de 12 meses,
  indicadores, movimientos recientes — todo calculado en tiempo real.
- **Tecnologías:** Express, Prisma (agregaciones con `findMany` + reducción en JS).
- **Entradas:** ninguna (solo el rol del usuario autenticado, vía token).
- **Procesamiento:** para `admin`, agrega todas las ventas/productos/clientes; para
  `vendedor`, filtra solo sus propias ventas; para `contador`, agrega
  ventas/egresos del mes con balance.
- **Salidas:** objeto con `stats`, `chartSeries`, `indicators`, `movements`
  (forma distinta según el rol).
- **Dependencias:** lee de `ventas`, `productos`, `clientes`, `egresos`.

### 5.8 Módulo `reportes`

- **Objetivo:** análisis financiero histórico del negocio.
- **Funcionalidad:** ingresos, egresos, utilidad, clientes con deuda, margen neto,
  producto líder, ticket promedio, productos más vendidos, clientes frecuentes,
  resumen mensual (12 meses, montos reales en pesos).
- **Tecnologías:** Express, Prisma.
- **Entradas:** ninguna (solo el rol, restringido a `admin`/`contador`).
- **Procesamiento:** agrega **todo el histórico** de ventas y egresos (no solo el
  mes actual), agrupa por mes y por producto/cliente.
- **Salidas:** objeto con `stats`, `indicators`, `monthly`, `topProducts`,
  `frequentCustomers`, `totals`.
- **Dependencias:** lee de `ventas`, `detalle_ventas`, `egresos`.

### 5.9 Módulo `configuracion`

- **Objetivo:** datos generales de la tienda y del sistema.
- **Funcionalidad:** consultar/editar datos de la empresa y preferencias visuales;
  consultar información de sistema (solo lectura).
- **Tecnologías:** Express, Prisma, zod.
- **Entradas:** formulario "Mi Tienda" (`nombre`, `NIT`, `dirección`, `teléfono`,
  `correo`, `moneda`, `densidad del dashboard`, `alerta de bajo stock`, `modo visual`).
- **Procesamiento:** lee/actualiza la única fila de `configuracion_tienda`
  (patrón *singleton*, no hay múltiples tiendas).
- **Salidas:** objeto `{ company, preferences }`; objeto de solo lectura
  `{ language, notifications, backup, version }` para la pestaña "Sistema".
- **Dependencias:** tabla `configuracion_tienda`.

---

## 6. Registro de datos

### 6.1 Entradas del sistema

**Formularios (frontend → backend):**

| Formulario | Página | Campos |
|---|---|---|
| Login | `LoginPage.jsx` | correo, contraseña, rol |
| Nuevo/editar cliente | `CustomersPage.jsx` | documento, nombre, teléfono, correo, dirección, tipo, estado |
| Nuevo/editar producto | `ProductsPage.jsx` | código, nombre, categoría, stock, stock mínimo, precio |
| Nueva venta | `NewSalePage.jsx` | cliente, fecha, método de pago, estado, producto, cantidad, precio unitario |
| Nuevo/editar egreso | `ExpensesPage.jsx` | fecha, categoría, descripción, valor |
| Perfil | `SettingsPage.jsx` (tab Mi Perfil) | nombre, teléfono, foto |
| Datos de tienda | `SettingsPage.jsx` (tab Mi Tienda) | nombre, NIT, dirección, teléfono, correo, moneda, densidad, alerta de stock, modo visual |
| Nuevo/editar usuario | `SettingsPage.jsx` (tab Usuarios) | nombre, correo, contraseña, rol, estado, teléfono |

**API (peticiones HTTP entrantes):** las 30+ rutas descritas en
[`API_DOCUMENTATION.md`](API_DOCUMENTATION.md), todas bajo `/api`, en formato JSON,
validadas con `zod` antes de tocar la base de datos.

**Base de datos (persistencia física de las entradas):** 7 tablas en MySQL
(`usuarios`, `clientes`, `productos`, `ventas`, `detalle_ventas`, `egresos`,
`configuracion_tienda`) — ver sección 8.3.

### 6.2 Salidas del sistema

**Consultas:** listados filtrables de clientes, productos, ventas y egresos;
detalle de una venta con sus ítems.

**Reportes:** panel de Reportes (ingresos/egresos/utilidad, productos más vendidos,
clientes frecuentes, resumen mensual) y Dashboard (estadísticas por rol).

**Respuestas API:** JSON en cada endpoint, con el formato uniforme de error
`{ error: { message, code, details? } }` cuando algo falla, documentado por completo
en [`API_DOCUMENTATION.md`](API_DOCUMENTATION.md).

**Interfaces:** las 10 páginas del frontend (Login, Dashboard, Clientes, Productos,
Ventas, Nueva Venta, Egresos, Reportes, Configuración, Registro [placeholder sin
implementar]) renderizan estas salidas usando los componentes reutilizables de
`src/components/common/` (tarjetas, tablas, modales).

---

## 7. Pruebas

### 7.1 Pruebas realizadas

**No existen pruebas automatizadas** (no hay Jest, Vitest, Supertest, Playwright ni
carpeta `tests/`/`__tests__/` en el repositorio — verificado por búsqueda directa en
el árbol de archivos). Toda la verificación del sistema se hizo de forma **manual y
real** durante el desarrollo (no simulada), en dos frentes:

1. **Backend vía `curl`** — sobre el servidor real corriendo en `localhost:4000`.
2. **Integración completa vía navegador real** — sobre el frontend real corriendo en
   `localhost:5173`, consumiendo el backend real, con la base de datos MySQL real.

Los resultados detallados de cada caso están en la tabla 7.2 y ampliados en
[`/evidencia/pruebas.md`](evidencia/pruebas.md).

### 7.2 Plan y resultados de pruebas manuales

| # | Caso de prueba | Objetivo | Pasos | Resultado esperado | Resultado obtenido |
|---|---|---|---|---|---|
| CP-01 | Login Administrador | Verificar autenticación con credenciales correctas | `POST /api/auth/login` con correo/clave del admin del seed | Token JWT + datos de usuario, `200` | **OK** — token recibido, redirige al dashboard de admin |
| CP-02 | Login Vendedor | Ídem para rol vendedor | Login con credenciales de vendedor | Token + panel de vendedor | **OK** |
| CP-03 | Login Contador | Ídem para rol contador | Login con credenciales de contador | Token + panel de contador | **OK** |
| CP-04 | Rechazo de credenciales inválidas | Verificar que no se autentica con datos incorrectos | Login con contraseña incorrecta | `401 Unauthorized` | **OK** |
| CP-05 | Autorización sin token | Verificar que la API exige autenticación | `GET /api/clientes` sin header `Authorization` | `401` | **OK** |
| CP-06 | Autorización por rol | Verificar que un rol no autorizado no accede | `GET /api/egresos` con token de `vendedor` | `403` | **OK** |
| CP-07 | Bloqueo de ruta cruzada en el frontend | Verificar que `RoleGuard` redirige si el rol no coincide con la ruta | Con sesión de `vendedor`, navegar a `/admin/reportes` | Redirección a `/vendedor/dashboard` | **OK** |
| CP-08 | CRUD Clientes — crear | Verificar alta de cliente desde la UI | Llenar formulario "Nuevo Cliente" y enviar | `201`, cliente aparece en la tabla y en los contadores | **OK** — total pasó de 4 a 5, activos de 2 a 3 |
| CP-09 | Validación de datos (Zod) | Verificar que el backend rechaza datos incompletos | `POST /api/clientes` solo con `name` | `400` con detalle de campos faltantes | **OK** — respondió los 4 campos obligatorios faltantes |
| CP-10 | Listado de productos con estado calculado | Verificar el cálculo de `Normal`/`Bajo stock`/`Agotado` | `GET /api/productos` | Estados coherentes con `stock` vs `stockMinimo` | **OK** — Frijol Cargamanto (8/12) mostró "Bajo stock" |
| CP-11 | Registro de venta con descuento de stock | Verificar la transacción de venta | Crear venta de 1 unidad de un producto desde la UI | `201`; stock del producto baja en 1 | **OK** — stock de Maíz Petado bajó de 35 a 34 |
| CP-12 | Venta con stock insuficiente | Verificar el rechazo de ventas imposibles | Crear venta pidiendo 9999 unidades | `400`, código `INSUFFICIENT_STOCK` | **OK** |
| CP-13 | Eliminar venta repone stock | Verificar reversión de inventario | Eliminar la venta creada en CP-11 | `204`; stock vuelve a su valor original | **OK** — stock volvió de 6 a 8 (caso equivalente con Frijol) |
| CP-14 | Detalle de venta | Verificar que el detalle trae los ítems reales | Clic en "Ver detalle" de una venta en la UI | Modal con código, cliente, método de pago, ítems y total | **OK** |
| CP-15 | CRUD Egresos — crear | Verificar alta de egreso y responsable automático | Llenar formulario de egreso (incluye campo "Responsable" que el backend ignora) | `201`; el campo `responsible` en la respuesta es el usuario autenticado, no el texto tipeado | **OK** — se tipeó un nombre distinto y la tabla mostró el usuario real logueado |
| CP-16 | Reportes con montos reales | Verificar que los montos mensuales no estén escalados incorrectamente | Ver tabla "Resumen Financiero" tras crear una venta y un egreso de prueba | Montos exactos en pesos, coincidentes con lo creado | **OK** (tras corregir un bug — ver 7.3) |
| CP-17 | Edición de perfil con sincronización en vivo | Verificar que el Topbar refleja el nombre editado sin recargar | Cambiar "Nombre" en Mi Perfil y guardar | El nombre en el Topbar cambia inmediatamente | **OK** |
| CP-18 | Edición de datos de tienda | Verificar `PUT /api/configuracion/tienda` | Editar teléfono de la empresa y guardar | `200`, dato persistido | **OK** |
| CP-19 | Creación de usuario y login posterior | Verificar el flujo completo alta→autenticación | Crear usuario "Vendedor" con contraseña desde Configuración → Usuarios; cerrar sesión; iniciar sesión con ese usuario | Login exitoso; menú y dashboard acotados al rol `vendedor` | **OK** — hash de bcrypt verificado end-to-end |
| CP-20 | Build de producción del frontend | Verificar que `npm run build` genera artefactos válidos | `npm run build` | Compila sin errores, genera `dist/` | **OK** — 114 módulos, `dist/` generado en 404ms |

### 7.3 Incidencias encontradas durante las pruebas (y su corrección)

1. **Redirección incorrecta tras registrar una venta** (afecta CP-11): `NewSalePage`
   navegaba a `..` esperando volver a la lista de ventas, pero por cómo está
   declarado el router terminaba en el Dashboard. Corregido navegando explícitamente
   a la ruta de ventas del rol activo. *(commit `e2d3db4`)*
2. **`400 Bad Request` al editar perfil/usuario sin foto o teléfono** (afecta
   CP-17/CP-19): la validación de Zod no aceptaba `null` (lo que retorna Prisma para
   campos opcionales vacíos). Corregido agregando `.nullable()` a esos campos.
   *(commit `e2d3db4`)*
3. **Bug de escala `× 1.000.000` en Reportes** (afecta CP-16): heredado del frontend
   original (mezclaba datos mock "en millones" con datos reales sin escalar).
   Corregido al construir el endpoint real de reportes y ajustar el render del
   frontend. *(commit `50e9b3c`)*

Todas las incidencias fueron corregidas y re-verificadas en la misma sesión de
pruebas (evidencia completa en la conversación de desarrollo y en los mensajes de
commit referenciados).

---

## 8. Arquitectura

### 8.1 Frontend

React 19 + Vite 8, estructurado en capas: `pages/` (una carpeta por módulo
funcional) → `components/` (piezas reutilizables: tarjetas, tablas, modal, tabs) →
`layouts/` (`AuthLayout` para login/registro, `AppLayout` para la app autenticada
con Sidebar/Topbar) → `contexts/` (sesión) → `services/` (la única capa que conoce
la existencia de una API HTTP; `apiClient.js` centraliza el `fetch` con el JWT).
El enrutamiento (`react-router-dom`) usa `RoleGuard` para proteger rutas por rol.

### 8.2 Backend

Node.js + Express, arquitectura por capas y por módulo. Cada entidad de negocio es
un paquete independiente en `backend/src/modules/<entidad>/` con 4 archivos:
`*.routes.js` (define los endpoints y aplica middlewares), `*.controller.js`
(recibe `req`/`res`), `*.service.js` (lógica de negocio + acceso a datos vía
Prisma), `*.schema.js` (validación de entrada con zod). Middlewares transversales en
`backend/src/middlewares/`: `authenticate` (verifica JWT), `authorize` (verifica
rol), `validate` (aplica el esquema zod), `errorHandler` (formatea todos los
errores).

### 8.3 Base de datos

MySQL, gestionada con Prisma ORM. 7 tablas:

```
usuarios ──┬──< ventas >──┬── clientes
           │              │
           └──< egresos   └──< detalle_ventas >── productos

configuracion_tienda   (tabla independiente, fila única)
```

- `usuarios 1—N ventas` (vendedor que la registra) y `usuarios 1—N egresos` (responsable).
- `clientes 1—N ventas`.
- `ventas 1—N detalle_ventas` (eliminación en cascada).
- `productos 1—N detalle_ventas`.

Esquema completo con tipos, valores por defecto y enums en
[`backend/prisma/schema.prisma`](backend/prisma/schema.prisma).

### 8.4 Flujo de información y comunicación entre módulos

```
Usuario
  │
  ▼
Frontend (React) ── el servicio de la página arma la petición y adjunta el JWT
  │
  ▼
API REST (Express, /api/...)
  │   authenticate → authorize(rol) → validate(zod)
  ▼
Controller → Service (Prisma Client)
  │
  ▼
MySQL
  │  la respuesta regresa por el mismo camino
  ▼
Frontend actualiza su estado y re-renderiza
```

Los módulos del backend se comunican entre sí **a través de la base de datos**, no
por llamadas directas: por ejemplo, `dashboard` y `reportes` no importan lógica de
`ventas`/`egresos`, sino que leen las mismas tablas vía Prisma. La única
comunicación directa entre servicios ocurre dentro de `ventas.service.js`, que
actualiza `productos` (descuento/reposición de stock) dentro de la misma transacción
de base de datos que crea/elimina la venta.

---

## 9. Conclusiones

1. **El objetivo de la evidencia se cumple de forma verificable:** el sistema quedó
   con sus módulos realmente integrados — no es un frontend con mocks y un backend
   aislado sin usar, sino una aplicación donde cada pantalla consume la API real y
   la API real persiste en MySQL, verificado end-to-end en el navegador (sección 7).
2. **El control de versiones fue una herramienta de trabajo real, no un formalismo
   final:** el historial de 11 commits en un único repositorio público de GitHub
   permite reconstruir el proceso completo, fase por fase, incluyendo los bugs
   encontrados y corregidos.
3. **La arquitectura por capas y por módulo (tanto en frontend como en backend)
   facilitó localizar y corregir defectos rápidamente** durante las pruebas (los 3
   bugs de la sección 7.3 se ubicaron y corrigieron en minutos gracias a la
   separación de responsabilidades).
4. **La seguridad implementada (JWT, bcrypt, autorización por rol en el servidor,
   validación de entrada) va más allá de lo que exigía el frontend original**, que
   solo ocultaba opciones de menú sin protección real — ahora la protección existe
   también del lado del servidor, que es donde realmente importa.
5. **Limitación principal y honesta del proyecto:** no hay pruebas automatizadas ni
   un entorno desplegado públicamente. Ambas son mejoras concretas y acotadas
   (agregar Vitest/Supertest; desplegar en Railway/Vercel) que no requieren rediseñar
   nada de lo ya construido — se detalla exactamente qué falta en la sección 4 y en
   el anexo de esta evidencia.
6. **El proyecto es reproducible por un tercero:** cualquier persona con Node.js y
   MySQL puede clonar el repositorio público y tener el sistema completo corriendo
   siguiendo únicamente `MANUAL_INSTALACION.md`, sin necesitar acceso a la máquina
   original de desarrollo.

---

## 10. Anexos

### 10.1 Árbol completo del proyecto

Ver [`/evidencia/estructura.md`](evidencia/estructura.md) para el árbol íntegro,
carpeta por carpeta y archivo por archivo (excluyendo `node_modules`, `dist` y `.git`).

### 10.2 Dependencias exactas

**Frontend** (`package.json`):
```json
"dependencies": {
  "@fontsource-variable/geist": "^5.2.9",
  "@fontsource/montserrat": "^5.2.8",
  "@fontsource/oswald": "^5.2.8",
  "class-variance-authority": "^0.7.1",
  "clsx": "^2.1.1",
  "lucide-react": "^1.21.0",
  "radix-ui": "^1.6.0",
  "react": "^19.2.7",
  "react-dom": "^19.2.7",
  "react-router-dom": "^7.18.0",
  "shadcn": "^4.11.0",
  "tailwind-merge": "^3.6.0",
  "tailwindcss-animate": "^1.0.7",
  "tw-animate-css": "^1.4.0"
},
"devDependencies": {
  "@eslint/js": "^10.0.1",
  "@tailwindcss/vite": "^4.3.1",
  "@types/react": "^19.2.17",
  "@types/react-dom": "^19.2.3",
  "@vitejs/plugin-react": "^6.0.2",
  "autoprefixer": "^10.5.1",
  "eslint": "^10.5.0",
  "eslint-plugin-react-hooks": "^7.1.1",
  "eslint-plugin-react-refresh": "^0.5.3",
  "globals": "^17.6.0",
  "postcss": "^8.5.15",
  "tailwindcss": "^4.3.1",
  "vite": "^8.1.0"
}
```

**Backend** (`backend/package.json`):
```json
"dependencies": {
  "@prisma/client": "^6.2.1",
  "bcrypt": "^5.1.1",
  "cors": "^2.8.5",
  "dotenv": "^16.4.7",
  "express": "^4.21.2",
  "helmet": "^8.0.0",
  "jsonwebtoken": "^9.0.2",
  "morgan": "^1.10.0",
  "zod": "^3.24.1"
},
"devDependencies": {
  "nodemon": "^3.1.9",
  "prisma": "^6.2.1"
}
```

### 10.3 Variables de entorno necesarias

`backend/.env` (plantilla real en `backend/.env.example`, sin valores sensibles):
```
PORT=4000
NODE_ENV=development
DATABASE_URL="mysql://root:@localhost:3306/grain_store_db"
JWT_SECRET=cambia_esta_clave_por_una_larga_y_secreta
JWT_EXPIRES_IN=8h
FRONTEND_URL=http://localhost:5173
```

`.env` raíz (plantilla real en `.env.example`):
```
VITE_API_URL=http://localhost:4000/api
```

Ninguna de estas variables se versiona con valores reales/sensibles: los archivos
`backend/.env` están excluidos por `.gitignore`.

### 10.4 Scripts disponibles

Ver tabla completa en la sección [3.3](#33-scripts-npm-disponibles).

### 10.5 Comandos de instalación

```bash
git clone https://github.com/gusmancamila93-ops/grain_store_conexion_backend.git
cd grain_stote/backend && npm install
cd .. && npm install
```

### 10.6 Comandos de ejecución

```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2
npm run dev
```

---

**Fin del documento.** Ver también los archivos complementarios en
[`/evidencia`](evidencia/): `README_EVIDENCIA.md`, `capturas_requeridas.md`,
`pruebas.md`, `modulos.md`, `urls.md`, `estructura.md`.
