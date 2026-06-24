export const roles = {
  admin: "Administrador",
  vendedor: "Vendedor",
  contador: "Contador",
};

export const publicRoutes = [
  { path: "/login", label: "Login" },
  { path: "/registro", label: "Registro" },
];

export const roleRoutes = {
  admin: [
    { path: "/admin/dashboard", label: "Dashboard", module: "dashboard" },
    { path: "/admin/ventas", label: "Ventas", module: "ventas" },
    { path: "/admin/ventas/nueva", label: "Registro de venta", module: "ventas" },
    { path: "/admin/clientes", label: "Clientes", module: "clientes" },
    { path: "/admin/productos", label: "Productos", module: "productos" },
    { path: "/admin/reportes", label: "Reportes", module: "reportes" },
    { path: "/admin/configuracion", label: "Configuracion", module: "configuracion" },
  ],
  vendedor: [
    { path: "/vendedor/dashboard", label: "Dashboard", module: "dashboard" },
    { path: "/vendedor/ventas", label: "Ventas", module: "ventas" },
    { path: "/vendedor/ventas/nueva", label: "Registro de venta", module: "ventas" },
    { path: "/vendedor/clientes", label: "Clientes", module: "clientes" },
    { path: "/vendedor/productos", label: "Productos", module: "productos" },
    { path: "/vendedor/configuracion", label: "Configuracion", module: "configuracion" },
  ],
  contador: [
    { path: "/contador/dashboard", label: "Dashboard", module: "dashboard" },
    { path: "/contador/clientes", label: "Clientes", module: "clientes" },
    { path: "/contador/reportes", label: "Reportes", module: "reportes" },
    { path: "/contador/configuracion", label: "Configuracion", module: "configuracion" },
  ],
};

export const modulePermissions = {
  dashboard: ["admin", "vendedor", "contador"],
  ventas: ["admin", "vendedor"],
  clientes: ["admin", "vendedor", "contador"],
  productos: ["admin", "vendedor"],
  reportes: ["admin", "contador"],
  configuracion: ["admin", "vendedor", "contador"],
  usuarios: ["admin"],
};
