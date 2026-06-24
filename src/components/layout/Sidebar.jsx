import { NavLink } from "react-router-dom";
import { ROLE_ROUTES, ROLES } from "@/routes/routeConfig";

function Sidebar({ role }) {
  const routes = ROLE_ROUTES[role] ?? [];

  return (
    <aside className="border-b border-border p-4" data-layout="sidebar">
      <strong>Grain Store</strong>
      <span className="ml-2 text-sm text-muted-foreground">{ROLES[role]}</span>
      <nav aria-label="Navegacion principal" className="mt-3 flex flex-wrap gap-2">
        {routes.map((route) => (
          <NavLink className="text-sm text-foreground hover:text-primary" key={route.path} to={route.path}>
            {route.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;
