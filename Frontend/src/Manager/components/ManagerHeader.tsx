import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, Search, X, UserCircle, Settings, LogOut, ChevronDown, Bell } from "lucide-react";
import { useAuth } from "@/UseAuth/AuthContext";
import { managerService } from "@/services/managerService";
import { useEffect } from "react";

const MANAGER_NAV_LINKS = [
  { label: "TRANG CHỦ", to: "/manager/dashboard" },
  { label: "HOẠT ĐỘNG", to: "/manager/activities" },
  { label: "THÔNG BÁO", to: "/manager/notifications" },
  { label: "THỐNG KÊ", to: "/manager/reports" },
];

const ManagerHeader = () => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { userData, logout } = useAuth();
  const greeting = userData?.fullName || "Quản lý";
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotif, setShowNotif] = useState(false);

  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      try {
        const data = await managerService.getNotifications();
        if (!mounted) return;
        setNotifications(data || []);
      } catch (err) {
        // ignore
      }
    };
    fetch();
    return () => { mounted = false; };
  }, []);

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
  };

  return (
    <header className="fixed inset-x-0 top-0 z-40 backdrop-blur-md border-b border-white/5 bg-[#060915]/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          <Link to="/manager/dashboard" className="flex items-center gap-3">
            <span className="text-2xl font-extrabold tracking-tight text-white">
              STU<span className="text-cyan-400">TECH</span>
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-10 text-sm font-medium">
            {MANAGER_NAV_LINKS.map((item) => (
              <NavLink
                key={item.label}
                to={item.to}
                className={({ isActive }) =>
                  `text-white/80 hover:text-cyan-300 transition ${
                    isActive ? "text-cyan-300" : ""
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3 sm:gap-4 lg:gap-8">
            <button className="p-2 rounded-full border border-white/15 text-white/70 hover:text-white hover:bg-white/10 transition">
              <Search size={18} />
            </button>

            {userData && (
              <div className="relative">
                <div className="flex items-center gap-3">
                  <div className="relative" onMouseEnter={() => setShowNotif(true)} onMouseLeave={() => setShowNotif(false)}>
                    <button className="p-2 rounded-full border border-white/15 text-white/70 hover:text-white hover:bg-white/10 transition">
                      <Bell size={18} />
                      {notifications.length > 0 && (
                        <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold leading-none text-white bg-rose-500 rounded-full">
                          {notifications.length}
                        </span>
                      )}
                    </button>
                    {showNotif && (
                      <div className="absolute right-0 mt-2 w-80 bg-[#0b1021] border border-white/10 rounded-xl shadow-xl z-50 p-2">
                        {notifications.slice(0,5).map((n)=> (
                          <div key={n._id} className="p-2 hover:bg-white/5 rounded">
                            <div className="text-sm font-medium text-white">{n.title}</div>
                            <div className="text-xs text-slate-400 line-clamp-2">{n.message}</div>
                          </div>
                        ))}
                        {notifications.length === 0 && <div className="text-sm text-slate-400 p-3">Không có thông báo</div>}
                        <div className="border-t border-white/10 mt-2 pt-2 text-center">
                          <a href="/manager/notifications" className="text-sm text-cyan-400">Xem tất cả</a>
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition"
                  >
                    <div className="text-right hidden sm:block">
                      <div className="text-sm font-medium text-white">{greeting}</div>
                      <div className="text-xs text-slate-400">Quản lý</div>
                    </div>
                    <UserCircle size={20} className="text-cyan-400" />
                    <ChevronDown size={16} className="text-slate-400" />
                  </button>
                </div>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-[#0b1021] border border-white/10 rounded-xl shadow-xl z-50">
                    <div className="py-2">
                      <Link
                        to="/manager/profile"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-white/5 transition"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <UserCircle size={16} />
                        Hồ sơ cá nhân
                      </Link>
                      <Link
                        to="/manager/change-password"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-white/5 transition"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Settings size={16} />
                        Đổi mật khẩu
                      </Link>
                      <div className="border-t border-white/10 my-1"></div>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-300 hover:bg-red-500/10 transition"
                      >
                        <LogOut size={16} />
                        Đăng xuất
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            <button
              className="lg:hidden p-2 rounded-lg border border-white/10 hover:bg-white/10 transition"
              onClick={() => setMobileNavOpen((prev) => !prev)}
              aria-label="Toggle navigation"
            >
              {mobileNavOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {mobileNavOpen && (
        <div className="lg:hidden bg-[#0b1021]/95 border-t border-white/5 px-4 pb-6">
          <nav className="flex flex-col gap-3 pt-4 text-sm">
            {MANAGER_NAV_LINKS.map((item) => (
              <NavLink
                key={item.label}
                to={item.to}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white/80 hover:text-cyan-300 ${
                    isActive ? "text-cyan-300" : ""
                  }`
                }
                onClick={() => setMobileNavOpen(false)}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};

export default ManagerHeader;

