import { Menu } from "lucide-react";
import { ROLE_PROFILE, ROLES } from "@/routes/routeConfig";
import ThemeToggle from "@/components/layout/ThemeToggle";
import { useAuth } from "@/hooks/useAuth";

function Topbar({ role, onToggleSidebar }) {
  const profile = ROLE_PROFILE[role];
  const { session } = useAuth();

  return (
    <header className="gs-topbar" data-layout="topbar">
      <div className="gs-topbar-left">
        <button
          aria-label="Abrir navegación"
          className="gs-icon-btn lg:hidden"
          onClick={onToggleSidebar}
          type="button"
        >
          <Menu size={20} />
        </button>
        <span className="font-heading text-xl font-semibold uppercase text-foreground">
          {ROLES[role] ?? "Usuario"}
        </span>
      </div>
      <div className="gs-topbar-right">
        <ThemeToggle />
        <div className="gs-profile" aria-label="Perfil activo">
          <div className="gs-avatar" aria-hidden="true">
            {session?.name?.charAt(0) ?? profile?.avatar ?? "GS"}
          </div>
          <div>
            <div className="gs-profile-name">{session?.name ?? profile?.profileName ?? "Usuario"}</div>
            <div className="gs-profile-role">{profile?.profileRole ?? "Panel"}</div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Topbar;
