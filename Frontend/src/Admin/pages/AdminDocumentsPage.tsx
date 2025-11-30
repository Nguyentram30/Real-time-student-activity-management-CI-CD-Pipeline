import { FolderPlus, Link2, Shield, Trash2, Upload, Loader2, Eye, Download } from "lucide-react";
import { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import type { AdminDocument } from "@/types/admin";
import { adminService } from "@/services/adminService";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

function DocumentCreateModal({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    accessScope: "admin",
    file: null as File | null,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, file: e.target.files![0] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.file) {
      toast.error("Vui lòng điền tiêu đề và chọn file");
      return;
    }

    try {
      setLoading(true);
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("accessScope", formData.accessScope);
      formDataToSend.append("file", formData.file);

      await adminService.createDocument(formDataToSend);
      toast.success("Tải tài liệu thành công!");
      setFormData({
        title: "",
        description: "",
        accessScope: "admin",
        file: null,
      });
      setOpen(false);
      onCreated?.();
    } catch (error: any) {
      console.error("Lỗi tải tài liệu:", error);
      const errorMessage = error?.response?.data?.message || error?.message || "Không thể tải tài liệu";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-[#050710] font-medium px-4 py-2 rounded-xl transition">
          <Upload size={18} /> Tải tài liệu
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tải tài liệu mới</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
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
              placeholder="Nhập tiêu đề tài liệu"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Mô tả</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full rounded-md border bg-transparent px-3 py-2 text-sm resize-none"
              placeholder="Mô tả tài liệu..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              File <span className="text-red-400">*</span>
            </label>
            <input
              type="file"
              onChange={handleFileChange}
              required
              className="w-full rounded-md border bg-transparent px-3 py-2 text-sm"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar,.jpg,.jpeg,.png,.gif"
            />
            {formData.file && (
              <p className="text-xs text-slate-400 mt-1">Đã chọn: {formData.file.name}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Phạm vi truy cập</label>
            <select
              name="accessScope"
              value={formData.accessScope}
              onChange={handleChange}
              className="w-full rounded-md border bg-transparent px-3 py-2 text-sm"
            >
              <option value="admin">Admin</option>
              <option value="manager">Quản lý</option>
              <option value="student">Sinh viên</option>
              <option value="public">Công khai</option>
            </select>
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
              className="px-6 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl text-sm transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Đang tải...
                </>
              ) : (
                "Tải lên"
              )}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

const AdminDocumentsPage = () => {
  const [documents, setDocuments] = useState<AdminDocument[]>([]);
  const [reloadKey, setReloadKey] = useState(0);

  const loadDocuments = async () => {
    try {
      const data = await adminService.getDocuments();
      setDocuments(data ?? []);
    } catch (error) {
      console.error("Không thể tải tài liệu", error);
      toast.error("Không thể tải tài liệu");
    }
  };

  useEffect(() => {
    loadDocuments();
  }, [reloadKey]);

  return (
    <AdminLayout
      title="Quản lý tài liệu"
      subtitle="Tải lên, phân quyền và tổ chức tài liệu hệ thống"
      actions={
        <DocumentCreateModal onCreated={() => setReloadKey((prev) => prev + 1)} />
      }
    >
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-4">
          {documents.length === 0 ? (
            <div className="text-center text-slate-500 py-12">Chưa có tài liệu nào</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-slate-400 border-b border-white/10">
                  <tr>
                    <th className="py-3">ID</th>
                    <th className="py-3">Người tạo</th>
                    <th className="py-3">File URL</th>
                    <th className="py-3">Người cập nhật</th>
                    <th className="py-3">Thời gian cập nhật</th>
                    <th className="py-3 text-right">Chức năng</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((document) => (
                    <tr key={document._id} className="border-b border-white/5 last:border-none">
                      <td className="py-3 text-xs font-mono">{document._id}</td>
                      <td className="py-3">{document.uploadedBy?.displayName || "Hệ thống"}</td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <a 
                            href={document.fileUrl} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-cyan-400 hover:underline text-xs truncate max-w-xs block"
                            title={document.fileUrl}
                          >
                            {document.title || document.fileUrl}
                          </a>
                          <span className="text-xs text-slate-500">
                            ({document.mimeType || "file"})
                          </span>
                        </div>
                      </td>
                      <td className="py-3 text-slate-400">
                        {(document as any).updatedBy?.displayName || document.uploadedBy?.displayName || "N/A"}
                      </td>
                      <td className="py-3 text-slate-400 text-xs">
                        {document.updatedAt ? new Date(document.updatedAt).toLocaleString("vi-VN") : "N/A"}
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <a
                            href={document.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-xl border border-white/10 hover:bg-white/10"
                          >
                            <Link2 size={16} />
                          </a>
                          <button
                            onClick={async () => {
                              if (!confirm(`Xoá tài liệu "${document.title}"?`)) return;
                              try {
                                await adminService.deleteDocument(document._id);
                                setReloadKey((prev) => prev + 1);
                                toast.success("Đã xoá tài liệu");
                              } catch (error) {
                                console.error("Không thể xoá tài liệu", error);
                                toast.error("Không thể xoá tài liệu");
                              }
                            }}
                            className="p-2 rounded-xl border border-rose-400/30 text-rose-200 hover:bg-rose-500/10"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-4">Phân quyền truy cập</h3>
          <div className="space-y-3">
            {[
              { group: "Admin", access: "Toàn quyền", color: "text-rose-300" },
              { group: "Quản lý khoa", access: "Tạo / sửa / xem", color: "text-cyan-300" },
              { group: "Sinh viên", access: "Xem / tải", color: "text-emerald-300" },
            ].map((item) => (
              <div key={item.group} className="border border-white/10 rounded-2xl p-4">
                <p className="text-sm">{item.group}</p>
                <p className={`text-xs mt-1 ${item.color}`}>{item.access}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDocumentsPage;

