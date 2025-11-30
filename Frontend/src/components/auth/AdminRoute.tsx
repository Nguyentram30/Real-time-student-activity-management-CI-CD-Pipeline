import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "@/UseAuth/AuthContext";

interface AdminRouteProps {
  children: ReactNode;
}

const AdminRoute = ({ children }: AdminRouteProps) => {
  const { token, userData } = useAuth();

  if (!token) {
    return <Navigate to="/LoginPage" replace />;
  }

  if (userData?.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;

