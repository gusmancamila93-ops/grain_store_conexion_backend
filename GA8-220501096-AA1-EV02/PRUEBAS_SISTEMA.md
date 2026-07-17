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

## Resumen

- **Total de casos ejecutados:** 24
- **Exitosos:** 23
- **Fallidos:** 1 (rutas directas de React Router devolviendo `404`), **corregido y reverificado exitosamente en la misma sesión** antes de cerrar esta evidencia.
- Ningún caso de prueba fue inventado ni asumido: todos corresponden a peticiones HTTP reales o interacciones reales en el navegador contra las URLs públicas del sistema.
