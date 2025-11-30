import { useState, useEffect } from "react";
import ManagerLayout from "../components/ManagerLayout";
import {
  Activity,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  Edit,
  Eye,
  Filter,
  Plus,
  Search,
  Users,
  XCircle,
  Loader2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { managerService } from "@/services/managerService";
import ManagerEditActivityModal from "../components/ManagerEditActivityModal";
import { toast } from "sonner";

const ManagerActivitiesPage = () => {
  const [activities, setActivities] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [exportOpenId, setExportOpenId] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        const data = await managerService.getActivities({
          search: searchTerm || undefined,
          status: statusFilter !== "all" ? statusFilter : undefined,
          dateFilter: dateFilter !== "all" ? dateFilter : undefined,
        });
        setActivities(data);
      } catch (error: any) {
        console.error("Failed to fetch activities:", error);
        const errorMessage = error?.response?.data?.message || error?.message || "Không thể tải danh sách hoạt động";
        toast.error(errorMessage);
        setActivities([]);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [searchTerm, statusFilter, dateFilter]);

  const downloadBlob = (content: BlobPart, filename: string, type = "text/csv;charset=utf-8;") => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleExport = async (activity: any, format: "csv" | "excel" | "pdf") => {
    try {
      setExportOpenId(null);
      const regs = await managerService.getActivityRegistrations(activity._id);

      // build table rows
      const rows: string[][] = [];
      const header = ["Họ tên", "Email", "MSSV", "Thời gian điểm danh", "Kết quả"];
      rows.push(header);

      regs.forEach((r: any) => {
        const name = r.user?.displayName || r.displayName || r.name || "";
        const email = r.user?.email || r.email || "";
        const studentId = r.studentId || r.user?.studentId || r.mssv || "";
        const attendance = Array.isArray(r.attendanceTimes) ? r.attendanceTimes.join("; ") : (r.attendanceTimes || r.attendedAt || "");
        const result = r.result || r.status || r.approval || "";
        rows.push([name, email, studentId, attendance, result]);
      });

      if (format === "csv" || format === "excel") {
        const csv = rows.map((row) => row.map((cell) => `"${String(cell || "").replace(/"/g, '""')}"`).join(",")).join("\n");
        const ext = format === "excel" ? "xlsx" : "csv";
        downloadBlob(csv, `${activity.title || activity._id}_participants.${ext}`);
        toast.success("Đã xuất file");
        return;
      }

      // PDF: open printable window
      const tableHtml = `
        <html>
        <head>
          <title>Danh sách tham gia - ${activity.title}</title>
          <style>table{width:100%;border-collapse:collapse}td,th{border:1px solid #ccc;padding:8px;text-align:left}</style>
        </head>
        <body>
          <h2>${activity.title}</h2>
          <p>Thời gian: ${activity.startTime ? new Date(activity.startTime).toLocaleString() : ""} ${activity.endTime ? (' - ' + new Date(activity.endTime).toLocaleString()) : ''}</p>
          <table>
            <thead><tr>${header.map(h => `<th>${h}</th>`).join("")}</tr></thead>
            <tbody>
              ${rows.slice(1).map(r=>`<tr>${r.map(c=>`<td>${String(c||"")}</td>`).join("")}</tr>`).join("")}
            </tbody>
          </table>
        </body>
        </html>
      `;
      const w = window.open("", "_blank");
      if (w) {
        w.document.write(tableHtml);
        w.document.close();
        // give the window a moment to render then call print
        setTimeout(() => {
          w.print();
        }, 300);
      }
    } catch (error) {
      console.error("Không thể xuất danh sách", error);
      toast.error("Không thể xuất danh sách");
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { style: string; label: string }> = {
      "Chờ phê duyệt": { style: "bg-amber-500/20 text-amber-300 border-amber-400/40", label: "Chờ phê duyệt" },
      "Đang mở": { style: "bg-green-500/20 text-green-300 border-green-400/40", label: "Đang mở" },
      "Đã kết thúc": { style: "bg-blue-500/20 text-blue-300 border-blue-400/40", label: "Đã kết thúc" },
      "Đã hủy": { style: "bg-red-500/20 text-red-300 border-red-400/40", label: "Đã hủy" },
    };
    
    const statusInfo = statusMap[status] || { style: "bg-slate-500/20 text-slate-300 border-slate-400/40", label: status };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusInfo.style}`}>
        {statusInfo.label}
      </span>
    );
  };

  return (
    <ManagerLayout
      title="Quản lý hoạt động"
      subtitle="Tạo, quản lý và theo dõi các hoạt động"
      actions={
        <Link
          to="/manager/activities/create"
          className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl transition flex items-center gap-2"
        >
          <Plus size={18} />
          Tạo hoạt động mới
        </Link>
      }
    >
      {/* Filters */}
      <div className="bg-[#0b1021]/60 border border-white/10 rounded-2xl p-6 space-y-4 ">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Tìm kiếm hoạt động..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/60"
            />
          </div>

          <div className="flex gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/60 text-blue-500"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">Chờ duyệt</option>
              <option value="ongoing">Đang diễn ra</option>
              <option value="completed">Đã kết thúc</option>
              <option value="cancelled">Đã hủy</option>
            </select>

            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/60 text-blue-500"
            >
              <option value="all">Tất cả thời gian</option>
              <option value="today">Hôm nay</option>
              <option value="week">Tuần này</option>
              <option value="month">Tháng này</option>
            </select>
          </div>
        </div>
      </div>

      {/* Activities List */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-[#0b1021]/60 border border-white/10 rounded-2xl p-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-cyan-400 mx-auto mb-4" />
            <p className="text-slate-400">Đang tải...</p>
          </div>
        ) : activities.length === 0 ? (
          <div className="bg-[#0b1021]/60 border border-white/10 rounded-2xl p-12 text-center">
            <Activity size={48} className="mx-auto text-slate-400 mb-4" />
            <p className="text-slate-400">Chưa có hoạt động nào</p>
          </div>
        ) : (
          activities.map((activity) => (
            <div
              key={activity._id}
              className="bg-[#0b1021]/60 border border-white/10 rounded-2xl p-6 hover:border-cyan-400/40 transition"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start gap-4 mb-3">
                    <div className="p-3 bg-cyan-500/10 rounded-xl">
                      <Activity size={20} className="text-cyan-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-2">
                        {activity.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                        {activity.startTime && (
                          <span className="flex items-center gap-1">
                            <Calendar size={14} />
                            {new Date(activity.startTime).toLocaleDateString("vi-VN")}
                            {activity.endTime && ` - ${new Date(activity.endTime).toLocaleDateString("vi-VN")}`}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Users size={14} />
                          {activity.participantCount || 0} người
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="ml-14">{getStatusBadge(activity.status)}</div>
                </div>

                <div className="flex flex-wrap gap-2 lg:ml-4">
                  <Link
                    to={`/manager/activities/${activity._id}`}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm transition flex items-center gap-2"
                  >
                    <Eye size={16} />
                    Xem chi tiết
                  </Link>
                  <Link
                    to={`/manager/activities/${activity._id}/registrations`}
                    className="px-4 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-400/40 text-blue-300 rounded-lg text-sm transition flex items-center gap-2"
                  >
                    <CheckCircle2 size={16} />
                    Duyệt đăng ký ({activity.participantCount || 0})
                  </Link>
                  <div className="relative">
                    <button
                      onClick={() => setExportOpenId((prev) => (prev === activity._id ? null : activity._id))}
                      className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm transition flex items-center gap-2 text-blue-900"
                    >
                      <Download size={16} />
                      Xuất danh sách
                    </button>
                    {exportOpenId === activity._id && (
                      <div className="absolute right-0 mt-2 w-40 bg-white/5 border border-white/10 rounded-lg p-2 z-20">
                        <button onClick={() => handleExport(activity, "csv")} className="w-full text-left px-2 py-2 hover:bg-white/10 rounded">CSV</button>
                        <button onClick={() => handleExport(activity, "excel")} className="w-full text-left px-2 py-2 hover:bg-white/10 rounded">Excel</button>
                        <button onClick={() => handleExport(activity, "pdf")} className="w-full text-left px-2 py-2 hover:bg-white/10 rounded">PDF</button>
                      </div>
                    )}
                  </div>
                  <ManagerEditActivityModal activity={activity} onUpdated={() => {
                    // refresh list
                    setLoading(true);
                    managerService.getActivities({ search: searchTerm || undefined, status: statusFilter !== "all" ? statusFilter : undefined, dateFilter: dateFilter !== "all" ? dateFilter : undefined })
                      .then((data) => setActivities(data))
                      .catch(() => {})
                      .finally(() => setLoading(false));
                  }} />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </ManagerLayout>
  );
};

export default ManagerActivitiesPage;

