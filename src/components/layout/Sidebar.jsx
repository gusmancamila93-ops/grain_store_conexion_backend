import { NavLink } from "react-router-dom";
import { ROLE_ROUTES, ROLES } from "@/routes/routeConfig";

function Sidebar({ role }) {
  const routes = ROLE_ROUTES[role] ?? [];

  return (
    <aside className="gs-sidebar" data-layout="sidebar">
      <div className="gs-sidebar-logo">
        <strong className="gs-sidebar-title">Grain Store</strong>
        <div className="gs-sidebar-label">{ROLES[role] ?? "Panel"}</div>
      </div>
      <nav aria-label="Navegacion principal" className="gs-sidebar-nav">
        {routes.map((route) => (
          <NavLink className="gs-nav-link" key={route.path} to={route.path}>
            {route.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;
