import { ActivitySquare, Code, Key, Layers3, MonitorSmartphone } from "lucide-react";
import { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import { adminService } from "@/services/adminService";
import type { SystemWidget } from "@/types/admin";
import { toast } from "sonner";

const iconMap: Record<string, React.ComponentType<{ size?: number }>> = {
  site: MonitorSmartphone,
  api: Key,
  cluster: Layers3,
  logs: Code,
};

const AdminSystemPage = () => {
  const [widgets, setWidgets] = useState<SystemWidget[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchWidgets = async () => {
      try {
        const data = await adminService.getSystemWidgets();
        if (isMounted) {
          // Đảm bảo data là array
          if (Array.isArray(data) && data.length > 0) {
            setWidgets(data);
          } else {
            setWidgets([]);
            console.warn("API trả về dữ liệu không hợp lệ:", data);
          }
        }
      } catch (error: any) {
        console.error("Không thể tải thông tin hệ thống", error);
        const errorMessage = error?.response?.data?.message || error?.message || "Không thể tải thông tin hệ thống";
        toast.error(errorMessage);
        if (isMounted) {
          setWidgets([]);
        }
      }
    };
    fetchWidgets();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <AdminLayout
      title="Quản lý hệ thống"
      subtitle="Điều phối cấu hình, server và hiệu suất toàn hệ thống"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {widgets.length === 0 && (
          <p className="text-sm text-slate-500">Chưa có cấu hình hệ thống.</p>
        )}
        {widgets.map((widget) => {
          const Icon = iconMap[widget.key] ?? MonitorSmartphone;
          return (
            <div key={widget.key} className="border border-white/10 rounded-2xl p-6 bg-white/5 flex gap-4">
              <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-400/30 h-fit">
                <div className="text-cyan-300">
                  <Icon size={20} />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold">{widget.title}</h3>
                <p className="text-sm text-slate-400 mt-1">{widget.description}</p>
                <button
                  onClick={async () => {
                    try {
                      setLoading(true);
                      await adminService.updateSystemWidget(widget.key, {
                        status: !widget.status,
                      });
                      setWidgets(widgets.map((w) => (w.key === widget.key ? { ...w, enabled: !w.enabled } : w)));
                      toast.success(`Đã ${widget.status ? "tắt" : "bật"} ${widget.title}`);
                    } catch (error) {
                      console.error("Không thể cập nhật widget", error);
                      toast.error("Không thể cập nhật widget");
                    } finally {
                      setLoading(false);
                    }
                  }}
                  disabled={loading}
                  className={`mt-4 px-4 py-2 rounded-xl text-sm transition ${
                    widget.status
                      ? "bg-cyan-500/10 text-blue-900 border border-cyan-400/30 hover:bg-cyan-500/20"
                      : "bg-slate-500/10 text-blue-900 border border-slate-400/30 hover:bg-slate-500/20"
                  } disabled:opacity-50`}
                >
                  {widget.status ? "Đang hoạt động" : "Đã tắt"}
                </button>
              </div>
            </div>
          );
        })}

        <div className="lg:col-span-2 border border-white/10 rounded-2xl p-6 bg-white/5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Hiệu suất hệ thống</h3>
              <p className="text-sm text-slate-400">Giám sát realtime CPU, RAM, DB</p>
            </div>
            <ActivitySquare size={20} className="text-cyan-300" />
          </div>
          <div className="h-56 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center text-sm text-slate-500">
            Placeholder biểu đồ giám sát
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSystemPage;

