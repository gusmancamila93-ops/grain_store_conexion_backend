export const ROLES = {
  admin: "Administrador",
  vendedor: "Vendedor",
  contador: "Contador",
};

export const PUBLIC_ROUTES = [
  { path: "/login", label: "Iniciar sesion" },
  { path: "/registro", label: "Registro" },
];

export const ROLE_ROUTES = {
  admin: [
    { path: "/admin/dashboard", label: "Dashboard" },
    { path: "/admin/ventas", label: "Ventas" },
    { path: "/admin/ventas/nueva", label: "Registro de venta" },
    { path: "/admin/clientes", label: "Clientes" },
    { path: "/admin/productos", label: "Productos" },
    { path: "/admin/reportes", label: "Reportes" },
    { path: "/admin/configuracion", label: "Configuracion" },
  ],
  vendedor: [
    { path: "/vendedor/dashboard", label: "Dashboard" },
    { path: "/vendedor/ventas", label: "Ventas" },
    { path: "/vendedor/ventas/nueva", label: "Registro de venta" },
    { path: "/vendedor/clientes", label: "Clientes" },
    { path: "/vendedor/productos", label: "Productos" },
    { path: "/vendedor/configuracion", label: "Configuracion" },
  ],
  contador: [
    { path: "/contador/dashboard", label: "Dashboard" },
    { path: "/contador/clientes", label: "Clientes" },
    { path: "/contador/reportes", label: "Reportes" },
    { path: "/contador/configuracion", label: "Configuracion" },
  ],
};

export const DEFAULT_ROLE_PATH = "/admin/dashboard";
