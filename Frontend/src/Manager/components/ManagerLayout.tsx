import { useState, useMemo } from "react";
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
  User,
  ChevronDown,
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
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const sidebarWidthClass = sidebarCollapsed ? "lg:w-20" : "lg:w-72";
  const contentOffsetClass = sidebarCollapsed ? "lg:ml-20" : "lg:ml-72";

  const renderNavItems = useMemo(
    () =>
      navItems.map(({ label, icon: Icon, to }) => (
        <NavLink
          key={label}
          to={to}
          title={sidebarCollapsed ? label : undefined}
          onClick={() => setMobileSidebarOpen(false)}
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition ${
              isActive
                ? "bg-cyan-500/10 text-cyan-300 border border-cyan-400/40 shadow-[0_0_12px_rgba(34,211,238,0.25)]"
                : "text-slate-300 hover:bg-white/5"
            } ${sidebarCollapsed ? "lg:justify-center" : ""}`
          }
        >
          <Icon size={18} />
          <span className={sidebarCollapsed ? "lg:hidden" : undefined}>{label}</span>
        </NavLink>
      )),
    [sidebarCollapsed]
  );

  return (
    <div className="min-h-screen w-full bg-[#050814] text-white flex">
      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:flex flex-col bg-[#0a0f1f]/95 border-r border-white/5 fixed inset-y-0 z-30 transition-all duration-300 ${sidebarWidthClass}`}
      >
        <div className="px-4 sm:px-6 py-4 sm:py-6 border-b border-white/5 flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <div className={`text-xl sm:text-2xl font-bold tracking-tight ${sidebarCollapsed ? "hidden" : "flex-1"}`}>
            STU<span className="text-cyan-400">TECH</span>
          </div>
          <button
            className="p-2 rounded-lg border border-white/10 hover:bg-white/10 transition text-xs flex-shrink-0 text-blue-900"
            onClick={() => setSidebarCollapsed((prev) => !prev)}
            aria-label="Thu gọn sidebar"
          >
            {sidebarCollapsed ? "›" : "‹"}
          </button>
        </div>
        <nav className="px-2 sm:px-4 py-4 sm:py-6 flex flex-col gap-1 flex-1 overflow-y-auto overscroll-contain">
          {renderNavItems}
        </nav>
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
                STU<span className="text-cyan-400">TECH</span>
              </div>
              <button
                className="p-2 rounded-lg border border-white/10 hover:bg-white/10 transition"
                onClick={() => setMobileSidebarOpen(false)}
                aria-label="Đóng sidebar"
              >
                ✕
              </button>
            </div>
            <nav className="flex flex-col gap-1 overflow-y-auto">{renderNavItems}</nav>
          </aside>
        </div>
      )}

      <div className={`flex-1 min-h-screen transition-all duration-300 ${contentOffsetClass}`}>
        <header className="h-auto min-h-20 border-b border-white/5 bg-[#070b19]/80 sticky top-0 backdrop-blur-lg flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 px-4 md:px-8 py-3 sm:py-4 z-20">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <button
              className="lg:hidden p-2 rounded-xl border border-white/10 hover:bg-white/10 transition flex-shrink-0 text-blue-900"
              onClick={() => setMobileSidebarOpen(true)}
              aria-label="Mở menu"
            >
              <Menu size={18} />
            </button>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl font-semibold truncate">{title}</h1>
              {subtitle && <p className="text-xs sm:text-sm text-slate-400 truncate">{subtitle}</p>}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto sm:ml-auto">
            <div className="relative flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 rounded-xl border border-white/10 bg-white/5 flex-shrink-0 min-w-0">
              <div className="min-w-0 hidden sm:block">
                <div className="text-sm font-medium truncate">{userData?.fullName || userData?.displayName || "Manager"}</div>
                <div className="text-xs text-slate-400 truncate">{userData?.email || "manager@stu.edu"}</div>
              </div>
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-1 rounded-lg hover:bg-white/10 transition"
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl border border-cyan-400/40 bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-xs font-semibold flex-shrink-0">
                    {(userData?.fullName || userData?.displayName || "STU").slice(0, 2).toUpperCase()}
                  </div>
                  <ChevronDown size={14} className="hidden sm:block text-slate-400" />
                </button>
                
                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-48 bg-[#0b1021] border border-white/10 rounded-xl shadow-xl z-20">
                      <NavLink
                        to="/manager/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-white/5 transition"
                      >
                        <User size={16} />
                        Thông tin người quản lý
                      </NavLink>
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-red-500/10 text-red-300 transition"
                      >
                        <LogOut size={16} />
                        Đăng xuất
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="p-4 md:p-8 space-y-8 bg-gradient-to-b from-[#070b19] via-[#060b21] to-[#070b19] min-h-[calc(100vh-5rem)]">
          {actions && <div className="flex justify-end">{actions}</div>}
          {children}
        </main>
      </div>
    </div>
  );
};

export default ManagerLayout;

