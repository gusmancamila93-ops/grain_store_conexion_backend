import { Outlet } from "react-router-dom";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";

function AppLayout({ role }) {
  return (
    <div className="gs-app-shell">
      <Sidebar role={role} />
      <div className="min-h-screen min-w-0">
        <Topbar role={role} />
        <main className="gs-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AppLayout;
