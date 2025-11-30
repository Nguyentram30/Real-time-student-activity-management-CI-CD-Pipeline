import { Download } from "lucide-react";
import StudentProfileModal from "./StudentProfileModal";
import { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import type { StudentProfile } from "@/types/admin";
import { adminService } from "@/services/adminService";
import { toast } from "sonner";

const AdminStudentsPage = () => {
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [search, setSearch] = useState("");
  const [faculty, setFaculty] = useState("all");
  const [activityFilter, setActivityFilter] = useState("all");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const data = await adminService.getStudents({
          search: search || undefined,
          faculty: faculty === "all" ? undefined : faculty,
          activityStatus: activityFilter === "all" ? undefined : activityFilter,
        });

        if (isMounted && data?.length) {
          setStudents(data);
        } else if (isMounted && !data?.length) {
          setStudents([]);
        }
      } catch (error: any) {
        console.error("Không thể tải danh sách sinh viên", error);
        const errorMessage = error?.response?.data?.message || error?.message || "Không thể tải danh sách sinh viên";
        toast.error(errorMessage);
        if (isMounted) {
          setStudents([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchStudents();
    return () => {
      isMounted = false;
    };
  }, [search, faculty, activityFilter]);

  return (
    <AdminLayout
      title="Quản lý sinh viên"
      subtitle="Hồ sơ, tình trạng hoạt động và kết quả học tập"
      actions={
        <button
          onClick={async () => {
            try {
              const blob = await adminService.exportStudents({
                faculty: faculty === "all" ? undefined : faculty,
              });
              const url = window.URL.createObjectURL(new Blob([blob]));
              const a = document.createElement("a");
              a.href = url;
              a.download = "students.csv";
              a.click();
              window.URL.revokeObjectURL(url);
              toast.success("Đang xuất danh sách sinh viên");
            } catch (error) {
              console.error("Không thể xuất dữ liệu", error);
              toast.error("Không thể xuất dữ liệu");
            }
          }}
          className="flex items-center gap-2 border border-white/15 px-4 py-2 rounded-xl hover:bg-white/10 text-blue-900"
        >
          <Download size={16} /> Xuất danh sách
        </button>
      }
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {[
            { label: "Tổng sinh viên", value: students.length.toString() },
            {
              label: "Đang tham gia hoạt động",
              value: students.filter((s) => s.activityStatus?.toLowerCase().includes("đang")).length.toString(),
            },
            {
              label: "Hoàn thành KPI năm",
              value: students.filter((s) => (s.progressPercent || 0) >= 80).length.toString(),
            },
            {
              label: "Đang cần hỗ trợ",
              value: students.filter((s) => (s.progressPercent || 0) < 50).length.toString(),
            },
          ].map((card) => (
            <div key={card.label} className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <p className="text-sm text-slate-400">{card.label}</p>
              <h3 className="text-2xl font-semibold mt-1">{card.value}</h3>
            </div>
          ))}
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex flex-wrap gap-4 mb-4">
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, MSSV..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 min-w-[220px] bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/60"
            />
            <select
              value={faculty}
              onChange={(e) => setFaculty(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-blue-300"
            >
              <option value="all">Tất cả khoa</option>
              <option value="CNTT">CNTT</option>
              <option value="Kinh tế">Kinh tế</option>
              <option value="Đa phương tiện">Đa phương tiện</option>
            </select>
            <select
              value={activityFilter}
              onChange={(e) => setActivityFilter(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-blue-300"
            >
              <option value="all">Tình trạng hoạt động</option>
              <option value="Đang tham gia">Đang tham gia</option>
              <option value="Hoàn thành">Hoàn thành</option>
              <option value="Chờ phê duyệt">Chờ phê duyệt</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-slate-400 border-b border-white/10 text-blue-900">
                <tr>
                  <th className="py-3">MSSV</th>
                  <th className="py-3">Họ tên</th>
                  <th className="py-3">Khoa</th>
                  <th className="py-3">Tình trạng hoạt động</th>
                  <th className="py-3">Tiến độ học tập</th>
                  <th className="py-3 text-right">Hồ sơ</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-slate-500">
                      Đang tải dữ liệu...
                    </td>
                  </tr>
                )}

                {!loading &&
                  students.map((student) => (
                    <tr key={student.studentId} className="border-b border-white/5 last:border-none">
                      <td className="py-3">{student.studentId}</td>
                      <td className="py-3">{student.fullName}</td>
                      <td className="py-3 text-slate-400">{student.faculty}</td>
                      <td className="py-3 text-sm">{student.activityStatus}</td>
                      <td className="py-3">
                        <div className="flex flex-col gap-1">
                          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500"
                              style={{ width: `${student.progressPercent}%` }}
                            />
                          </div>
                          <span className="text-xs text-slate-400">
                            {student.progressPercent}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3 text-right">
                        <StudentProfileModal student={student} />
                      </td>
                    </tr>
                  ))}

                {!loading && students.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-slate-500">
                      Không có sinh viên nào phù hợp bộ lọc.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminStudentsPage;

