import { DatabaseBackup, KeyRound, ShieldCheck, UserCog } from "lucide-react";
import { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import { adminService } from "@/services/adminService";
import type { AdvancedFeature } from "@/types/admin";
import { toast } from "sonner";

const iconMap: Record<string, React.ComponentType<{ size?: number }>> = {
  permissions: UserCog,
  audit: ShieldCheck,
  security: KeyRound,
  backup: DatabaseBackup,
};

const AdminAdvancedPage = () => {
  const [features, setFeatures] = useState<AdvancedFeature[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchFeatures = async () => {
      try {
        const data = await adminService.getAdvancedFeatures();
        if (isMounted && data?.length) {
          setFeatures(data);
        }
      } catch (error) {
        console.error("Không thể tải tính năng đặc biệt", error);
        toast.error("Không thể tải tính năng đặc biệt");
      }
    };
    fetchFeatures();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleToggle = async (feature: AdvancedFeature) => {
    try {
      setLoading(true);
      const updated = await adminService.updateAdvancedFeature(feature.key, {
        status: !feature.status,
      });
      setFeatures(features.map((f) => (f.key === feature.key ? updated : f)));
      toast.success(`Đã ${updated.status ? "bật" : "tắt"} ${feature.title}`);
    } catch (error) {
      console.error("Không thể cập nhật tính năng", error);
      toast.error("Không thể cập nhật tính năng");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout
      title="Tính năng đặc biệt"
      subtitle="Phân quyền, bảo mật, log hệ thống và backup dữ liệu"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {features.length === 0 && (
          <p className="text-sm text-slate-500">Chưa có cấu hình tính năng nào.</p>
        )}
        {features.map((feature) => {
          const Icon = iconMap[feature.key] ?? ShieldCheck;
          return (
            <div key={feature.key} className="border border-white/10 rounded-2xl p-6 bg-white/5 flex flex-col gap-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Icon size={18} /> {feature.title}
              </h3>
              <p className="text-sm text-slate-400">{feature.description}</p>
              <div className="flex items-center gap-3 mt-2">
                <button
                  onClick={() => handleToggle(feature)}
                  disabled={loading}
                  className={`px-4 py-2 rounded-xl text-sm transition ${
                    feature.status
                      ? "bg-emerald-500/10 text-blue-900 border border-emerald-400/30 hover:bg-emerald-500/20"
                      : "bg-slate-500/10 text-blue-900 border border-slate-400/30 hover:bg-slate-500/20"
                  } disabled:opacity-50`}
                >
                  {feature.status ? "Đang bật" : "Đang tắt"}
                </button>
                <button className="px-4 py-2 rounded-xl border border-white/10 text-sm hover:bg-white/10 text-blue-900">
                  Thiết lập
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </AdminLayout>
  );
};

export default AdminAdvancedPage;

