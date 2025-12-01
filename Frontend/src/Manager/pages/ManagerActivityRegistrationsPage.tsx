import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ManagerLayout from "../components/ManagerLayout";
import { managerService } from "@/services/managerService";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle2, XCircle, Clock, Loader2, User, Mail, GraduationCap, QrCode, Copy } from "lucide-react";

const ManagerActivityRegistrationsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchRegistrations();
    fetchQRCode();
  }, [id]);

  const fetchQRCode = async () => {
    if (!id) return;
    try {
      const data = await managerService.getActivityQRCode(id);
      if (data.qrCodeRecord) {
        setQrCode(data.qrCodeRecord.qrCode);
      }
    } catch (error: any) {
      // QR code chưa được tạo, không hiển thị lỗi
      setQrCode(null);
    }
  };

  const handleCreateQRCode = async () => {
    if (!id) return;
    try {
      setQrLoading(true);
      const data = await managerService.createActivityQRCode(id);
      setQrCode(data.qrCode);
      setShowQrModal(true);
      toast.success("Tạo mã QR thành công!");
    } catch (error: any) {
      console.error("Lỗi tạo mã QR:", error);
      const errorMessage = error?.response?.data?.message || error?.message || "Không thể tạo mã QR";
      toast.error(errorMessage);
    } finally {
      setQrLoading(false);
    }
  };

  const handleCopyQRCode = () => {
    if (qrCode) {
      navigator.clipboard.writeText(qrCode);
      toast.success("Đã sao chép mã QR!");
    }
  };

  const fetchRegistrations = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await managerService.getActivityRegistrations(id);
      setRegistrations(data);
    } catch (error: any) {
      console.error("Lỗi tải danh sách đăng ký:", error);
      const errorMessage = error?.response?.data?.message || error?.message || "Không thể tải danh sách đăng ký";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (registrationId: string) => {
    if (!id) return;
    try {
      setProcessingId(registrationId);
      await managerService.approveRegistration(id, registrationId);
      toast.success("Đã duyệt đăng ký");
      await fetchRegistrations();
    } catch (error: any) {
      console.error("Lỗi duyệt đăng ký:", error);
      const errorMessage = error?.response?.data?.message || error?.message || "Không thể duyệt đăng ký";
      toast.error(errorMessage);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (registrationId: string) => {
    if (!id) return;
    const reason = prompt("Nhập lý do từ chối:");
    if (!reason) return;

    try {
      setProcessingId(registrationId);
      await managerService.rejectRegistration(id, registrationId, reason);
      toast.success("Đã từ chối đăng ký");
      await fetchRegistrations();
    } catch (error: any) {
      console.error("Lỗi từ chối đăng ký:", error);
      const errorMessage = error?.response?.data?.message || error?.message || "Không thể từ chối đăng ký";
      toast.error(errorMessage);
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { style: string; label: string; icon: any }> = {
      pending: {
        style: "bg-amber-500/20 text-amber-300 border-amber-400/40",
        label: "Chờ duyệt",
        icon: Clock,
      },
      approved: {
        style: "bg-green-500/20 text-green-300 border-green-400/40",
        label: "Đã duyệt",
        icon: CheckCircle2,
      },
      rejected: {
        style: "bg-red-500/20 text-red-300 border-red-400/40",
        label: "Từ chối",
        icon: XCircle,
      },
      checked_in: {
        style: "bg-blue-500/20 text-blue-300 border-blue-400/40",
        label: "Đã điểm danh",
        icon: CheckCircle2,
      },
      completed: {
        style: "bg-purple-500/20 text-purple-300 border-purple-400/40",
        label: "Hoàn thành",
        icon: CheckCircle2,
      },
    };

    const statusInfo = statusMap[status] || {
      style: "bg-slate-500/20 text-slate-300 border-slate-400/40",
      label: status,
      icon: Clock,
    };

    const Icon = statusInfo.icon;

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${statusInfo.style}`}>
        <Icon size={12} />
        {statusInfo.label}
      </span>
    );
  };

  const pendingRegistrations = registrations.filter((r) => r.status === "pending");
  const approvedRegistrations = registrations.filter((r) => r.status === "approved" || r.status === "checked_in" || r.status === "completed");
  const rejectedRegistrations = registrations.filter((r) => r.status === "rejected");

  return (
    <ManagerLayout
      title="Quản lý đăng ký hoạt động"
      subtitle="Duyệt và quản lý đăng ký của sinh viên"
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
        ) : (
          <div className="space-y-6">
            {/* QR Code Section */}
            <div className="bg-[#0b1021]/60 border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <QrCode size={20} className="text-cyan-400" />
                  Mã QR điểm danh
                </h3>
                {qrCode ? (
                  <button
                    onClick={() => setShowQrModal(true)}
                    className="px-4 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 rounded-lg text-sm transition flex items-center gap-2"
                  >
                    <QrCode size={16} />
                    Xem mã QR
                  </button>
                ) : (
                  <button
                    onClick={handleCreateQRCode}
                    disabled={qrLoading}
                    className="px-4 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 rounded-lg text-sm transition flex items-center gap-2 disabled:opacity-50"
                  >
                    {qrLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Đang tạo...
                      </>
                    ) : (
                      <>
                        <QrCode size={16} />
                        Tạo mã QR
                      </>
                    )}
                  </button>
                )}
              </div>
              {qrCode ? (
                <p className="text-sm text-slate-400">
                  Mã QR đã được tạo. Sinh viên có thể sử dụng mã này để điểm danh trong thời gian cho phép.
                </p>
              ) : (
                <p className="text-sm text-slate-400">
                  Chưa có mã QR. Tạo mã QR để sinh viên có thể điểm danh bằng QR code.
                </p>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#0b1021]/60 border border-white/10 rounded-2xl p-4">
                <div className="text-2xl font-bold text-amber-300">{pendingRegistrations.length}</div>
                <div className="text-sm text-slate-400">Chờ duyệt</div>
              </div>
              <div className="bg-[#0b1021]/60 border border-white/10 rounded-2xl p-4">
                <div className="text-2xl font-bold text-green-300">{approvedRegistrations.length}</div>
                <div className="text-sm text-slate-400">Đã duyệt</div>
              </div>
              <div className="bg-[#0b1021]/60 border border-white/10 rounded-2xl p-4">
                <div className="text-2xl font-bold text-red-300">{rejectedRegistrations.length}</div>
                <div className="text-sm text-slate-400">Từ chối</div>
              </div>
            </div>

            {/* Pending Registrations */}
            {pendingRegistrations.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Đăng ký chờ duyệt</h3>
                <div className="space-y-4">
                  {pendingRegistrations.map((registration) => (
                    <div
                      key={registration._id}
                      className="bg-[#0b1021]/60 border border-amber-400/30 rounded-2xl p-6"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-start gap-4 mb-3">
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
                                {registration.user?.class && (
                                  <div>Lớp: {registration.user.class}</div>
                                )}
                              </div>
                            </div>
                          </div>
                          {getStatusBadge(registration.status)}
                          {registration.note && (
                            <p className="mt-3 text-sm text-slate-300">Ghi chú: {registration.note}</p>
                          )}
                        </div>

                        <div className="flex gap-2 lg:ml-4">
                          <button
                            onClick={() => handleApprove(registration._id)}
                            disabled={processingId === registration._id}
                            className="px-4 py-2 bg-green-500/10 hover:bg-green-500/20 border border-green-400/40 text-green-300 rounded-lg text-sm transition flex items-center gap-2 disabled:opacity-50"
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
                            onClick={() => handleReject(registration._id)}
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
              </div>
            )}

            {/* All Registrations */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Tất cả đăng ký ({registrations.length})</h3>
              {registrations.length === 0 ? (
                <div className="bg-[#0b1021]/60 border border-white/10 rounded-2xl p-12 text-center">
                  <p className="text-slate-400">Chưa có đăng ký nào</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {registrations.map((registration) => (
                    <div
                      key={registration._id}
                      className="bg-[#0b1021]/60 border border-white/10 rounded-xl p-4 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-cyan-500/10 rounded-lg">
                          <User size={16} className="text-cyan-400" />
                        </div>
                        <div>
                          <div className="font-medium text-white">
                            {registration.user?.displayName || "Không có tên"}
                          </div>
                          <div className="text-xs text-slate-400">
                            {registration.user?.email || "N/A"} • {registration.user?.studentCode || "N/A"}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {getStatusBadge(registration.status)}
                        <div className="text-xs text-slate-400">
                          {new Date(registration.registeredAt).toLocaleDateString("vi-VN")}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* QR Code Modal */}
        {showQrModal && qrCode && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-[#0b1021] border border-white/10 rounded-2xl p-6 max-w-md w-full mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white">Mã QR điểm danh</h3>
                <button
                  onClick={() => setShowQrModal(false)}
                  className="p-2 rounded-lg hover:bg-white/10 transition"
                >
                  <XCircle size={20} className="text-slate-400" />
                </button>
              </div>
              <div className="bg-white p-6 rounded-xl mb-4 flex items-center justify-center">
                <div className="text-center">
                  <QrCode size={120} className="text-slate-900 mx-auto mb-4" />
                  <p className="text-xs text-slate-500 mb-2">Mã QR Code</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                  <p className="text-xs text-slate-400 mb-1">Mã QR:</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-sm font-mono text-cyan-300 break-all">{qrCode}</code>
                    <button
                      onClick={handleCopyQRCode}
                      className="p-2 rounded-lg hover:bg-white/10 transition flex-shrink-0"
                      title="Sao chép"
                    >
                      <Copy size={16} className="text-slate-400" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-slate-400">
                  Gửi mã QR này cho sinh viên để họ có thể điểm danh. Mã QR chỉ có hiệu lực trong thời gian điểm danh đã được thiết lập.
                </p>
                <button
                  onClick={() => setShowQrModal(false)}
                  className="w-full px-4 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 rounded-lg text-sm transition"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ManagerLayout>
  );
};

export default ManagerActivityRegistrationsPage;

