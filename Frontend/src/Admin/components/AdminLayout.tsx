import { useMemo, useState } from "react";
import NotificationModal from "./NotificationModal";
import { NavLink } from "react-router-dom";
import {
  Activity,
  BarChart3,
  Bell,
  FolderArchive,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Moon,
  Search,
  Server,
  ShieldCheck,
  Users,
} from "lucide-react";
import type { ReactNode } from "react";
import { useAuth } from "@/UseAuth/AuthContext";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, to: "/admin/dashboard" },
  { label: "Người dùng", icon: Users, to: "/admin/users" },
  { label: "Hoạt động", icon: Activity, to: "/admin/activities" },
  { label: "Sinh viên", icon: GraduationCap, to: "/admin/students" },
  { label: "Thông báo", icon: Megaphone, to: "/admin/notifications" },
  { label: "Tài liệu", icon: FolderArchive, to: "/admin/documents" },
  { label: "Báo cáo", icon: BarChart3, to: "/admin/reports" },
  { label: "Tính năng đặc biệt", icon: ShieldCheck, to: "/admin/advanced" },
  { label: "Quản lý hệ thống", icon: Server, to: "/admin/system" },
];

interface AdminLayoutProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}

const AdminLayout = ({ title, subtitle, actions, children }: AdminLayoutProps) => {
  const { userData, logout } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
  };

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
          <span className={sidebarCollapsed ? "lg:hidden" : undefined}>
            {label}
          </span>
        </NavLink>
      )),
    [sidebarCollapsed]
  );

  return (
    <div className="min-h-screen bg-[#060915] text-white flex">
      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:flex flex-col bg-[#0b1021]/95 border-r border-white/5 fixed inset-y-0 z-30 transition-all duration-300 ${sidebarWidthClass} max-h-screen overflow-hidden`}
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
            className="absolute inset-y-0 left-0 w-72 bg-[#0b1021] border-r border-white/10 p-6 flex flex-col gap-6"
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
              ☰
            </button>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl font-semibold truncate">{title}</h1>
              {subtitle && <p className="text-xs sm:text-sm text-slate-400 truncate">{subtitle}</p>}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto sm:ml-auto">
            <div className="relative hidden sm:block">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              />
              <input
                type="text"
                placeholder="Tìm kiếm nhanh..."
                className="bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/60 w-48"
              />
            </div>

            <button
              className="p-2 rounded-xl border border-white/10 hover:bg-white/10 transition flex-shrink-0 text-blue-900"
              onClick={() => {
                const html = document.documentElement;
                if (html.classList.contains("light")) {
                  html.classList.remove("light");
                  html.classList.add("dark");
                } else {
                  html.classList.remove("dark");
                  html.classList.add("light");
                }
              }}
              aria-label="Đổi theme"
            >
              <Moon size={16} />
            </button>

            <NotificationModal
              trigger={
                <button className="relative p-2 rounded-xl border border-white/10 hover:bg-white/10 transition flex-shrink-0 text-blue-900">
                  <Bell size={16} />
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full"></span>
                </button>
              }
            />

            <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 rounded-xl border border-white/10 bg-white/5 flex-shrink-0 min-w-0">
              <div className="min-w-0 hidden sm:block">
                <div className="text-sm font-medium truncate">{userData?.fullName || "Admin"}</div>
                <div className="text-xs text-slate-400 truncate">{userData?.email || "Hệ thống"}</div>
              </div>
              <img
                src="https://i.pravatar.cc/64?img=12"
                alt="admin-avatar"
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl border border-cyan-400/40 object-cover flex-shrink-0"
              />
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 rounded-xl border border-red-500/40 text-blue-900 hover:bg-red-500/10 transition text-sm flex-shrink-0 whitespace-nowrap"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Đăng xuất</span>
            </button>
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

export default AdminLayout;

