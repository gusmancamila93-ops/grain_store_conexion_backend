# Estructura del proyecto — Grain Store

Árbol completo del repositorio, generado a partir del sistema de archivos real
(excluye `node_modules`, `dist`, `.git` y logs locales, que son artefactos
generados y no código fuente).

```
grain_stote/
├── .claude/
│   └── launch.json                 # config del dev server para el pane de previsualización
├── .vscode/
│   └── launch.json
├── .env                              # VITE_API_URL (no sensible, sin credenciales)
├── .env.example
├── .gitignore
├── ANALISIS_BACKEND.md               # Fase 1 — Análisis del frontend original
├── API_DOCUMENTATION.md              # Referencia completa de endpoints
├── DISENO_BACKEND.md                 # Fase 2 — Diseño de arquitectura del backend
├── DOCUMENTACION_TECNICA.md          # Decisiones técnicas, seguridad, limitaciones
├── Evidencia_GA8-220501096-AA1-EV02.md
├── INFORME_TECNICO.md                # Notas técnicas previas del proceso de análisis inicial
├── MANUAL_INSTALACION.md             # Guía de instalación paso a paso
├── PLAN_DE_IMPLEMENTACION.md         # Plan original de implementación del frontend
├── README.md                         # Documentación general del sistema completo
├── README_BACKEND.md                 # Documentación específica del backend
├── components.json                   # Configuración de shadcn/Radix UI
├── eslint.config.js
├── index.html                        # Punto de entrada HTML del frontend
├── jsconfig.json                     # Alias de rutas (@/ → src/)
├── package.json                      # Dependencias y scripts del frontend
├── package-lock.json
├── vite.config.js
│
├── backend/                          # ── API REST independiente ──
│   ├── .env                          # variables reales (excluido de Git)
│   ├── .env.example
│   ├── package.json
│   ├── package-lock.json
│   ├── prisma/
│   │   ├── schema.prisma             # Modelo de datos (7 tablas)
│   │   ├── seed.js                   # Datos de ejemplo
│   │   └── migrations/
│   │       ├── migration_lock.toml
│   │       └── 20260716174809_init/
│   │           └── migration.sql
│   └── src/
│       ├── app.js                    # Configuración de Express (middlewares + rutas)
│       ├── server.js                 # Arranque del servidor
│       ├── config/
│       │   ├── cors.js
│       │   ├── db.js                 # Cliente de Prisma
│       │   └── env.js                # Carga y valida variables de entorno
│       ├── middlewares/
│       │   ├── authenticate.js       # Verifica JWT
│       │   ├── authorize.js          # Verifica rol
│       │   ├── errorHandler.js       # Formato uniforme de errores
│       │   └── validate.js           # Aplica esquemas zod
│       ├── modules/                  # Un paquete por entidad de negocio
│       │   ├── auth/                 (controller, routes, schema, service)
│       │   ├── clientes/             (controller, routes, schema, service)
│       │   ├── configuracion/        (controller, routes, schema, service)
│       │   ├── dashboard/            (controller, routes, service)
│       │   ├── egresos/              (controller, routes, schema, service)
│       │   ├── productos/            (controller, routes, schema, service)
│       │   ├── reportes/             (controller, routes, service)
│       │   ├── usuarios/             (controller, routes, schema, service)
│       │   └── ventas/               (controller, routes, schema, service)
│       └── utils/
│           ├── ApiError.js           # Clase de error con statusCode
│           ├── asyncHandler.js       # Envuelve controladores async
│           ├── constants.js          # Listas cerradas compartidas (roles, categorías, estados)
│           ├── jwt.js                # Firma/verifica tokens
│           ├── monthly.js            # Helper de agregación mensual (dashboard/reportes)
│           └── password.js           # Hash/comparación con bcrypt
│
├── public/                           # ── Estáticos del frontend ──
│   ├── favicon.svg
│   └── icons.svg
│
├── docs/                             # (carpeta vacía, sin archivos versionados)
│
└── src/                               # ── Frontend (React) ──
    ├── App.jsx                        # Punto de entrada de la SPA (RouterProvider)
    ├── main.jsx                       # Bootstrap de React + AuthProvider
    ├── index.css                      # Estilos globales / Tailwind
    ├── assets/
    │   └── hero.png
    ├── components/
    │   ├── common/                    # Tarjetas, tablas, modal, tabs, buscador (reutilizables)
    │   ├── layout/                    # Sidebar, Topbar, overlay móvil, selector de tema
    │   └── ui/                        # Primitivas de UI (shadcn)
    ├── contexts/
    │   ├── AuthContext.js
    │   ├── AuthProvider.jsx           # Sesión activa, login/logout/updateProfile
    │   └── ThemeContext.js            # (definido, sin consumidores activos)
    ├── data/
    │   └── mockData.js                # Datos de ejemplo históricos — ya no se usan tras la integración (Fase 4)
    ├── hooks/
    │   ├── useAuth.js                 # Hook de acceso al contexto de sesión
    │   ├── useLocalStorageList.js     # (stub sin uso, heredado del proyecto original)
    │   └── useTheme.js                # (stub sin uso; el tema real lo maneja ThemeToggle.jsx)
    ├── layouts/
    │   ├── AppLayout.jsx              # Shell de la app autenticada (Sidebar + Topbar + Outlet)
    │   └── AuthLayout.jsx             # Shell de login/registro
    ├── lib/
    │   └── utils.js                   # Utilidad `cn()` de shadcn
    ├── pages/                         # Una carpeta por módulo funcional
    │   ├── PagePlaceholder.jsx        # Página reservada genérica
    │   ├── auth/
    │   │   ├── LoginPage.jsx
    │   │   └── RegisterPage.jsx       # Placeholder, sin formulario funcional
    │   ├── customers/CustomersPage.jsx
    │   ├── dashboard/DashboardPage.jsx
    │   ├── expenses/ExpensesPage.jsx
    │   ├── products/ProductsPage.jsx
    │   ├── reports/ReportsPage.jsx
    │   ├── sales/
    │   │   ├── NewSalePage.jsx
    │   │   └── SalesPage.jsx
    │   └── settings/SettingsPage.jsx
    ├── routes/
    │   ├── RoleGuard.jsx               # Protección de rutas por rol
    │   ├── router.jsx                  # Árbol de rutas de la aplicación
    │   └── routeConfig.js              # Roles, menú por rol, home por rol
    ├── services/                       # Capa de acceso a la API
    │   ├── apiClient.js                 # Cliente HTTP central (JWT, manejo de 401/errores)
    │   ├── authService.js
    │   ├── clientesService.js
    │   ├── configService.js
    │   ├── dashboardService.js
    │   ├── egresosService.js
    │   ├── productosService.js
    │   ├── reportesService.js
    │   ├── storage.js                   # Claves de localStorage (sesión, tema)
    │   ├── usuariosService.js
    │   └── ventasService.js
    ├── styles/                          # (carpeta vacía, sin archivos versionados)
    └── utils/
        ├── formatCurrency.js
        ├── formatDate.js
        ├── idGenerator.js                # (stub sin uso, heredado del proyecto original)
        └── presentaciones.js             # (stub sin uso, heredado del proyecto original)
```

## Notas sobre archivos marcados como "sin uso"

Durante el análisis se verificó (con búsqueda de referencias en todo `src/`) que
los siguientes archivos existen en el repositorio pero **ningún otro archivo los
importa**: `src/data/mockData.js`, `src/hooks/useLocalStorageList.js`,
`src/hooks/useTheme.js`, `src/contexts/ThemeContext.js`, `src/utils/idGenerator.js`,
`src/utils/presentaciones.js`, `src/components/common/AvatarUploader.jsx`. Son
remanentes del proyecto original (antes de la integración con el backend) que no se
eliminaron para no modificar el repositorio más allá de lo solicitado en cada fase;
no afectan el funcionamiento del sistema.
