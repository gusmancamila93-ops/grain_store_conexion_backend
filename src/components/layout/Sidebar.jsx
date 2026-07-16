import { NavLink, useNavigate } from "react-router-dom";
import {
  BarChart3,
  Boxes,
  ChartLine,
  CircleMinus,
  Gauge,
  LogOut,
  Settings,
  Users,
  X,
} from "lucide-react";
import { ROLE_PROFILE, ROLE_ROUTES } from "@/routes/routeConfig";
import { useAuth } from "@/hooks/useAuth";

const ICONS = {
  dashboard: Gauge,
  customers: Users,
  products: Boxes,
  expenses: CircleMinus,
  sales: ChartLine,
  reports: BarChart3,
  settings: Settings,
};

const GROUP_ORDER = ["Principal", "Gestión"];

function groupRoutes(routes) {
  return GROUP_ORDER.map((group) => ({
    group,
    routes: routes.filter((route) => route.group === group),
  })).filter((section) => section.routes.length);
}

function Sidebar({ role, open = false, onNavigate, onRequestClose }) {
  const routes = ROLE_ROUTES[role] ?? [];
  const profile = ROLE_PROFILE[role];
  const { logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    onNavigate?.();
    navigate("/login", { replace: true });
  }

  return (
    <aside className="gs-sidebar" data-layout="sidebar" data-open={open ? "true" : "false"}>
      <div className="gs-sidebar-logo">
        <button
          aria-label="Cerrar navegación"
          className="gs-sidebar-close"
          onClick={onRequestClose}
          type="button"
        >
          <X size={18} />
        </button>
        <strong className="gs-sidebar-title">Grain Store</strong>
        <div className="gs-sidebar-label">{profile?.panelLabel ?? "Panel"}</div>
      </div>
      <nav aria-label="Navegacion principal" className="gs-sidebar-nav">
        {groupRoutes(routes).map((section) => (
          <div className="gs-nav-section" key={section.group}>
            <div className="gs-nav-label">{section.group}</div>
            {section.routes.map((route) => {
              const Icon = ICONS[route.icon] ?? Gauge;

              return (
                <NavLink
                  className={({ isActive }) => `gs-nav-link${isActive ? " active" : ""}`}
                  key={route.path}
                  onClick={onNavigate}
                  to={route.path}
                >
                  <Icon size={18} />
                  <span
                    className={route.label === "Dashboard" ? "notranslate" : undefined}
                    translate={route.label === "Dashboard" ? "no" : undefined}
                  >
                    {route.label}
                  </span>
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>
      <div className="gs-sidebar-bottom">
        <button className="gs-nav-link w-full" onClick={handleLogout} type="button">
          <LogOut size={18} />
          <span>Salir</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
