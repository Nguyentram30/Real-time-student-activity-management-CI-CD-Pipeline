import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Calendar,
  MapPin,
  Users,
  FileText,
  User,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Loader2,
  Download,
  Eye,
} from "lucide-react";
import MainHeader from "@/components/layout/MainHeader";
import { useAuth } from "@/UseAuth/AuthContext";
import api from "@/lib/axios";
import { toast } from "sonner";

interface ActivityDetail {
  _id: string;
  title: string;
  description: string;
  location: string;
  type: string;
  status: string;
  startTime: string;
  endTime: string;
  maxParticipants: number;
  participantCount: number;
  coverImage?: string;
  createdBy?: {
    _id: string;
    displayName: string;
    email: string;
    role: string;
  };
  meta?: {
    tags?: string[];
    responsiblePerson?: string;
    points?: number;
    documentUrl?: string;
  };
  registered?: boolean;
  registrationStatus?: string;
  start_checkin_time?: string;
  end_checkin_time?: string;
  AttendanceTime?: string;
  EvidenceDeadline?: string;
  evidenceUrl?: string;
  evidenceNote?: string;
  evidence?: string;
  isClosed?: boolean;
}

export default function ActivityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();
  const isLoggedIn = Boolean(token);
  const [activity, setActivity] = useState<ActivityDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);

  useEffect(() => {
    if (!id) {
      navigate("/ActivityPage");
      return;
    }

    const fetchActivityDetail = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/activities`);
        const activities = Array.isArray(res.data) ? res.data : [];
        const found = activities.find((act: any) => act.id === id || act._id === id);
        
        if (found) {
          setActivity(found);
          
          // Nếu là Manager hoặc Admin, lấy danh sách đăng ký
          if (isLoggedIn) {
            try {
              const userRes = await api.get("/users/me");
              const user = userRes.data.user;
              if (user.role === "manager" || user.role === "admin") {
                // TODO: Gọi API lấy registrations
                // const regRes = await api.get(`/manager/activities/${id}/registrations`);
                // setRegistrations(regRes.data.registrations || []);
              }
            } catch (err) {
              // Ignore
            }
          }
        } else {
          toast.error("Không tìm thấy hoạt động");
          navigate("/ActivityPage");
        }
      } catch (error: any) {
        console.error("Lỗi tải chi tiết hoạt động:", error);
        toast.error("Không thể tải chi tiết hoạt động");
        navigate("/ActivityPage");
      } finally {
        setLoading(false);
      }
    };

    fetchActivityDetail();
  }, [id, navigate, isLoggedIn]);

  // Hàm refresh activity data
  const refreshActivity = async () => {
    if (!id) return;
    try {
      const res = await api.get(`/activities`);
      const activities = Array.isArray(res.data) ? res.data : [];
      const found = activities.find((act: any) => act.id === id || act._id === id);
      if (found) {
        setActivity(found);
      }
    } catch (error) {
      console.error("Lỗi refresh activity:", error);
    }
  };

  // Hàm đăng ký hoạt động
  const handleRegister = async () => {
    if (!activity || !id) return;
    try {
      setRegisterLoading(true);
      const res = await api.post(`/activities/${id}/register`);
      toast.success(res.data?.message || "Đăng ký thành công");
      await refreshActivity();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Đăng ký thất bại");
    } finally {
      setRegisterLoading(false);
    }
  };

  // Hàm điểm danh GPS
  const handleCheckInGPS = async () => {
    if (!activity || !id) return;
    if (!navigator.geolocation) {
      toast.error("Trình duyệt không hỗ trợ Geolocation.");
      return;
    }
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          setCheckInLoading(true);
          const res = await api.post(`/activities/${id}/checkin/gps`, {
            lat: latitude,
            lng: longitude,
          });
          toast.success(res.data?.message || "Điểm danh thành công (GPS)");
          await refreshActivity();
        } catch (err: any) {
          console.error(err);
          toast.error(err?.response?.data?.message || "Điểm danh GPS thất bại");
        } finally {
          setCheckInLoading(false);
          setGeoLoading(false);
        }
      },
      (err) => {
        console.error("GPS error", err);
        toast.error("Không thể lấy vị trí. Vui lòng cho phép truy cập vị trí.");
        setGeoLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Hàm điểm danh QR
  const handleCheckInQR = async () => {
    if (!activity || !id) return;
    const code = prompt("Nhập mã QR hoặc mã điểm danh:");
    if (!code) return;
    try {
      setCheckInLoading(true);
      const res = await api.post(`/activities/${id}/checkin/qr`, {
        code,
      });
      toast.success(res.data?.message || "Điểm danh QR thành công");
      await refreshActivity();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Điểm danh QR thất bại");
    } finally {
      setCheckInLoading(false);
    }
  };

  // Hàm nộp minh chứng
  const handleUploadEvidence = async () => {
    if (!activity || !id) return;
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".pdf,.doc,.docx,.jpg,.jpeg,.png";
    fileInput.onchange = async (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const evidenceNote = prompt("Nhập mô tả minh chứng của bạn (tùy chọn):") || "";

      try {
        setUploadLoading(true);
        const formData = new FormData();
        formData.append("file", file);
        if (evidenceNote) {
          formData.append("evidenceNote", evidenceNote);
        }

        const uploadRes = await api.post(`/manager/upload`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        const evidenceUrl = uploadRes.data?.fileUrl;
        if (!evidenceUrl) {
          toast.error("Upload file thất bại");
          return;
        }

        await api.post(`/activities/${id}/upload`, {
          evidenceUrl,
          evidenceNote,
        });

        toast.success("Nộp minh chứng thành công");
        await refreshActivity();
      } catch (err: any) {
        console.error(err);
        toast.error(err?.response?.data?.message || "Nộp minh chứng thất bại");
      } finally {
        setUploadLoading(false);
      }
    };
    fileInput.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen w-screen bg-slate-950 text-white font-sans">
        <MainHeader />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
        </div>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="min-h-screen w-screen bg-slate-950 text-white font-sans">
        <MainHeader />
        <div className="pt-32 max-w-7xl mx-auto px-6">
          <p className="text-center text-slate-400">Không tìm thấy hoạt động</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "Chưa xác định";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return new Intl.DateTimeFormat("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; color: string }> = {
      Open: { label: "Đang diễn ra", color: "bg-green-500/20 text-green-300 border-green-400/40" },
      Approved: { label: "Đã phê duyệt", color: "bg-emerald-500/20 text-emerald-300 border-emerald-400/40" },
      ApprovedWithCondition: { label: "Phê duyệt có điều kiện", color: "bg-teal-500/20 text-teal-300 border-teal-400/40" },
      Pending: { label: "Chờ duyệt", color: "bg-amber-500/20 text-amber-300 border-amber-400/40" },
      NeedEdit: { label: "Cần chỉnh sửa", color: "bg-indigo-500/20 text-indigo-300 border-indigo-400/40" },
      Rejected: { label: "Bị từ chối", color: "bg-red-500/20 text-red-300 border-red-400/40" },
      Completed: { label: "Đã kết thúc", color: "bg-slate-500/20 text-slate-300 border-slate-400/40" },
      Cancelled: { label: "Đã hủy", color: "bg-rose-500/20 text-rose-300 border-rose-400/40" },
    };
    const statusInfo = statusMap[status] || { label: status, color: "bg-slate-500/20 text-slate-300 border-slate-400/40" };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusInfo.color}`}>
        {statusInfo.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen w-screen bg-slate-950 text-white font-sans overflow-x-hidden">
      <MainHeader />

      <main className="pt-28 max-w-7xl mx-auto px-6 pb-20">
        {/* Back button */}
        <div className="mb-6">
          <Link
            to="/ActivityPage"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 hover:bg-white/10 transition"
          >
            <ArrowLeft size={18} />
            Quay lại danh sách
          </Link>
        </div>

        {/* Header */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{activity.title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                <span className="flex items-center gap-2">
                  <Calendar size={16} />
                  {formatDate(activity.startTime)} - {formatDate(activity.endTime)}
                </span>
                <span className="flex items-center gap-2">
                  <MapPin size={16} />
                  {activity.location || "Chưa cập nhật"}
                </span>
                <span className="flex items-center gap-2">
                  <Users size={16} />
                  {activity.participantCount || 0} / {activity.maxParticipants || "∞"} người tham gia
                </span>
              </div>
            </div>
            <div>{getStatusBadge(activity.status)}</div>
          </div>

          {/* Cover Image */}
          {activity.coverImage && (
            <div className="mb-6 rounded-xl overflow-hidden">
              <img
                src={activity.coverImage}
                alt={activity.title}
                className="w-full h-64 object-cover"
              />
            </div>
          )}

          {/* Description */}
          {activity.description && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Mô tả</h3>
              <p className="text-slate-300 whitespace-pre-wrap">{activity.description}</p>
            </div>
          )}

          {/* Meta Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Thông tin chi tiết</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <User size={16} className="text-slate-400" />
                  <span className="text-slate-300">Người tạo:</span>
                  <span className="text-white">{activity.createdBy?.displayName || "Hệ thống"}</span>
                </div>
                {activity.meta?.responsiblePerson && (
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-slate-400" />
                    <span className="text-slate-300">Người phụ trách:</span>
                    <span className="text-white">{activity.meta.responsiblePerson}</span>
                  </div>
                )}
                {activity.meta?.points && (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-slate-400" />
                    <span className="text-slate-300">Điểm cộng:</span>
                    <span className="text-white">{activity.meta.points} điểm</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-slate-400" />
                  <span className="text-slate-300">Trạng thái:</span>
                  {getStatusBadge(activity.status)}
                </div>
              </div>
            </div>

            {/* Tags */}
            {activity.meta?.tags && activity.meta.tags.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {activity.meta.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-cyan-500/10 text-cyan-300 border border-cyan-400/30 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Document */}
          {activity.meta?.documentUrl && (
            <div className="mt-6 p-4 bg-cyan-500/10 border border-cyan-400/30 rounded-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText size={20} className="text-cyan-400" />
                  <div>
                    <h4 className="font-semibold text-cyan-300">Tài liệu đính kèm</h4>
                    <p className="text-sm text-slate-400">Tài liệu liên quan đến hoạt động</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <a
                    href={activity.meta.documentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-300 rounded-xl transition flex items-center gap-2"
                  >
                    <Eye size={16} />
                    Xem
                  </a>
                  <a
                    href={activity.meta.documentUrl}
                    download
                    className="px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-300 rounded-xl transition flex items-center gap-2"
                  >
                    <Download size={16} />
                    Tải xuống
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons Section */}
          <div className="mt-6 space-y-4">
            {/* Đăng ký / Trạng thái đăng ký */}
            {!isLoggedIn ? (
              <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                <Link
                  to="/LoginPage"
                  className="w-full inline-flex justify-center items-center py-3 border border-cyan-400 text-cyan-400 hover:bg-cyan-400/10 rounded-lg font-semibold transition"
                >
                  Đăng nhập để đăng ký
                </Link>
              </div>
            ) : activity.isClosed || activity.status === "Completed" ? (
              <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                <button className="w-full py-3 bg-gray-600 rounded-lg cursor-not-allowed" disabled>
                  Hoạt động đã đóng
                </button>
              </div>
            ) : !activity.registered ? (
              <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                <button
                  onClick={handleRegister}
                  disabled={registerLoading}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center justify-center gap-2 text-white font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {registerLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    "Đăng ký tham gia"
                  )}
                </button>
              </div>
            ) : activity.registrationStatus === "pending" ? (
              <div className="p-4 bg-white/5 border border-amber-400/40 rounded-xl">
                <div className="flex items-center gap-2 text-amber-300">
                  <Clock size={16} />
                  <span className="font-semibold">Chờ Manager duyệt</span>
                </div>
              </div>
            ) : activity.registrationStatus === "rejected" ? (
              <div className="p-4 bg-white/5 border border-red-400/40 rounded-xl">
                <div className="flex items-center gap-2 text-red-300">
                  <XCircle size={16} />
                  <span className="font-semibold">Đăng ký bị từ chối</span>
                </div>
              </div>
            ) : activity.registrationStatus === "approved" ? (
              <>
                {/* Nút điểm danh - chỉ hiển thị khi đã được duyệt */}
                <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                  <h3 className="font-semibold mb-4">Điểm danh</h3>
                  {(() => {
                    const now = new Date();
                    const attendanceTime = activity.AttendanceTime ? new Date(activity.AttendanceTime) : null;
                    const startCheckIn = activity.start_checkin_time ? new Date(activity.start_checkin_time) : null;
                    const endCheckIn = activity.end_checkin_time ? new Date(activity.end_checkin_time) : null;

                    // Kiểm tra thời gian điểm danh
                    let canCheckIn = true;
                    let checkInMessage = "";

                    if (startCheckIn && endCheckIn) {
                      if (now < startCheckIn) {
                        canCheckIn = false;
                        checkInMessage = "Chưa tới thời gian điểm danh";
                      } else if (now > endCheckIn) {
                        canCheckIn = false;
                        checkInMessage = "Hết hạn điểm danh";
                      }
                    } else if (attendanceTime) {
                      const activityStart = activity.startTime ? new Date(activity.startTime) : null;
                      if (activityStart && now < activityStart) {
                        canCheckIn = false;
                        checkInMessage = "Chưa tới thời gian điểm danh";
                      }
                    }

                    return (
                      <div className="flex flex-col sm:flex-row gap-3">
                        <button
                          onClick={handleCheckInQR}
                          disabled={!canCheckIn || checkInLoading}
                          className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition ${
                            canCheckIn && !checkInLoading
                              ? "bg-cyan-500 hover:bg-cyan-600 text-white"
                              : "bg-gray-600 text-gray-300 cursor-not-allowed"
                          }`}
                        >
                          {checkInLoading ? (
                            <span className="flex items-center justify-center gap-2">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Đang xử lý...
                            </span>
                          ) : checkInMessage ? (
                            checkInMessage
                          ) : (
                            "Điểm danh QR"
                          )}
                        </button>

                        <button
                          onClick={handleCheckInGPS}
                          disabled={!canCheckIn || checkInLoading || geoLoading}
                          className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition ${
                            canCheckIn && !checkInLoading && !geoLoading
                              ? "bg-cyan-500 hover:bg-cyan-600 text-white"
                              : "bg-gray-600 text-gray-300 cursor-not-allowed"
                          }`}
                        >
                          {geoLoading ? (
                            <span className="flex items-center justify-center gap-2">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Đang lấy vị trí...
                            </span>
                          ) : checkInLoading ? (
                            <span className="flex items-center justify-center gap-2">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Đang xử lý...
                            </span>
                          ) : checkInMessage ? (
                            checkInMessage
                          ) : (
                            "Điểm danh GPS"
                          )}
                        </button>
                      </div>
                    );
                  })()}
                </div>

                {/* Nộp minh chứng */}
                {activity.registrationStatus === "approved" && (!activity.evidence && !activity.evidenceUrl && !activity.evidenceNote) && (
                  <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                    {(() => {
                      const now = new Date();
                      const evidenceDeadline = activity.EvidenceDeadline ? new Date(activity.EvidenceDeadline) : null;
                      const canUpload = !evidenceDeadline || now <= evidenceDeadline;

                      return canUpload ? (
                        <button
                          onClick={handleUploadEvidence}
                          disabled={uploadLoading}
                          className="w-full py-3 bg-yellow-500 hover:bg-yellow-600 rounded-lg flex items-center justify-center gap-2 text-white font-semibold transition disabled:opacity-50"
                        >
                          {uploadLoading ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Đang xử lý...
                            </>
                          ) : (
                            "Nộp minh chứng"
                          )}
                        </button>
                      ) : (
                        <div className="w-full py-3 bg-gray-500/20 border border-gray-400/40 text-gray-300 rounded-lg flex items-center justify-center gap-2 font-semibold">
                          Hết hạn nộp minh chứng
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* Hiển thị minh chứng đã nộp */}
                {(activity.evidence || activity.evidenceUrl || activity.evidenceNote) && (
                  <div className="p-4 bg-white/5 border border-cyan-400/40 rounded-xl">
                    <div className="flex items-center gap-2 text-cyan-300">
                      <CheckCircle2 size={16} />
                      <span className="font-semibold">Minh chứng đã nộp</span>
                    </div>
                    {activity.evidenceNote && (
                      <p className="text-sm text-slate-300 mt-2">{activity.evidenceNote}</p>
                    )}
                    {activity.evidenceUrl && (
                      <a
                        href={activity.evidenceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-cyan-400 hover:underline mt-2 inline-block"
                      >
                        Xem file minh chứng
                      </a>
                    )}
                  </div>
                )}

                {/* Trạng thái đăng ký */}
                <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                  <div className="flex items-center gap-2 text-green-300">
                    <CheckCircle2 size={16} />
                    <span className="font-semibold">Đã được duyệt</span>
                  </div>
                </div>
              </>
            ) : null}
          </div>

          {/* Registered Students List (for Manager/Admin) */}
          {registrations.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4">Danh sách sinh viên đã đăng ký</h3>
              <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-white/5 border-b border-white/10">
                    <tr>
                      <th className="py-3 px-4 text-left">Họ tên</th>
                      <th className="py-3 px-4 text-left">Email</th>
                      <th className="py-3 px-4 text-left">Trạng thái</th>
                      <th className="py-3 px-4 text-left">Ngày đăng ký</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registrations.map((reg: any) => (
                      <tr key={reg._id} className="border-b border-white/5 last:border-none">
                        <td className="py-3 px-4">{reg.user?.displayName || "N/A"}</td>
                        <td className="py-3 px-4 text-slate-400">{reg.user?.email || "N/A"}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              reg.status === "approved"
                                ? "bg-green-500/20 text-green-300"
                                : reg.status === "rejected"
                                ? "bg-red-500/20 text-red-300"
                                : "bg-amber-500/20 text-amber-300"
                            }`}
                          >
                            {reg.status === "approved"
                              ? "Đã duyệt"
                              : reg.status === "rejected"
                              ? "Từ chối"
                              : "Chờ duyệt"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-400 text-xs">
                          {reg.registeredAt
                            ? new Date(reg.registeredAt).toLocaleDateString("vi-VN")
                            : "N/A"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

