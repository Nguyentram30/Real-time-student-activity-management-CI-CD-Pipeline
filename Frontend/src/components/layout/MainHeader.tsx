import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, Search, X } from "lucide-react";
import { useAuth } from "@/UseAuth/AuthContext";

const NAV_LINKS = [
  { label: "TRANG CHỦ", to: "/" },
  { label: "HOẠT ĐỘNG", to: "/ActivityPage" },
  { label: "KẾT QUẢ", to: "/DashboardPage" },
  { label: "THÔNG BÁO", to: "/NotificationsPage" },
  { label: "LIÊN HỆ", to: "/ContactPage" },
];

const MainHeader = () => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { userData, logout } = useAuth();
  const greeting = userData?.fullName || "Người dùng";

  return (
    <header className="fixed inset-x-0 top-0 z-40 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          <Link to="/" className="flex items-center gap-3">
            <span className="text-2xl font-extrabold tracking-tight text-white">
              STU<span className="text-cyan-400">TECH</span>
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-20 text-sm text-white font-medium">
            {NAV_LINKS.map((item) => (
              <NavLink
                key={item.label}
                to={item.to}
                className={({ isActive }) =>
                  `text-white/80 hover:text-white-300 transition ${
                    isActive ? "text-cyan-300" : ""
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3 sm:gap-4 lg:gap-8">
            <button className="px-2 py-3 border border-cyan-400 text-cyan-400 hover:bg-cyan-400/10 rounded-xl transition run-cyan">
              <Search size={18} />
            </button>

            {userData ? (
              <div className="flex items-center gap-3">
                <span className="hidden sm:block text-sm whitespace-nowrap">
                  Xin chào,{" "}
                  <span className="font-semibold text-cyan-300">{greeting}</span>
                </span>
                <button
                  onClick={logout}
                  className="px-4 py-3 border border-cyan-400 text-cyan-400 hover:bg-cyan-400/10 rounded-xl transition run-cyan"
                >
                  Đăng xuất
                </button>
              </div>
            ) : (
              <Link
                to="/LoginPage"
                className="px-8 py-3 border border-cyan-400 text-cyan-400 hover:bg-cyan-400/10 rounded-xl transition run-cyan"
              >
                ĐĂNG KÝ / ĐĂNG NHẬP
              </Link>
            )}

            <button
              className="lg:hidden p-2 border border-cyan-400 text-cyan-400 hover:bg-cyan-400/10 rounded-xl transition run-cyan"
              onClick={() => setMobileNavOpen((prev) => !prev)}
              aria-label="Toggle navigation"
            >
              {mobileNavOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {mobileNavOpen && (
        <div className="lg:hidden bg-slate-950/95 border-t border-white/5 px-4 pb-6">
          <nav className="flex flex-col gap-3 pt-4 text-sm">
            {NAV_LINKS.map((item) => (
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

export default MainHeader;

