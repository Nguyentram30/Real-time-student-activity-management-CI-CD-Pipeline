import { useState, useEffect, useMemo } from "react";
import MainHeader from "@/components/layout/MainHeader";
import { useAuth } from "@/UseAuth/AuthContext";
import { Calendar, MapPin, Clock, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";
import { Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

export default function RegisteredActivitiesPage() {
  const { token } = useAuth();
  const isLoggedIn = Boolean(token);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) {
      setActivities([]);
      return;
    }

    const fetchActivities = async () => {
      try {
        setLoading(true);
        const res = await api.get("/activities");
        const allActivities = Array.isArray(res.data) ? res.data : [];
        // Filter only registered activities
        const registered = allActivities.filter((activity: any) => activity.registered);
        setActivities(registered);
      } catch (error) {
        console.error("Không thể tải hoạt động đã đăng ký", error);
        toast.error("Không thể tải hoạt động đã đăng ký");
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [isLoggedIn]);

  const getStatusInfo = (status: string) => {
    const statusMap: Record<string, { label: string; color: string; icon: any }> = {
      pending: {
        label: "Chờ Manager duyệt",
        color: "bg-amber-500/20 text-amber-300 border-amber-400/40",
        icon: Clock,
      },
      approved: {
        label: "Đã được duyệt",
        color: "bg-blue-500/20 text-blue-300 border-blue-400/40",
        icon: CheckCircle2,
      },
      rejected: {
        label: "Không được duyệt",
        color: "bg-red-500/20 text-red-300 border-red-400/40",
        icon: XCircle,
      },
      checked_in: {
        label: "Đã điểm danh",
        color: "bg-green-500/20 text-green-300 border-green-400/40",
        icon: CheckCircle2,
      },
      completed: {
        label: "Hoàn tất",
        color: "bg-purple-500/20 text-purple-300 border-purple-400/40",
        icon: CheckCircle2,
      },
    };

    return statusMap[status] || {
      label: "Chờ duyệt",
      color: "bg-slate-500/20 text-slate-300 border-slate-400/40",
      icon: Clock,
    };
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen w-screen bg-slate-950 text-white font-sans">
        <MainHeader />
        <div className="pt-32 px-6 flex flex-col items-center gap-4 text-center max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold">Bạn cần đăng nhập</h1>
          <p className="text-slate-300">Vui lòng đăng nhập để xem hoạt động đã đăng ký.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-screen bg-slate-950 text-white font-sans">
      <MainHeader />
      <div className="pt-28 max-w-6xl mx-auto px-6 pb-20">
        <h1 className="text-4xl font-bold mb-2">Hoạt động đã đăng ký</h1>
        <p className="text-gray-400 mb-8">Danh sách các hoạt động bạn đã đăng ký tham gia</p>

        {loading ? (
          <div className="bg-[#141a33] rounded-2xl p-12 text-center border border-white/10">
            <Loader2 className="w-8 h-8 animate-spin text-cyan-400 mx-auto mb-4" />
            <p className="text-slate-400">Đang tải...</p>
          </div>
        ) : activities.length === 0 ? (
          <div className="bg-[#141a33] rounded-2xl p-12 text-center border border-white/10">
            <p className="text-slate-400">Bạn chưa đăng ký hoạt động nào</p>
            <Link
              to="/ActivityPage"
              className="mt-4 inline-block px-6 py-3 border border-cyan-400 text-cyan-400 hover:bg-cyan-400/10 rounded-xl transition"
            >
              Xem hoạt động
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity: any) => {
              const statusInfo = getStatusInfo(activity.registrationStatus || "pending");
              const StatusIcon = statusInfo.icon;

              return (
                <div
                  key={activity.id || activity._id}
                  className="bg-[#141a33] border border-white/10 rounded-xl p-6 hover:border-cyan-400/40 transition"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-2">{activity.title}</h3>
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
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${statusInfo.color}`}>
                        <StatusIcon size={12} />
                        {statusInfo.label}
                      </span>
                      <Link
                        to={`/activities/${activity.id || activity._id}`}
                        className="px-4 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 rounded-lg text-sm transition"
                      >
                        Xem chi tiết
                      </Link>
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
        )}
      </div>
    </div>
  );
}

