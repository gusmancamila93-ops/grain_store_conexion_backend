import { ROLES } from "@/routes/routeConfig";
import ThemeToggle from "@/components/layout/ThemeToggle";

function Topbar({ role }) {
  return (
    <header className="flex items-center justify-between border-b border-border p-4" data-layout="topbar">
      <span>{ROLES[role] ?? "Usuario"}</span>
      <ThemeToggle />
    </header>
  );
}

export default Topbar;
