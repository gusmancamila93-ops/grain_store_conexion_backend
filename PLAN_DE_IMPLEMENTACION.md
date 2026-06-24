# PLAN DE IMPLEMENTACIÓN — Grain Store

**Proyecto académico ADSO SENA — Sistema de gestión para tienda de granos**
**Documento de planificación previo a la generación de código (Fase 2)**

---

## 0. Decisiones confirmadas que rigen este plan

Este plan incorpora las decisiones aprobadas por el cliente/aprendiz tras la Fase 1 de análisis:

1. **Rol Contador**: acceso únicamente a *Dashboard, Clientes, Reportes, Configuración*. No existirá Panel de Ventas, Registro de Ventas, ni "Consultas Financieras" como página independiente para este rol. Lo financiero vive dentro de Reportes, igual que en los HTML.
2. **Módulo Usuarios**: no es una página ni un ítem de sidebar. Es una pestaña interna dentro de `Configuración` del Administrador.
3. **Proyecto base**: se usa exclusivamente `grain_stote` (el proyecto Vite + Tailwind v4 + Shadcn ya inicializado). La carpeta `vite-app` se ignora por completo y no se reutiliza ningún archivo suyo.
4. **Fidelidad visual absoluta**: colores, distribución, espaciados, formularios, tablas, dashboard, tarjetas, gráficas, responsive design y modo oscuro deben replicar exactamente los 19 HTML de referencia. No se rediseña, no se simplifica.

---

## 1. Arquitectura final

**Tipo de arquitectura**: SPA (Single Page Application) en React, organizada por **capas + features**, con enrutamiento declarativo y guardas de rol.

**Principios rectores**:

- **Una sola implementación por página**, parametrizada por rol (en vez de duplicar Admin/Vendedor/Contador como en los HTML). El rol decide *qué* sidebar, *qué* rutas y *qué* acciones se muestran, no genera componentes distintos.
- **Capa de presentación separada de la capa de datos**: las páginas no acceden a `localStorage` directamente, siempre pasan por `services/`.
- **Layouts compartidos**: un `AuthLayout` para Login/Registro y un `AppLayout` único (sidebar + topbar + outlet) para todas las vistas autenticadas de los 3 roles.
- **Enrutamiento anidado por rol** con `react-router-dom`, protegido por un componente `RoleGuard`.
- **Estado de sesión y tema en Contexto de React** (no se requiere Redux/Zustand dado el alcance académico).
- **Persistencia en `localStorage`**, igual que los HTML y que el proyecto de referencia del instructor, encapsulada en servicios para poder migrar a una API real sin tocar las vistas.
- **Tailwind CSS + Shadcn/UI** como sistema de estilos y primitivos de UI, configurados con el tema visual oficial de Grain Store (menta / lila / naranja + modo oscuro) para que coincidan exactamente con el CSS embebido de los HTML.

**Diagrama de capas (alto nivel)**

```
Páginas (features/*)
        │
        ▼
Componentes compartidos (components/ui, components/layout, components/common)
        │
        ▼
Contextos (AuthContext, ThemeContext)
        │
        ▼
Servicios (ventasService, clientesService, productosService, usuariosService, reportesService, configService, authService)
        │
        ▼
storage.js (wrapper de localStorage)
```

---

## 2. Estructura de carpetas definitiva

```
grain_stote/
├── public/
│   └── favicon.svg
├── src/
│   ├── main.jsx
│   ├── index.css                       (tema Tailwind: colores, fuentes, dark mode)
│   │
│   ├── app/
│   │   ├── routes.jsx                  (árbol de rutas con react-router-dom)
│   │   └── RoleGuard.jsx                (protección de rutas por sesión/rol)
│   │
│   ├── layouts/
│   │   ├── AuthLayout.jsx               (Login / Registro)
│   │   └── AppLayout.jsx                (Sidebar + Topbar + <Outlet/>)
│   │
│   ├── components/
│   │   ├── ui/                          (primitivos shadcn: button, dialog, tabs,
│   │   │                                  input, select, table, badge, avatar...)
│   │   ├── layout/
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Topbar.jsx
│   │   │   ├── MobileOverlay.jsx
│   │   │   └── ThemeToggle.jsx
│   │   └── common/
│   │       ├── StatCard.jsx
│   │       ├── ChartCard.jsx
│   │       ├── TableCard.jsx
│   │       ├── EmptyState.jsx
│   │       ├── Modal.jsx
│   │       ├── FormCard.jsx
│   │       ├── SearchInput.jsx
│   │       └── AvatarUploader.jsx
│   │
│   ├── features/
│   │   ├── auth/
│   │   │   ├── LoginPage.jsx
│   │   │   └── RegistroPage.jsx
│   │   ├── dashboard/
│   │   │   └── DashboardPage.jsx        (una sola página, secciones por rol)
│   │   ├── ventas/
│   │   │   ├── PanelVentasPage.jsx      (solo admin / vendedor)
│   │   │   ├── RegistroVentaPage.jsx    (solo admin / vendedor)
│   │   │   └── components/
│   │   │       ├── CartSidebar.jsx
│   │   │       └── ItemVentaRow.jsx
│   │   ├── clientes/
│   │   │   ├── ClientesPage.jsx
│   │   │   └── components/
│   │   │       ├── ClienteModal.jsx
│   │   │       └── DeudorCard.jsx
│   │   ├── productos/
│   │   │   ├── ProductosPage.jsx
│   │   │   └── components/
│   │   │       └── ProductoModal.jsx
│   │   ├── reportes/
│   │   │   ├── ReportesPage.jsx         (admin y contador comparten la misma vista)
│   │   │   └── components/
│   │   │       ├── VentasChart.jsx
│   │   │       ├── EgresosChart.jsx
│   │   │       └── BalanceChart.jsx
│   │   └── configuracion/
│   │       ├── ConfiguracionPage.jsx
│   │       └── tabs/
│   │           ├── PerfilTab.jsx
│   │           ├── SistemaTab.jsx
│   │           ├── TiendaTab.jsx
│   │           └── UsuariosTab.jsx       (solo visible/montada si role === 'admin')
│   │
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   └── ThemeContext.jsx
│   │
│   ├── services/
│   │   ├── storage.js                   (get/set/remove genérico sobre localStorage)
│   │   ├── authService.js
│   │   ├── ventasService.js
│   │   ├── clientesService.js
│   │   ├── productosService.js
│   │   ├── usuariosService.js
│   │   ├── configService.js
│   │   └── reportesService.js           (agregaciones para dashboard/reportes)
│   │
│   ├── data/
│   │   └── mockData.js                  (semillas iniciales si localStorage está vacío)
│   │
│   ├── utils/
│   │   ├── formatCurrency.js            (formato $ COP, igual a displayCOP del HTML)
│   │   ├── formatDate.js
│   │   ├── presentaciones.js            (factores de conversión libra/arroba/etc.)
│   │   └── idGenerator.js
│   │
│   └── hooks/
│       ├── useAuth.js
│       ├── useTheme.js
│       └── useLocalStorageList.js       (lectura reactiva de una colección en localStorage)
│
├── index.html
├── vite.config.js
├── tailwind.config.js                    (si aplica según versión de Tailwind v4)
├── package.json
└── PLAN_DE_IMPLEMENTACION.md
```

> Nota: la carpeta del proyecto se mantiene con el nombre actual `grain_stote` para no romper el historial de Git ya existente. Es un detalle menor y no bloqueante.

---

## 3. Dependencias necesarias

### Ya instaladas en `grain_stote` (se conservan)
- `react`, `react-dom` — base de React 19
- `vite`, `@vitejs/plugin-react` — tooling
- `tailwindcss`, `@tailwindcss/vite` (o `postcss`/`autoprefixer` según corresponda a la versión final de Tailwind) — estilos
- `shadcn`, `class-variance-authority`, `clsx`, `tailwind-merge`, `radix-ui` — base de Shadcn/UI
- `react-router-dom` (ya está en `package.json`, falta usarse) — enrutamiento
- `lucide-react` — íconos para los primitivos de Shadcn

### Por agregar
| Paquete | Uso |
|---|---|
| `chart.js` | Gráficas de barras y dona (Dashboard, Reportes) — reemplaza el `<script>` CDN del HTML |
| `@fontsource/montserrat` y `@fontsource/oswald` (o variantes variable-font) | Tipografías oficiales del diseño; sustituyen a Google Fonts por CDN para empaquetado consistente |
| `@fortawesome/fontawesome-svg-core`, `@fortawesome/free-solid-svg-icons`, `@fortawesome/react-fontawesome` **o** mantener Font Awesome vía `<link>` en `index.html` | Preservar exactamente los íconos `fa-solid fa-*` usados en los 19 HTML sin tener que reemplazar cada ícono por un equivalente de `lucide-react` |

### Por remover/limpiar
- `@fontsource-variable/geist` — la fuente Geist no se usa en los diseños finales (que usan Montserrat/Oswald); se elimina para evitar peso muerto.
- CSS residual del template de Vite en `App.css` (clases `.hero`, `.counter` con animación del logo).
- Carpeta `vite-app` completa (no es dependencia, pero se elimina del repositorio).

**Decisión a tomar en Fase 2 (recomendación, no bloqueante)**: usar Font Awesome vía CDN en `index.html` es la opción de **menor riesgo de fidelidad visual** porque permite copiar literalmente las clases `<i class="fa-solid fa-gauge-high">` de los HTML sin mapear cada ícono. Se recomienda esta opción salvo que se prefiera una integración 100% vía npm.

---

## 4. Componentes reutilizables (especificación funcional)

| Componente | Props clave | Usado en |
|---|---|---|
| `Sidebar` | `role`, `activePath` | AppLayout (todas las páginas autenticadas) |
| `Topbar` | `onToggleSidebar`, `userName`, `userRole` | AppLayout |
| `MobileOverlay` | `open`, `onClose` | AppLayout (breakpoint ≤780px) |
| `ThemeToggle` | — (lee/escribe `ThemeContext`) | Topbar |
| `StatCard` | `icon`, `label`, `value`, `tone`, `badge` | Dashboard, Reportes |
| `ChartCard` | `title`, `badge`, `chartConfig` | Dashboard, Reportes |
| `TableCard` | `title`, `columns`, `rows`, `emptyMessage` | Dashboard, Panel Ventas, Clientes, Productos |
| `Modal` | `open`, `title`, `onClose`, `children`, `footer` | Clientes, Productos |
| `FormCard` | `icon`, `title`, `children` | Registro de Venta, Login, Registro, Reportes (filtros) |
| `EmptyState` | `icon`, `text` | Tablas sin datos |
| `SearchInput` | `value`, `onChange`, `placeholder` | Clientes, Productos, Panel Ventas |
| `AvatarUploader` | `value`, `onChange`, `fallbackLetter` | Topbar, Configuración → Perfil |
| `DeudorCard` | `deudor`, `onVerDetalle` | Clientes (sección de deudores) |
| `CartSidebar` | `items`, `total`, `deuda`, `onSubmit` | Registro de Venta |
| `Tabs` (de Shadcn) | `tabs`, `activeTab` | Configuración, Reportes |

Todos los componentes de esta tabla son **agnósticos del rol**: reciben datos ya filtrados desde la página que los usa, no contienen lógica de "si es admin, si es vendedor".

---

## 5. Layouts

1. **`AuthLayout`**: pantalla completa sin sidebar, usada por `LoginPage` y `RegistroPage`. Reproduce el panel decorativo + tarjeta de formulario visto en `GESTION_DE_USUARIO.html` / `REGISTRO_DE_USUARIO.html`.
2. **`AppLayout`**: estructura `Sidebar + (MobileOverlay) + (Topbar + <Outlet/>)`, compartida por los 3 roles. Recibe el rol activo desde `AuthContext` y se lo pasa a `Sidebar` para renderizar el menú correcto:
   - **Admin**: Dashboard, Ventas, Clientes, Productos, Reportes, Configuración.
   - **Vendedor**: Dashboard, Ventas, Clientes, Productos, Configuración.
   - **Contador**: Dashboard, Reportes, Clientes, Configuración. *(sin Ventas, según decisión confirmada)*.
3. **Layout de venta (`sales-layout`)**: no es un layout de routing, sino una composición interna de `RegistroVentaPage` (formulario + `CartSidebar` en grid de 2 columnas, colapsando a 1 columna en `≤900px`).
4. **Layout de pestañas**: composición interna de `ConfiguracionPage` (barra de tabs + panel activo), reutilizando el componente `Tabs` de Shadcn.

---

## 6. Rutas (árbol definitivo de `react-router-dom`)

```
/login                          → AuthLayout > LoginPage
/registro                       → AuthLayout > RegistroPage

/admin                          → AppLayout (RoleGuard: role === 'admin')
  /admin/dashboard               → DashboardPage
  /admin/ventas                  → PanelVentasPage
  /admin/ventas/nueva            → RegistroVentaPage
  /admin/clientes                → ClientesPage
  /admin/productos               → ProductosPage
  /admin/reportes                → ReportesPage
  /admin/configuracion           → ConfiguracionPage   (incluye tab "Usuarios")

/vendedor                       → AppLayout (RoleGuard: role === 'vendedor')
  /vendedor/dashboard             → DashboardPage
  /vendedor/ventas                → PanelVentasPage
  /vendedor/ventas/nueva          → RegistroVentaPage
  /vendedor/clientes              → ClientesPage
  /vendedor/productos             → ProductosPage
  /vendedor/configuracion         → ConfiguracionPage

/contador                       → AppLayout (RoleGuard: role === 'contador')
  /contador/dashboard              → DashboardPage
  /contador/reportes               → ReportesPage
  /contador/clientes               → ClientesPage
  /contador/configuracion          → ConfiguracionPage

/                                → redirige a /login o a /{rol}/dashboard según sesión
*                                 → redirige a / (ruta no encontrada)
```

**`RoleGuard`**: componente envoltorio que valida (a) que exista sesión activa en `AuthContext` y (b) que el rol de la sesión coincida con el segmento de la ruta (`admin` / `vendedor` / `contador`). Si falla (a), redirige a `/login`. Si falla (b), redirige al dashboard del rol correcto.

`DashboardPage` y `ReportesPage` son **un solo componente** reutilizado en las rutas de los distintos roles; internamente leen el rol activo desde `AuthContext` para decidir qué tarjetas/columnas mostrar (ej. Contador no ve el botón "Registrar Venta" del banner de bienvenida).

---

## 7. Contextos

### `AuthContext`
- **Estado**: `session` (`{ id, nombre, rol, avatar }` o `null`).
- **Acciones**: `login(credenciales)`, `register(datos)`, `logout()`.
- **Persistencia**: hidrata desde `localStorage` (`usuarios_gs` + clave de sesión) al montar, igual que `store.getSession()` en el proyecto del instructor.
- **Consumido por**: `RoleGuard`, `Sidebar` (nombre/rol/avatar), `Topbar`, `UsuariosTab`.

### `ThemeContext`
- **Estado**: `theme` (`'light' | 'dark'`).
- **Acciones**: `toggleTheme()`.
- **Persistencia**: clave `theme` en `localStorage`, igual que en los HTML. Aplica el atributo `data-theme="dark"` sobre `document.body` o `documentElement` para activar las variables CSS de modo oscuro definidas en `index.css`.
- **Consumido por**: `ThemeToggle`, `Sidebar` (logo claro/oscuro), gráficas de Chart.js (colores de ejes/leyenda según tema).

No se crea un contexto para el estado de apertura del sidebar móvil: al ser estado compartido solo entre `Sidebar`, `Topbar` y `MobileOverlay` (todos hijos directos de `AppLayout`), se maneja como estado local en `AppLayout` y se pasa por props, evitando contexto innecesario.

---

## 8. Servicios

Todos los servicios exponen funciones puras que leen/escriben a través de `storage.js` (nunca acceden a `window.localStorage` directamente), preservando exactamente las claves usadas en los HTML para no romper la compatibilidad de datos:

| Servicio | Clave(s) de `localStorage` | Responsabilidades |
|---|---|---|
| `authService.js` | `usuarios_gs`, sesión actual | login, registro, logout, sesión activa |
| `ventasService.js` | `ventas` | crear venta, listar ventas, calcular deuda por venta a crédito |
| `clientesService.js` | `clientes_gs`, `deudores_gs` | CRUD clientes, cálculo/listado de deudores |
| `productosService.js` | `productos_gs` | CRUD productos, control de stock bajo |
| `usuariosService.js` | `usuarios_gs` | CRUD de usuarios (consumido por `UsuariosTab`) |
| `configService.js` | `config_perfil`, `config_sistema`, `config_tienda`, `tienda_logo`, `userPhoto` | lectura/escritura de las 3 pestañas de Configuración + logo/avatar |
| `reportesService.js` | `ventas`, `egresos_gs` | agregaciones para Dashboard y Reportes (ventas por mes, egresos por categoría, balance, exportación CSV) |
| `storage.js` | — (genérico) | `getItem`/`setItem`/`removeItem` con `JSON.parse`/`stringify` seguros |

`mockData.js` provee datos semilla (clientes, productos, usuarios, ventas de ejemplo) que se cargan únicamente si la clave correspondiente no existe aún en `localStorage`, replicando el comportamiento del proyecto del instructor.

---

## 9. Estrategia de migración HTML → React

1. **Extracción del sistema de diseño**: tomar las variables `:root` (`--mint`, `--lilac`, `--orange`, sombras, radios, transición) y las reglas de modo oscuro (`[data-theme="dark"]`) de cualquiera de los 19 HTML y trasladarlas una sola vez al tema de Tailwind (`index.css` / `tailwind.config`), junto con las fuentes Montserrat/Oswald.
2. **Construcción de `AppLayout`** a partir de la estructura común de sidebar+topbar presente en los 19 archivos, parametrizando lo que varía por rol (label del panel, ítems de navegación, inicial del avatar).
3. **Auth**: migrar `GESTION_DE_USUARIO.html` y `REGISTRO_DE_USUARIO.html` a `LoginPage`/`RegistroPage`, conservando el layout de dos columnas (panel decorativo + tarjeta de formulario).
4. **Dashboard**: migrar las 3 variantes (`DASHBOARD_ADMIN/VENDEDOR/CONTADOR`) a una sola `DashboardPage`, extrayendo a `StatCard`/`ChartCard`/`TableCard` lo que hoy está repetido, y condicionando solo lo mínimo (ej. botón "Registrar Venta" no aparece para Contador).
5. **Clientes y Productos**: migrar el patrón de tabla + `SearchInput` + `Modal` de alta/edición, unificando las copias por rol en una sola página por módulo.
6. **Ventas** (solo Admin/Vendedor): migrar el layout de dos columnas de `REGISTRO_DE_VENTAS_*.html` a `RegistroVentaPage` + `CartSidebar`, trasladando cuidadosamente la lógica de conversión de presentaciones y el flujo de crédito/fiado a `utils/presentaciones.js` y `ventasService.js`.
7. **Reportes**: migrar las 3 gráficas (barras, dona, barras de balance) y el botón de exportación CSV, compartiendo la misma página entre Admin y Contador.
8. **Configuración**: migrar el patrón de pestañas (`Mi Perfil`, `Sistema`, `Mi Tienda`) a los 3 roles, agregando la pestaña `Usuarios` exclusivamente cuando `role === 'admin'`.
9. **Validación visual continua**: después de cada módulo migrado, comparar contra el HTML original (colores, espaciados, breakpoints `1024px`/`780px`/`480px`, modo oscuro) antes de avanzar al siguiente.

---

## 10. Orden exacto de desarrollo

1. Eliminar `vite-app` del repositorio; confirmar que `grain_stote` compila limpio (`npm run dev`).
2. Limpiar `App.css` (quitar `.hero`/`.counter` residual de Vite) y remover la dependencia `@fontsource-variable/geist`.
3. Instalar dependencias nuevas (Chart.js, fuentes Montserrat/Oswald, estrategia de íconos elegida).
4. Configurar el tema visual oficial en `index.css`/Tailwind (colores, radios, sombra, fuentes, `data-theme="dark"`).
5. Crear `storage.js` y `mockData.js`.
6. Crear `AuthContext` y `ThemeContext`.
7. Crear `AuthLayout` y `AppLayout` (con `Sidebar`, `Topbar`, `MobileOverlay`, `ThemeToggle`) — sin páginas reales todavía, solo el cascarón navegable.
8. Configurar `routes.jsx` y `RoleGuard` con el árbol completo de la sección 6 (placeholders vacíos por página).
9. Construir los componentes comunes: `StatCard`, `ChartCard`, `TableCard`, `Modal`, `FormCard`, `EmptyState`, `SearchInput`, `AvatarUploader`.
10. Implementar `LoginPage` y `RegistroPage` (conecta con `authService`).
11. Implementar `DashboardPage` (las 3 variantes por rol, con datos reales desde `reportesService`).
12. Implementar `ClientesPage` (+ `ClienteModal`, `DeudorCard`).
13. Implementar `ProductosPage` (+ `ProductoModal`).
14. Implementar `PanelVentasPage` y `RegistroVentaPage` (+ `CartSidebar`, lógica de presentaciones y crédito) — solo rutas Admin/Vendedor.
15. Implementar `ReportesPage` (+ 3 gráficas y exportación CSV) — rutas Admin/Contador.
16. Implementar `ConfiguracionPage` (+ tabs Perfil/Sistema/Tienda, y `UsuariosTab` solo para Admin).
17. QA final: revisar cada ruta de cada rol contra su HTML equivalente, en claro/oscuro y en los 3 breakpoints responsive.

---

## 11. Riesgos y mitigaciones

| Riesgo | Mitigación |
|---|---|
| Confundir `vite-app` con la base real y mezclar archivos TypeScript en el proyecto | Eliminar la carpeta antes del paso 1; no importar nada desde ahí |
| Perder fidelidad visual al convertir CSS embebido a Tailwind | Migrar las variables CSS de color/sombra/radio tal cual al tema de Tailwind antes de tocar cualquier componente (paso 4), y validar cada módulo contra su HTML original |
| Romper el cálculo de conversión de presentaciones (libra/arroba) al migrar la lógica de Registro de Venta | Aislar esa lógica en `utils/presentaciones.js` con los mismos factores de conversión vistos en el HTML, antes de integrarla a la UI |
| Reintroducir duplicación de código por rol (como en los 19 HTML) | Una sola página por módulo, con render condicional mínimo basado en `role`, nunca componentes copiados |
| Inconsistencia en claves de `localStorage` respecto a los HTML (rompería compatibilidad de datos si se reutilizan en la sustentación) | Mantener exactamente las claves documentadas en la sección 8 dentro de cada servicio |
| Pérdida de íconos exactos al migrar de Font Awesome a otra librería | Mantener Font Awesome (CDN o npm) en vez de remapear cada ícono a `lucide-react` |
| Falta de feedback visual al usuario si Tailwind v4 cambia de sintaxis respecto a lo ya configurado en `grain_stote` | Validar la configuración de Tailwind con una página de prueba simple antes de construir layouts complejos |
| Mezclar lógica de permisos dentro de componentes compartidos (`Sidebar`, `Card`, etc.) | Los componentes comunes solo reciben datos ya filtrados por la página; la lógica de "qué puede ver cada rol" vive únicamente en `routes.jsx`, `RoleGuard` y las páginas de `features/` |

---

## 12. Próximo paso

Con este documento aprobado, la Fase 2 puede iniciar siguiendo el orden exacto de la sección 10, comenzando por la limpieza del proyecto base y la configuración del tema visual oficial.
