# Informe tecnico breve - Grain Store

## Alcance revisado

Se analizo exclusivamente el proyecto `grain_stote`, los 19 HTML/CSS de referencia, el proyecto React de referencia del profesor y `PLAN_DE_IMPLEMENTACION.md`.

## Hallazgos principales

- `grain_stote` es un proyecto React + Vite + Tailwind/Shadcn inicial, pero todavia esta en fase de plantilla: `App.jsx` solo renderiza un boton y no existe enrutamiento real.
- Los HTML de referencia estan duplicados por rol. La estructura visual repetida es clara: `Sidebar`, `Topbar`, overlay movil, contenido principal, tarjetas, tablas, formularios, modales, tabs y graficas.
- El proyecto del profesor usa una arquitectura mas simple y monolitica: concentra pantallas, navegacion y estado en `App.jsx`, con `services/storage.js`, `mockData.js` y utilidades. Sirve como referencia de persistencia local y flujo academico, pero no conviene copiar su organizacion para Grain Store.
- El plan define correctamente una SPA por capas + features, con `AuthLayout`, `AppLayout`, rutas por rol, servicios sobre `localStorage`, contextos de sesion/tema y componentes reutilizables.
- Hay un problema estructural previo: existe una carpeta hermana `vite-app` que no debe usarse para este proyecto. Tambien el nombre del proyecto real es `grain_stote`, no `grain_store`, y se mantiene para no romper el entorno.
- `vite.config.js` importa `@tailwindcss/vite`, pero `package.json` no lo declara como dependencia directa. El build actual funciona porque el paquete esta disponible en `node_modules`, pero conviene declararlo para evitar instalaciones no reproducibles.

## Modulos por rol

- Administrador: Dashboard, Ventas, Clientes, Productos, Reportes, Configuracion. La gestion de usuarios vive como tab interna de Configuracion.
- Vendedor: Dashboard, Ventas, Clientes, Productos, Configuracion.
- Contador: Dashboard, Clientes, Reportes, Configuracion. No debe tener Ventas ni consultas financieras separadas.

## Rutas necesarias

- Publicas: `/login`, `/registro`.
- Admin: `/admin/dashboard`, `/admin/ventas`, `/admin/ventas/nueva`, `/admin/clientes`, `/admin/productos`, `/admin/reportes`, `/admin/configuracion`.
- Vendedor: `/vendedor/dashboard`, `/vendedor/ventas`, `/vendedor/ventas/nueva`, `/vendedor/clientes`, `/vendedor/productos`, `/vendedor/configuracion`.
- Contador: `/contador/dashboard`, `/contador/clientes`, `/contador/reportes`, `/contador/configuracion`.

## Arquitectura propuesta

La base recomendada queda organizada por capas:

- `src/app`: definicion de rutas, permisos y guardas.
- `src/layouts`: cascarones visuales compartidos.
- `src/components`: componentes reutilizables de layout, UI y comunes.
- `src/features`: paginas y componentes especificos por modulo.
- `src/context`: sesion y tema.
- `src/services`: acceso a datos y persistencia local.
- `src/data`: semillas/mock data.
- `src/utils`: formateadores, conversiones y helpers puros.
- `src/hooks`: hooks compartidos.

## Problemas a corregir antes de implementar

- Declarar `@tailwindcss/vite` como dependencia directa si se conserva ese plugin en `vite.config.js`.
- Migrar las variables visuales reales de los HTML (`--mint`, `--lilac`, `--orange`, modo oscuro, sombras y breakpoints) antes de construir pantallas.
- Evitar copiar HTML por rol; cada modulo debe tener una sola pagina parametrizada por permisos.
- Encapsular todas las claves de `localStorage` en servicios para no dispersar persistencia en las vistas.
- Mantener `PLAN_DE_IMPLEMENTACION.md` en la raiz de `grain_stote`.
