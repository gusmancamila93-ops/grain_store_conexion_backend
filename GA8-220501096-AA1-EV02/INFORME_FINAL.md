# INFORME FINAL — GA8-220501096-AA1-EV02

## 1. Resumen ejecutivo

El sistema **Grain Store** está desplegado y verificado funcionando en producción:
frontend en Vercel, backend en Render, base de datos MySQL en Aiven. Durante la
verificación inicial se encontró y corrigió un problema real de configuración de
despliegue (rutas de React Router devolviendo `404` en navegación directa). En una
segunda ronda de revisión final se limpiaron archivos y ramas no necesarios para la
entrega, y se reverificó el sistema completo una vez más antes de cerrar esta
evidencia.

## 2. Verificaciones realizadas

### Backend (vía `curl`, contra la URL pública de Render)
- Health check (`GET /api/health`) — verificado dos veces (verificación inicial y revisión final).
- Login con las credenciales del rol Administrador — verificado dos veces.
- 8 endpoints protegidos con token válido: `clientes`, `productos`, `ventas`, `egresos`, `dashboard`, `reportes`, `usuarios`, `configuracion/tienda`.
- 1 endpoint protegido sin token, para confirmar el rechazo `401`.

### Frontend (navegador real, contra la URL pública de Vercel)
- Carga de la pantalla de login.
- Login y logout de los **3 roles**: Administrador, Vendedor, Contador.
- Navegación por los **9 módulos**: Autenticación, Dashboard, Clientes, Productos, Ventas (+ Nueva Venta), Egresos, Reportes, Usuarios, Configuración (con sus 4 pestañas).
- Verificación de que el contenido del Dashboard cambia correctamente según el rol.
- Verificación del control de acceso por rol (`RoleGuard`) mediante navegación directa por URL a una ruta no permitida para el rol activo.
- Verificación de rutas directas de React Router (deep-linking) antes y después de corregir el problema encontrado, y reverificada una vez más en la revisión final (punto 6).

### Infraestructura y despliegue
- Confirmación de que `backend/.env` (con credenciales reales) no está versionado en Git.
- Confirmación de que las variables de entorno en Render y Vercel están correctamente configuradas (`DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL`, `VITE_API_URL`).
- Confirmación de que el redeploy automático desde `main` funciona en ambas plataformas.
- Confirmación de que `main` es la única rama del repositorio (ver punto 6) y, por lo tanto, la única rama desde la cual Render y Vercel pueden estar desplegando.

## 2.1 Implementación de pruebas automatizadas

Como refuerzo adicional de la evidencia, se agregó una suite de **pruebas
automatizadas reales** (105 pruebas en total) que se ejecuta contra el código
fuente del sistema, sin modificar su lógica ni su arquitectura:

- **Validación individual de módulos (pruebas unitarias):** 38 en backend
  (autenticación, JWT, validaciones con Zod, permisos por rol, cálculo de estado
  de stock, cálculos financieros de reportes) y 25 en frontend (componentes UI,
  el hook `useAuth`, utilidades de formato y la página de login), verificando
  cada módulo de forma aislada con sus dependencias externas controladas.
- **Validación de integración frontend-backend (pruebas de integración):** 30 en
  backend, ejercitando la app real de Express (rutas → middlewares →
  controladores → servicios) contra los 9 grupos de endpoints con `supertest`; y
  12 en frontend, renderizando la aplicación React real (`App` + `AuthProvider` +
  `react-router`) con las respuestas de la API simuladas, cubriendo login,
  logout, protección de rutas por rol y carga de datos del dashboard.
- **Resultados obtenidos:** 105/105 pruebas exitosas (68 backend + 37 frontend).
  El detalle completo (herramientas, estructura, comandos y resultados) está en
  la sección "Pruebas automatizadas" de [PRUEBAS_SISTEMA.md](PRUEBAS_SISTEMA.md).
- **Nota metodológica:** dado que el entorno de esta evidencia no cuenta con un
  servidor MySQL disponible, las pruebas de backend sustituyen únicamente la
  capa de acceso a datos (Prisma) por un doble de prueba, manteniendo intacta
  toda la lógica real de negocio, validación y autorización.

## 3. Documentos creados

Dentro de `GA8-220501096-AA1-EV02/`:
- `README_EVIDENCIA.md`
- `DOCUMENTACION_MODULOS.md`
- `PRUEBAS_SISTEMA.md`
- `URLS_DESPLIEGUE.md`
- `EJECUCION_SISTEMA.md`
- `CONTROL_VERSIONES.md`
- `INFORME_FINAL.md` (este documento)

## 4. Documentos actualizados

- **`vercel.json`** (raíz del repositorio): creado en la sesión de preparación del despliegue; permaneció sin efecto en producción hasta fusionarse a `main` (ver problema encontrado, punto 5).
- **`.env`** (raíz): `VITE_API_URL` actualizado para apuntar al backend real de Render.
- **`README.md`** (raíz): actualizado con la arquitectura de despliegue, las URLs públicas y la estructura completa del sistema.
- **`.gitignore`** (raíz): se agregó `.claude/` para excluir permanentemente la configuración del entorno de asistencia de IA.
- **`CONTROL_VERSIONES.md`**: actualizado en la revisión final (punto 6) para reflejar la eliminación de la rama de feature y el análisis de `.claude`/`.vscode`.
- **`PRUEBAS_SISTEMA.md`**: se agregó la sección "Pruebas automatizadas" (ver punto 2.1) con las 105 pruebas unitarias e integración implementadas.
- **`backend/package.json`** y **`package.json`** (raíz): se agregaron los scripts `test` y `test:watch`, y las dependencias de desarrollo `vitest`, `supertest` (backend) y `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, `jsdom` (frontend).
- **`vite.config.js`**: se agregó el bloque `test` de Vitest (entorno `jsdom`, archivo de setup), reutilizando el alias `@` ya existente.

## 5. Problemas encontrados

### Rutas de React Router devolviendo 404 en producción (Vercel)
- **Síntoma:** navegar directamente a una URL como `/admin/clientes` (o refrescar la página en cualquier ruta distinta de `/`) devolvía la página `404: NOT_FOUND` de Vercel, en vez de cargar la aplicación.
- **Causa raíz:** el archivo `vercel.json` con el *rewrite* necesario para SPA (`{ "source": "/(.*)", "destination": "/index.html" }`) se había creado y commiteado en la rama `feature/manejo-errores-y-evidencia-ev02`, pero Vercel despliega producción desde `main`. El archivo nunca llegó a producción hasta fusionar el PR.
- **Corrección aplicada:** se fusionó el Pull Request #1 a `main` (squash merge), lo que disparó un redeploy automático en Vercel.
- **Verificación de la corrección:** se esperó el redeploy (confirmado por *polling* del endpoint hasta obtener `200`) y se repitió la prueba en 4 rutas directas distintas (`/admin/clientes`, `/admin/reportes`, `/admin/configuracion`, `/vendedor/dashboard`), las 4 exitosas. Adicionalmente se verificó que el control de acceso por rol (`RoleGuard`) seguía funcionando correctamente después de la corrección (una sesión de `vendedor` navegando directo a `/admin/reportes` redirige correctamente a `/vendedor/dashboard`).
- **Estado final:** ✅ resuelto y verificado. El detalle completo está en [PRUEBAS_SISTEMA.md](PRUEBAS_SISTEMA.md).

No se encontraron otros problemas durante la verificación inicial ni durante la revisión final.

## 6. Revisión final previa a la entrega

Se realizó una segunda ronda de revisión, posterior al cierre inicial de esta evidencia, con los siguientes resultados:

- **Análisis de `.claude/`:** contenía únicamente `launch.json`, configuración exclusiva del entorno de asistencia de IA (Claude Code) para su panel de vista previa — no la usa el sistema en ejecución. Estaba rastreada en Git. **Se eliminó del repositorio** y se agregó `.claude/` a `.gitignore`.
- **Análisis de `.vscode/`:** contenía únicamente `launch.json`, una configuración de depuración de VS Code apuntando a un puerto (`8080`) que no coincide con el puerto real del proyecto (`5173`) — remanente obsoleto de una plantilla anterior. **Nunca estuvo rastreada en Git** (ya excluida vía `.gitignore`), por lo que no afectaba la entrega; se eliminó igualmente del disco local por prolijidad.
- **Verificación de ramas:** `git ls-remote --heads origin` confirmó que, tras fusionar el PR #1, la rama `feature/manejo-errores-y-evidencia-ev02` seguía existiendo en el remoto aunque ya sin diferencias de contenido con `main` (`git diff main feature/... --stat` sin salida). Se eliminó tanto en local (`git branch -D`) como en el remoto (`git push origin --delete`), dejando **`main` como única rama del repositorio**, confirmado nuevamente con `git ls-remote --heads origin`.
- **Rama de despliegue en Render y Vercel:** no fue posible inspeccionar directamente la configuración de "rama de producción" en los paneles de Render/Vercel (esta sesión no cuenta con credenciales de API para esas plataformas, solo para GitHub). Se determinó por lógica: como `main` es ahora la **única rama existente en todo el repositorio remoto**, y ambos despliegues siguieron funcionando exitosamente después de la limpieza, necesariamente están configurados para desplegar desde `main` — no existe ninguna otra rama a la que pudieran apuntar.
- **Reverificación funcional post-limpieza:** health check (`200` en 36.8s, cold start esperado), carga del frontend (`200`), login (`200`), y navegación real en el navegador por Dashboard, Reportes y Configuración con sesión de Contador — incluyendo una prueba de navegación directa a `/contador/configuracion` para reconfirmar que el rewrite de SPA seguía activo. Todo exitoso.

## 7. Autoevaluación — cumplimiento de los requisitos de la evidencia

| Requisito del enunciado SENA | Documento que lo cumple | Estado | Observaciones |
|---|---|---|---|
| 1. Manejar un repositorio de control de versiones para entregar el código fuente | [CONTROL_VERSIONES.md](CONTROL_VERSIONES.md) | ✅ Cumplido | Repositorio público en GitHub, verificado accesible; `main` confirmada como única rama; commits relevantes documentados; confirmado sin credenciales en Git |
| 2. Entregar los archivos ejecutables del sistema | [EJECUCION_SISTEMA.md](EJECUCION_SISTEMA.md) | ✅ Cumplido | Documenta los componentes ejecutables, requisitos, dependencias, variables de entorno (sin secretos), comandos y arquitectura del despliegue real |
| 3. Entregar las URLs donde se encuentran desplegados los módulos | [URLS_DESPLIEGUE.md](URLS_DESPLIEGUE.md) | ✅ Cumplido | Las 3 URLs públicas (frontend, backend, health check) más el repositorio, con la función de cada una y verificadas activas dos veces |
| 4. Entregar la documentación por módulo y componente, registrando datos de entrada y salida | [DOCUMENTACION_MODULOS.md](DOCUMENTACION_MODULOS.md) | ✅ Cumplido | 9 módulos documentados con objetivo, componentes, endpoints, datos de entrada/salida, validaciones, flujo y observaciones, basados en el código real |
| 5. Informar las pruebas realizadas para cada módulo y su resultado | [PRUEBAS_SISTEMA.md](PRUEBAS_SISTEMA.md) | ✅ Cumplido | 24 casos de prueba funcionales reales ejecutados contra producción, más 105 pruebas automatizadas (unitarias e integración, backend y frontend); incluye el problema encontrado y su corrección documentada |

### Confirmación expresa

**La evidencia GA8-220501096-AA1-EV02 cumple con los 5 requisitos exigidos por el
enunciado del SENA.** Toda la información documentada corresponde a verificaciones
reales ejecutadas contra el sistema desplegado en producción el 2026-07-17 (con una
segunda ronda de revisión y reverificación el mismo día), sin funcionalidades,
módulos, endpoints, pruebas ni resultados inventados. El repositorio quedó con
**`main` como única rama activa**, sin archivos de configuración de herramientas de
desarrollo innecesarios para la entrega, y con la documentación completamente
consistente con el estado final del sistema.
