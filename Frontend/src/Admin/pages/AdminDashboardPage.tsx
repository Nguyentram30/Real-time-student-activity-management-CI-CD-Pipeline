import AdminLayout from "../components/AdminLayout";
import {
  Activity,
  BarChart3,
  FileText,
  GraduationCap,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { DashboardOverview } from "@/types/admin";
import { adminService } from "@/services/adminService";

const formatNumber = (value: number) =>
  new Intl.NumberFormat("vi-VN").format(value);

const AdminDashboardPage = () => {
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchOverview = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await adminService.getDashboardOverview();
        if (isMounted && data) {
          setOverview(data);
        }
      } catch (error: any) {
        console.error("Không thể tải dữ liệu dashboard", error);
        if (isMounted) {
          const errorMessage = error?.response?.data?.message || error?.message || "Không thể tải dữ liệu dashboard";
          setError(errorMessage);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchOverview();
    return () => {
      isMounted = false;
    };
  }, []);

  const stats = useMemo(
    () => [
      {
        label: "Tổng sinh viên",
        value: formatNumber(overview?.totals.students || 0),
        change: loading ? "Đang tải..." : "+4.2%",
        icon: GraduationCap,
      },
      {
        label: "Quản lý",
        value: formatNumber(overview?.totals.managers || 0),
        change: loading ? "Đang tải..." : "+2 mới",
        icon: Users,
      },
      {
        label: "Hoạt động đang mở",
        value: formatNumber(overview?.totals.activeActivities || 0),
        change: loading ? "Đang tải..." : "5 sắp hết hạn",
        icon: Activity,
      },
      {
        label: "Tài liệu / bài học",
        value: formatNumber(overview?.totals.documents || 0),
        change: loading ? "Đang tải..." : "+42 tuần này",
        icon: FileText,
      },
    ],
    [overview, loading]
  );

  const chartData = overview?.trends.months || [];
  const hasChartData = chartData.length > 0;

  return (
    <AdminLayout
      title="Dashboard quản trị"
      subtitle="Tổng quan hệ thống, hoạt động và tương tác"
    >
      {error && (
        <div className="mb-4 p-4 rounded-2xl border border-rose-400/40 bg-rose-500/10 text-rose-100 text-sm">
          {error}
        </div>
      )}
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map(({ label, value, change, icon: Icon }) => (
          <div
            key={label}
            className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col gap-4 shadow-[0_0_25px_rgba(15,23,42,0.45)]"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">{label}</p>
                <h3 className="text-2xl font-semibold mt-1">{value}</h3>
              </div>
              <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-400/30">
                <Icon size={24} className="text-cyan-300" />
              </div>
            </div>
            <span className="text-xs text-emerald-400">{change}</span>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold">Biểu đồ số lượng hoạt động</h3>
              <p className="text-sm text-slate-400">Số hoạt động được mở mỗi tháng</p>
            </div>
          </div>
          <div className="h-64 flex items-end gap-4">
            {!hasChartData && !loading && (
              <p className="text-sm text-slate-500">Chưa có dữ liệu hoạt động trong giai đoạn này.</p>
            )}
            {hasChartData && chartData.map((item) => (
              <div key={item.label} className="flex-1 flex flex-col gap-2">
                <div
                  className="bg-gradient-to-b from-cyan-400 to-cyan-600 rounded-t-2xl"
                  style={{ height: `${item.activities * 12}px` }}
                />
                <p className="text-center text-xs text-slate-400">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-4">Biểu đồ tương tác sinh viên</h3>
          <div className="space-y-4">
            {!hasChartData && !loading && (
              <p className="text-sm text-slate-500">Chưa có dữ liệu tương tác.</p>
            )}
            {hasChartData && chartData.map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{item.label}</span>
                  <span className="text-cyan-300">
                    {item.interactions} tương tác
                  </span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400"
                    style={{ width: `${(item.interactions / 120) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-4">Biểu đồ báo cáo theo thời gian</h3>
          <div className="grid grid-cols-6 gap-4">
            {!hasChartData && !loading && (
              <p className="text-sm text-slate-500 col-span-6">Chưa có dữ liệu báo cáo.</p>
            )}
            {hasChartData && chartData.map((item) => (
              <div key={item.label} className="rounded-2xl border border-white/10 p-4 bg-white/3">
                <p className="text-sm text-slate-400">{item.label}</p>
                <p className="text-xl font-semibold mt-1">{item.submissions}</p>
                <p className="text-xs text-slate-500">Báo cáo / bài nộp</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Luồng hoạt động</h3>
              <p className="text-sm text-slate-400">Theo dõi realtime</p>
            </div>
            <BarChart3 size={22} className="text-cyan-300" />
          </div>
          {(overview?.trends.logs || []).length === 0 && !loading && (
            <p className="text-sm text-slate-500">Chưa có hoạt động nào được ghi nhận.</p>
          )}
          {(overview?.trends.logs || []).map((log) => (
            <div key={log.message} className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-cyan-400 mt-2" />
              <div>
                <p className="text-sm">{log.message}</p>
                <span className="text-xs text-slate-500">{log.timestamp}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </AdminLayout>
  );
};

export default AdminDashboardPage;

