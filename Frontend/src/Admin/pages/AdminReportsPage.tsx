import { CalendarRange, DownloadCloud, Filter, FileDown } from "lucide-react";
import { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import { adminService } from "@/services/adminService";
import type { ReportSummary } from "@/types/admin";
import { toast } from "sonner";

const AdminReportsPage = () => {
  const [summary, setSummary] = useState<ReportSummary[]>([]);
  const [period, setPeriod] = useState("month");
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [quarter, setQuarter] = useState(Math.floor((new Date().getMonth() + 1) / 3) + 1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchSummary = async () => {
      try {
        setLoading(true);
        const params: any = { period };
        if (period === "month") params.month = month;
        if (period === "quarter") params.quarter = quarter;
        if (period === "year") params.year = year;
        params.year = year;

        const data = await adminService.getReportSummaries(params);
        if (isMounted && data?.length) {
          setSummary(data);
        }
      } catch (error: any) {
        console.error("Không thể tải báo cáo", error);
        const errorMessage = error?.response?.data?.message || error?.message || "Không thể tải báo cáo";
        toast.error(errorMessage);
        if (isMounted) {
          setSummary([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    fetchSummary();
    return () => {
      isMounted = false;
    };
  }, [period, year, month, quarter]);

  const handleExport = async (format: "csv" | "excel") => {
    try {
      const params: any = { period, year };
      if (period === "month") params.month = month;
      if (period === "quarter") params.quarter = quarter;

      if (format === "csv") {
        const blob = await adminService.exportReports(params);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `bao-cao-${new Date().getTime()}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success("Đã xuất CSV thành công");
      } else {
        toast.info("Chức năng xuất Excel đang được phát triển");
      }
    } catch (error) {
      console.error("Không thể xuất báo cáo", error);
      toast.error("Không thể xuất báo cáo");
    }
  };

  return (
    <AdminLayout
      title="Báo cáo & Thống kê"
      subtitle="Phân tích dữ liệu, lọc và xuất báo cáo tổng hợp"
      actions={
        <div className="flex gap-3">
          <button
            onClick={() => handleExport("csv")}
            className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-[#050710] font-medium px-4 py-2 rounded-xl transition text-blue-900"
          >
            <DownloadCloud size={18} /> Xuất CSV
          </button>
          <button
            onClick={() => handleExport("excel")}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/15 hover:bg-white/10 text-blue-900"
          >
            <FileDown size={16} /> Xuất Excel
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {summary.length === 0 && (
            <p className="text-sm text-slate-500">Chưa có dữ liệu báo cáo.</p>
          )}
          {summary.map((item) => (
            <div key={item.label} className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <p className="text-sm text-slate-400">{item.label}</p>
              <h3 className="text-2xl font-semibold mt-1">{item.value}</h3>
            </div>
          ))}
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex flex-wrap gap-4 mb-6">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm"
            >
              <option value="month">Theo tháng</option>
              <option value="quarter">Theo quý</option>
              <option value="year">Theo năm</option>
            </select>
            {period === "month" && (
              <select
                value={month}
                onChange={(e) => setMonth(parseInt(e.target.value))}
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>
                    Tháng {m}
                  </option>
                ))}
              </select>
            )}
            {period === "quarter" && (
              <select
                value={quarter}
                onChange={(e) => setQuarter(parseInt(e.target.value))}
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm"
              >
                {[1, 2, 3, 4].map((q) => (
                  <option key={q} value={q}>
                    Quý {q}
                  </option>
                ))}
              </select>
            )}
            <select
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm"
            >
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map((y) => (
                <option key={y} value={y}>
                  Năm {y}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {[1, 2].map((chart) => (
              <div key={chart} className="border border-white/10 rounded-2xl p-5">
                <h4 className="text-base font-semibold mb-2">
                  {chart === 1 ? "Biểu đồ kết quả theo hoạt động" : "Biểu đồ phân bổ khoa"}
                </h4>
                <div className="h-56 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center text-sm text-slate-500">
                  Placeholder biểu đồ
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminReportsPage;

