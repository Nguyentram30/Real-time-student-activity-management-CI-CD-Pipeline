import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ManagerLayout from "../components/ManagerLayout";
import { managerService } from "@/services/managerService";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle2, XCircle, Loader2, User, Mail, GraduationCap, FileText, Download, Eye } from "lucide-react";
import api from "@/lib/axios";

const ManagerEvidenceApprovalPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetchRegistrations();
  }, [id]);

  const fetchRegistrations = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await managerService.getActivityRegistrations(id);
      // Filter only students who have checked in and uploaded evidence
      const withEvidence = data.filter(
        (r: any) => 
          (r.status === "checked_in" || r.status === "completed") && 
          (r.evidenceUrl || r.evidenceNote)
      );
      setRegistrations(withEvidence);
    } catch (error: any) {
      console.error("Lỗi tải danh sách:", error);
      const errorMessage = error?.response?.data?.message || error?.message || "Không thể tải danh sách";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveEvidence = async (registrationId: string) => {
    if (!id) return;
    try {
      setProcessingId(registrationId);
      await api.post(`/manager/activities/${id}/registrations/${registrationId}/approve-evidence`);
      toast.success("Đã duyệt minh chứng");
      await fetchRegistrations();
    } catch (error: any) {
      console.error("Lỗi duyệt minh chứng:", error);
      const errorMessage = error?.response?.data?.message || error?.message || "Không thể duyệt minh chứng";
      toast.error(errorMessage);
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectEvidence = async (registrationId: string) => {
    if (!id) return;
    const reason = prompt("Nhập lý do từ chối (yêu cầu upload lại):");
    if (!reason) return;

    try {
      setProcessingId(registrationId);
      await api.post(`/manager/activities/${id}/registrations/${registrationId}/reject-evidence`, { reason });
      toast.success("Đã từ chối minh chứng");
      await fetchRegistrations();
    } catch (error: any) {
      console.error("Lỗi từ chối minh chứng:", error);
      const errorMessage = error?.response?.data?.message || error?.message || "Không thể từ chối minh chứng";
      toast.error(errorMessage);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <ManagerLayout
      title="Duyệt minh chứng hoàn thành"
      subtitle="Kiểm tra và duyệt minh chứng của sinh viên đã điểm danh"
    >
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate("/manager/activities")}
          className="mb-6 flex items-center gap-2 text-slate-400 hover:text-white transition"
        >
          <ArrowLeft size={18} />
          Quay lại danh sách hoạt động
        </button>

        {loading ? (
          <div className="bg-[#0b1021]/60 border border-white/10 rounded-2xl p-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-cyan-400 mx-auto mb-4" />
            <p className="text-slate-400">Đang tải...</p>
          </div>
        ) : registrations.length === 0 ? (
          <div className="bg-[#0b1021]/60 border border-white/10 rounded-2xl p-12 text-center">
            <FileText size={48} className="mx-auto text-slate-400 mb-4" />
            <p className="text-slate-400">Chưa có sinh viên nào nộp minh chứng</p>
          </div>
        ) : (
          <div className="space-y-4">
            {registrations.map((registration) => (
              <div
                key={registration._id}
                className="bg-[#0b1021]/60 border border-white/10 rounded-2xl p-6"
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="p-3 bg-cyan-500/10 rounded-xl">
                        <User size={20} className="text-cyan-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-white mb-2">
                          {registration.user?.displayName || "Không có tên"}
                        </h4>
                        <div className="space-y-2 text-sm text-slate-400">
                          <div className="flex items-center gap-2">
                            <Mail size={14} />
                            {registration.user?.email || "N/A"}
                          </div>
                          <div className="flex items-center gap-2">
                            <GraduationCap size={14} />
                            MSSV: {registration.user?.studentCode || registration.user?.username || "N/A"}
                          </div>
                          {registration.user?.department && (
                            <div>Khoa: {registration.user.department}</div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Evidence Display */}
                    <div className="ml-14 space-y-3">
                      {registration.evidenceUrl && (
                        <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                          <div className="flex items-center gap-2 mb-2">
                            <FileText size={16} className="text-cyan-400" />
                            <span className="text-sm font-medium text-white">File minh chứng:</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <a
                              href={registration.evidenceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 px-3 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 rounded-lg text-sm transition"
                            >
                              <Eye size={14} />
                              Xem file
                            </a>
                            <a
                              href={registration.evidenceUrl}
                              download
                              className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg text-sm transition"
                            >
                              <Download size={14} />
                              Tải xuống
                            </a>
                          </div>
                        </div>
                      )}

                      {registration.evidenceNote && (
                        <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                          <div className="flex items-center gap-2 mb-2">
                            <FileText size={16} className="text-cyan-400" />
                            <span className="text-sm font-medium text-white">Ghi chú minh chứng:</span>
                          </div>
                          <p className="text-sm text-slate-300">{registration.evidenceNote}</p>
                        </div>
                      )}

                      {!registration.evidenceUrl && !registration.evidenceNote && (
                        <div className="p-4 bg-amber-500/10 rounded-xl border border-amber-400/30">
                          <p className="text-sm text-amber-300">Chưa có minh chứng</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 lg:ml-4">
                    <button
                      onClick={() => handleApproveEvidence(registration._id)}
                      disabled={processingId === registration._id || registration.status === "completed"}
                      className="px-4 py-2 bg-green-500/10 hover:bg-green-500/20 border border-green-400/40 text-green-300 rounded-lg text-sm transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processingId === registration._id ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Đang xử lý...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 size={16} />
                          Duyệt
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleRejectEvidence(registration._id)}
                      disabled={processingId === registration._id}
                      className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-400/40 text-red-300 rounded-lg text-sm transition flex items-center gap-2 disabled:opacity-50"
                    >
                      <XCircle size={16} />
                      Từ chối
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ManagerLayout>
  );
};

export default ManagerEvidenceApprovalPage;

