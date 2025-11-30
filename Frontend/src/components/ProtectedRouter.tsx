import { Navigate } from "react-router-dom";
import { useAuth } from "@/UseAuth/AuthContext";
import type { ReactElement } from "react";

export default function ProtectedRouter({ children }: { children: ReactElement }) {
  const { token } = useAuth();

  if (!token) return <Navigate to="/login" replace />;

  return children;
}
