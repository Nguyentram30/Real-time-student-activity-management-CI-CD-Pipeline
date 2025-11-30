import { useState, useEffect } from "react";
import ManagerLayout from "../components/ManagerLayout";
import {
  Download,
  GraduationCap,
  Lock,
  Mail,
  Phone,
  Search,
  Unlock,
  UserCheck,
  Users,
  Loader2,
} from "lucide-react";
import { managerService } from "@/services/managerService";
import { toast } from "sonner";

const ManagerStudentsPage = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const data = await managerService.getStudents(searchTerm || undefined);
        setStudents(data);
      } catch (error) {
        console.error("Failed to fetch students:", error);
        toast.error("Không thể tải danh sách sinh viên");
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [searchTerm]);

  return (
    <ManagerLayout
      title="Quản lý sinh viên"
      subtitle="Danh sách và quản lý sinh viên thuộc đơn vị"
      actions={
        <div className="flex gap-33">
          <button className="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition flex items-center gap-2 text-blue-900">
            <Download size={18} />
            Xuất danh sách
          </button>
        </div>
      }
    >
      {/* Filters */}
      <div className="bg-[#0b1021]/60 border border-white/10 rounded-2xl p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Tìm kiếm theo MSSV, tên, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/60"
            />
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-[#0b1021]/60 border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                  MSSV
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                  Họ tên
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                  Khoa/Lớp
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                  Hoạt động
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                  Điểm
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                  Trạng thái
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                    <Loader2 className="w-8 h-8 animate-spin text-cyan-400 mx-auto mb-4" />
                    <p>Đang tải...</p>
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                    <GraduationCap size={48} className="mx-auto mb-4 opacity-50" />
                    Không tìm thấy sinh viên nào
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr
                    key={student.id}
                    className="hover:bg-white/5 transition"
                  >
                    <td className="px-6 py-4 text-sm text-white font-medium">
                      {student.studentId}
                    </td>
                    <td className="px-6 py-4 text-sm text-white">{student.fullName}</td>
                    <td className="px-6 py-4 text-sm text-slate-400">{student.email}</td>
                    <td className="px-6 py-4 text-sm text-slate-400">
                      {student.faculty} / {student.class}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">
                      {student.activitiesCount} hoạt động
                    </td>
                    <td className="px-6 py-4 text-sm text-white font-semibold">
                      {student.points} điểm
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          student.status === "active"
                            ? "bg-green-500/20 text-green-300"
                            : "bg-red-500/20 text-red-300"
                        }`}
                      >
                        {student.status === "active" ? "Hoạt động" : "Đã khóa"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          className="p-2 hover:bg-white/10 rounded-lg transition text-blue-900"
                          title="Xem hồ sơ"
                        >
                          <UserCheck size={16} className="text-cyan-400" />
                        </button>
                        {student.status === "active" ? (
                          <button
                            className="p-2 hover:bg-red-500/10 rounded-lg transition text-blue-900"
                            title="Khóa tài khoản"
                          >
                            <Lock size={16} className="text-red-400" />
                          </button>
                        ) : (
                          <button
                            className="p-2 hover:bg-green-500/10 rounded-lg transition text-blue-900"
                            title="Mở khóa tài khoản"
                          >
                            <Unlock size={16} className="text-green-400" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </ManagerLayout>
  );
};

export default ManagerStudentsPage;

