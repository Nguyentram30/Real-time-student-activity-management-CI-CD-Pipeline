import { useState, useEffect } from "react";
import ManagerLayout from "../components/ManagerLayout";
import {
  Activity,
  BarChart3,
  Bell,
  FileText,
  MessageSquare,
  Plus,
  TrendingUp,
  Users,
  CheckCircle2,
  Clock,
  XCircle,
  Loader2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { managerService } from "@/services/managerService";
import { toast } from "sonner";

interface StatCard {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: string;
  color: string;
}

const ManagerDashboardPage = () => {
  const [stats, setStats] = useState({
    totalActivities: 0,
    pendingRegistrations: 0,
    totalStudents: 0,
    totalNotifications: 0,
    activeActivities: 0,
    completedActivities: 0,
  });
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const statusChipMap: Record<
    string,
    { style: string; label: string }
  > = {
    Draft: { style: "bg-slate-500/20 text-slate-300", label: "Bản nháp" },
    Pending: { style: "bg-amber-500/20 text-amber-300", label: "Chờ duyệt" },
    Approved: { style: "bg-green-500/20 text-green-300", label: "Đã phê duyệt" },
    ApprovedWithCondition: { style: "bg-emerald-500/20 text-emerald-300", label: "Phê duyệt có điều kiện" },
    NeedEdit: { style: "bg-indigo-500/20 text-indigo-300", label: "Cần chỉnh sửa" },
    Rejected: { style: "bg-red-500/20 text-red-300", label: "Bị từ chối" },
    Open: { style: "bg-cyan-500/20 text-cyan-300", label: "Đang diễn ra" },
    Completed: { style: "bg-blue-500/20 text-blue-300", label: "Đã kết thúc" },
    Cancelled: { style: "bg-rose-500/20 text-rose-300", label: "Đã hủy" },
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [dashboardData, activitiesData] = await Promise.all([
          managerService.getDashboard(),
          managerService.getActivities({ dateFilter: "month" }),
        ]);

        setStats(dashboardData);
        // Lấy 3 hoạt động gần nhất
        setRecentActivities(activitiesData.slice(0, 3));
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        toast.error("Không thể tải dữ liệu dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const statCards: StatCard[] = [
    {
      title: "Tổng hoạt động",
      value: stats.totalActivities,
      icon: <Activity size={24} />,
      change: "+12% so với tháng trước",
      color: "cyan",
    },
    {
      title: "Đơn đăng ký chờ duyệt",
      value: stats.pendingRegistrations,
      icon: <Clock size={24} />,
      change: "Cần xử lý",
      color: "amber",
    },
    {
      title: "Sinh viên quản lý",
      value: stats.totalStudents,
      icon: <Users size={24} />,
      change: "+5 mới",
      color: "blue",
    },
    {
      title: "Thông báo đã gửi",
      value: stats.totalNotifications,
      icon: <Bell size={24} />,
      change: "Tháng này",
      color: "purple",
    },
  ];

  const quickActions = [
    {
      title: "Tạo & Quản lý hoạt động",
      description: "Tạo hoạt động mới, duyệt đăng ký, điểm danh",
      icon: <Activity size={32} />,
      to: "/manager/activities",
      color: "bg-cyan-500/10 border-cyan-400/40 text-cyan-300",
    },
    {
      title: "Quản lý thông báo",
      description: "Tạo và gửi thông báo đến sinh viên",
      icon: <Bell size={32} />,
      to: "/manager/notifications",
      color: "bg-purple-500/10 border-purple-400/40 text-purple-300",
    },
    {
      title: "Quản lý sinh viên",
      description: "Xem danh sách, hồ sơ và quản lý sinh viên",
      icon: <Users size={32} />,
      to: "/manager/students",
      color: "bg-green-500/10 border-green-400/40 text-green-300",
    },
    {
      title: "Thống kê & Báo cáo",
      description: "Xem thống kê và xuất báo cáo PDF/Excel",
      icon: <BarChart3 size={32} />,
      to: "/manager/reports",
      color: "bg-blue-500/10 border-blue-400/40 text-blue-300",
    },
    {
      title: "Phản hồi sinh viên",
      description: "Xem và xử lý phản hồi từ sinh viên",
      icon: <MessageSquare size={32} />,
      to: "/manager/feedback",
      color: "bg-amber-500/10 border-amber-400/40 text-amber-300",
    },
  ];

  if (loading) {
    return (
      <ManagerLayout title="Dashboard Quản lý" subtitle="Tổng quan hoạt động và quản lý">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
        </div>
      </ManagerLayout>
    );
  }

  return (
    <ManagerLayout
      title="Dashboard Quản lý"
      subtitle="Tổng quan hoạt động và quản lý"
      actions={
        <Link
          to="/manager/activities?action=create"
          className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl transition flex items-center gap-2"
        >
          <Plus size={18} />
          Tạo hoạt động mới
        </Link>
      }
    >
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <div
            key={index}
            className="bg-[#0b1021]/60 border border-white/10 rounded-2xl p-6 hover:border-cyan-400/40 transition"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-xl bg-${card.color}-500/10`}>{card.icon}</div>
              <TrendingUp size={16} className="text-slate-400" />
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-white">{card.value}</p>
              <p className="text-sm text-slate-400">{card.title}</p>
              {card.change && (
                <p className="text-xs text-slate-500 mt-2">{card.change}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Chức năng chính</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              to={action.to}
              className={`${action.color} border rounded-2xl p-6 hover:scale-105 transition cursor-pointer`}
            >
              <div className="mb-4">{action.icon}</div>
              <h3 className="font-semibold mb-1">{action.title}</h3>
              <p className="text-xs text-slate-400">{action.description}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activities & Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <div className="bg-[#0b1021]/60 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Hoạt động gần đây</h2>
            <Link
              to="/manager/activities"
              className="text-sm text-cyan-400 hover:text-cyan-300"
            >
              Xem tất cả →
            </Link>
          </div>
          <div className="space-y-4">
            {recentActivities.length === 0 ? (
              <p className="text-slate-400 text-center py-8">Chưa có hoạt động nào</p>
            ) : (
              recentActivities.map((activity) => (
                <div
                  key={activity._id}
                  className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 hover:border-cyan-400/40 transition"
                >
                  <div className="flex-1">
                    <h3 className="font-medium text-white mb-1">{activity.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-slate-400">
                      <span className="flex items-center gap-1">
                        <Users size={14} />
                        {activity.participantCount || 0} người
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs ${
                          statusChipMap[activity.status]?.style || "bg-slate-500/20 text-slate-300"
                        }`}
                      >
                        {statusChipMap[activity.status]?.label || activity.status}
                      </span>
                    </div>
                  </div>
                  <Link
                    to={`/manager/activities/${activity._id}`}
                    className="text-cyan-400 hover:text-cyan-300"
                  >
                    Chi tiết →
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Activity Status Overview */}
        <div className="bg-[#0b1021]/60 border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-4">Tổng quan trạng thái</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <CheckCircle2 size={20} className="text-green-400" />
                </div>
                <div>
                  <p className="font-medium text-white">Hoạt động đã hoàn thành</p>
                  <p className="text-sm text-slate-400">{stats.completedActivities} hoạt động</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-green-400">
                {stats.completedActivities}
              </span>
            </div>

            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-cyan-500/20 rounded-lg">
                  <Activity size={20} className="text-cyan-400" />
                </div>
                <div>
                  <p className="font-medium text-white">Hoạt động đang diễn ra</p>
                  <p className="text-sm text-slate-400">{stats.activeActivities} hoạt động</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-cyan-400">
                {stats.activeActivities}
              </span>
            </div>

            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/20 rounded-lg">
                  <Clock size={20} className="text-amber-400" />
                </div>
                <div>
                  <p className="font-medium text-white">Đơn đăng ký chờ duyệt</p>
                  <p className="text-sm text-slate-400">{stats.pendingRegistrations} đơn</p>
                </div>
              </div>
              <Link
                to="/manager/activities?filter=pending"
                className="px-4 py-2 bg-amber-500/20 text-amber-300 rounded-lg hover:bg-amber-500/30 transition text-sm font-medium"
              >
                Xem ngay
              </Link>
            </div>
          </div>
        </div>
      </div>
    </ManagerLayout>
  );
};

export default ManagerDashboardPage;

