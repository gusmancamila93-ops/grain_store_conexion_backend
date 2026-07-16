# Grain Store — Backend

API REST del sistema de gestión **Grain Store**, construida para la evidencia SENA
**GA8-220501096-AA1-EV01 — Desarrollar software a partir de la integración de sus
módulos y componentes**.

Este backend reemplaza el `localStorage` que usaba originalmente el frontend por una
API real con base de datos, autenticación con JWT y autorización por rol, sin alterar
el diseño ni la experiencia de usuario del frontend existente.

## Stack

| Capa | Tecnología |
|---|---|
| Runtime | Node.js (ESM) |
| Framework HTTP | Express 4 |
| Base de datos | MySQL |
| ORM | Prisma |
| Autenticación | JWT (jsonwebtoken) |
| Hash de contraseñas | bcrypt |
| Validación | zod |
| Seguridad HTTP | helmet, cors |
| Logging | morgan |
| Configuración | dotenv |

## Estructura

```
backend/
├── prisma/
│   ├── schema.prisma      # Modelo de datos
│   ├── migrations/        # Migraciones generadas por Prisma
│   └── seed.js             # Datos iniciales de ejemplo
├── src/
│   ├── config/             # env, conexión a Prisma, CORS
│   ├── middlewares/         # authenticate, authorize, validate, errorHandler
│   ├── modules/             # un paquete por entidad (routes/controller/service/schema)
│   │   ├── auth/
│   │   ├── usuarios/
│   │   ├── clientes/
│   │   ├── productos/
│   │   ├── ventas/
│   │   ├── egresos/
│   │   ├── dashboard/
│   │   ├── reportes/
│   │   └── configuracion/
│   ├── utils/                # ApiError, asyncHandler, jwt, password, constants, monthly
│   ├── app.js                 # Configuración de Express
│   └── server.js              # Arranque del servidor
├── .env.example
└── package.json
```

Ver el detalle de la arquitectura y las decisiones de diseño en
[DISENO_BACKEND.md](DISENO_BACKEND.md) y [DOCUMENTACION_TECNICA.md](DOCUMENTACION_TECNICA.md).

## Puesta en marcha rápida

Ver la guía completa en [MANUAL_INSTALACION.md](MANUAL_INSTALACION.md). Resumen:

```bash
cd backend
npm install
cp .env.example .env      # ajustar DATABASE_URL si es necesario
npx prisma migrate dev
npm run seed
npm run dev                # http://localhost:4000
```

## Scripts disponibles (`backend/package.json`)

| Script | Descripción |
|---|---|
| `npm run dev` | Levanta el servidor con recarga automática (nodemon) |
| `npm start` | Levanta el servidor en modo producción |
| `npm run seed` | Carga los datos de ejemplo en la base de datos |
| `npm run prisma:migrate` | Crea/aplica una migración en desarrollo |
| `npm run prisma:deploy` | Aplica migraciones pendientes (producción) |
| `npm run prisma:studio` | Abre Prisma Studio para inspeccionar la base de datos |

## Usuarios de prueba (seed)

| Rol | Correo | Contraseña |
|---|---|---|
| Administrador | admin@grainstore.com | admin123 |
| Vendedor | vendedor@grainstore.com | vendedor123 |
| Contador | contador@grainstore.com | contador123 |

## Documentación relacionada

- [ANALISIS_BACKEND.md](ANALISIS_BACKEND.md) — Fase 1: análisis del frontend original.
- [DISENO_BACKEND.md](DISENO_BACKEND.md) — Fase 2: arquitectura y modelo de datos.
- [API_DOCUMENTATION.md](API_DOCUMENTATION.md) — Referencia completa de endpoints.
- [MANUAL_INSTALACION.md](MANUAL_INSTALACION.md) — Guía de instalación paso a paso.
- [DOCUMENTACION_TECNICA.md](DOCUMENTACION_TECNICA.md) — Decisiones técnicas, seguridad y limitaciones conocidas.
