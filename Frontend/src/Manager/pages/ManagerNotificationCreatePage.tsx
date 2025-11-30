import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ManagerLayout from "../components/ManagerLayout";
import { managerService } from "@/services/managerService";
import { toast } from "sonner";
import { ArrowLeft, Upload, Loader2, Users, Calendar } from "lucide-react";

const ManagerNotificationCreatePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    targetRoles: ["student"],
    scheduleAt: "",
    activityId: "",
    attachmentUrl: "",
    attachmentFile: null as File | null,
    attachmentDocument: null as any,
  });
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.message) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        title: formData.title,
        message: formData.message,
        targetRoles: formData.targetRoles,
        scheduleAt: formData.scheduleAt ? new Date(formData.scheduleAt).toISOString() : new Date().toISOString(),
        status: "sent",
        activityId: formData.activityId || undefined,
        metadata: {
          attachmentUrl: formData.attachmentUrl || undefined,
        },
      };

      await managerService.createNotification(payload as any);
      toast.success("Tạo thông báo thành công!");
      navigate("/manager/notifications");
    } catch (error: any) {
      console.error("Lỗi tạo thông báo:", error);
      const errorMessage = error?.response?.data?.message || error?.message || "Không thể tạo thông báo";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        setUploading(true);
        const meta = {
          title: file.name,
          activityId: formData.activityId || undefined,
          description: "Tệp đính kèm thông báo",
          accessScope: "manager",
        } as any;
        const result = await managerService.uploadFile(file, meta);
        setFormData(prev => ({ ...prev, attachmentUrl: result.fileUrl, attachmentFile: file, attachmentDocument: result.document || null }));
        toast.success("Upload file thành công!");
      } catch (error: any) {
        console.error("Lỗi upload file:", error);
        toast.error(error?.response?.data?.message || "Không thể upload file");
      } finally {
        setUploading(false);
      }
    }
  };

  const handleTargetRolesChange = (role: string) => {
    setFormData(prev => {
      const roles = prev.targetRoles.includes(role)
        ? prev.targetRoles.filter(r => r !== role)
        : [...prev.targetRoles, role];
      return { ...prev, targetRoles: roles.length > 0 ? roles : ["student"] };
    });
  };

  return (
    <ManagerLayout
      title="Tạo thông báo mới"
      subtitle="Gửi thông báo đến sinh viên tham gia hoạt động"
    >
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate("/manager/notifications")}
          className="mb-6 flex items-center gap-2 text-slate-400 hover:text-white transition"
        >
          <ArrowLeft size={18} />
          Quay lại danh sách
        </button>

        <form onSubmit={handleSubmit} className="bg-[#0b1021]/60 border border-white/10 rounded-2xl p-6 space-y-6">
          {/* Thông tin cơ bản */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-2">
              Thông tin thông báo
            </h3>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Tiêu đề <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/60"
                placeholder="Ví dụ: Thông báo về hoạt động Workshop AI"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Nội dung thông báo <span className="text-red-400">*</span>
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={6}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/60 resize-none"
                placeholder="Nhập nội dung thông báo chi tiết..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Đối tượng nhận thông báo
              </label>
              <div className="flex flex-wrap gap-3">
                {["student", "manager", "admin"].map((role) => (
                  <label
                    key={role}
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:bg-white/10 transition"
                  >
                    <input
                      type="checkbox"
                      checked={formData.targetRoles.includes(role)}
                      onChange={() => handleTargetRolesChange(role)}
                      className="w-4 h-4 rounded border-white/20 bg-white/5 text-cyan-500 focus:ring-cyan-400"
                    />
                    <Users size={16} />
                    <span className="text-sm capitalize">{role === "student" ? "Sinh viên" : role === "manager" ? "Quản lý" : "Admin"}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Thời gian và đính kèm */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-2">
              Thời gian và đính kèm
            </h3>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Thời gian gửi
              </label>
              <div className="relative">
                <Calendar
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="datetime-local"
                  name="scheduleAt"
                  value={formData.scheduleAt}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/60"
                />
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Để trống để gửi ngay lập tức
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                ID Hoạt động liên quan (tùy chọn)
              </label>
              <input
                type="text"
                name="activityId"
                value={formData.activityId}
                onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/60"
                placeholder="Nhập ID hoạt động nếu thông báo liên quan"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                File đính kèm (tùy chọn)
              </label>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif"
                onChange={handleFileChange}
                disabled={uploading}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/60 disabled:opacity-50"
              />
              {formData.attachmentUrl && (
                <div className="mt-1">
                  <p className="text-xs text-emerald-400">✓ Đã upload: {formData.attachmentFile?.name || "File đính kèm"}</p>
                  {formData.attachmentDocument?._id && (
                    <p className="text-xs text-slate-400 mt-1">Đã lưu tài liệu hệ thống (ID: <span className="font-mono text-xs">{formData.attachmentDocument._id}</span>)</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Submit buttons */}
          <div className="flex gap-4 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={() => navigate("/manager/notifications")}
              className="px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl text-sm transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Đang tạo...
                </>
              ) : (
                "Tạo thông báo"
              )}
            </button>
          </div>
        </form>
      </div>
    </ManagerLayout>
  );
};

export default ManagerNotificationCreatePage;

