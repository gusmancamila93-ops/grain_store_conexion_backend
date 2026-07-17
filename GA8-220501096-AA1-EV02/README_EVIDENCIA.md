# README_EVIDENCIA — GA8-220501096-AA1-EV02

**Proyecto:** Grain Store — Sistema de gestión Full Stack para tienda de granos
**Evidencia:** GA8-220501096-AA1-EV02
**Programa:** SENA — ADSO
**Fecha de verificación:** 2026-07-17
**Estado del sistema verificado:** desplegado y funcional en producción (frontend, backend y base de datos)

## Requisitos de la evidencia y dónde se cumplen

| # | Requisito | Documento(s) |
|---|---|---|
| 1 | Repositorio de control de versiones para el código fuente | [CONTROL_VERSIONES.md](CONTROL_VERSIONES.md) |
| 2 | Archivos ejecutables del sistema | [EJECUCION_SISTEMA.md](EJECUCION_SISTEMA.md) |
| 3 | URLs donde están desplegados los módulos | [URLS_DESPLIEGUE.md](URLS_DESPLIEGUE.md) |
| 4 | Documentación por módulo y componente, con datos de entrada/salida | [DOCUMENTACION_MODULOS.md](DOCUMENTACION_MODULOS.md) |
| 5 | Pruebas realizadas por módulo y su resultado | [PRUEBAS_SISTEMA.md](PRUEBAS_SISTEMA.md) |
| — | Resumen ejecutivo, autoevaluación y confirmación de cumplimiento | [INFORME_FINAL.md](INFORME_FINAL.md) |

## URLs verificadas en esta evidencia

| Componente | URL |
|---|---|
| Frontend (Vercel) | https://grain-store-conexion-backend.vercel.app |
| Backend / API (Render) | https://grain-store-conexion-backend.onrender.com |
| Health check | https://grain-store-conexion-backend.onrender.com/api/health |
| Repositorio (GitHub) | https://github.com/gusmancamila93-ops/grain_store_conexion_backend |

## Pruebas automatizadas

Además de la verificación funcional manual contra producción, el repositorio
incluye una suite de 105 pruebas automatizadas (unitarias e integración, backend y
frontend). Se ejecutan con:

```bash
# Backend
cd backend && npm run test

# Frontend (desde la raíz del repositorio)
npm run test
```

Detalle completo (herramientas, estructura y resultados) en la sección "Pruebas
automatizadas" de [PRUEBAS_SISTEMA.md](PRUEBAS_SISTEMA.md).

## Metodología de verificación

Toda la información de esta evidencia proviene de **verificaciones reales ejecutadas durante esta sesión**, no de documentación previa sin comprobar:

- El backend se probó con peticiones HTTP reales (`curl`) contra la URL pública de Render: health check, login con los 3 roles, y los 9 endpoints principales con y sin token de autenticación.
- El frontend se probó en un navegador real contra la URL pública de Vercel: inicio de sesión con los 3 roles (Administrador, Vendedor, Contador), cierre de sesión, navegación por los 9 módulos, y verificación del control de acceso por rol (`RoleGuard`) tanto por clic dentro de la aplicación como por navegación directa a una URL.
- Durante la primera ronda de verificación se detectó un problema real (rutas de React Router devolviendo `404` en navegación directa) que se corrigió y volvió a verificar antes de generar esta documentación — el detalle está en [PRUEBAS_SISTEMA.md](PRUEBAS_SISTEMA.md) y en [INFORME_FINAL.md](INFORME_FINAL.md).

## Documentación relacionada (fuera de esta carpeta)

Esta evidencia complementa, sin reemplazar, la documentación técnica ya existente en la raíz del repositorio:

- [`README.md`](../README.md) — documentación general del sistema completo.
- [`README_BACKEND.md`](../README_BACKEND.md) — documentación específica del backend.
- [`API_DOCUMENTATION.md`](../API_DOCUMENTATION.md) — referencia completa de endpoints.
- [`MANUAL_INSTALACION.md`](../MANUAL_INSTALACION.md) — guía de instalación local paso a paso.
- [`DOCUMENTACION_TECNICA.md`](../DOCUMENTACION_TECNICA.md) — decisiones técnicas y seguridad.
- [`Evidencia_GA8-220501096-AA1-EV02.md`](../Evidencia_GA8-220501096-AA1-EV02.md) y [`/evidencia`](../evidencia/) — versión previa de esta evidencia, generada **antes** del despliegue en Render/Vercel (documentaba el sistema corriendo solo en local). Esta carpeta (`GA8-220501096-AA1-EV02/`) es la versión **actualizada tras el despliegue real**.
