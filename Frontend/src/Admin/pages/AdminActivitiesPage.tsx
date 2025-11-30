import { Calendar, CheckCircle2, ListChecks, Plus } from "lucide-react";
import { ActivityDetailModal } from "@/components/admin/ActivityDetailModal";
import EditActivityModal from "./EditActivityModal";
import DeleteActivityButton from "./DeleteActivityButton";
import { useEffect, useMemo, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import type { AdminActivity } from "@/types/admin";
import { adminService } from "@/services/adminService";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

// Helper to format dates
const formatDate = (value: string | Date | undefined | null) => {
  if (!value) return "Chưa xác định";
  try {
    const date = value instanceof Date ? value : new Date(value);
    if (isNaN(date.getTime())) return "Ngày không hợp lệ";
    return new Intl.DateTimeFormat("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch (error) {
    console.error("Lỗi format date:", error, value);
    return "Ngày không hợp lệ";
  }
};

function ActivityCreateModal({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
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
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, field: "coverImage" | "documentUrl") => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        setUploading(true);
        const result = await adminService.uploadFile(file);
        if (field === "coverImage") {
          setFormData((prev) => ({ ...prev, coverImage: result.fileUrl, coverImageFile: file }));
        } else {
          setFormData((prev) => ({ ...prev, documentUrl: result.fileUrl, documentFile: file }));
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.startTime || !formData.endTime) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }
    try {
      setLoading(true);
      const payload = {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        type: formData.type,
        startTime: new Date(formData.startTime).toISOString(),
        endTime: new Date(formData.endTime).toISOString(),
        maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : 0,
        coverImage: formData.coverImage || undefined,
        meta: {
          tags: formData.tags ? formData.tags.split(",").map((t) => t.trim()) : [],
          responsiblePerson: formData.responsiblePerson,
          points: formData.points ? parseInt(formData.points) : 0,
          documentUrl: formData.documentUrl,
        },
      };
      await adminService.createActivity(payload);
      toast.success("Tạo hoạt động thành công!");
      setFormData({
        title: "",
        description: "",
        location: "",
        type: "general",
        startTime: "",
        endTime: "",
        maxParticipants: "",
        coverImage: "",
        coverImageFile: null,
        responsiblePerson: "",
        points: "",
        tags: "",
        documentUrl: "",
        documentFile: null,
      });
      setOpen(false);
      onCreated();
    } catch (error: any) {
      console.error("Lỗi tạo hoạt động:", error);
      const msg = error?.response?.data?.message || error?.message || "Không thể tạo hoạt động";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-[#050710] font-medium px-4 py-2 rounded-xl transition">
          <Plus size={18} /> Tạo hoạt động
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tạo hoạt động mới</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Thông tin cơ bản */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Thông tin cơ bản</h3>
            <div>
              <label className="block text-sm font-medium mb-2">Tên hoạt động <span className="text-red-400">*</span></label>
              <Input type="text" name="title" value={formData.title} onChange={handleChange} required placeholder="Ví dụ: Workshop AI và Machine Learning" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Mô tả hoạt động</label>
              <textarea name="description" value={formData.description} onChange={handleChange} rows={4} className="w-full rounded-md border bg-transparent px-3 py-2 text-sm resize-none" placeholder="Mô tả chi tiết về hoạt động..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Loại hoạt động</label>
                <select name="type" value={formData.type} onChange={handleChange} className="w-full rounded-md border bg-transparent px-3 py-2 text-sm">
                  <option value="general">Chung</option>
                  <option value="academic">Học thuật</option>
                  <option value="social">Cộng đồng</option>
                  <option value="sports">Thể thao</option>
                  <option value="volunteer">Tình nguyện</option>
                  <option value="workshop">Workshop</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Địa điểm</label>
                <Input type="text" name="location" value={formData.location} onChange={handleChange} placeholder="Ví dụ: Phòng A101, Tòa nhà A" />
              </div>
            </div>
          </div>
          {/* Thời gian và số lượng */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Thời gian và số lượng</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Thời gian bắt đầu <span className="text-red-400">*</span></label>
                <Input type="datetime-local" name="startTime" value={formData.startTime} onChange={handleChange} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Thời gian kết thúc <span className="text-red-400">*</span></label>
                <Input type="datetime-local" name="endTime" value={formData.endTime} onChange={handleChange} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Số lượng sinh viên tối đa</label>
                <Input type="number" name="maxParticipants" value={formData.maxParticipants} onChange={handleChange} min="1" placeholder="0 = không giới hạn" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Điểm cộng (nếu có)</label>
                <Input type="number" name="points" value={formData.points} onChange={handleChange} min="0" placeholder="0" />
              </div>
            </div>
          </div>
          {/* Thông tin bổ sung */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Thông tin bổ sung</h3>
            <div>
              <label className="block text-sm font-medium mb-2">Người phụ trách</label>
              <Input type="text" name="responsiblePerson" value={formData.responsiblePerson} onChange={handleChange} placeholder="Họ tên người phụ trách" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Tags (phân cách bằng dấu phẩy)</label>
              <Input type="text" name="tags" value={formData.tags} onChange={handleChange} placeholder="Ví dụ: AI, Machine Learning, Workshop" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Hình ảnh bìa</label>
              <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, "coverImage")} disabled={uploading} className="w-full rounded-md border bg-transparent px-3 py-2 text-sm disabled:opacity-50" />
              {formData.coverImage && (
                <p className="text-xs text-emerald-400 mt-1">✓ Đã upload: {formData.coverImageFile?.name || "Hình ảnh"}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Tài liệu đính kèm</label>
              <input type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt" onChange={(e) => handleFileChange(e, "documentUrl")} disabled={uploading} className="w-full rounded-md border bg-transparent px-3 py-2 text-sm disabled:opacity-50" />
              {formData.documentUrl && (
                <p className="text-xs text-emerald-400 mt-1">✓ Đã upload: {formData.documentFile?.name || "Tài liệu"}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <button type="button" onClick={() => setOpen(false)} className="px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm transition text-blue-900">
              Hủy
            </button>
            <button type="submit" disabled={loading} className="px-6 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl text-sm transition disabled:opacity-50 disabled:cursor-not-allowed text-blue-900">
              {loading ? "Đang tạo..." : "Tạo hoạt động"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

const AdminActivitiesPage = () => {
  const [activities, setActivities] = useState<AdminActivity[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const fetchActivities = async () => {
      try {
        setLoading(true);
        const data = await adminService.getActivities({
          search: search || undefined,
          status: statusFilter === "all" ? undefined : statusFilter,
          type: typeFilter === "all" ? undefined : typeFilter,
        });
        if (isMounted) setActivities(data ?? []);
      } catch (error: any) {
        console.error("Không thể tải danh sách hoạt động", error);
        const msg = error?.response?.data?.message || error?.message || "Không thể tải danh sách hoạt động";
        toast.error(msg);
        if (isMounted) setActivities([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchActivities();
    return () => { isMounted = false; };
  }, [search, statusFilter, typeFilter, reloadKey]);

  const approvalSteps = useMemo(() => [
    { title: "Hoạt động STEM", percent: 40 },
    { title: "Workshop UX", percent: 60 },
    { title: "Sự kiện AI Summit", percent: 80 },
  ], []);

  return (
    <AdminLayout
      title="Quản lý hoạt động & sự kiện"
      subtitle="Theo dõi, phê duyệt và tổ chức hoạt động"
      actions={
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/15 hover:bg-white/10 text-blue-900">
            <ListChecks size={16} /> Phê duyệt nhanh
          </button>
          <ActivityCreateModal onCreated={() => setReloadKey((k) => k + 1)} />
        </div>
      }
    >
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex flex-wrap gap-4 mb-4">
            <input
              type="text"
              placeholder="Tìm kiếm hoạt động..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 min-w-[220px] bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/60"
            />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm">
              <option value="all">Tất cả trạng thái</option>
              <option value="Đang mở">Đang mở</option>
              <option value="Chờ phê duyệt">Chờ phê duyệt</option>
              <option value="Đã kết thúc">Đã kết thúc</option>
            </select>
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm">
              <option value="all">Loại hoạt động</option>
              <option value="academic">Học thuật</option>
              <option value="social">Cộng đồng</option>
              <option value="general">Khác</option>
            </select>
          </div>
          <div className="space-y-4">
            {loading && <div className="text-center text-slate-500 py-6">Đang tải dữ liệu...</div>}
            {!loading && activities.length === 0 && (
              <div className="text-center text-slate-500 py-6">Không có hoạt động nào phù hợp bộ lọc.</div>
            )}
            {!loading && activities.map((activity) => (
              <div key={activity._id} className="border border-white/10 rounded-2xl p-4 bg-white/3 flex flex-col gap-3">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold">{activity.title}</h3>
                    <p className="text-sm text-slate-400">Đơn vị phụ trách: {activity.createdBy?.displayName || "Hệ thống"}</p>
                  </div>
                  <span className="text-xs px-3 py-1 rounded-full border border-white/20">Loại: {activity.type || "general"}</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-400">
                  <span className="flex items-center gap-2"><Calendar size={14} />{formatDate(activity.startTime)}</span>
                  <span className="flex items-center gap-2"><CheckCircle2 size={14} />{activity.status}</span>
                </div>
                <div className="flex flex-wrap gap-2 text-blue-900">
                  <ActivityDetailModal activity={activity} />
                  {activity.status === "Chờ phê duyệt" && (
                    <button
                      onClick={async () => {
                        if (!confirm(`Duyệt hoạt động "${activity.title}"?`)) return;
                        try {
                          await adminService.updateActivity(activity._id, { status: "Đang mở" });
                          setReloadKey((prev) => prev + 1);
                          toast.success("Đã duyệt hoạt động! Sinh viên có thể thấy hoạt động này.");
                        } catch (error) {
                          console.error("Không thể duyệt hoạt động", error);
                          toast.error("Không thể duyệt hoạt động");
                        }
                      }}
                      className="px-3 py-1 text-xs rounded-full border border-emerald-400/40 text-emerald-200 hover:bg-emerald-500/10 text-blue-900"
                    >
                      ✓ Duyệt hoạt động
                    </button>
                  )}
                  <EditActivityModal activity={activity} onUpdated={() => setReloadKey((prev) => prev + 1)} />
                  <button className="px-3 py-1 text-xs rounded-full border border-cyan-400/40 hover:bg-cyan-500/10 text-blue-900">
                    {activity.participantCount ?? 0} sinh viên
                  </button>
                  <DeleteActivityButton activity={activity} onDeleted={() => setReloadKey((prev) => prev + 1)} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col gap-5">
          <h3 className="text-lg font-semibold">Tiến trình phê duyệt</h3>
          {approvalSteps.map((item) => (
            <div key={item.title} className="border border-white/10 rounded-2xl p-4">
              <div className="flex items-center justify-between text-sm">
                <span>{item.title}</span>
                <span className="text-cyan-300">{item.percent}%</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500" style={{ width: `${item.percent}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminActivitiesPage;
