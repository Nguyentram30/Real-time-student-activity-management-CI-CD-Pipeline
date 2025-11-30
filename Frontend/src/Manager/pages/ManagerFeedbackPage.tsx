import { useState, useEffect, useCallback } from "react";
import ManagerLayout from "../components/ManagerLayout";
import {
  MessageSquare,
  CheckCircle2,
  Clock,
  XCircle,
  Filter,
  Search,
  Reply,
  Eye,
} from "lucide-react";
import { managerService } from "@/services/managerService";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Feedback {
  id: string;
  studentName: string;
  studentId: string;
  type: "complaint" | "suggestion" | "support";
  title: string;
  content: string;
  createdAt: string;
  status: "pending" | "processing" | "resolved";
  response?: string;
}

const ManagerFeedbackPage = () => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  useEffect(() => {
    let isMounted = true;
    const fetch = async () => {
      try {
        const data = await managerService.getFeedbacks();
        if (!isMounted) return;
        setFeedbacks(
          data.map((f: any) => ({
            id: f._id,
            studentName: f.user?.displayName || "",
            studentId: f.user?.studentCode || f.user?.username || "",
            type: f.type || "support",
            title: f.title || f.content?.slice(0, 60) || "",
            content: f.content,
            createdAt: f.createdAt,
            status: f.status === "published" ? "resolved" : (f.status || "pending"),
            response: f.response,
            attachmentUrl: f.attachmentUrl,
            responseAttachmentUrl: f.responseAttachmentUrl,
          }))
        );
      } catch (error) {
        console.error("Không thể tải feedbacks", error);
      }
    };
    fetch();
    return () => { isMounted = false; };
  }, []);

  const refresh = useCallback(() => {
    managerService.getFeedbacks()
      .then((data) => setFeedbacks(data.map((f: any) => ({
        id: f._id,
        studentName: f.user?.displayName || "",
        studentId: f.user?.studentCode || f.user?.username || "",
        type: f.type || "support",
        title: f.title || f.content?.slice(0, 60) || "",
        content: f.content,
        createdAt: f.createdAt,
        status: f.status === "published" ? "resolved" : (f.status || "pending"),
        response: f.response,
        attachmentUrl: f.attachmentUrl,
        responseAttachmentUrl: f.responseAttachmentUrl,
      })) ))
      .catch((err) => console.error(err));
  }, []);

  function ReplyModal({ feedbackId, onDone }: { feedbackId: string; onDone: () => void }) {
    const [open, setOpen] = useState(false);
    const [text, setText] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
      setLoading(true);
        try {
          let fileUrl: string | undefined;
        if (file) {
          const meta = { title: `feedback-response-${feedbackId}`, description: "Phản hồi phản hồi từ quản lý", accessScope: "manager" } as any;
          const res = await managerService.uploadFile(file, meta);
          fileUrl = res.fileUrl;
          // show quick confirmation that file was stored as Document
          if (res.document && res.document._id) {
            toast.success(`File đã lưu: ID ${res.document._id}`);
          }
        }
          await managerService.replyFeedback(feedbackId, { response: text, fileUrl });
        toast.success("Đã gửi phản hồi");
        setOpen(false);
        onDone();
      } catch (error) {
        console.error(error);
        toast.error("Không thể gửi phản hồi");
      } finally { setLoading(false); }
    };

    return (
      <>
        <button onClick={() => setOpen(true)} className="px-4 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-400/40 rounded-lg text-sm transition flex items-center gap-2 text-blue-900">
          <Reply size={16} /> Trả lời
        </button>
        {open && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-[#0b1021]/80 p-6 rounded-lg w-full max-w-lg">
              <h3 className="text-lg font-semibold mb-3">Gửi phản hồi</h3>
              <textarea value={text} onChange={(e)=>setText(e.target.value)} rows={6} className="w-full p-3 rounded border mb-3" />
              <input type="file" onChange={(e)=> setFile(e.target.files?.[0] || null)} className="mb-3" />
              <div className="flex justify-end gap-2">
                <button onClick={()=>setOpen(false)} className="px-4 py-2 rounded bg-white/5">Hủy</button>
                <button onClick={handleSubmit} disabled={loading} className="px-4 py-2 rounded bg-cyan-500 text-black-900">Gửi</button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  const getTypeLabel = (type: string) => {
    const labels = {
      complaint: "Khiếu nại",
      suggestion: "Góp ý",
      support: "Hỗ trợ",
    };
    return labels[type as keyof typeof labels];
  };

  const getTypeColor = (type: string) => {
    const colors = {
      complaint: "bg-red-500/20 text-red-300 border-red-400/40",
      suggestion: "bg-blue-500/20 text-blue-300 border-blue-400/40",
      support: "bg-green-500/20 text-green-300 border-green-400/40",
    };
    return colors[type as keyof typeof colors];
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: "bg-amber-500/20 text-amber-300 border-amber-400/40",
      processing: "bg-blue-500/20 text-blue-300 border-blue-400/40",
      resolved: "bg-green-500/20 text-green-300 border-green-400/40",
    };
    const labels = {
      pending: "Chưa xử lý",
      processing: "Đang xử lý",
      resolved: "Đã xử lý",
    };
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium border ${styles[status as keyof typeof styles]}`}
      >
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const filteredFeedbacks = feedbacks.filter((feedback) => {
    const matchesSearch =
      feedback.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feedback.studentName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || feedback.status === statusFilter;
    const matchesType = typeFilter === "all" || feedback.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <ManagerLayout
      title="Quản lý phản hồi"
      subtitle="Xem và xử lý phản hồi từ sinh viên"
    >
      {/* Filters */}
      <div className="bg-[#0b1021]/60 border border-white/10 rounded-2xl p-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Tìm kiếm phản hồi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/60 text-blue-900"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/60 text-blue-300"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="pending">Chưa xử lý</option>
            <option value="processing">Đang xử lý</option>
            <option value="resolved">Đã xử lý</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/60 text-blue-300"
          >
            <option value="all">Tất cả loại</option>
            <option value="complaint">Khiếu nại</option>
            <option value="suggestion">Góp ý</option>
            <option value="support">Hỗ trợ</option>
          </select>
        </div>
      </div>

      {/* Feedbacks List */}
      <div className="space-y-4">
        {filteredFeedbacks.length === 0 ? (
          <div className="bg-[#0b1021]/60 border border-white/10 rounded-2xl p-12 text-center">
            <MessageSquare size={48} className="mx-auto text-slate-400 mb-4" />
            <p className="text-slate-400">Chưa có phản hồi nào</p>
          </div>
        ) : (
          filteredFeedbacks.map((feedback) => (
            <div
              key={feedback.id}
              className="bg-[#0b1021]/60 border border-white/10 rounded-2xl p-6 hover:border-cyan-400/40 transition"
            >
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start gap-4 mb-3">
                    <div className="p-3 bg-cyan-500/10 rounded-xl">
                      <MessageSquare size={20} className="text-cyan-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">
                          {feedback.title}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium border ${getTypeColor(feedback.type)}`}
                        >
                          {getTypeLabel(feedback.type)}
                        </span>
                        {getStatusBadge(feedback.status)}
                      </div>
                      <p className="text-sm text-slate-400 mb-3">{feedback.content}</p>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                        <span>
                          <strong className="text-white">{feedback.studentName}</strong> ({feedback.studentId})
                        </span>
                        <span>{feedback.createdAt}</span>
                      </div>
                      {feedback.response && (
                        <div className="mt-4 p-4 bg-cyan-500/5 border border-cyan-400/20 rounded-xl">
                          <p className="text-sm font-medium text-cyan-300 mb-1">Phản hồi:</p>
                          <p className="text-sm text-slate-300">{feedback.response}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 lg:ml-4">
                  <button className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm transition flex items-center gap-2 text-blue-900">
                    <Eye size={16} />
                    Xem chi tiết
                  </button>
                  <ReplyModal feedbackId={feedback.id} onDone={refresh} />
                  {feedback.status !== "resolved" && (
                    <button className="px-4 py-2 bg-green-500/10 hover:bg-green-500/20 border border-green-400/40 text-blue-900 rounded-lg text-sm transition flex items-center gap-2">
                      <CheckCircle2 size={16} />
                      Đánh dấu đã xử lý
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </ManagerLayout>
  );
};

export default ManagerFeedbackPage;

