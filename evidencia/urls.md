# URLs de despliegue — Grain Store

## Estado actual

**PENDIENTE DE DESPLIEGUE**

Se buscó en todo el repositorio cualquier evidencia de un despliegue existente:
archivos de configuración de proveedores de hosting (`vercel.json`, `netlify.toml`,
`railway.json`, `render.yaml`, `fly.toml`), contenedores (`Dockerfile`,
`docker-compose*`, `Procfile`), y pipelines de integración/despliegue continuo
(carpeta `.github/workflows/`). **No se encontró ninguno.** El proyecto, en su
estado actual, solo se ejecuta en el entorno local de desarrollo:

- Frontend: `http://localhost:5173` (Vite dev server)
- Backend / API: `http://localhost:4000` (Express)
- Base de datos: `localhost:3306` (MySQL vía XAMPP)

| Componente | URL pública | Estado |
|---|---|---|
| Frontend | *(no aplica)* | **PENDIENTE DE DESPLIEGUE** |
| Backend / API | *(no aplica)* | **PENDIENTE DE DESPLIEGUE** |
| Base de datos | *(no aplica)* | **PENDIENTE DE DESPLIEGUE** |

## Qué falta exactamente para completar cada URL

### 1. Base de datos MySQL accesible por red
Hoy corre en XAMPP en `localhost`, no accesible desde fuera de la máquina de
desarrollo. Para publicarla:
- Elegir un proveedor de MySQL administrado (ej. Railway, Clever Cloud,
  PlanetScale) o levantar MySQL en un VPS propio con el puerto expuesto de forma
  segura.
- Obtener la cadena de conexión pública (`mysql://usuario:contraseña@host:puerto/basedatos`).
- **Anotar aquí la URL/host una vez exista** — reemplazar esta línea:
  `DATABASE_URL_PRODUCCION = <pendiente>`

### 2. Backend (Node.js/Express)
- Elegir un proveedor de hosting para Node.js (ej. Railway, Render, Fly.io) o un VPS.
- Configurar en ese proveedor las variables de entorno de producción:
  - `DATABASE_URL` → la cadena de conexión del punto 1.
  - `JWT_SECRET` → una clave nueva y secreta, distinta a la de desarrollo.
  - `FRONTEND_URL` → el dominio del frontend desplegado (punto 3), para que CORS lo
    permita.
  - `NODE_ENV=production`.
- Ejecutar `npx prisma migrate deploy` contra la base de datos de producción, y
  opcionalmente `npm run seed` si se desea cargar los datos de ejemplo.
- Arrancar con `npm start`.
- **Anotar aquí la URL una vez exista** — reemplazar esta línea:
  `URL_BACKEND_PRODUCCION = <pendiente>`

### 3. Frontend (React/Vite)
- Elegir un proveedor de hosting de estáticos (ej. Vercel, Netlify, Cloudflare
  Pages).
- Configurar la variable de entorno `VITE_API_URL` apuntando a la URL pública del
  backend (punto 2) **antes** de ejecutar el build — Vite incrusta esa variable en
  el bundle en tiempo de compilación, no se puede cambiar después sin recompilar.
- Ejecutar `npm run build` y publicar el contenido de `dist/`.
- **Anotar aquí la URL una vez exista** — reemplazar esta línea:
  `URL_FRONTEND_PRODUCCION = <pendiente>`

### 4. Ajuste final
Una vez publicados el backend y el frontend, actualizar `FRONTEND_URL` en las
variables de entorno del backend desplegado con el dominio real del frontend (no
`localhost`), para que las peticiones no sean bloqueadas por CORS.

## Plantilla para completar una vez desplegado

```
Frontend:      https://____________________
Backend / API: https://____________________
Base de datos: (host/puerto internos — no se expone públicamente por seguridad,
                solo el backend debe tener acceso a ella)
```
