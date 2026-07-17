# URLS DE DESPLIEGUE — Grain Store

Todas las URLs de esta tabla fueron verificadas activas y funcionales el 2026-07-17.

| Componente | URL | Función |
|---|---|---|
| **Frontend** | https://grain-store-conexion-backend.vercel.app | Aplicación React (SPA) que sirve la interfaz completa del sistema: login, dashboard y los 9 módulos funcionales. Es la URL que usan las personas usuarias del sistema. Desplegada en **Vercel** como sitio estático (build de Vite), con redeploy automático en cada push a la rama `main` del repositorio. |
| **Backend / API** | https://grain-store-conexion-backend.onrender.com | API REST (Node.js + Express) que expone todos los endpoints bajo el prefijo `/api`. Es el componente que procesa la lógica de negocio, valida datos, aplica autenticación/autorización y se comunica con la base de datos vía Prisma. Desplegado en **Render** como servicio web de Node persistente. |
| **Health check** | https://grain-store-conexion-backend.onrender.com/api/health | Endpoint público (`GET`) que confirma que el backend está arriba y respondiendo. Responde `{ "status": "ok" }`. Útil para monitoreo y para verificar el "despertar" del servicio tras inactividad (plan gratuito de Render). |
| **Repositorio** | https://github.com/gusmancamila93-ops/grain_store_conexion_backend | Repositorio Git público que contiene todo el código fuente (frontend y backend), la documentación y el historial de commits del proyecto. Es la fuente de verdad desde la cual se despliegan tanto Vercel como Render. |

## Base de datos

La base de datos **no tiene una URL pública documentable en este archivo** (no debe exponerse públicamente por seguridad — solo el backend, mediante su variable de entorno `DATABASE_URL` en Render, tiene la cadena de conexión). Es un servicio **MySQL administrado por Aiven**, accesible únicamente desde el backend desplegado.

## Relación entre los componentes

```
Usuario ──▶ https://grain-store-conexion-backend.vercel.app            (Frontend, Vercel)
                │
                │  fetch + JWT, hacia VITE_API_URL
                ▼
           https://grain-store-conexion-backend.onrender.com/api/...   (Backend, Render)
                │
                │  Prisma Client
                ▼
           MySQL en Aiven (sin URL pública en este documento)
```

- El **frontend** en Vercel tiene incrustada en su build la variable `VITE_API_URL=https://grain-store-conexion-backend.onrender.com/api`, por lo que todas sus peticiones van dirigidas al backend de Render.
- El **backend** en Render tiene configurada la variable `FRONTEND_URL` apuntando al dominio de Vercel, para que el middleware de CORS acepte peticiones del navegador provenientes de ese origen.
- El **repositorio de GitHub** es el origen de ambos despliegues: Render usa `backend/` como *Root Directory*, y Vercel usa la raíz del repositorio (donde vive el frontend).
