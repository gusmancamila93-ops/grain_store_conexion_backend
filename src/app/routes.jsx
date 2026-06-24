import { createBrowserRouter, Navigate } from "react-router-dom";
import AppLayout from "@/layouts/AppLayout";
import AuthLayout from "@/layouts/AuthLayout";
import RoleGuard from "@/app/RoleGuard";
import LoginPage from "@/features/auth/LoginPage";
import RegistroPage from "@/features/auth/RegistroPage";
import DashboardPage from "@/features/dashboard/DashboardPage";
import PanelVentasPage from "@/features/ventas/PanelVentasPage";
import RegistroVentaPage from "@/features/ventas/RegistroVentaPage";
import ClientesPage from "@/features/clientes/ClientesPage";
import ProductosPage from "@/features/productos/ProductosPage";
import ReportesPage from "@/features/reportes/ReportesPage";
import ConfiguracionPage from "@/features/configuracion/ConfiguracionPage";

export const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [
      { path: "/login", element: <LoginPage /> },
      { path: "/registro", element: <RegistroPage /> },
    ],
  },
  {
    element: <RoleGuard />,
    children: [
      {
        path: "/admin",
        element: <AppLayout role="admin" />,
        children: [
          { index: true, element: <Navigate to="/admin/dashboard" replace /> },
          { path: "dashboard", element: <DashboardPage /> },
          { path: "ventas", element: <PanelVentasPage /> },
          { path: "ventas/nueva", element: <RegistroVentaPage /> },
          { path: "clientes", element: <ClientesPage /> },
          { path: "productos", element: <ProductosPage /> },
          { path: "reportes", element: <ReportesPage /> },
          { path: "configuracion", element: <ConfiguracionPage /> },
        ],
      },
      {
        path: "/vendedor",
        element: <AppLayout role="vendedor" />,
        children: [
          { index: true, element: <Navigate to="/vendedor/dashboard" replace /> },
          { path: "dashboard", element: <DashboardPage /> },
          { path: "ventas", element: <PanelVentasPage /> },
          { path: "ventas/nueva", element: <RegistroVentaPage /> },
          { path: "clientes", element: <ClientesPage /> },
          { path: "productos", element: <ProductosPage /> },
          { path: "configuracion", element: <ConfiguracionPage /> },
        ],
      },
      {
        path: "/contador",
        element: <AppLayout role="contador" />,
        children: [
          { index: true, element: <Navigate to="/contador/dashboard" replace /> },
          { path: "dashboard", element: <DashboardPage /> },
          { path: "clientes", element: <ClientesPage /> },
          { path: "reportes", element: <ReportesPage /> },
          { path: "configuracion", element: <ConfiguracionPage /> },
        ],
      },
    ],
  },
  { path: "/", element: <Navigate to="/login" replace /> },
  { path: "*", element: <Navigate to="/" replace /> },
]);
