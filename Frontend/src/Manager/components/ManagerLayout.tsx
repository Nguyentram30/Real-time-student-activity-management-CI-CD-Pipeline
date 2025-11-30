import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  Activity,
  BarChart3,
  Bell,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Users,
} from "lucide-react";
import type { ReactNode } from "react";
import { useAuth } from "@/UseAuth/AuthContext";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, to: "/manager/dashboard" },
  { label: "Quản lý hoạt động", icon: Activity, to: "/manager/activities" },
  { label: "Quản lý thông báo", icon: Bell, to: "/manager/notifications" },
  { label: "Quản lý sinh viên", icon: Users, to: "/manager/students" },
  { label: "Thống kê & Báo cáo", icon: BarChart3, to: "/manager/reports" },
  { label: "Phản hồi sinh viên", icon: MessageSquare, to: "/manager/feedback" },
];

interface ManagerLayoutProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}

const ManagerLayout = ({ title, subtitle, actions, children }: ManagerLayoutProps) => {
  const { userData, logout } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const sidebarWidthClass = sidebarCollapsed ? "lg:w-20" : "lg:w-[17rem]";
  const contentOffsetClass = sidebarCollapsed ? "lg:ml-20" : "lg:ml-[17rem]";

  const renderNavItems = navItems.map(({ label, icon: Icon, to }) => (
    <NavLink
      key={label}
      to={to}
      title={sidebarCollapsed ? label : undefined}
      onClick={() => setMobileSidebarOpen(false)}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition ${
          isActive
            ? "bg-violet-500/10 text-violet-200 border border-violet-400/30 shadow-[0_0_10px_rgba(139,92,246,0.3)]"
            : "text-slate-300 hover:bg-white/5"
        } ${sidebarCollapsed ? "lg:justify-center" : ""}`
      }
    >
      <Icon size={18} />
      <span className={sidebarCollapsed ? "lg:hidden" : undefined}>{label}</span>
    </NavLink>
  ));

  return (
    <div className="min-h-screen w-full bg-[#050814] text-white flex">
      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:flex flex-col bg-[#0a0f1f]/95 border-r border-white/5 fixed inset-y-0 z-30 transition-all duration-300 ${sidebarWidthClass}`}
      >
        <div className="px-5 py-6 border-b border-white/10 flex items-center gap-3">
          <div className="text-xl font-bold tracking-tight flex-1">
            STU<span className="text-violet-400">Leader</span>
          </div>
          <button
            className="p-2 rounded-lg border border-white/10 hover:bg-white/10 transition text-xs text-blue-900"
            onClick={() => setSidebarCollapsed((prev) => !prev)}
            aria-label="Thu gọn menu"
          >
            {sidebarCollapsed ? "›" : "‹"}
          </button>
        </div>
        <nav className="px-4 py-6 flex flex-col gap-1 flex-1 overflow-y-auto">{renderNavItems}</nav>
      </aside>

      {/* Mobile sidebar */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        >
          <aside
            className="absolute inset-y-0 left-0 w-72 bg-[#0a0f1f] border-r border-white/10 p-6 flex flex-col gap-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold tracking-tight">
                STU<span className="text-violet-400">Leader</span>
              </div>
              <button
                className="p-2 rounded-lg border border-white/10 hover:bg-white/10 transition text-blue-900"
                onClick={() => setMobileSidebarOpen(false)}
                aria-label="Đóng menu"
              >
                ✕
              </button>
            </div>
            <nav className="flex flex-col gap-1 overflow-y-auto">{renderNavItems}</nav>
          </aside>
        </div>
      )}

      <div className={`flex-1 min-h-screen transition-all duration-300 ${contentOffsetClass}`}>
        <header className="h-auto min-h-20 border-b border-white/5 bg-[#070b19]/90 backdrop-blur-lg sticky top-0 z-20 flex flex-wrap items-center gap-4 px-4 md:px-8 py-4">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-2 rounded-xl border border-white/10 hover:bg-white/10 transition text-blue-900"
              onClick={() => setMobileSidebarOpen(true)}
              aria-label="Mở menu"
            >
              <Menu size={18} />
            </button>
            <div>
              <h1 className="text-2xl font-semibold">{title}</h1>
              {subtitle && <p className="text-sm text-slate-400">{subtitle}</p>}
            </div>
          </div>

          <div className="ml-auto flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-3 px-4 py-2 rounded-xl border border-white/10 bg-white/5">
              <div>
                <p className="text-sm font-medium">{userData?.fullName || "Manager"}</p>
                <p className="text-xs text-slate-400">{userData?.email || "manager@stu.edu"}</p>
              </div>
              <div className="w-10 h-10 rounded-xl border border-violet-400/40 bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-xs font-semibold">
                {(userData?.fullName || "STU").slice(0, 2).toUpperCase()}
              </div>
            </div>

            <button
              onClick={logout}
              className="flex items-center gap-2 px-3 py-2 rounded-xl border border-red-500/40 text-blue-900 hover:bg-red-500/10 transition text-sm"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Đăng xuất</span>
            </button>
          </div>
        </header>

        <main className="p-4 md:p-8 space-y-8 bg-gradient-to-b from-[#070b19] via-[#050d26] to-[#050814] min-h-[calc(100vh-5rem)]">
          {actions && <div className="flex justify-end">{actions}</div>}
          {children}
        </main>
      </div>
    </div>
  );
};

export default ManagerLayout;

