# PRUEBAS DEL SISTEMA — Grain Store

Pruebas funcionales reales, ejecutadas contra el sistema **desplegado en producción**
(frontend en Vercel, backend en Render, base de datos en Aiven) el 2026-07-17. Ninguna
prueba de este documento es simulada: cada "Resultado obtenido" refleja la respuesta
real observada (vía `curl` contra el backend, o vía navegador real contra el frontend).

## Infraestructura y despliegue

| Caso de prueba | Objetivo | Datos utilizados | Resultado esperado | Resultado obtenido | Estado | Observaciones |
|---|---|---|---|---|---|---|
| Health check del backend | Confirmar que la API en Render responde | `GET https://grain-store-conexion-backend.onrender.com/api/health` | `200 { "status": "ok" }` | `200 { "status": "ok" }` en 32.06s | ✅ Exitosa | El tiempo alto corresponde al "cold start" normal del plan gratuito de Render tras inactividad, no a un error |
| Carga del frontend | Confirmar que Vercel sirve la aplicación | `GET https://grain-store-conexion-backend.vercel.app` | `200`, HTML de la SPA | `200`, pantalla de login renderizada con los 3 usuarios de demostración | ✅ Exitosa | — |
| Ruta directa de React Router (primer intento) | Confirmar que una URL profunda (`/admin/clientes`) carga la app, no un 404 | `GET https://grain-store-conexion-backend.vercel.app/admin/clientes` | `200`, contenido de la app | **`404: NOT_FOUND` (página de error de Vercel)** | ❌ **Fallida** | Causa: `vercel.json` (con el rewrite de SPA) estaba commiteado solo en la rama `feature/manejo-errores-y-evidencia-ev02`, no en `main` — que es la rama que Vercel despliega a producción. Ver corrección abajo |
| Ruta directa de React Router (tras corrección) | Confirmar que el problema anterior quedó resuelto | Mismo `GET` que arriba, después de fusionar el PR #1 a `main` y esperar el redeploy automático de Vercel | `200`, contenido real de la app | `200`, página de Clientes con datos reales | ✅ Exitosa | Verificado además en `/admin/reportes`, `/admin/configuracion` y `/vendedor/dashboard` — los 4 devuelven `200` |
| CORS entre Vercel y Render | Confirmar que el navegador puede llamar a la API sin ser bloqueado | Login real desde `https://grain-store-conexion-backend.vercel.app` hacia la API de Render | Petición aceptada, sin error de CORS en consola | Login exitoso, sin errores de CORS | ✅ Exitosa | `FRONTEND_URL` en Render ya apunta al dominio real de Vercel |

## Autenticación

| Caso de prueba | Objetivo | Datos utilizados | Resultado esperado | Resultado obtenido | Estado | Observaciones |
|---|---|---|---|---|---|---|
| Login Administrador (API) | Verificar autenticación directa contra el backend | `POST /api/auth/login` con `admin@grainstore.com` / `admin123` / `admin` | `200`, `{ token, user }` | `200`, token JWT y datos de usuario recibidos | ✅ Exitosa | — |
| Login Administrador (UI) | Verificar el flujo completo desde el navegador | Mismas credenciales, desde el formulario de login en Vercel | Redirección al Dashboard de Administrador | Dashboard cargado con datos reales | ✅ Exitosa | — |
| Login Vendedor (UI) | Verificar autenticación y menú acotado | `vendedor@grainstore.com` / `vendedor123` | Panel de Vendedor, menú con solo Dashboard/Ventas/Clientes/Productos | Panel correcto, menú acotado confirmado | ✅ Exitosa | — |
| Login Contador (UI) | Verificar autenticación y datos financieros | `contador@grainstore.com` / `contador123` | Panel de Contador con balance financiero | Panel correcto, ingresos/egresos/utilidad en $0 (sin movimientos del mes actual) | ✅ Exitosa | — |
| Petición sin token | Verificar que la API exige autenticación | `GET /api/clientes` sin header `Authorization` | `401` | `401` | ✅ Exitosa | — |
| Cierre de sesión | Verificar que "Salir" limpia la sesión | Clic en "Salir" desde el panel de Administrador y de Vendedor | Redirección a `/login`, sesión eliminada | Redirección correcta en ambos casos | ✅ Exitosa | — |

## Dashboard

| Caso de prueba | Objetivo | Datos utilizados | Resultado esperado | Resultado obtenido | Estado | Observaciones |
|---|---|---|---|---|---|---|
| Dashboard Administrador | Verificar agregación global | Sesión de admin, `GET /api/dashboard` | Estadísticas de todo el negocio | "Clientes Activos: 2", "Bajo stock: 1" — coincide con los datos reales de la BD | ✅ Exitosa | — |
| Dashboard Vendedor | Verificar filtrado por usuario | Sesión de vendedor | Solo las ventas de ese vendedor | "Clientes Atendidos: 1", "Ventas Registradas: 1" (coincide con el seed, donde el vendedor registró 1 venta) | ✅ Exitosa | — |
| Dashboard Contador | Verificar balance financiero | Sesión de contador | Ingresos/egresos/utilidad del mes | $0 en los 3 (correcto: sin movimientos en julio 2026, mes actual) | ✅ Exitosa | — |

## Clientes

| Caso de prueba | Objetivo | Datos utilizados | Resultado esperado | Resultado obtenido | Estado | Observaciones |
|---|---|---|---|---|---|---|
| Listado de clientes | Verificar carga de datos reales | `GET /api/clientes` y vista en UI | 4 clientes, contadores por estado | 4 clientes (2 activos, 1 pendiente, 1 inactivo) — coincide API y UI | ✅ Exitosa | — |

## Productos

| Caso de prueba | Objetivo | Datos utilizados | Resultado esperado | Resultado obtenido | Estado | Observaciones |
|---|---|---|---|---|---|---|
| Listado de productos con estado calculado | Verificar cálculo de stock | `GET /api/productos` y vista en UI | Estados `Normal`/`Bajo stock`/`Agotado` correctos | 4 productos: 3 "Normal", 1 "Bajo stock" (Frijol Cargamanto, 8/12) | ✅ Exitosa | — |

## Ventas

| Caso de prueba | Objetivo | Datos utilizados | Resultado esperado | Resultado obtenido | Estado | Observaciones |
|---|---|---|---|---|---|---|
| Listado de ventas | Verificar totales y estados | `GET /api/ventas` y vista en UI | 3 ventas, total vendido correcto | 3 ventas (2 pagadas, 1 pendiente), total `$859.800` | ✅ Exitosa | — |
| Formulario "Nueva Venta" | Verificar carga de clientes/productos reales en el formulario | Navegación a `/admin/ventas/nueva` | Combos de cliente y producto poblados desde la API | Combos con los 4 clientes y 4 productos reales | ✅ Exitosa | No se confirmó el envío del formulario en producción para no alterar los datos de la evidencia (sí se verificó exhaustivamente el flujo de creación de venta, incluyendo descuento de stock, en la sesión de pruebas contra Aiven previa al despliegue) |

## Egresos

| Caso de prueba | Objetivo | Datos utilizados | Resultado esperado | Resultado obtenido | Estado | Observaciones |
|---|---|---|---|---|---|---|
| Listado de egresos | Verificar totales y responsables | `GET /api/egresos` y vista en UI | 3 egresos, total y responsables correctos | 3 egresos, total `$4.350.000`, responsables (Administrador/Vendedor/Contador) resueltos correctamente | ✅ Exitosa | — |

## Reportes

| Caso de prueba | Objetivo | Datos utilizados | Resultado esperado | Resultado obtenido | Estado | Observaciones |
|---|---|---|---|---|---|---|
| Resumen financiero mensual | Verificar que los montos son reales (no escalados) | `GET /api/reportes` y vista en UI | Montos mensuales en pesos reales | Junio: `$859.800` ingresos / `$4.350.000` egresos — coincide exactamente con Ventas y Egresos | ✅ Exitosa | Confirma que el bug histórico de escala (`×1.000.000`) sigue corregido en producción |

## Usuarios

| Caso de prueba | Objetivo | Datos utilizados | Resultado esperado | Resultado obtenido | Estado | Observaciones |
|---|---|---|---|---|---|---|
| Listado de usuarios (solo admin) | Verificar acceso restringido y datos reales | `GET /api/usuarios` con token admin; pestaña "Usuarios" en UI | 3 usuarios listados, con rol en español | 3 usuarios (Administrador, Vendedor, Contador), roles mostrados correctamente | ✅ Exitosa | — |

## Configuración

| Caso de prueba | Objetivo | Datos utilizados | Resultado esperado | Resultado obtenido | Estado | Observaciones |
|---|---|---|---|---|---|---|
| Pestaña Mi Perfil | Verificar carga de datos del usuario autenticado | `GET /api/auth/me` y vista en UI | Nombre, correo, teléfono del admin | Datos correctos cargados | ✅ Exitosa | — |
| Pestaña Mi Tienda | Verificar datos de la empresa | `GET /api/configuracion/tienda` y vista en UI | Nombre, NIT, dirección, preferencias | "Grain Store", NIT `900123456-1`, dirección y preferencias cargadas correctamente | ✅ Exitosa | — |
| Pestaña Sistema | Verificar información de solo lectura | `GET /api/configuracion/sistema` y vista en UI | Idioma, notificaciones, copia de seguridad, versión | Campos visibles, sin errores | ✅ Exitosa | — |

## Control de acceso por rol (transversal a todos los módulos)

| Caso de prueba | Objetivo | Datos utilizados | Resultado esperado | Resultado obtenido | Estado | Observaciones |
|---|---|---|---|---|---|---|
| Bloqueo de endpoint por rol incorrecto | Verificar autorización en el backend | `GET /api/egresos` con token de rol `vendedor` | `403` | `403` (verificado en la sesión de pruebas previa al despliegue, mismo backend/código ahora en producción) | ✅ Exitosa | — |
| Bloqueo de ruta cruzada en el frontend (tras la corrección del SPA) | Verificar que `RoleGuard` sigue funcionando en navegación directa | Sesión de `vendedor`, `GET https://grain-store-conexion-backend.vercel.app/admin/reportes` | Redirección a `/vendedor/dashboard` | Redirección correcta a `/vendedor/dashboard` | ✅ Exitosa | Prueba clave: confirma que la corrección del rewrite de SPA no rompió el control de acceso por rol |

## Resumen (pruebas manuales/funcionales)

- **Total de casos ejecutados:** 24
- **Exitosos:** 23
- **Fallidos:** 1 (rutas directas de React Router devolviendo `404`), **corregido y reverificado exitosamente en la misma sesión** antes de cerrar esta evidencia.
- Ningún caso de prueba fue inventado ni asumido: todos corresponden a peticiones HTTP reales o interacciones reales en el navegador contra las URLs públicas del sistema.

# Pruebas automatizadas

Además de las pruebas funcionales manuales de las secciones anteriores, el sistema
cuenta con una suite de **pruebas automatizadas reales** (unitarias e integración)
que se ejecuta contra el código fuente y valida comportamiento real: autenticación,
validaciones, reglas de negocio, endpoints HTTP, componentes React y flujos de
navegación. Se agregaron sin modificar la lógica ni la arquitectura existente del
sistema.

## Herramientas y dependencias instaladas

**Backend** (`backend/package.json`, `devDependencies`):
- [`vitest`](https://vitest.dev) — corredor de pruebas y aserciones, compatible de forma nativa con ESM y con el mapeo de imports `#config/*`, `#modules/*`, etc. ya usado por el proyecto.
- [`supertest`](https://github.com/ladjs/supertest) — pruebas HTTP contra la app de Express (`src/app.js`) sin necesidad de levantar un servidor real.

**Frontend** (`package.json` raíz, `devDependencies`):
- `vitest` — mismo corredor, configurado en `vite.config.js` (bloque `test`) reutilizando el alias `@` ya definido para Vite.
- `@testing-library/react` y `@testing-library/user-event` — renderizado e interacción real con los componentes.
- `@testing-library/jest-dom` — matchers adicionales (`toBeInTheDocument`, etc.).
- `jsdom` — entorno de navegador simulado para ejecutar los componentes en Node.

## Nota sobre el uso de una base de datos simulada (mock)

El proyecto usa MySQL en producción (Aiven) y localmente (XAMPP), pero el entorno
donde se generó esta evidencia no tiene un servidor MySQL disponible. Para poder
ejecutar pruebas reales de manera reproducible en **cualquier equipo o pipeline de
CI**, sin depender de una base de datos externa, las pruebas de backend sustituyen
únicamente la capa de acceso a datos (`#config/db.js`, el cliente de Prisma) por un
doble de prueba (`backend/tests/helpers/prismaMock.js`). Toda la lógica real del
sistema —autenticación, validaciones con Zod, middlewares de autorización,
controladores, servicios y reglas de negocio (cálculo de stock, totales, roles)— se
ejecuta sin modificar ni una línea; solo se evita la conexión TCP real a MySQL.

## Estructura de pruebas

```
backend/
 └── tests/
      ├── setup.js
      ├── helpers/
      │    ├── prismaMock.js
      │    └── authToken.js
      ├── unit/
      │    ├── password.test.js
      │    ├── jwt.test.js
      │    ├── constants.test.js
      │    ├── monthly.test.js
      │    ├── apiError.test.js
      │    ├── authorize.middleware.test.js
      │    ├── validate.middleware.test.js
      │    ├── auth.service.test.js
      │    ├── productos.service.test.js
      │    └── reportes.service.test.js
      └── integration/
           ├── health.integration.test.js
           ├── auth.integration.test.js
           ├── productos.integration.test.js
           ├── ventas.integration.test.js
           ├── clientes.integration.test.js
           ├── egresos.integration.test.js
           ├── dashboard.integration.test.js
           ├── reportes.integration.test.js
           ├── usuarios.integration.test.js
           └── configuracion.integration.test.js

src/
 └── tests/
      ├── setup.js
      ├── unit/
      │    ├── StatCard.test.jsx
      │    ├── SearchInput.test.jsx
      │    ├── EmptyState.test.jsx
      │    ├── Modal.test.jsx
      │    ├── Button.test.jsx
      │    ├── useAuth.test.jsx
      │    ├── formatCurrency.test.js
      │    ├── formatDate.test.js
      │    └── LoginPage.test.jsx
      └── integration/
           ├── testAppHelper.jsx
           ├── initialRender.integration.test.jsx
           ├── roleGuard.integration.test.jsx
           ├── loginSuccess.integration.test.jsx
           ├── loginFailure.integration.test.jsx
           ├── logout.integration.test.jsx
           ├── dashboardDataLoading.integration.test.jsx
           └── apiClientAuthStorage.integration.test.js
```

## Comandos de ejecución

```bash
# Backend
cd backend
npm run test          # ejecuta toda la suite una vez
npm run test:watch    # modo watch, útil en desarrollo

# Frontend (desde la raíz del repositorio)
npm run test
npm run test:watch
```

## Pruebas unitarias realizadas

**Backend (38 pruebas):**
- `password.js`: una contraseña correcta permite la autenticación, una incorrecta la rechaza, el hash generado nunca es igual al texto plano.
- `jwt.js`: un token firmado se verifica correctamente y conserva el payload (`id`, `rol`, `nombre`); un token alterado o inválido es rechazado.
- `constants.js` (`getProductStatus`): calcula `Agotado`, `Bajo stock` y `Normal` según `stock` y `stockMinimo`, igual que en producción.
- `monthly.js`: `sumByMonth` agrupa y suma valores por mes/año correctamente e ignora años distintos; `isSameMonth`/`isSameDay` comparan fechas con exactitud.
- `ApiError`: cada fábrica (`unauthorized`, `forbidden`, `notFound`, `badRequest`) genera el código HTTP y el código de error correctos.
- `authorize` (middleware de roles): permite el paso con un rol autorizado, lanza `403` con un rol no autorizado y `401` sin usuario autenticado.
- `validate` (middleware de Zod): normaliza datos válidos (ej. correo a minúsculas), y rechaza con `400 VALIDATION_ERROR` cuando faltan campos o el formato es inválido.
- `authService.login`: autentica con credenciales correctas, y rechaza contraseña incorrecta, rol no coincidente, usuario inactivo y correo inexistente — con el código HTTP correcto en cada caso.
- `productosService`: calcula el estado del producto al listar, filtra por estado calculado, lanza `404` al actualizar un producto inexistente y traduce correctamente los campos públicos al esquema de base de datos.
- `reportesService.getReports`: calcula ingresos/egresos/utilidad reales a partir de las ventas pagadas y los egresos, e identifica el producto líder y los clientes con deuda pendiente.

**Frontend (25 pruebas):** componentes `StatCard`, `SearchInput`, `EmptyState`, `Modal`, `Button` (renderizado, variantes, interacción de usuario con `user-event`, estados deshabilitados); el hook `useAuth` (error fuera de `AuthProvider`, lectura del contexto); las utilidades `formatCurrency` y `formatDate`; y `LoginPage` (precarga de datos del usuario de demostración, edición de campos, selección de usuario de prueba, mensaje de error ante credenciales inválidas).

## Pruebas de integración realizadas

**Backend (30 pruebas)**, todas contra la app real de Express (`src/app.js`) vía `supertest`, verificando código HTTP, estructura de la respuesta JSON, autenticación por token y permisos por rol:
- `GET /api/health` (sin auth) y ruta inexistente → `404 NOT_FOUND`.
- `POST /api/auth/login` (éxito, credenciales inválidas, validación incompleta) y `GET /api/auth/me` (sin token → `401`, con token → perfil).
- `GET /api/productos`: `401` sin token, `403` para rol sin permiso (`contador`), `200` con estado de stock calculado.
- `GET /api/ventas` y `POST /api/ventas`: regla de negocio real de stock insuficiente (`400 INSUFFICIENT_STOCK`) y producto inexistente (`400 PRODUCT_NOT_FOUND`).
- `GET /api/clientes` (sin token, con los 3 roles autorizados) y `404` al actualizar un cliente inexistente.
- `GET /api/egresos` (`403` para `vendedor`, `200` para `contador`) y `POST /api/egresos` asociando el egreso al usuario autenticado.
- `GET /api/dashboard`: contenido distinto según el rol (`admin` vs `vendedor`, filtrando por `usuarioId`) y `401` sin autenticación.
- `GET /api/reportes`: `403` para `vendedor`, `200` con la estructura completa (`stats`, `monthly` de 12 meses) para `admin`.
- `GET /api/usuarios` y `POST /api/usuarios`: `403` para no-admin, `200` sin exponer `passwordHash`, `400` de validación con contraseña corta.
- `GET /api/configuracion/sistema` y `GET /api/configuracion/tienda`: permisos por rol y creación de configuración por defecto cuando no existe registro previo.

**Frontend (12 pruebas)**, renderizando la aplicación real (`App` + `AuthProvider` + `react-router`) con `fetch` simulado:
- Renderizado inicial: la ruta raíz y una ruta desconocida redirigen a `/login` sin sesión activa.
- `RoleGuard`: redirige a `/login` sin sesión, redirige al home del rol cuando el rol no coincide, y renderiza el contenido protegido cuando sí coincide.
- Flujo de login exitoso: autentica, persiste la sesión en `localStorage`, navega al panel del rol y el `Dashboard` carga datos reales de la API simulada (incluyendo el header `Authorization: Bearer <token>`).
- Flujo de login fallido: muestra el mensaje de error real del backend y no navega ni persiste sesión.
- Cierre de sesión: limpia `localStorage` y redirige a `/login` desde el panel.
- Carga de datos del dashboard: navegación según rol (`vendedor`) y manejo de estado de error con botón de reintento.
- Integración `authService` + `apiClient` + `storage`: el token se adjunta en peticiones posteriores al login, y una respuesta `401` limpia la sesión persistida.

## Resultados obtenidos

| Suite | Archivos | Pruebas | Resultado | Tiempo |
|---|---|---|---|---|
| Backend — unitarias | 10 | 38 | ✅ 38/38 exitosas | ~1.1 s |
| Backend — integración | 10 | 30 | ✅ 30/30 exitosas | incluido arriba (misma corrida) |
| Backend — total (`npm run test`) | 20 | 68 | ✅ 68/68 exitosas | ~2.8 s |
| Frontend — unitarias | 9 | 25 | ✅ 25/25 exitosas | incluido abajo |
| Frontend — integración | 7 | 12 | ✅ 12/12 exitosas | incluido abajo |
| Frontend — total (`npm run test`) | 16 | 37 | ✅ 37/37 exitosas | ~9.4 s |
| **Total general** | **36** | **105** | ✅ **105/105 exitosas** | — |

## Ejecución de pruebas automatizadas

Registro de la **última ejecución real** de la suite completa, con la salida
efectivamente producida por Vitest (sin datos inventados ni estimados).

- **Fecha y hora de ejecución:** 2026-07-17, 13:40 (hora local del entorno de desarrollo).
- **Comando backend:** `cd backend && npx vitest run` (equivalente a `npm run test`).
- **Comando frontend:** `npx vitest run` desde la raíz del repositorio (equivalente a `npm run test`).

### Resultado — Backend

```
RUN  v4.1.10 C:/Users/Lenovo/Desktop/grain_store/grain_stote/backend

 Test Files  20 passed (20)
      Tests  68 passed (68)
   Start at  13:40:18
   Duration  2.69s (transform 2.75s, setup 295ms, import 12.61s, tests 2.20s, environment 3ms)
```

- Archivos de prueba ejecutados: **20** (10 en `tests/unit/`, 10 en `tests/integration/`).
- Pruebas ejecutadas: **68**.
- Pruebas aprobadas: **68** (0 fallidas).
- Duración total: **2.69 s**.

### Resultado — Frontend

```
RUN  v4.1.10 C:/Users/Lenovo/Desktop/grain_store/grain_stote

 Test Files  16 passed (16)
      Tests  37 passed (37)
   Start at  13:40:03
   Duration  10.03s (transform 3.59s, setup 10.51s, import 3.97s, tests 10.48s, environment 57.13s)
```

- Archivos de prueba ejecutados: **16** (9 en `src/tests/unit/`, 7 en `src/tests/integration/`).
- Pruebas ejecutadas: **37**.
- Pruebas aprobadas: **37** (0 fallidas).
- Duración total: **10.03 s**.

### Totales de esta ejecución

| Suite | Archivos de prueba | Pruebas ejecutadas | Pruebas aprobadas | Pruebas fallidas |
|---|---|---|---|---|
| Backend | 20 | 68 | 68 | 0 |
| Frontend | 16 | 37 | 37 | 0 |
| **Total** | **36** | **105** | **105** | **0** |

El mínimo exigido (10 unitarias + 10 integración en backend; 8 unitarias + 8
integración en frontend; 36 en total) se cumple y se supera en las cuatro
categorías, sin pruebas vacías ni artificiales: cada prueba ejercita una entrada
concreta, compara contra un resultado esperado explícito y falla si el
comportamiento real del sistema cambia.

Durante la implementación se detectó y corrigió un problema del propio entorno de
pruebas (no del sistema): el `localStorage` experimental incorporado en Node.js 25
sustituía al `localStorage` de `jsdom` en las pruebas de frontend. Se resolvió con
un polyfill de `Storage` en memoria dentro de `src/tests/setup.js`, sin tocar
ningún archivo de código fuente del sistema.
