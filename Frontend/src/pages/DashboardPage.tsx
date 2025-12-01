import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import {
  LayoutDashboard,
  Users,
  ListChecks,
  Award,
  CheckCircle2,
  Clock,
  XCircle,
  Calendar,
  MapPin,
  Bell
} from "lucide-react";
import MainHeader from "@/components/layout/MainHeader";
import { useAuth } from "@/UseAuth/AuthContext";
import api from "@/lib/axios";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function DashboardPage() {

  const [scrollWidth, setScrollWidth] = useState(0);
  const { token } = useAuth();
  const isLoggedIn = Boolean(token);
  const [activities, setActivities] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.body.scrollHeight - window.innerHeight;
      const progress = totalHeight > 0 ? (window.scrollY / totalHeight) * 100 : 0;
      setScrollWidth(progress);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);


  useEffect(() => {
    if (!isLoggedIn) {
      setActivities([]);
      return;
    }

    const fetchDashboardData = async () => {
      try {
        setLoadingData(true);
        const res = await api.get("/activities");
        setActivities(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        console.error("Không thể tải dữ liệu dashboard", error);
        toast.error("Không thể tải dữ liệu hoạt động");
      } finally {
        setLoadingData(false);
      }
    };

    fetchDashboardData();
  }, [isLoggedIn]);

  const registeredActivities = useMemo(
    () => activities.filter((activity) => activity.registered),
    [activities]
  );

  const completedActivities = useMemo(
    () => registeredActivities.filter((activity) => activity.status === "Đã kết thúc"),
    [registeredActivities]
  );

  const evidenceSubmitted = useMemo(
    () => registeredActivities.filter((activity) => activity.evidence).length,
    [registeredActivities]
  );

  const stats = [
    { label: "Tổng hoạt động", value: activities.length, change: "Tất cả hoạt động khả dụng", color: "from-cyan-400 to-blue-400" },
    { label: "Đã đăng ký", value: registeredActivities.length, change: "Hoạt động bạn quan tâm", color: "from-indigo-400 to-purple-400" },
    { label: "Đã hoàn thành", value: completedActivities.length, change: "Hoạt động kết thúc", color: "from-pink-400 to-rose-400" },
    { label: "Minh chứng đã nộp", value: evidenceSubmitted, change: "Được xác nhận", color: "from-violet-400 to-purple-500" },
  ];

  const chartData = useMemo(() => {
    const monthMap: Record<string, number> = {};
    activities.forEach((activity) => {
      if (!activity.date) return;
      const date = new Date(activity.date);
      if (Number.isNaN(date.getTime())) return;
      const label = `Th${date.getMonth() + 1}`;
      monthMap[label] = (monthMap[label] || 0) + 1;
    });

    const labels = Array.from({ length: 6 }, (_, idx) => {
      const now = new Date();
      now.setMonth(now.getMonth() - (5 - idx));
      return `Th${now.getMonth() + 1}`;
    });

    return labels.map((label) => ({
      name: label,
      hours: monthMap[label] || 0,
    }));
  }, [activities]);

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen w-screen bg-slate-950 text-white font-sans overflow-x-hidden">
        <MainHeader />
        <div className="pt-32 px-6 flex flex-col items-center gap-4 text-center max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold">Bạn cần đăng nhập để xem kết quả</h1>
          <p className="text-slate-300">
            Vui lòng đăng nhập bằng tài khoản sinh viên để xem Dashboard và kết quả rèn luyện.
          </p>
          <Link
            to="/LoginPage"
            className="px-6 py-3 border border-cyan-400 text-blue-900 bg-white hover:bg-cyan-50 rounded-xl transition run-cyan"
          >
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-screen bg-slate-950 text-white font-sans overflow-x-hidden">

      <MainHeader />
      <div
        className="fixed top-20 left-0 right-0 h-[4px] rounded-full shadow-[0_0_12px_rgba(0,255,255,0.6)] z-30"
        style={{
          width: `${scrollWidth}%`,
          background: "linear-gradient(90deg, #00f2ff, #38bdf8, #3b82f6)",
        }}
      />

      {/* ================= MAIN LAYOUT ================= */}
      <div className="flex pt-28 max-w-7xl mx-auto">

        {/* SIDEBAR */}
        <aside className="w-64 bg-[#141a33] rounded-2xl shadow-xl p-6 border border-white/10 hidden md:block h-[90vh]">
          <h3 className="text-lg font-semibold mb-6">Menu</h3>

          <nav className="flex flex-col gap-3 text-gray-300 font-medium">
            <Link to="/DashboardPage" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-cyan-400/20">
              <LayoutDashboard size={18} /> Tổng quan
            </Link>

            <Link to="/ActivityPage" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-cyan-400/20">
              <ListChecks size={18} /> Hoạt động
            </Link>

            <Link to="/NotificationsPage" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-cyan-400/20">
              <Bell size={18} /> Thông báo
            </Link>

            <Link to="#" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-cyan-400/20">
              <Users size={18} /> Thành viên
            </Link>

            <Link to="#" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-cyan-400/20">
              <Award size={18} /> Giấy chứng nhận
            </Link>
          </nav>
        </aside>

        {/* ================= CONTENT ================= */}
        <main className="flex-1 ml-10 space-y-8 pb-20">

          <h1 className="text-4xl font-bold">Tổng quan</h1>
          <p className="text-gray-400">Theo dõi tiến trình rèn luyện của bạn</p>

          {/* ==== CARDS ==== */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-6 mr-3" >
            {stats.map((s, i) => (
              <div
                key={i}
                className={`p-6 rounded-2xl shadow-lg bg-gradient-to-br ${s.color}`}
              >
                <p className="text-sm">{s.label}</p>
                <div className="text-3xl font-bold my-3">
                  {loadingData ? <Loader2 className="w-8 h-8 animate-spin" /> : s.value}
                </div>
                <span className="text-sm opacity-80">{s.change}</span>
              </div>
            ))}
          </div>

          {/* ==== HOẠT ĐỘNG ĐÃ ĐĂNG KÝ ==== */}
          {registeredActivities.length > 0 && (
            <div className="bg-[#141a33] p-6 rounded-2xl shadow-lg border border-white/10 mr-4">
              <h3 className="font-semibold mb-4 text-xl">Hoạt động đã đăng ký</h3>
              <div className="space-y-4">
                {registeredActivities.map((activity: any) => {
                  const getStatusInfo = () => {
                    const status = activity.registrationStatus || "pending";
                    if (status === "pending") {
                      return {
                        label: "Đã đăng ký (pending Manager)",
                        color: "bg-amber-500/20 text-amber-300 border-amber-400/40",
                        icon: Clock,
                      };
                    } else if (status === "approved") {
                      return {
                        label: "Đã duyệt (Manager duyệt)",
                        color: "bg-green-500/20 text-green-300 border-green-400/40",
                        icon: CheckCircle2,
                      };
                    } else if (status === "rejected") {
                      return {
                        label: "Bị từ chối (Manager từ chối)",
                        color: "bg-red-500/20 text-red-300 border-red-400/40",
                        icon: XCircle,
                      };
                    } else if (status === "checked_in" || status === "completed") {
                      return {
                        label: "Hoàn tất",
                        color: "bg-green-500/20 text-green-300 border-green-400/40",
                        icon: CheckCircle2,
                      };
                    }
                    return {
                      label: "Chờ duyệt",
                      color: "bg-slate-500/20 text-slate-300 border-slate-400/40",
                      icon: Clock,
                    };
                  };

                  const statusInfo = getStatusInfo();
                  const StatusIcon = statusInfo.icon;

                  return (
                    <div
                      key={activity.id || activity._id}
                      className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-cyan-400/40 transition"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-white mb-2">{activity.title}</h4>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                            {activity.date && (
                              <span className="flex items-center gap-1">
                                <Calendar size={14} />
                                {new Date(activity.date).toLocaleDateString("vi-VN")}
                              </span>
                            )}
                            {activity.location && (
                              <span className="flex items-center gap-1">
                                <MapPin size={14} />
                                {activity.location}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${statusInfo.color}`}>
                            <StatusIcon size={12} />
                            {statusInfo.label}
                          </span>
                          {/* Trạng thái điểm danh */}
                          {activity.attendanceStatus && (
                            <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${
                              activity.attendanceStatus === "Đã điểm danh"
                                ? "bg-green-500/20 text-green-300 border-green-400/40"
                                : activity.attendanceStatus === "Quá hạn"
                                ? "bg-red-500/20 text-red-300 border-red-400/40"
                                : "bg-amber-500/20 text-amber-300 border-amber-400/40"
                            }`}>
                              {activity.attendanceStatus === "Đã điểm danh" && <CheckCircle2 size={12} />}
                              {activity.attendanceStatus === "Quá hạn" && <XCircle size={12} />}
                              {activity.attendanceStatus === "Chưa điểm danh" && <Clock size={12} />}
                              {activity.attendanceStatus}
                            </span>
                          )}
                        </div>
                      </div>
                      {activity.registrationStatus === "rejected" && activity.note && (
                        <div className="mt-3 p-3 bg-red-500/10 border border-red-400/30 rounded-lg">
                          <p className="text-sm text-red-300">
                            <strong>Lý do từ chối:</strong> {activity.note}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ==== BIỂU ĐỒ ==== */}
          <div className="bg-[#141a33] p-6 rounded-2xl shadow-lg border border-white/10 mr-4">
            <h3 className="font-semibold mb-4">Thống kê giờ rèn luyện</h3>

            <div className="h-64">
              {loadingData ? (
                <div className="w-full h-full flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <XAxis dataKey="name" stroke="#aaa" />
                    <YAxis stroke="#aaa" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="hours" fill="#38bdf8" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* ================= FOOTER ================= */}
      <footer className="bg-[#02030a] border-t border-slate-800 mt-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row md:justify-between gap-8">

            <div>
              <span className="text-2xl font-bold text-white">
                STU<span className="text-cyan-400">TECH</span>
              </span>
              <p className="text-sm text-slate-400 max-w-md mt-3">
                Hệ thống hỗ trợ quản lý, theo dõi và tổ chức các hoạt động sinh viên.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-sm text-slate-400">
              <div>
                <h4 className="text-white font-semibold">Tính năng</h4>
                <ul className="space-y-2 mt-3">
                  <li className="hover:text-cyan-300">Quản lý hoạt động</li>
                  <li className="hover:text-cyan-300">Đăng ký tham gia</li>
                  <li className="hover:text-cyan-300">Điểm danh</li>
                </ul>
              </div>

              <div>
                <h4 className="text-white font-semibold">Hỗ trợ</h4>
                <ul className="space-y-2 mt-3">
                  <li className="hover:text-cyan-300">Tài liệu</li>
                  <li className="hover:text-cyan-300">Cộng đồng</li>
                  <li className="hover:text-cyan-300">Liên hệ</li>
                </ul>
              </div>
            </div>
          </div>

          <p className="text-sm text-slate-500 mt-8">
            © {new Date().getFullYear()} TDMU. Hệ thống quản lý hoạt động sinh viên.
          </p>
        </div>
      </footer>

    </div>
  );
}
