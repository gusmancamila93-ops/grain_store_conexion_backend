import { ROLES } from "@/routes/routeConfig";
import ThemeToggle from "@/components/layout/ThemeToggle";

function Topbar({ role }) {
  return (
    <header className="gs-topbar" data-layout="topbar">
      <span className="font-heading text-xl font-semibold uppercase text-foreground">
        {ROLES[role] ?? "Usuario"}
      </span>
      <ThemeToggle />
    </header>
  );
}

export default Topbar;
