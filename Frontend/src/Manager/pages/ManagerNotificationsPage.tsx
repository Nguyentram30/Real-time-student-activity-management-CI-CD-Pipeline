import { useState, useEffect } from "react";
import ManagerLayout from "../components/ManagerLayout";
import {
  Bell,
  Calendar,
  Edit,
  Eye,
  FileText,
  Filter,
  Megaphone,
  Plus,
  Search,
  Send,
  Trash2,
  Users,
  Loader2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { managerService } from "@/services/managerService";
import { toast } from "sonner";

const ManagerNotificationsPage = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const data = await managerService.getNotifications(
          searchTerm || undefined
        );
        setNotifications(data);
      } catch (error: any) {
        console.error("Failed to fetch notifications:", error);
        const errorMessage = error?.response?.data?.message || error?.message || "Không thể tải danh sách thông báo";
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [searchTerm]);

  return (
    < ManagerLayout
      title="Quản lý thông báo"
      subtitle="Tạo và quản lý thông báo gửi đến sinh viên"
      actions={
        <div className="flex gap-3">
        <Link to="/manager/notifications/create"
          className="flex gap-3 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition flex items-center gap-2"
        >
          <Plus size={18} />
          Tạo thông báo mới
        </Link>
        </div>
      }
    >
      {/* Filters */}
      <div className=" bg-[#0b1021]/60 border border-white/10 rounded-2xl p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Tìm kiếm thông báo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/60"
            />
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-[#0b1021]/60 border border-white/10 rounded-2xl p-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-cyan-400 mx-auto mb-4" />
            <p className="text-slate-400">Đang tải...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-[#0b1021]/60 border border-white/10 rounded-2xl p-12 text-center">
            <Bell size={48} className="mx-auto text-slate-400 mb-4" />
            <p className="text-slate-400">Chưa có thông báo nào</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif._id}
              className="bg-[#0b1021]/60 border border-white/10 rounded-2xl p-6 hover:border-cyan-400/40 transition"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start gap-4 mb-3">
                    <div className="p-3 bg-purple-500/10 rounded-xl">
                      <Megaphone size={20} className="text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-2">
                        {notif.title}
                      </h3>
                      <p className="text-sm text-slate-400 mb-3 line-clamp-2">
                        {notif.message}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                        {notif.createdAt && (
                          <span className="flex items-center gap-1">
                            <Calendar size={14} />
                            {new Date(notif.createdAt).toLocaleDateString("vi-VN")}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Users size={14} />
                          {notif.targetRoles.join(", ")}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye size={14} />
                          Gửi: {new Date(notif.scheduleAt).toLocaleString("vi-VN")}
                        </span>
                      </div>
                      {(notif as any).metadata?.attachmentUrl && (
                        <div className="mt-3 p-3 bg-cyan-500/10 border border-cyan-400/30 rounded-xl">
                          <div className="flex items-center gap-2 mb-1">
                            <FileText size={14} className="text-cyan-400" />
                            <span className="text-sm font-medium text-cyan-300">File đính kèm</span>
                          </div>
                          <a
                            href={(notif as any).metadata.attachmentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-cyan-400 hover:underline text-xs break-all"
                          >
                            {(notif as any).metadata.attachmentUrl}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 lg:ml-4">
                  <button className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm transition flex items-center gap-2">
                    <Eye size={16} />
                    Xem chi tiết
                  </button>
                  <button className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm transition flex items-center gap-2">
                    <Edit size={16} />
                    Chỉnh sửa
                  </button>
                  <button
                    onClick={async () => {
                      if (confirm("Bạn có chắc muốn xóa thông báo này?")) {
                        try {
                          await managerService.deleteNotification(notif._id);
                          toast.success("Đã xóa thông báo");
                          setNotifications(notifications.filter(n => n._id !== notif._id));
                        } catch (error) {
                          toast.error("Không thể xóa thông báo");
                        }
                      }
                    }}
                    className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-400/40 text-red-300 rounded-lg text-sm transition flex items-center gap-2"
                  >
                    <Trash2 size={16} />
                    Xóa
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </ManagerLayout>
  );
};

export default ManagerNotificationsPage;

