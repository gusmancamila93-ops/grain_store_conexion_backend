import { createBrowserRouter, Navigate } from "react-router-dom";
import AppLayout from "@/layouts/AppLayout";
import AuthLayout from "@/layouts/AuthLayout";
import RoleGuard from "@/routes/RoleGuard";
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import DashboardPage from "@/pages/dashboard/DashboardPage";
import SalesPage from "@/pages/sales/SalesPage";
import NewSalePage from "@/pages/sales/NewSalePage";
import CustomersPage from "@/pages/customers/CustomersPage";
import ProductsPage from "@/pages/products/ProductsPage";
import ReportsPage from "@/pages/reports/ReportsPage";
import SettingsPage from "@/pages/settings/SettingsPage";

export const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [
      { path: "/login", element: <LoginPage /> },
      { path: "/registro", element: <RegisterPage /> },
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
          { path: "ventas", element: <SalesPage /> },
          { path: "ventas/nueva", element: <NewSalePage /> },
          { path: "clientes", element: <CustomersPage /> },
          { path: "productos", element: <ProductsPage /> },
          { path: "reportes", element: <ReportsPage /> },
          { path: "configuracion", element: <SettingsPage /> },
        ],
      },
      {
        path: "/vendedor",
        element: <AppLayout role="vendedor" />,
        children: [
          { index: true, element: <Navigate to="/vendedor/dashboard" replace /> },
          { path: "dashboard", element: <DashboardPage /> },
          { path: "ventas", element: <SalesPage /> },
          { path: "ventas/nueva", element: <NewSalePage /> },
          { path: "clientes", element: <CustomersPage /> },
          { path: "productos", element: <ProductsPage /> },
          { path: "configuracion", element: <SettingsPage /> },
        ],
      },
      {
        path: "/contador",
        element: <AppLayout role="contador" />,
        children: [
          { index: true, element: <Navigate to="/contador/dashboard" replace /> },
          { path: "dashboard", element: <DashboardPage /> },
          { path: "clientes", element: <CustomersPage /> },
          { path: "reportes", element: <ReportsPage /> },
          { path: "configuracion", element: <SettingsPage /> },
        ],
      },
    ],
  },
  { path: "/", element: <Navigate to="/login" replace /> },
  { path: "*", element: <Navigate to="/" replace /> },
]);
