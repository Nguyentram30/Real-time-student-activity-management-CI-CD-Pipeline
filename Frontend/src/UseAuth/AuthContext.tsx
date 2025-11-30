import React, { createContext, useContext, useState } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";

// ------------------ Types ------------------
interface User {
  id: string;
  fullName: string;
  email: string;
  studentId?: string;
  faculty?: string;
  role?: string;
}

interface AuthContextProps {
  token: string | null;
  userData: User | null;

  login: (token: string, userData?: User) => void;
  logout: () => void;
  setUserData: (user: User | null) => void;
}

// ------------------ Context ------------------
const AuthContext = createContext<AuthContextProps | undefined>(undefined);

// ------------------ Provider ------------------
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );

  const [userData, setUserDataState] = useState<User | null>(
    JSON.parse(localStorage.getItem("user") || "null")
  );

  const navigate = useNavigate();

  // 🔥 LOGIN
  const login = (newToken: string, newUserData?: User) => {
    // Persist token and user in localStorage
    localStorage.setItem("token", newToken);
    setToken(newToken);
    // Sync token with Zustand store
    useAuthStore.getState().setAccessToken(newToken);

    if (newUserData) {
      localStorage.setItem("user", JSON.stringify(newUserData));
      setUserDataState(newUserData);
      // Also sync user data with Zustand store (optional, for other parts of app)
      // Here we only store token; user data can be fetched via fetchMe when needed.
    }

    const role =
      newUserData?.role ||
      (() => {
        try {
          return JSON.parse(localStorage.getItem("user") || "null")?.role;
        } catch {
          return undefined;
        }
      })();

    // Redirect based on role
    if (role === "admin") {
      navigate("/admin/dashboard");
    } else if (role === "manager" || role === "organizer") {
      navigate("/manager/dashboard");
    } else {
      navigate("/");
    }
  };

  // 🔥 SET USER
  const setUserData = (user: User | null) => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
    setUserDataState(user);
    // Keep Zustand store in sync (optional)
    if (user) {
      // No direct method for user in store, but fetchMe can be called elsewhere if needed.
    } else {
      useAuthStore.getState().clearState();
    }
  };

  // 🔥 LOGOUT
  const logout = () => {
    // Clear persisted data
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUserDataState(null);
    // Clear Zustand auth store
    useAuthStore.getState().clearState();
    navigate("/LoginPage");
  };

  return (
    <AuthContext.Provider
      value={{ token, userData, login, logout, setUserData }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ------------------ Hook ------------------
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context)
    throw new Error("useAuth must be used within AuthProvider");
  return context;
};
