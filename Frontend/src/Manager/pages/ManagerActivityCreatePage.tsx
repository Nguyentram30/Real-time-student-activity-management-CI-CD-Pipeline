import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ManagerLayout from "../components/ManagerLayout";
import { managerService } from "@/services/managerService";
import { adminService } from "@/services/adminService";
import { toast } from "sonner";
import { ArrowLeft, Upload, Loader2 } from "lucide-react";

const ManagerActivityCreatePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    type: "general",
    startTime: "",
    endTime: "",
    maxParticipants: "",
    coverImage: "",
    coverImageFile: null as File | null,
    responsiblePerson: "",
    points: "",
    tags: "",
    documentUrl: "",
    documentFile: null as File | null,
    documentRecord: null as any,
  });
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.startTime || !formData.endTime) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    if (!formData.documentUrl) {
      toast.error("Vui lòng upload tài liệu đính kèm");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        type: formData.type,
        status: "Chờ phê duyệt", // Mặc định chờ Admin duyệt
        startTime: new Date(formData.startTime).toISOString(),
        endTime: new Date(formData.endTime).toISOString(),
        maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : 0,
        coverImage: formData.coverImage || undefined,
        meta: {
          tags: formData.tags ? formData.tags.split(",").map((t: string) => t.trim()) : [],
          responsiblePerson: formData.responsiblePerson,
          points: formData.points ? parseInt(formData.points as any) : 0,
          documentUrl: formData.documentUrl,
        },
        createdBy: undefined,
      } as any;

      await managerService.createActivity(payload);
      toast.success("Tạo hoạt động thành công! Đang chờ Admin duyệt.");
      navigate("/manager/activities");
    } catch (error: any) {
      console.error("Lỗi tạo hoạt động:", error);
      const errorMessage = error?.response?.data?.message || error?.message || "Không thể tạo hoạt động";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, field: "coverImage" | "documentUrl") => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        setUploading(true);
        const meta = {
          title: file.name,
          description: field === "documentUrl" ? "Tài liệu đính kèm hoạt động" : "Hình ảnh bìa hoạt động",
          accessScope: "manager",
        } as any;
        const result = await managerService.uploadFile(file, meta);
        if (field === "coverImage") {
          setFormData(prev => ({ ...prev, coverImage: result.fileUrl, coverImageFile: file }));
        } else {
          setFormData(prev => ({ ...prev, documentUrl: result.fileUrl, documentFile: file, documentRecord: result.document || null }));
        }
        toast.success("Upload file thành công!");
      } catch (error: any) {
        console.error("Lỗi upload file:", error);
        toast.error(error?.response?.data?.message || "Không thể upload file");
      } finally {
        setUploading(false);
      }
    }
  };

  return (
    <ManagerLayout
      title="Tạo hoạt động mới"
      subtitle="Điền thông tin để tạo hoạt động, sau đó gửi Admin duyệt"
    >
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate("/manager/activities")}
          className="mb-6 flex items-center gap-2 text-slate-400 hover:text-white transition"
        >
          <ArrowLeft size={18} />
          Quay lại danh sách
        </button>

        <form onSubmit={handleSubmit} className="bg-[#0b1021]/60 border border-white/10 rounded-2xl p-6 space-y-6">
          {/* Thông tin cơ bản */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-2">
              Thông tin cơ bản
            </h3>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Tên hoạt động <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/60"
                placeholder="Ví dụ: Workshop AI và Machine Learning"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Mô tả hoạt động
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/60 resize-none"
                placeholder="Mô tả chi tiết về hoạt động..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Loại hoạt động
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/60"
                >
                  <option value="general">Chung</option>
                  <option value="academic">Học thuật</option>
                  <option value="social">Cộng đồng</option>
                  <option value="sports">Thể thao</option>
                  <option value="volunteer">Tình nguyện</option>
                  <option value="workshop">Workshop</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Địa điểm
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/60"
                  placeholder="Ví dụ: Phòng A101, Tòa nhà A"
                />
              </div>
            </div>
          </div>

          {/* Thời gian và địa điểm */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-2">
              Thời gian và số lượng
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Thời gian bắt đầu <span className="text-red-400">*</span>
                </label>
                <input
                  type="datetime-local"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/60"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Thời gian kết thúc <span className="text-red-400">*</span>
                </label>
                <input
                  type="datetime-local"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/60"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Số lượng sinh viên tối đa
                </label>
                <input
                  type="number"
                  name="maxParticipants"
                  value={formData.maxParticipants}
                  onChange={handleChange}
                  min="1"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/60"
                  placeholder="0 = không giới hạn"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Điểm cộng (nếu có)
                </label>
                <input
                  type="number"
                  name="points"
                  value={formData.points}
                  onChange={handleChange}
                  min="0"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/60"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* Thông tin bổ sung */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-2">
              Thông tin bổ sung
            </h3>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Người phụ trách
              </label>
              <input
                type="text"
                name="responsiblePerson"
                value={formData.responsiblePerson}
                onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/60"
                placeholder="Họ tên người phụ trách"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Tags (phân cách bằng dấu phẩy)
              </label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/60"
                placeholder="Ví dụ: AI, Machine Learning, Workshop"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Hình ảnh bìa
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, "coverImage")}
                disabled={uploading}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/60 disabled:opacity-50"
              />
              {formData.coverImage && (
                <p className="text-xs text-emerald-400 mt-1">✓ Đã upload: {formData.coverImageFile?.name || "Hình ảnh"}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Tài liệu đính kèm <span className="text-amber-400">*</span>
              </label>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                onChange={(e) => handleFileChange(e, "documentUrl")}
                disabled={uploading}
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/60 disabled:opacity-50"
              />
              {formData.documentUrl && (
                <div className="mt-1">
                  <p className="text-xs text-emerald-400">✓ Đã upload: {formData.documentFile?.name || "Tài liệu"}</p>
                  {formData.documentRecord?._id && (
                    <p className="text-xs text-slate-400 mt-1">Đã lưu tài liệu hệ thống (ID: <span className="font-mono text-xs">{formData.documentRecord._id}</span>)</p>
                  )}
                </div>
              )}
              <p className="text-xs text-slate-400 mt-1">
                Tài liệu bắt buộc phải có để Admin duyệt hoạt động
              </p>
            </div>
          </div>

          {/* Submit buttons */}
          <div className="flex gap-4 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={() => navigate("/manager/activities")}
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
                "Tạo hoạt động"
              )}
            </button>
          </div>
        </form>
      </div>
    </ManagerLayout>
  );
};

export default ManagerActivityCreatePage;

