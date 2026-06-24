import { Outlet } from "react-router-dom";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";

function AppLayout({ role }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar role={role} />
      <div className="min-h-screen">
        <Topbar role={role} />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AppLayout;
