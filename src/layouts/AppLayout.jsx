import { Outlet } from "react-router-dom";
import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import MobileOverlay from "@/components/layout/MobileOverlay";

function AppLayout({ role }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="gs-app-shell" data-sidebar-open={sidebarOpen ? "true" : "false"}>
      <MobileOverlay open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Sidebar
        onNavigate={() => setSidebarOpen(false)}
        onRequestClose={() => setSidebarOpen(false)}
        open={sidebarOpen}
        role={role}
      />
      <div className="min-h-screen min-w-0">
        <Topbar onToggleSidebar={() => setSidebarOpen((current) => !current)} role={role} />
        <main className="gs-content">
          <Outlet context={{ role }} />
        </main>
      </div>
    </div>
  );
}

export default AppLayout;
