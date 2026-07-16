import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { ROLE_HOME } from "@/routes/routeConfig";

function RoleGuard({ allowedRoles, children }) {
  const { isAuthenticated, session } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate replace state={{ from: location }} to="/login" />;
  }

  if (allowedRoles?.length && !allowedRoles.includes(session.role)) {
    return <Navigate replace to={ROLE_HOME[session.role] ?? "/login"} />;
  }

  return children ?? <Outlet />;
}

export default RoleGuard;
