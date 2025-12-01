import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ManagerLayout from "../components/ManagerLayout";
import { managerService } from "@/services/managerService";
import { adminService } from "@/services/adminService";
import { toast } from "sonner";
import { ArrowLeft, Upload, Loader2, Eye, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const ManagerActivityCreatePage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    type: "general",
    startTime: "",
    endTime: "",
    EvidenceDeadline: "",
    AttendanceTime: "",
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
  const [loadingAction, setLoadingAction] = useState<"submit" | "draft" | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const [conflictPrompt, setConflictPrompt] = useState<{
    message: string;
    conflicts: any[];
    suggestions: { startTime: string; endTime: string; label: string }[];
    status: "Pending" | "Draft";
  } | null>(null);
  const [conflictCheck, setConflictCheck] = useState<{
    hasConflict: boolean;
    suggestions: { startTime: string; endTime: string; label: string }[];
    message: string;
  } | null>(null);
  const [checkingConflict, setCheckingConflict] = useState(false);

  const hasBasicInfo = useMemo(
    () => Boolean(formData.title && formData.startTime && formData.endTime),
    [formData.title, formData.startTime, formData.endTime]
  );

  const convertInputToISO = (value?: string) => (value ? new Date(value).toISOString() : undefined);
  const convertISOToInput = (value?: string) => {
    if (!value) return "";
    const date = new Date(value);
    const tzOffset = date.getTimezoneOffset();
    const local = new Date(date.getTime() - tzOffset * 60000);
    return local.toISOString().slice(0, 16);
  };

  const buildPayload = (status: "Pending" | "Draft", ignoreConflicts = false) => {
    const tags =
      formData.tags && formData.tags.length
        ? formData.tags.split(",").map((tag: string) => tag.trim()).filter(Boolean)
        : [];

    return {
      title: formData.title,
      description: formData.description,
      location: formData.location,
      type: formData.type,
      status,
      startTime: convertInputToISO(formData.startTime),
      endTime: convertInputToISO(formData.endTime),
      EvidenceDeadline: convertInputToISO(formData.EvidenceDeadline),
      AttendanceTime: convertInputToISO(formData.AttendanceTime),
      maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : 0,
      coverImage: formData.coverImage || undefined,
      meta: {
        tags,
        responsiblePerson: formData.responsiblePerson,
        points: formData.points ? parseInt(formData.points as any) : 0,
        documentUrl: formData.documentUrl,
      },
      ignoreConflicts,
    };
  };

  const ensureMinimumData = (status: "Pending" | "Draft") => {
    if (!hasBasicInfo) {
      toast.error("Vui lòng nhập tên hoạt động và thời gian bắt đầu / kết thúc");
      return false;
    }
    if (status === "Pending" && !formData.documentUrl) {
      toast.error("Vui lòng upload tài liệu đính kèm trước khi gửi duyệt");
      return false;
    }
    return true;
  };

  const handleSubmitActivity = async (status: "Pending" | "Draft", ignoreConflicts = false) => {
    if (!ensureMinimumData(status)) return;
    try {
      setLoadingAction(status === "Pending" ? "submit" : "draft");
      setConflictPrompt(null);
      const payload = buildPayload(status, ignoreConflicts);
      await managerService.createActivity(payload);
      toast.success(
        status === "Pending"
          ? "Đã gửi hoạt động. Admin sẽ xem xét phê duyệt."
          : "Đã lưu bản nháp hoạt động."
      );
      navigate("/manager/activities");
    } catch (error: any) {
      if (error?.response?.status === 409) {
        const data = error.response.data || {};
        setConflictPrompt({
          message: data.message || "Phát hiện xung đột thời gian tại địa điểm này.",
          conflicts: data.conflicts || [],
          suggestions: data.suggestions || [],
          status,
        });
      } else {
        const message = error?.response?.data?.message || error?.message || "Không thể lưu hoạt động";
        toast.error(message);
      }
    } finally {
      setLoadingAction(null);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmitActivity("Pending");
  };

  const handleSaveDraft = () => {
    handleSubmitActivity("Draft");
  };

  const handlePreview = async () => {
    if (!ensureMinimumData("Pending")) return;
    try {
      setPreviewLoading(true);
      const preview = await managerService.previewActivity(buildPayload("Pending"));
      setPreviewData(preview);
      setPreviewOpen(true);
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || "Không thể tạo bản xem trước";
      toast.error(message);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleCheckConflicts = async () => {
    if (!hasBasicInfo || !formData.location) {
      toast.error("Vui lòng nhập đầy đủ địa điểm và thời gian để kiểm tra xung đột");
      return;
    }
    try {
      setCheckingConflict(true);
      const res = await managerService.checkConflicts({
        location: formData.location,
        startTime: convertInputToISO(formData.startTime) as string,
        endTime: convertInputToISO(formData.endTime) as string,
      });
      if (res.hasConflict) {
        setConflictCheck({
          hasConflict: true,
          suggestions: res.suggestions || [],
          message: "Phát hiện xung đột lịch",
        });
        setConflictPrompt({
          message: "Địa điểm này đang bị trùng lịch. Vui lòng chọn thời gian khác hoặc tiếp tục với xung đột.",
          conflicts: res.conflicts || [],
          suggestions: res.suggestions || [],
          status: "Pending",
        });
      } else {
        setConflictCheck({
          hasConflict: false,
          suggestions: [],
          message: "Không phát hiện xung đột nào",
        });
        toast.success("Không có xung đột tại thời gian đã chọn");
      }
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || "Không thể kiểm tra xung đột";
      toast.error(message);
    } finally {
      setCheckingConflict(false);
    }
  };

  const handleApplySuggestion = (suggestion: { startTime: string; endTime: string }) => {
    setFormData((prev) => ({
      ...prev,
      startTime: convertISOToInput(suggestion.startTime),
      endTime: convertISOToInput(suggestion.endTime),
    }));
    setConflictPrompt(null);
    setConflictCheck(null);
  };

  const continueAfterConflict = () => {
    if (!conflictPrompt) return;
    handleSubmitActivity(conflictPrompt.status, true);
  };

  const isSubmitting = loadingAction === "submit";
  const isSavingDraft = loadingAction === "draft";


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

        <form onSubmit={handleFormSubmit} className="bg-[#0b1021]/60 border border-white/10 rounded-2xl p-6 space-y-6">
          {conflictPrompt && (
            <div className="bg-amber-500/10 border border-amber-400/40 rounded-xl p-4 space-y-3 text-sm text-amber-100">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 mt-0.5 text-amber-300" />
                <div>
                  <p className="font-semibold text-amber-200">Cảnh báo xung đột lịch</p>
                  <p>{conflictPrompt.message}</p>
                  {conflictPrompt.conflicts?.length > 0 && (
                    <ul className="list-disc ml-5 mt-2 space-y-1 text-amber-100/90">
                      {conflictPrompt.conflicts.map((conflict: any) => (
                        <li key={conflict._id}>
                          {conflict.title} • {new Date(conflict.startTime).toLocaleString("vi-VN")} -{" "}
                          {new Date(conflict.endTime).toLocaleString("vi-VN")}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
              {conflictPrompt.suggestions?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {conflictPrompt.suggestions.map((suggestion) => (
                    <button
                      key={suggestion.startTime}
                      type="button"
                      onClick={() => handleApplySuggestion(suggestion)}
                      className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-xs hover:bg-white/10 transition"
                    >
                      Dùng gợi ý {suggestion.label}
                    </button>
                  ))}
                </div>
              )}
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={continueAfterConflict}
                  className="px-4 py-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-sm font-medium transition"
                >
                  Vẫn tiếp tục
                </button>
                <button
                  type="button"
                  onClick={() => setConflictPrompt(null)}
                  className="px-4 py-2 rounded-lg border border-white/10 hover:bg-white/5 text-sm transition"
                >
                  Đóng
                </button>
              </div>
            </div>
          )}

          {conflictCheck && !conflictPrompt && (
            <div
              className={`rounded-xl p-4 text-sm ${
                conflictCheck.hasConflict
                  ? "bg-amber-500/10 border border-amber-400/40 text-amber-100"
                  : "bg-emerald-500/10 border border-emerald-400/40 text-emerald-100"
              }`}
            >
              {conflictCheck.message}
            </div>
          )}
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
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleCheckConflicts}
                disabled={checkingConflict}
                className="px-4 py-2 text-sm rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition flex items-center gap-2 disabled:opacity-50"
              >
                {checkingConflict ? <Loader2 className="w-4 h-4 animate-spin" /> : <AlertTriangle className="w-4 h-4" />}
                Kiểm tra xung đột thời gian
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Thời gian gửi minh chứng (deadline)
                </label>
                <input
                  type="datetime-local"
                  name="EvidenceDeadline"
                  value={formData.EvidenceDeadline}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/60"
                />
                <p className="text-xs text-slate-400 mt-1">Mốc thời gian cuối cùng sinh viên được phép gửi minh chứng</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Thời gian điểm danh
                </label>
                <input
                  type="datetime-local"
                  name="AttendanceTime"
                  value={formData.AttendanceTime}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/60"
                />
                <p className="text-xs text-slate-400 mt-1">Thời gian cho phép sinh viên điểm danh</p>
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
          <div className="flex flex-wrap gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={() => navigate("/manager/activities")}
              className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm transition"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handlePreview}
              disabled={!hasBasicInfo || previewLoading}
              className="px-5 py-2.5 border border-white/10 rounded-xl text-sm transition flex items-center gap-2 bg-white/5 hover:bg-white/10 disabled:opacity-50"
            >
              {previewLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
              Xem trước
            </button>
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={isSavingDraft || uploading}
              className="px-5 py-2.5 bg-slate-600/60 hover:bg-slate-600 rounded-xl text-sm transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSavingDraft ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                "Lưu bản nháp"
              )}
            </button>
            <button
              type="submit"
              disabled={isSubmitting || uploading}
              className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl text-sm transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Đang gửi...
                </>
              ) : (
                "Gửi duyệt"
              )}
            </button>
          </div>
        </form>
      </div>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="bg-[#0b1021] border border-white/10 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl">Xem trước hoạt động</DialogTitle>
            <DialogDescription className="text-slate-400">
              Đây là bản xem trước dựa trên thông tin hiện tại. Hoạt động chưa được lưu.
            </DialogDescription>
          </DialogHeader>
          {previewData ? (
            <div className="space-y-4 mt-2 text-sm">
              <div>
                <p className="text-xs text-slate-400">Tên hoạt động</p>
                <p className="text-base font-semibold">{previewData.title}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-400">Thời gian</p>
                  <p>
                    {previewData.startTime
                      ? new Date(previewData.startTime).toLocaleString("vi-VN")
                      : "-"}{" "}
                    →{" "}
                    {previewData.endTime ? new Date(previewData.endTime).toLocaleString("vi-VN") : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Địa điểm</p>
                  <p>{previewData.location || "-"}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-400">Mô tả</p>
                <p className="whitespace-pre-line leading-relaxed">
                  {previewData.description || "Chưa có mô tả"}
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-slate-400">Loại hoạt động</p>
                  <p className="capitalize">{previewData.type || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Số lượng tối đa</p>
                  <p>{previewData.maxParticipants || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Điểm cộng</p>
                  <p>{previewData.meta?.points ?? 0}</p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-400">Không có dữ liệu xem trước.</p>
          )}
        </DialogContent>
      </Dialog>
    </ManagerLayout>
  );
};

export default ManagerActivityCreatePage;

