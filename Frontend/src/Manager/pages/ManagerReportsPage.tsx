import { useState, useEffect } from "react";
import ManagerLayout from "../components/ManagerLayout";
import {
  Activity,
  BarChart3,
  Download,
  FileText,
  Filter,
  TrendingUp,
  Users,
  Calendar,
  Loader2,
} from "lucide-react";
import { managerService } from "@/services/managerService";
import { toast } from "sonner";

const ManagerReportsPage = () => {
  const [reportType, setReportType] = useState<string>("activity");
  const [dateRange, setDateRange] = useState<string>("month");
  const [reports, setReports] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const data = await managerService.getReports();
        setReports(data);
      } catch (error: any) {
        console.error("Failed to fetch reports:", error);
        const errorMessage = error?.response?.data?.message || error?.message || "Không thể tải dữ liệu báo cáo";
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const reportTypes = [
    { value: "activity", label: "Báo cáo hoạt động" },
    { value: "student", label: "Báo cáo sinh viên" },
    { value: "participation", label: "Báo cáo tham gia" },
    { value: "points", label: "Báo cáo điểm rèn luyện" },
  ];

  return (
    <ManagerLayout
      title="Thống kê & Báo cáo"
      subtitle="Xem thống kê và xuất báo cáo"
    >
      {/* Report Filters */}
      <div className="bg-[#0b1021]/60 border border-white/10 rounded-2xl p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Loại báo cáo
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/60"
            >
              {reportTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Khoảng thời gian
            </label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/60"
            >
              <option value="week">Tuần này</option>
              <option value="month">Tháng này</option>
              <option value="quarter">Quý này</option>
              <option value="year">Năm nay</option>
              <option value="custom">Tùy chọn</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={async () => {
                try {
                  toast.info("Đang tạo báo cáo...");
                  const blob = await managerService.exportReports("pdf");
                  const url = window.URL.createObjectURL(new Blob([blob]));
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `manager_report_${new Date().toISOString().slice(0,19).replace(/[:T]/g,'-')}.pdf`;
                  document.body.appendChild(a);
                  a.click();
                  a.remove();
                  URL.revokeObjectURL(url);
                  toast.success("Báo cáo đã được tạo thành công!");
                } catch (error) {
                  toast.error("Không thể xuất báo cáo");
                }
              }}
              className="w-full px-6 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-blue-900 rounded-xl transition flex items-center justify-center gap-2"
            >
              <Download size={18} />
              Xuất báo cáo
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Overview */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[200px]">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-[#0b1021]/60 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-500/10 rounded-xl">
                <Activity size={24} className="text-blue-400" />
              </div>
              <TrendingUp size={16} className="text-green-400" />
            </div>
            <p className="text-3xl font-bold text-white mb-1">{reports?.totalActivities || 0}</p>
            <p className="text-sm text-slate-400">Tổng hoạt động</p>
          </div>

          <div className="bg-[#0b1021]/60 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-500/10 rounded-xl">
                <Users size={24} className="text-green-400" />
              </div>
              <TrendingUp size={16} className="text-green-400" />
            </div>
            <p className="text-3xl font-bold text-white mb-1">{reports?.totalStudents || 0}</p>
            <p className="text-sm text-slate-400">Sinh viên tham gia</p>
          </div>

          <div className="bg-[#0b1021]/60 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-500/10 rounded-xl">
                <BarChart3 size={24} className="text-purple-400" />
              </div>
              <TrendingUp size={16} className="text-green-400" />
            </div>
            <p className="text-3xl font-bold text-white mb-1">{reports?.completionRate || "0%"}</p>
            <p className="text-sm text-slate-400">Tỉ lệ hoàn thành</p>
          </div>

          <div className="bg-[#0b1021]/60 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-amber-500/10 rounded-xl">
                <TrendingUp size={24} className="text-amber-400" />
              </div>
              <TrendingUp size={16} className="text-green-400" />
            </div>
            <p className="text-3xl font-bold text-white mb-1">{reports?.totalPoints || 0}</p>
            <p className="text-sm text-slate-400">Tổng điểm rèn luyện</p>
          </div>
        </div>
      )}

      {/* Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#0b1021]/60 border border-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-4">Biểu đồ hoạt động theo tháng</h3>
          <div className="h-64 flex items-center justify-center text-slate-400">
            <div className="text-center">
              <BarChart3 size={48} className="mx-auto mb-2 opacity-50" />
              <p>Biểu đồ sẽ được tích hợp sau</p>
            </div>
          </div>
        </div>

        <div className="bg-[#0b1021]/60 border border-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-4">Phân bố điểm rèn luyện</h3>
          <div className="h-64 flex items-center justify-center text-slate-400">
            <div className="text-center">
              <BarChart3 size={48} className="mx-auto mb-2 opacity-50" />
              <p>Biểu đồ sẽ được tích hợp sau</p>
            </div>
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="bg-[#0b1021]/60 border border-white/10 rounded-2xl p-6">
        <h3 className="text-lg font-semibold mb-4">Xuất báo cáo</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={async () => {
              try {
                toast.info("Đang tạo báo cáo PDF...");
                const blob = await managerService.exportReports("pdf");
                const url = window.URL.createObjectURL(new Blob([blob], { type: "text/html" }));
                const a = document.createElement("a");
                a.href = url;
                a.download = `manager_report_${new Date().toISOString().slice(0,19).replace(/[:T]/g,'-')}.html`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                URL.revokeObjectURL(url);
                toast.success("Báo cáo PDF đã được tạo!");
              } catch (error) {
                toast.error("Không thể xuất PDF");
              }
            }}
            className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition flex items-center gap-3 text-blue-900"
          >
            <FileText size={24} className="text-red-400" />
            <div className="text-left">
              <p className="font-medium text-white">Xuất PDF</p>
              <p className="text-xs text-slate-400">Báo cáo định dạng PDF</p>
            </div>
          </button>

          <button
            onClick={async () => {
              try {
                toast.info("Đang tạo báo cáo Excel...");
                const blob = await managerService.exportReports("excel");
                const url = window.URL.createObjectURL(new Blob([blob]));
                const a = document.createElement("a");
                a.href = url;
                a.download = `manager_report_${new Date().toISOString().slice(0,19).replace(/[:T]/g,'-')}.csv`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                URL.revokeObjectURL(url);
                toast.success("Báo cáo Excel đã được tạo!");
              } catch (error) {
                toast.error("Không thể xuất Excel");
              }
            }}
            className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition flex items-center gap-3 text-blue-900"
          >
            <FileText size={24} className="text-green-400" />
            <div className="text-left">
              <p className="font-medium text-white">Xuất Excel</p>
              <p className="text-xs text-slate-400">Báo cáo định dạng Excel</p>
            </div>
          </button>

          <button
            onClick={async () => {
              try {
                toast.info("Đang tạo file CSV...");
                const blob = await managerService.exportReports("csv");
                const url = window.URL.createObjectURL(new Blob([blob]));
                const a = document.createElement("a");
                a.href = url;
                a.download = `manager_report_${new Date().toISOString().slice(0,19).replace(/[:T]/g,'-')}.csv`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                URL.revokeObjectURL(url);
                toast.success("File CSV đã được tạo!");
              } catch (error) {
                toast.error("Không thể xuất CSV");
              }
            }}
            className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition flex items-center gap-3 text-blue-900"
          >
            <Download size={24} className="text-cyan-400" />
            <div className="text-left">
              <p className="font-medium text-white">Tải dữ liệu</p>
              <p className="text-xs text-slate-400">Tải file CSV</p>
            </div>
          </button>
        </div>
      </div>
    </ManagerLayout>
  );
};

export default ManagerReportsPage;

