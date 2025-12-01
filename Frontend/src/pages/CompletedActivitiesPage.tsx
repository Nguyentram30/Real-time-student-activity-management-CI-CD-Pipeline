import { useState, useEffect } from "react";
import MainHeader from "@/components/layout/MainHeader";
import { useAuth } from "@/UseAuth/AuthContext";
import { Calendar, MapPin, CheckCircle2, Award } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";
import { Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

export default function CompletedActivitiesPage() {
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
        // Filter only completed activities that user registered for
        const completed = allActivities.filter(
          (activity: any) => activity.registered && (activity.status === "Đã kết thúc" || activity.registrationStatus === "completed")
        );
        setActivities(completed);
      } catch (error) {
        console.error("Không thể tải hoạt động đã hoàn thành", error);
        toast.error("Không thể tải hoạt động đã hoàn thành");
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [isLoggedIn]);

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen w-screen bg-slate-950 text-white font-sans">
        <MainHeader />
        <div className="pt-32 px-6 flex flex-col items-center gap-4 text-center max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold">Bạn cần đăng nhập</h1>
          <p className="text-slate-300">Vui lòng đăng nhập để xem hoạt động đã hoàn thành.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-screen bg-slate-950 text-white font-sans">
      <MainHeader />
      <div className="pt-28 max-w-6xl mx-auto px-6 pb-20">
        <h1 className="text-4xl font-bold mb-2">Hoạt động đã hoàn thành</h1>
        <p className="text-gray-400 mb-8">Danh sách các hoạt động bạn đã hoàn thành</p>

        {loading ? (
          <div className="bg-[#141a33] rounded-2xl p-12 text-center border border-white/10">
            <Loader2 className="w-8 h-8 animate-spin text-cyan-400 mx-auto mb-4" />
            <p className="text-slate-400">Đang tải...</p>
          </div>
        ) : activities.length === 0 ? (
          <div className="bg-[#141a33] rounded-2xl p-12 text-center border border-white/10">
            <Award className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-400 mb-2">Bạn chưa hoàn thành hoạt động nào</p>
            <p className="text-sm text-slate-500">Hoàn thành hoạt động để nhận giấy chứng nhận</p>
            <Link
              to="/ActivityPage"
              className="mt-4 inline-block px-6 py-3 border border-cyan-400 text-cyan-400 hover:bg-cyan-400/10 rounded-xl transition"
            >
              Xem hoạt động
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity: any) => (
              <div
                key={activity.id || activity._id}
                className="bg-[#141a33] border border-white/10 rounded-xl p-6 hover:border-cyan-400/40 transition"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-white">{activity.title}</h3>
                      <span className="px-3 py-1 rounded-full text-xs font-medium border bg-green-500/20 text-green-300 border-green-400/40 flex items-center gap-1">
                        <CheckCircle2 size={12} />
                        Hoàn thành
                      </span>
                    </div>
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
                    <Link
                      to={`/activities/${activity.id || activity._id}`}
                      className="px-4 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 rounded-lg text-sm transition"
                    >
                      Xem chi tiết
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

