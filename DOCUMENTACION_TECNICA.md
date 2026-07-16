# DOCUMENTACION_TECNICA.md — Grain Store

Documento técnico de cierre del proyecto: resume la arquitectura implementada, las
decisiones tomadas, la seguridad aplicada, las pruebas realizadas y las limitaciones
conocidas. Complementa a [DISENO_BACKEND.md](DISENO_BACKEND.md) (diseño previo a la
implementación) con lo que efectivamente quedó construido.

## 1. Arquitectura implementada

```
React (Vite) ── fetch + JWT ──▶ Express (Node.js) ── Prisma Client ──▶ MySQL
```

- **Frontend:** React 19 + React Router 7, sin cambios de diseño. Los `src/services/*.js`
  son la única capa que sabe que existe una API HTTP; las páginas siguen usando los
  mismos nombres de función que antes (`readCustomers`, `createSale`, etc.), ahora
  asíncronos.
- **Backend:** arquitectura por capas y por módulo, un paquete (`routes/controller/service/schema`)
  por entidad, bajo `backend/src/modules/`. Ver la estructura completa en
  [README_BACKEND.md](README_BACKEND.md).
- **Base de datos:** MySQL, un único origen de verdad. `localStorage` dejó de usarse
  para datos de negocio (se mantiene únicamente para la preferencia de tema
  claro/oscuro, que es un detalle de UI ajeno al alcance de esta evidencia).

## 2. Modelo de datos

7 tablas: `usuarios`, `clientes`, `productos`, `ventas`, `detalle_ventas`, `egresos`,
`configuracion_tienda`. Relaciones:

- `Usuario 1—N Venta` (vendedor que registra la venta).
- `Usuario 1—N Egreso` (responsable).
- `Cliente 1—N Venta`.
- `Venta 1—N DetalleVenta` (ítems de la venta, cascada al eliminar la venta).
- `Producto 1—N DetalleVenta`.

Definición completa en [backend/prisma/schema.prisma](backend/prisma/schema.prisma).

### Decisiones de modelado
- **Usuarios unificados:** el análisis inicial (Fase 1) encontró dos fuentes de
  "usuario" separadas en el frontend original (`MOCK_USERS` para login vs.
  `seedUsers` para el CRUD de administración), sin relación entre sí. Se unificaron
  en una sola tabla `usuarios`, con `rol` en minúsculas (`admin`/`vendedor`/`contador`)
  para que coincida exactamente con la lógica de `RoleGuard` del frontend.
- **Relaciones reales en vez de texto libre:** `Venta.cliente` y `DetalleVenta.producto`
  eran texto libre en el frontend original; ahora son claves foráneas (`clienteId`,
  `productoId`). Lo mismo para `Egreso.responsible`, que ahora es `usuarioId` tomado
  automáticamente del usuario autenticado (nunca del body de la petición, por
  seguridad — evita que cualquier usuario se atribuya un egreso a otra persona).
- **Enums solo para campos cortos y críticos para autorización** (`rol`, `estado`);
  el resto de listas cerradas (categorías de producto, categorías de egreso, método
  de pago) se validan con `zod` contra constantes compartidas
  (`backend/src/utils/constants.js`) en vez de usar `enum` de base de datos — permite
  ampliarlas sin generar una migración, y evita el problema de que varios valores
  llevan tildes/espacios (`"Compra de mercancía"`, `"Crédito"`), que no son
  identificadores válidos para un `enum` de Prisma.
- **`configuracion_tienda` como tabla singleton** (una sola fila, `id` fijo en 1):
  la aplicación no contempla múltiples tiendas/sucursales.
- **Estado de producto no se almacena:** `Normal` / `Bajo stock` / `Agotado` se
  calcula en el backend (`getProductStatus`) comparando `stock` contra `stockMinimo`
  en cada respuesta, igual que hacía originalmente `productosService.getStatus()`
  en el frontend.

## 3. Seguridad

| Mecanismo | Implementación |
|---|---|
| Autenticación | JWT firmado (`JWT_SECRET`), expira en 8h (`JWT_EXPIRES_IN`) |
| Contraseñas | Hash con `bcrypt`, 10 salt rounds; nunca se devuelve `passwordHash` en ninguna respuesta |
| Autorización por rol | Middleware `authorize(...roles)` en cada router; replica exactamente los permisos que el frontend ya mostraba/ocultaba en el menú (`ROLE_ROUTES`) |
| Cabeceras HTTP | `helmet()` con su configuración por defecto |
| CORS | Restringido a `FRONTEND_URL` (una sola URL de origen permitido) |
| Validación de entrada | `zod` en cada endpoint que recibe body/query/params; errores `400` con detalle de campos |
| Manejo de errores | Middleware centralizado; en producción no se filtran stack traces al cliente |
| Egresos/ventas y el usuario que las registra | Siempre se toman del token (`req.user`), nunca de un campo del body — evita suplantación |

**Fuera de alcance (justificado):** no se implementó *refresh token* (JWT expira y
obliga a re-loguear); es una decisión consciente de simplicidad para un proyecto
académico, documentada también en la Fase 2 (`DISENO_BACKEND.md`).

## 4. Pruebas realizadas

No se automatizaron pruebas unitarias/integración (fuera del alcance definido para
esta evidencia), pero se verificó manualmente **cada endpoint y cada pantalla**:

- **Backend (vía `curl`):** login de los 3 roles, `GET /me`, CRUD completo de
  clientes/productos/usuarios/egresos, creación y eliminación de ventas (incluyendo
  el descuento y la reposición de stock dentro de una transacción Prisma),
  validaciones de Zod (`400` con campos faltantes), autorización por rol (`401` sin
  token, `403` con rol incorrecto), y los endpoints de dashboard/reportes/configuración.
- **Integración frontend↔backend (navegador real):** flujo completo de login/logout
  para los 3 roles; creación de cliente, producto, venta (con verificación de que el
  stock del producto vendido efectivamente baja) y egreso desde la UI; visualización
  del detalle de una venta (ítems reales traídos del backend); edición de perfil con
  sincronización inmediata del nombre en el Topbar; edición de datos de tienda;
  creación de un usuario nuevo (con contraseña) y verificación de que ese usuario
  puede iniciar sesión; bloqueo de rutas de un rol distinto al autenticado
  (`RoleGuard` + navegación directa por URL).

### Bugs encontrados y corregidos durante la verificación

1. **Redirección incorrecta tras registrar una venta.** `NewSalePage.jsx` usaba
   `navigate("..", { replace: true })` esperando volver a `/admin/ventas`, pero en
   el router `ventas/nueva` está declarada como ruta **hermana** de `ventas` (no
   anidada), por lo que `".."` resolvía al índice de `/admin` (Dashboard). Se
   corrigió navegando explícitamente a `` `/${role}/ventas` ``. Bug preexistente en
   el frontend original, no introducido durante la integración.
2. **`400 Bad Request` al guardar el perfil o editar un usuario sin teléfono/foto.**
   Los esquemas de Zod (`auth.schema.js`, `usuarios.schema.js`) solo aceptaban
   `string | undefined` para `phone`/`photo`, pero Prisma retorna `null` para esos
   campos opcionales cuando no tienen valor. Se corrigió agregando `.nullable()`.

## 5. Limitaciones conocidas / trabajo futuro

- El formulario "Registrar Egreso" del frontend todavía muestra un campo
  **"Responsable"**, heredado del diseño original. El backend ignora ese valor por
  diseño (usa el usuario autenticado, más seguro), por lo que el campo quedó
  visualmente presente pero sin efecto. No se eliminó para no modificar el diseño
  sin aprobación explícita; es un ajuste de una línea si se decide quitarlo.
- `NewSalePage` solo permite un producto por venta en la UI, aunque el modelo de
  datos y la API (`items: []`) ya soportan múltiples ítems por venta. Ampliar el
  formulario a un carrito de varios productos es una mejora de frontend pendiente
  que no requiere cambios de backend.
- No hay *refresh token*; al expirar la sesión (8h) el usuario debe volver a iniciar
  sesión.
- No se implementaron pruebas automatizadas (unitarias/e2e); la verificación fue
  manual y exhaustiva (ver sección 4).
- Sin *rate limiting* ni *account lockout* tras intentos fallidos de login — aceptable
  para un entorno académico, no recomendado tal cual para producción pública.
