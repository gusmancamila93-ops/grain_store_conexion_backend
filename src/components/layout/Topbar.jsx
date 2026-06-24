import { roles } from "@/app/routeConfig";
import ThemeToggle from "@/components/layout/ThemeToggle";

function Topbar({ role }) {
  return (
    <header data-layout="topbar">
      <span>{roles[role] ?? "Usuario"}</span>
      <ThemeToggle />
    </header>
  );
}

export default Topbar;
