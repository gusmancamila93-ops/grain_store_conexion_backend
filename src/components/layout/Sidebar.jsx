import { roleRoutes, roles } from "@/app/routeConfig";

function Sidebar({ role }) {
  const routes = roleRoutes[role] ?? [];

  return (
    <aside data-layout="sidebar">
      <strong>Grain Store</strong>
      <span>{roles[role]}</span>
      <nav aria-label="Navegacion principal">
        {routes.map((route) => (
          <a href={route.path} key={route.path}>
            {route.label}
          </a>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;
