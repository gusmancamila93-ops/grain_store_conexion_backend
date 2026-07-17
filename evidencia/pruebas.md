# Pruebas realizadas — Grain Store

## Alcance de las pruebas

El proyecto **no tiene pruebas automatizadas** (no hay Jest, Vitest, Mocha,
Supertest ni Playwright configurados; no existe carpeta `tests/` ni `__tests__/` en
el repositorio). Toda la verificación funcional se realizó de forma **manual y
real**, en dos etapas del desarrollo:

1. **Fase 3 (backend recién construido):** pruebas contra el servidor Express real
   (`localhost:4000`) usando `curl`, con la base de datos MySQL real.
2. **Fase 4 (integración completa):** pruebas contra el sistema completo en un
   navegador real — frontend (`localhost:5173`) consumiendo el backend real, que a
   su vez persiste en MySQL real. Se usaron herramientas de automatización de
   navegador para simular clics, llenado de formularios y lectura de las respuestas
   de red efectivamente recibidas.

Ningún resultado de esta sección es hipotético: cada "Resultado obtenido" refleja lo
que efectivamente devolvió el sistema al ejecutarse.

## Pruebas de backend (vía `curl`, Fase 3)

| # | Prueba | Comando / acción | Resultado obtenido |
|---|---|---|---|
| B-01 | Salud del servidor | `GET /api/health` | `200 { "status": "ok" }` |
| B-02 | Login válido (admin) | `POST /api/auth/login` con credenciales del seed | `200`, token JWT + datos de usuario |
| B-03 | `GET /me` con token | `GET /api/auth/me` con `Authorization: Bearer <token>` | `200`, datos del usuario autenticado |
| B-04 | Listado de clientes | `GET /api/clientes` | `200`, arreglo de 4 clientes (seed) |
| B-05 | Listado de productos | `GET /api/productos` | `200`, arreglo de 4 productos con `status` calculado (`"Bajo stock"` en Frijol Cargamanto: 8/12) |
| B-06 | Petición sin token | `GET /api/clientes` sin header `Authorization` | `401` |
| B-07 | Rol incorrecto | `GET /api/egresos` con token de `vendedor` | `403` |
| B-08 | Crear venta válida | `POST /api/ventas` con 2 unidades de un producto en stock | `201`; stock del producto pasó de 8 a 6 |
| B-09 | Venta con stock insuficiente | `POST /api/ventas` pidiendo 9999 unidades | `400`, `code: "INSUFFICIENT_STOCK"`, mensaje con el stock disponible |
| B-10 | Validación de campos | `POST /api/clientes` con solo `{"name":"Solo nombre"}` | `400`, `code: "VALIDATION_ERROR"`, detalle de los 4 campos obligatorios faltantes (`document`, `phone`, `email`, `address`) |
| B-11 | Eliminar venta repone stock | `DELETE /api/ventas/:id` sobre la venta creada en B-08 | `204`; stock del producto volvió de 6 a 8 |
| B-12 | CRUD usuarios (admin) | `GET/POST /api/usuarios` | `200`/`201`, listado y creación correctos |
| B-13 | Configuración de tienda | `GET/PUT /api/configuracion/tienda` | `200` en ambos, cambios persistidos |
| B-14 | Configuración de sistema | `GET /api/configuracion/sistema` | `200`, valores fijos de la aplicación |
| B-15 | Egresos (contador) | `POST /api/egresos` | `201`, `responsible` = usuario autenticado |

## Pruebas de integración completa (navegador real, Fase 4)

| # | Prueba | Objetivo | Pasos | Resultado esperado | Resultado obtenido |
|---|---|---|---|---|---|
| I-01 | Login Administrador | Verificar autenticación end-to-end desde la UI | Abrir `/login`, usar credenciales de admin, enviar | Redirección al dashboard de admin con datos reales | **OK** |
| I-02 | Login Vendedor | Ídem, rol vendedor | Ídem con credenciales de vendedor | Panel y menú acotados a vendedor | **OK** |
| I-03 | Login Contador | Ídem, rol contador | Ídem con credenciales de contador | Panel y menú acotados a contador | **OK** |
| I-04 | `RoleGuard` bloquea rutas cruzadas | Verificar protección de rutas en el cliente | Con sesión de vendedor, navegar directamente a `/admin/reportes` | Redirección automática a `/vendedor/dashboard` | **OK** |
| I-05 | Crear cliente desde la UI | Verificar el flujo completo de alta | Llenar "Nuevo Cliente" y enviar | `POST /api/clientes` → `201`; tabla y contadores se actualizan sin recargar | **OK** — total pasó de 4 a 5, activos de 2 a 3 |
| I-06 | Listado de productos con estado | Verificar que el estado de stock se ve correctamente en la UI | Abrir "Productos" | Badges `Normal`/`Bajo stock`/`Agotado` coherentes con cada producto | **OK** |
| I-07 | Registrar venta (descuento de stock) | Verificar la transacción completa desde la UI | Completar "Nueva Venta" con 1 unidad de un producto | `POST /api/ventas` → `201`; el stock del producto baja en 1 en la página de Productos | **OK** — Maíz Petado: 35 → 34 |
| I-08 | Ver detalle de venta | Verificar que el detalle trae los ítems reales del backend (no solo el resumen de la lista) | Clic en "Ver detalle" de una venta | `GET /api/ventas/:id` → modal con código, cliente, método de pago, ítems y total | **OK** |
| I-09 | Eliminar venta repone stock | Verificar reversión de inventario desde la UI | Eliminar una venta recién creada | `DELETE /api/ventas/:id` → `204`; el stock del producto vuelve a su valor original | **OK** |
| I-10 | Registrar egreso | Verificar alta y que el "responsable" real viene del login, no del formulario | Completar "Registrar Egreso" escribiendo un nombre distinto en el campo "Responsable" | `POST /api/egresos` → `201`; la tabla muestra el usuario autenticado, no el texto escrito | **OK** |
| I-11 | Reportes con montos reales | Verificar que el resumen financiero mensual no esté mal escalado | Ver "Resumen Financiero" tras crear una venta y un egreso de prueba en el mes actual | Montos exactos en pesos, coincidentes con lo creado | **OK** (tras corregir el bug de escala — ver abajo) |
| I-12 | Editar perfil con sincronización en vivo | Verificar que el nombre del Topbar se actualiza sin recargar la página | Cambiar "Nombre" en Configuración → Mi Perfil y guardar | `PUT /api/auth/me` → `200`; el nombre del Topbar cambia inmediatamente | **OK** |
| I-13 | Editar datos de tienda | Verificar persistencia de configuración de empresa | Cambiar el teléfono de la empresa en Configuración → Mi Tienda y guardar | `PUT /api/configuracion/tienda` → `200`, dato persistido tras recargar | **OK** |
| I-14 | Crear usuario y volver a iniciar sesión con él | Verificar el flujo completo alta de usuario → autenticación real (bcrypt) | Crear un usuario "Vendedor" con contraseña desde Configuración → Usuarios; cerrar sesión; iniciar sesión con ese usuario nuevo | Login exitoso; menú y dashboard acotados al rol asignado | **OK** |
| I-15 | Build de producción | Verificar que el frontend compila sin errores | `npm run build` | Compilación exitosa, `dist/` generado | **OK** — 114 módulos transformados, build en 404ms |

## Bugs encontrados durante las pruebas y su corrección

Estas incidencias se descubrieron **durante** la ejecución de las pruebas de la
tabla anterior (no antes), lo que demuestra que las pruebas manuales cumplieron su
propósito real de detectar defectos, no solo confirmar lo esperado.

### 1. Redirección incorrecta tras registrar una venta (detectado en I-07)
**Síntoma:** al guardar una venta nueva, la aplicación redirigía al Dashboard en vez
de a la lista de Ventas.
**Causa:** `NewSalePage.jsx` usaba `navigate("..", { replace: true })`, pero en el
árbol de rutas `ventas/nueva` está declarada como ruta **hermana** de `ventas` (no
anidada bajo ella), por lo que `".."` resolvía al índice de `/admin` (el Dashboard).
**Corrección:** se reemplazó por `navigate(\`/${role}/ventas\`, { replace: true })`.
**Verificación posterior:** se repitió I-07 y la redirección fue correcta.

### 2. `400 Bad Request` al guardar perfil o editar un usuario sin foto/teléfono (detectado en I-12/I-14)
**Síntoma:** `PUT /api/auth/me` respondía `400` con `"Expected string, received null"`
para el campo `photo`.
**Causa:** los usuarios del seed no tienen foto ni siempre teléfono; Prisma retorna
`null` para esos campos opcionales, pero el esquema de Zod solo aceptaba
`string | undefined`, no `null`.
**Corrección:** se agregó `.nullable()` a `phone` y `photo` en
`auth.schema.js` y a `phone` en `usuarios.schema.js`.
**Verificación posterior:** se repitió I-12 y respondió `200`.

### 3. Montos mensuales de Reportes multiplicados por 1.000.000 (detectado en I-11, heredado del frontend original)
**Síntoma:** el resumen financiero mensual mostraba cifras absurdamente grandes.
**Causa:** el frontend original mezclaba datos mock "en millones" (una convención de
la maqueta) con un multiplicador `* 1000000` fijo en el render; al conectar datos
reales en pesos, la multiplicación quedó aplicada sobre valores que ya eran reales.
**Corrección:** se construyó el endpoint `GET /api/reportes` para devolver montos
reales en pesos y se quitó el multiplicador del render en `ReportsPage.jsx`.
**Verificación posterior:** se repitió I-11 con una venta y un egreso de prueba y los
montos coincidieron exactamente.

## Resumen

- 15 pruebas de backend (`curl`): **15/15 OK**.
- 15 pruebas de integración completa (navegador): **15/15 OK** (3 requirieron una
  corrección de código antes de pasar; documentado arriba).
- 3 bugs reales encontrados y corregidos durante el proceso, con commits
  identificables en el historial de Git (`e2d3db4`, `50e9b3c`).
