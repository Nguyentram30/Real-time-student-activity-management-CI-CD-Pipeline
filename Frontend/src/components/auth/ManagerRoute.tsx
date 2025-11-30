import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "@/UseAuth/AuthContext";

interface ManagerRouteProps {
  children: ReactNode;
}

const ManagerRoute = ({ children }: ManagerRouteProps) => {
  const { token, userData } = useAuth();

  if (!token) {
    return <Navigate to="/LoginPage" replace />;
  }

  const allowedRoles = ["manager", "admin"];

  if (!allowedRoles.includes(userData?.role || "")) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ManagerRoute;

