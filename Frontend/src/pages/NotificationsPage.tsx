import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Bell, Calendar, User, FileText, ArrowLeft, Loader2 } from "lucide-react";
import MainHeader from "@/components/layout/MainHeader";
import { useAuth } from "@/UseAuth/AuthContext";
import api from "@/lib/axios";
import { toast } from "sonner";

interface Notification {
  _id: string;
  title: string;
  message: string;
  targetRoles: string[];
  scheduleAt: string;
  createdAt: string;
  createdBy?: {
    displayName: string;
    role: string;
  };
  metadata?: {
    attachmentUrl?: string;
  };
}

export default function NotificationsPage() {
  const { token } = useAuth();
  const isLoggedIn = Boolean(token);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all"); // all, today, week, month

  useEffect(() => {
    if (!isLoggedIn) {
      return;
    }

    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const res = await api.get("/users/notifications");
        setNotifications(res.data.notifications || []);
      } catch (error: any) {
        console.error("Không thể tải thông báo", error);
        toast.error("Không thể tải thông báo");
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [isLoggedIn, filter]);

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen w-screen bg-slate-950 text-white font-sans overflow-x-hidden">
        <MainHeader />
        <div className="pt-32 px-6 flex flex-col items-center gap-4 text-center max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold">Bạn cần đăng nhập để xem thông báo</h1>
          <Link
            to="/LoginPage"
            className="px-6 py-3 border border-cyan-400 text-blue-900 bg-white hover:bg-cyan-50 rounded-xl transition"
          >
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    );
  }

  const filteredNotifications = notifications.filter((notif) => {
    if (filter === "all") return true;
    const notifDate = new Date(notif.scheduleAt || notif.createdAt);
    const now = new Date();
    if (filter === "today") {
      return notifDate.toDateString() === now.toDateString();
    }
    if (filter === "week") {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return notifDate >= weekAgo;
    }
    if (filter === "month") {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return notifDate >= monthAgo;
    }
    return true;
  });

  return (
    <div className="min-h-screen w-screen bg-slate-950 text-white font-sans overflow-x-hidden">
      <MainHeader />
      
      <main className="pt-28 max-w-7xl mx-auto px-6 pb-20">
        <div className="flex items-center gap-4 mb-6">
          <Link
            to="/DashboardPage"
            className="p-2 rounded-xl border border-white/10 hover:bg-white/10 transition"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-4xl font-bold">Thông báo</h1>
            <p className="text-gray-400 mt-1">Xem tất cả thông báo từ Admin và Manager</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-xl border transition ${
              filter === "all"
                ? "bg-cyan-500/20 border-cyan-400/40 text-cyan-300"
                : "bg-white/5 border-white/10 hover:bg-white/10"
            }`}
          >
            Tất cả
          </button>
          <button
            onClick={() => setFilter("today")}
            className={`px-4 py-2 rounded-xl border transition ${
              filter === "today"
                ? "bg-cyan-500/20 border-cyan-400/40 text-cyan-300"
                : "bg-white/5 border-white/10 hover:bg-white/10"
            }`}
          >
            Hôm nay
          </button>
          <button
            onClick={() => setFilter("week")}
            className={`px-4 py-2 rounded-xl border transition ${
              filter === "week"
                ? "bg-cyan-500/20 border-cyan-400/40 text-cyan-300"
                : "bg-white/5 border-white/10 hover:bg-white/10"
            }`}
          >
            Tuần này
          </button>
          <button
            onClick={() => setFilter("month")}
            className={`px-4 py-2 rounded-xl border transition ${
              filter === "month"
                ? "bg-cyan-500/20 border-cyan-400/40 text-cyan-300"
                : "bg-white/5 border-white/10 hover:bg-white/10"
            }`}
          >
            Tháng này
          </button>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="text-center py-12 bg-white/5 border border-white/10 rounded-2xl">
              <Bell size={48} className="mx-auto text-slate-400 mb-4" />
              <p className="text-slate-400">Chưa có thông báo nào</p>
            </div>
          ) : (
            filteredNotifications.map((notif) => (
              <div
                key={notif._id}
                className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-cyan-400/40 transition"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-purple-500/10 rounded-xl">
                    <Bell size={20} className="text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">{notif.title}</h3>
                    <p className="text-slate-300 mb-4 whitespace-pre-wrap">{notif.message}</p>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400 mb-4">
                      <span className="flex items-center gap-1">
                        <User size={14} />
                        {notif.createdBy?.displayName || "Hệ thống"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {new Date(notif.scheduleAt || notif.createdAt).toLocaleString("vi-VN")}
                      </span>
                    </div>

                    {notif.metadata?.attachmentUrl && (
                      <div className="mt-4 p-3 bg-cyan-500/10 border border-cyan-400/30 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText size={16} className="text-cyan-400" />
                          <span className="text-sm font-medium text-cyan-300">File đính kèm</span>
                        </div>
                        <a
                          href={notif.metadata.attachmentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cyan-400 hover:underline text-sm break-all"
                        >
                          {notif.metadata.attachmentUrl}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}

