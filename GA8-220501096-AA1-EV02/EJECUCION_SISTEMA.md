# EJECUCIÓN DEL SISTEMA — Grain Store

Este documento explica cómo ejecutar el sistema tanto en **local** (desarrollo) como
describe su ejecución real en **producción** (Vercel + Render).

## Componentes ejecutables del proyecto

| Componente | Tipo | Punto de entrada |
|---|---|---|
| Frontend | Aplicación web (SPA, estáticos tras el build) | `src/main.jsx` → `npm run build` → `dist/` |
| Backend | Servidor Node.js (proceso persistente) | `backend/src/server.js` |
| Base de datos | Servicio externo (MySQL administrado) | No es ejecutable del repositorio; es un servicio de Aiven |

No hay archivos `.exe`/binarios — es un proyecto JavaScript (Node.js + React), los "ejecutables" son procesos Node y un build de estáticos, como corresponde a su arquitectura.

## Requisitos previos (para ejecución local)

- **Node.js** — el proyecto no declara una versión mínima en `package.json` (sin campo `engines`); se desarrolló y probó con Node.js v25.2.1. Se recomienda Node 20 LTS o superior.
- **npm** (incluido con Node.js).
- **MySQL** 8.x — en local puede usarse XAMPP/WAMP o un MySQL propio; en producción se usa MySQL administrado por Aiven.
- **Git**.

## Dependencias principales

**Frontend** (`package.json`, raíz): React 19, Vite 8, React Router DOM 7, Tailwind CSS 4, Radix UI/shadcn.
**Backend** (`backend/package.json`): Express 4, Prisma + `@prisma/client`, `jsonwebtoken`, `bcrypt`, `zod`, `helmet`, `cors`, `morgan`, `dotenv`.

Listado completo de dependencias en [`README.md`](../README.md#tecnologías-utilizadas) y en los propios archivos `package.json`.

## Variables de entorno requeridas (sin mostrar valores reales)

### `backend/.env`
| Variable | Uso |
|---|---|
| `PORT` | Puerto del servidor (en Render lo asigna la plataforma automáticamente) |
| `NODE_ENV` | `development` en local, `production` en Render |
| `DATABASE_URL` | Cadena de conexión a MySQL (local: XAMPP; producción: Aiven) |
| `JWT_SECRET` | Clave para firmar los tokens JWT (debe ser distinta entre local y producción) |
| `JWT_EXPIRES_IN` | Duración de la sesión (por defecto `8h` si no se define) |
| `FRONTEND_URL` | Origen permitido por CORS (local: `http://localhost:5173`; producción: la URL de Vercel) |

### `.env` (raíz, frontend)
| Variable | Uso |
|---|---|
| `VITE_API_URL` | URL base de la API que consume el frontend (local: `http://localhost:4000/api`; producción: `https://grain-store-conexion-backend.onrender.com/api`) |

Ningún valor real de estas variables se expone en este documento ni está versionado en Git (ver [CONTROL_VERSIONES.md](CONTROL_VERSIONES.md)).

## Ejecución local

### 1. Backend
```bash
cd backend
npm install
cp .env.example .env      # completar con los valores propios
npx prisma migrate dev    # crea/actualiza las tablas
npm run seed               # carga datos de ejemplo (opcional)
npm run dev                 # http://localhost:4000
```

### 2. Frontend
```bash
npm install
cp .env.example .env       # completar VITE_API_URL
npm run dev                 # http://localhost:5173
```

Guía ampliada con solución de problemas en [`MANUAL_INSTALACION.md`](../MANUAL_INSTALACION.md).

## Comandos de producción (build y arranque)

**Frontend:**
```bash
npm run build      # genera ./dist (estáticos)
npm run preview     # sirve ./dist localmente para verificar el build
```

**Backend:**
```bash
npx prisma migrate deploy   # aplica migraciones pendientes
npm start                    # node src/server.js
```

## Arquitectura del despliegue real

```
┌────────────────────────┐        ┌───────────────────────────┐        ┌──────────────────┐
│   Vercel (Frontend)     │        │   Render (Backend)         │        │  Aiven (MySQL)    │
│   React + Vite, build   │──────▶│   Node.js + Express         │──────▶│  Base de datos     │
│   estático servido      │  HTTPS │   Root Directory: backend/  │ Prisma │  administrada      │
│   por CDN                │        │   Start: prisma migrate     │        │                    │
│                          │        │     deploy && npm start     │        │                    │
└────────────────────────┘        └───────────────────────────┘        └──────────────────┘
   grain-store-conexion-             grain-store-conexion-
   backend.vercel.app                backend.onrender.com
```

**Configuración real usada en cada plataforma:**

| Plataforma | Root Directory | Build Command | Start Command |
|---|---|---|---|
| Render (backend) | `backend` | `npm install && npx prisma generate` | `npx prisma migrate deploy && npm start` |
| Vercel (frontend) | `.` (raíz del repo) | `npm run build` (default de Vite) | — (sitio estático, sin proceso persistente) |

Ambos despliegues se disparan automáticamente al hacer push a la rama `main` del repositorio en GitHub.
