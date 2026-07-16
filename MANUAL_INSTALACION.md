# MANUAL_INSTALACION.md — Grain Store

Guía paso a paso para instalar y ejecutar el proyecto completo (frontend + backend)
en un equipo nuevo.

## 1. Requisitos previos

| Herramienta | Versión recomendada | Notas |
|---|---|---|
| Node.js | 20 LTS o superior | Incluye npm |
| MySQL | 8.x | Puede ser standalone o vía XAMPP/WAMP |
| Git | cualquiera reciente | Para clonar el repositorio |

Verifica que tienes Node y npm instalados:

```bash
node -v
npm -v
```

### MySQL con XAMPP (opción usada en el desarrollo de este proyecto)

1. Instala XAMPP y abre el **Panel de Control**.
2. Da clic en **Start** junto a **MySQL**.
3. Con la configuración por defecto: host `localhost`, puerto `3306`, usuario `root`,
   contraseña vacía. No es necesario crear la base de datos a mano — Prisma la crea
   automáticamente en el primer `migrate dev` si no existe.

> **Importante:** la ruta de la carpeta del proyecto **no debe contener el carácter
> `#`** (ni otros caracteres especiales de URL como `?`). Vite tiene un bug conocido
> que rompe tanto el servidor de desarrollo como el build de producción cuando la
> ruta absoluta del proyecto incluye `#` (por ejemplo
> `C:\...\9. actividad #07\...`). Si tu carpeta lo tiene, renómbrala antes de continuar.

## 2. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd grain_stote
```

## 3. Backend

### 3.1 Instalar dependencias

```bash
cd backend
npm install
```

### 3.2 Configurar variables de entorno

Copia el archivo de ejemplo y ajusta los valores si tu MySQL no usa la configuración
por defecto de XAMPP:

```bash
cp .env.example .env
```

`backend/.env`:

```
PORT=4000
NODE_ENV=development

# Ajusta usuario/contraseña/host/puerto/nombre de BD según tu instalación
DATABASE_URL="mysql://root:@localhost:3306/grain_store_db"

JWT_SECRET=cambia_esta_clave_por_una_larga_y_secreta
JWT_EXPIRES_IN=8h

FRONTEND_URL=http://localhost:5173
```

### 3.3 Crear la base de datos y aplicar migraciones

Con MySQL ya corriendo:

```bash
npx prisma migrate dev
```

Esto crea la base de datos `grain_store_db` (si no existe) y todas las tablas.

### 3.4 Cargar datos de ejemplo (seed)

```bash
npm run seed
```

Esto crea los 3 usuarios de prueba, 4 clientes, 4 productos, 3 ventas y 3 egresos de
ejemplo (los mismos datos que originalmente estaban como mocks en el frontend).

### 3.5 Levantar el servidor

```bash
npm run dev
```

El backend queda disponible en `http://localhost:4000`. Verifica que responde:

```bash
curl http://localhost:4000/api/health
# {"status":"ok"}
```

## 4. Frontend

### 4.1 Instalar dependencias

Desde la raíz del proyecto (no dentro de `backend/`):

```bash
cd ..
npm install
```

### 4.2 Configurar variables de entorno

```bash
cp .env.example .env
```

`.env` (raíz del proyecto):

```
VITE_API_URL=http://localhost:4000/api
```

### 4.3 Levantar el servidor de desarrollo

```bash
npm run dev
```

El frontend queda disponible en `http://localhost:5173`.

## 5. Verificación

1. Abre `http://localhost:5173/login` en el navegador.
2. Usa cualquiera de los botones de "usuarios simulados" (Administrador, Vendedor o
   Contador) para autocompletar el formulario, o ingresa manualmente:

   | Rol | Correo | Contraseña |
   |---|---|---|
   | Administrador | admin@grainstore.com | admin123 |
   | Vendedor | vendedor@grainstore.com | vendedor123 |
   | Contador | contador@grainstore.com | contador123 |

3. Deberías entrar al panel correspondiente con datos reales provenientes de la base
   de datos (no mocks).

## 6. Solución de problemas

| Problema | Causa probable | Solución |
|---|---|---|
| El navegador muestra una pantalla en blanco y Vite reporta `Failed to load url /src/main.jsx` | La ruta del proyecto contiene `#` | Mueve/renombra la carpeta del proyecto a una ruta sin `#` |
| `Error: connect ECONNREFUSED` al migrar o levantar el backend | MySQL no está corriendo | Inicia el servicio MySQL (XAMPP → Start) |
| `401` al llamar cualquier endpoint desde el frontend | El token expiró o no hay sesión | Vuelve a iniciar sesión desde `/login` |
| El navegador bloquea las peticiones al backend por CORS | `FRONTEND_URL` en `backend/.env` no coincide con el puerto real del frontend | Ajusta `FRONTEND_URL` al valor que muestra `npm run dev` en el frontend |
| `EADDRINUSE` al levantar el backend | Ya hay un proceso usando el puerto 4000 | Detén el proceso anterior o cambia `PORT` en `backend/.env` |
| Prisma no encuentra la base de datos | El nombre/usuario/contraseña en `DATABASE_URL` no coincide con tu MySQL | Ajusta `DATABASE_URL` en `backend/.env` y vuelve a correr `npx prisma migrate dev` |

## 7. Reiniciar la base de datos a su estado inicial (opcional)

Si quieres borrar todos los datos y volver exactamente al seed original:

```bash
cd backend
npx prisma migrate reset --force
```

**Advertencia:** este comando borra todos los datos de la base `grain_store_db` y
vuelve a aplicar las migraciones y el seed. Úsalo solo en un entorno de desarrollo.
