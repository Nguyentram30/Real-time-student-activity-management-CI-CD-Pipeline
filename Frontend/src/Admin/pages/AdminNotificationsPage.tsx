import { CalendarClock, Megaphone, Plus, Send, Upload, Users, Calendar, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import type { NotificationMessage } from "@/types/admin";
import { adminService } from "@/services/adminService";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

const statusLabel: Record<NotificationMessage["status"], string> = {
  sent: "Đã gửi",
  scheduled: "Đang lên lịch",
  draft: "Bản nháp",
};

function QuickEditor({ onSent }: { onSent: () => void }) {
  const [quickData, setQuickData] = useState({
    title: "",
    message: "",
    targetRole: "student",
  });
  const [sending, setSending] = useState(false);

  const handleQuickSend = async () => {
    if (!quickData.title || !quickData.message) {
      toast.error("Vui lòng điền tiêu đề và nội dung");
      return;
    }

    try {
      setSending(true);
      await adminService.createNotification({
        title: quickData.title,
        message: quickData.message,
        targetRoles: [quickData.targetRole],
        status: "sent",
        scheduleAt: new Date().toISOString(),
      });
      toast.success("Đã gửi thông báo!");
      setQuickData({ title: "", message: "", targetRole: "student" });
      onSent?.();
    } catch (error: any) {
      console.error("Lỗi gửi thông báo:", error);
      toast.error(error?.response?.data?.message || "Không thể gửi thông báo");
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <input
        type="text"
        placeholder="Tiêu đề thông báo"
        value={quickData.title}
        onChange={(e) => setQuickData(prev => ({ ...prev, title: e.target.value }))}
        className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/60"
      />
      <textarea
        rows={5}
        placeholder="Nội dung chính..."
        value={quickData.message}
        onChange={(e) => setQuickData(prev => ({ ...prev, message: e.target.value }))}
        className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/60 resize-none"
      />
      <select
        value={quickData.targetRole}
        onChange={(e) => setQuickData(prev => ({ ...prev, targetRole: e.target.value }))}
        className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm"
      >
        <option value="student">Tất cả sinh viên</option>
        <option value="manager">Quản lý</option>
        <option value="admin">Admin</option>
      </select>
      <button
        onClick={handleQuickSend}
        disabled={sending}
        className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-blue-900 text-sm disabled:opacity-50 disabled:cursor-not-allowed text-blue-900"
      >
        <Send size={16} /> {sending ? "Đang gửi..." : "Gửi ngay"}
      </button>
    </>
  );
}

function NotificationCreateModal({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    targetRoles: ["student"] as string[],
    scheduleAt: "",
    activityId: "",
    attachmentUrl: "",
    attachmentFile: null as File | null,
  });
  const [uploading, setUploading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        setUploading(true);
        const result = await adminService.uploadFile(file);
        setFormData(prev => ({ ...prev, attachmentUrl: result.fileUrl, attachmentFile: file }));
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

      await adminService.createNotification(payload as any);
      toast.success("Tạo thông báo thành công!");
      setFormData({
        title: "",
        message: "",
        targetRoles: ["student"],
        scheduleAt: "",
        activityId: "",
        attachmentUrl: "",
        attachmentFile: null,
      });
      setOpen(false);
      onCreated?.();
    } catch (error: any) {
      console.error("Lỗi tạo thông báo:", error);
      const errorMessage = error?.response?.data?.message || error?.message || "Không thể tạo thông báo";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-[#050710] font-medium px-4 py-2 rounded-xl transition text-blue-900">
          <Plus size={18} /> Tạo thông báo
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto ">
        <DialogHeader>
          <DialogTitle>Tạo thông báo mới</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Thông tin thông báo */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Thông tin thông báo</h3>
            <div>
              <label className="block text-sm font-medium mb-2">
                Tiêu đề <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full rounded-md border bg-transparent px-3 py-2 text-sm"
                placeholder="Ví dụ: Thông báo về hoạt động Workshop AI"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Nội dung thông báo <span className="text-red-400">*</span>
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={6}
                className="w-full rounded-md border bg-transparent px-3 py-2 text-sm resize-none"
                placeholder="Nhập nội dung thông báo chi tiết..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Đối tượng nhận thông báo</label>
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
            <h3 className="text-lg font-semibold border-b pb-2">Thời gian và đính kèm</h3>
            <div>
              <label className="block text-sm font-medium mb-2">Thời gian gửi</label>
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
                  className="w-full rounded-md border bg-transparent pl-10 pr-4 py-2 text-sm"
                />
              </div>
              <p className="text-xs text-slate-400 mt-1">Để trống để gửi ngay lập tức</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">ID Hoạt động liên quan (tùy chọn)</label>
              <input
                type="text"
                name="activityId"
                value={formData.activityId}
                onChange={handleChange}
                className="w-full rounded-md border bg-transparent px-3 py-2 text-sm"
                placeholder="Nhập ID hoạt động nếu thông báo liên quan"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">File đính kèm (tùy chọn)</label>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif"
                onChange={handleFileChange}
                disabled={uploading}
                className="w-full rounded-md border bg-transparent px-3 py-2 text-sm disabled:opacity-50"
              />
              {formData.attachmentUrl && (
                <p className="text-xs text-emerald-400 mt-1">✓ Đã upload: {formData.attachmentFile?.name || "File đính kèm"}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-cyan-500 hover:bg-cyan-600 rounded-xl text-sm transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-black-900"
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
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

const AdminNotificationsPage = () => {
  const [notifications, setNotifications] = useState<NotificationMessage[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const data = await adminService.getNotifications();
        if (isMounted) {
          setNotifications(data ?? []);
        }
      } catch (error) {
        console.error("Không thể tải thông báo", error);
        toast.error("Không thể tải thông báo");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    fetchNotifications();
    return () => {
      isMounted = false;
    };
  }, [reloadKey]);

  const filteredNotifications = useMemo(
    () =>
      notifications.filter((item) => {
        const matchStatus = statusFilter === "all" || item.status === statusFilter;
        const matchSearch =
          !search ||
          item.title.toLowerCase().includes(search.toLowerCase()) ||
          item.message.toLowerCase().includes(search.toLowerCase()) ||
          item.targetRoles.some((role) => role.toLowerCase().includes(search.toLowerCase()));
        return matchStatus && matchSearch;
      }),
    [notifications, statusFilter, search]
  );

  return (
    <AdminLayout
      title="Quản lý thông báo"
      subtitle="Soạn thảo, hẹn lịch và gửi thông báo đến các nhóm người dùng"
      actions={
        <NotificationCreateModal onCreated={() => setReloadKey((prev) => prev + 1)} />
      }
    >
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex flex-wrap gap-4 mb-4">
            <input
              type="text"
              placeholder="Tìm kiếm thông báo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 min-w-[220px] bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/60"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm  text-blue-300"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="sent">Đã gửi</option>
              <option value="scheduled">Đang lên lịch</option>
              <option value="draft">Bản nháp</option>
            </select>
          </div>

          <div className="space-y-4">
            {loading && <div className="text-center text-slate-500 py-6">Đang tải dữ liệu...</div>}
            {!loading && filteredNotifications.length === 0 && (
              <div className="text-center text-slate-500 py-6">
                Không có thông báo nào phù hợp bộ lọc.
              </div>
            )}
            {!loading &&
              filteredNotifications.map((item) => (
                <div key={item._id} className="border border-white/10 rounded-2xl p-4 bg-white/3 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">{item.title}</h3>
                    <span className="text-xs px-3 py-1 rounded-full border border-white/20">
                      {statusLabel[item.status]}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400 line-clamp-2">{item.message}</p>
                  <div className="flex items-center gap-4 text-sm text-slate-400">
                    <span>ID: {item._id}</span>
                    <span>Người gửi: {(item as any).createdBy?.displayName || "Hệ thống"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <CalendarClock size={14} />
                    Ngày gửi: {new Date(item.scheduleAt).toLocaleString("vi-VN")}
                  </div>
                  {(item as any).metadata?.attachmentUrl && (
                    <div className="flex items-center gap-2 text-sm text-cyan-400">
                      <Upload size={14} />
                      File đính kèm: <a href={(item as any).metadata.attachmentUrl} target="_blank" rel="noopener noreferrer" className="underline">Xem file</a>
                    </div>
                  )}
                  <div className="flex gap-3">
                    <button
                      onClick={async () => {
                        const title = prompt("Tiêu đề mới:", item.title) ?? item.title;
                        try {
                          await adminService.updateNotification(item._id, { title });
                          setReloadKey((prev) => prev + 1);
                          toast.success("Đã cập nhật thông báo");
                        } catch (error) {
                          console.error("Không thể cập nhật thông báo", error);
                          toast.error("Không thể cập nhật thông báo");
                        }
                      }}
                      className="px-3 py-1 text-xs rounded-full border border-white/20 hover:bg-white/10 text-blue-900"
                    >
                      Chỉnh sửa
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          const scheduleAt =
                            prompt(
                              "Chọn thời gian gửi (ISO)",
                              new Date(item.scheduleAt).toISOString()
                            ) ?? new Date(item.scheduleAt).toISOString();
                          await adminService.scheduleNotification(item._id, scheduleAt);
                          setReloadKey((prev) => prev + 1);
                          toast.success("Đã cập nhật thời gian gửi");
                        } catch (error) {
                          console.error("Không thể hẹn lịch thông báo", error);
                          toast.error("Không thể hẹn lịch thông báo");
                        }
                      }}
                      className="px-3 py-1 text-xs rounded-full border border-cyan-400/40 hover:bg-cyan-500/10 text-blue-900"
                    >
                      Xem chi tiết
                    </button>
                    <button
                      onClick={async () => {
                        if (!confirm(`Xoá thông báo "${item.title}"?`)) return;
                        try {
                          await adminService.deleteNotification(item._id);
                          setReloadKey((prev) => prev + 1);
                          toast.success("Đã xoá thông báo");
                        } catch (error) {
                          console.error("Không thể xoá thông báo", error);
                          toast.error("Không thể xoá thông báo");
                        }
                      }}
                      className="px-3 py-1 text-xs rounded-full border border-rose-400/40  hover:bg-rose-500/10 text-blue-900"
                    >
                      Xoá
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col gap-5 text-blue-900">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Megaphone size={18} /> Trình soạn thảo nhanh
          </h3>
          <QuickEditor onSent={() => setReloadKey((prev) => prev + 1)} />
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminNotificationsPage;

