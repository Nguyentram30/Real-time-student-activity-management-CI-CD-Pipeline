// src/pages/ActivityPage.jsx
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  MapPin,
  CheckCircle,
  Clock,
  XCircle,
  FileCheck,
  Loader2,
} from "lucide-react";
import { Link } from "react-router-dom";
import api from "../lib/axios";
import MainHeader from "@/components/layout/MainHeader";
import { useAuth } from "@/UseAuth/AuthContext";
import { toast } from "sonner";

// NOTE: sample local image present in container - used as fallback image url
const LOCAL_FALLBACK_IMAGE = "/mnt/data/b16809a1-7a24-41c7-9379-ab3044da213f.png";

  interface Activity {
  _id?: string;
  id?: number | string;
  title: string;
  date: string;
  location: string;
  status: string;
  image: string;
  evidence?: string;
  evidenceUrl?: string;
  evidenceNote?: string;
  registrationStatus?: string;
  category?: string;
  description?: string;
  participantsCount?: number;
  participants?: any[];
  isClosed?: boolean;
  registered?: boolean;
  tags?: string[];
  startTime?: string;
  EvidenceDeadline?: string;
  AttendanceTime?: string;
  start_checkin_time?: string;
  end_checkin_time?: string;
}

const tagStyles: Record<string, string> = {
  "Thể thao": "bg-blue-500/20 text-blue-300",
  "Tình nguyện": "bg-green-500/20 text-green-300",
  "Hội thảo": "bg-purple-500/20 text-purple-300",
  "Văn hóa": "bg-pink-500/20 text-pink-300",
  "Giải trí": "bg-yellow-500/20 text-yellow-300",
};

const formatDate = (value?: string) => {
  if (!value) return "Chưa xác định";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("vi-VN");
};

export default function ActivityPage() {
  const [scrollWidth, setScrollWidth] = useState(0);
  const { token } = useAuth();
  const isLoggedIn = Boolean(token);

  const [activityData, setActivityData] = useState<Activity[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);

  // GPS checkin state
  const [geoLoadingId, setGeoLoadingId] = useState<string | number | null>(null);

  // generic loading map by id for optimistic UI
  const [loadingMap, setLoadingMap] = useState<Record<string | number, boolean>>({});

  // ---------------------------------------
  // Scroll progress bar (for header glow)
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.body.scrollHeight - window.innerHeight;
      const progress = totalHeight > 0 ? (window.scrollY / totalHeight) * 100 : 0;
      setScrollWidth(progress);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ---------------------------------------
  // fetch activities from API (initial + refresh)
  const fetchActivities = async () => {
    try {
      setLoadingActivities(true);
      const res = await api.get("/activities");
      // Kiểm tra response format
      let activities = [];
      if (Array.isArray(res.data)) {
        activities = res.data;
      } else if (res.data?.activities && Array.isArray(res.data.activities)) {
        // Nếu backend trả về { activities: [...] }
        activities = res.data.activities;
      } else {
        console.warn("API trả về format không hợp lệ:", res.data);
        setActivityData([]);
        toast.error("Dữ liệu hoạt động không đúng định dạng");
        return;
      }

      // Lọc bỏ các hoạt động đã đăng ký (nếu user đã đăng nhập)
      if (isLoggedIn) {
        activities = activities.filter((act: Activity) => {
          // Chỉ hiển thị hoạt động chưa đăng ký hoặc chưa bị từ chối
          return !act.registered || act.registrationStatus === "rejected";
        });
      }

      setActivityData(activities);
    } catch (err: any) {
      console.error("Lỗi tải hoạt động:", err);
      const errorMessage = err?.response?.data?.message || err?.message || "Không thể tải danh sách hoạt động";
      toast.error(errorMessage);
      setActivityData([]);
    } finally {
      setLoadingActivities(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  // ---------------------------------------
  // REGISTER: đăng ký tham gia
  const handleRegister = async (activity: Activity) => {
    if (!activity) return;
    const id = activity._id ?? activity.id;
    if (!id) return; // Safety check
    try {
      setLoadingMap((m) => ({ ...m, [id]: true }));
      const res = await api.post(`/activities/${id}/register`);
      toast.success(res.data?.message || "Đăng ký thành công");
      await fetchActivities();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Đăng ký thất bại");
    } finally {
      setLoadingMap((m) => ({ ...m, [id]: false }));
    }
  };

  // ---------------------------------------
  // CHECKIN - GPS: gửi tọa độ tới server
  const handleCheckInGPS = async (activity: Activity) => {
    if (!navigator.geolocation) {
      toast.error("Trình duyệt không hỗ trợ Geolocation.");
      return;
    }
    const id = activity._id ?? activity.id;
    if (!id) return;
    setGeoLoadingId(id);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          setLoadingMap((m) => ({ ...m, [id]: true }));
          const res = await api.post(`/activities/${id}/checkin/gps`, {
            lat: latitude,
            lng: longitude,
          });
          toast.success(res.data?.message || "Điểm danh thành công (GPS)");
          await fetchActivities();
        } catch (err: any) {
          console.error(err);
          toast.error(err?.response?.data?.message || "Điểm danh GPS thất bại");
        } finally {
          setLoadingMap((m) => ({ ...m, [id]: false }));
          setGeoLoadingId(null);
        }
      },
      (err) => {
        console.error("GPS error", err);
        toast.error("Không thể lấy vị trí. Vui lòng cho phép truy cập vị trí.");
        setGeoLoadingId(null);
        setLoadingMap((m) => ({ ...m, [id]: false }));
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // ---------------------------------------
  const handleCheckInQR = async (activity: Activity) => {
    const id = activity._id ?? activity.id;
    if (!id) return;
    const code = prompt("Nhập mã QR hoặc mã điểm danh:");
    if (!code) return;
    try {
      setLoadingMap((m) => ({ ...m, [id]: true }));
      const res = await api.post(`/activities/${id}/checkin/qr`, {
        code,
      });
      toast.success(res.data?.message || "Điểm danh QR thành công");
      await fetchActivities();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Điểm danh QR thất bại");
    } finally {
      setLoadingMap((m) => ({ ...m, [id]: false }));
    }
  };

  // ---------------------------------------
  const handleUpload = async (activity: Activity) => {
    const id = activity._id ?? activity.id;
    if (!id) return;
    
    // Tạo input file ẩn để chọn file
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.txt";
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const evidenceNote = prompt("Nhập mô tả minh chứng của bạn (tùy chọn):") || "";
      
      try {
        setLoadingMap((m) => ({ ...m, [id]: true }));
        const formData = new FormData();
        formData.append("file", file);
        if (evidenceNote) {
          formData.append("evidenceNote", evidenceNote);
        }

        const res = await api.post(`/activities/${id}/upload`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success(res.data?.message || "Gửi minh chứng thành công!");
        await fetchActivities();
      } catch (err: any) {
        console.error("Lỗi upload:", err);
        const errorMessage = err?.response?.data?.message || err?.message || "Upload thất bại!";
        toast.error(errorMessage);
      } finally {
        setLoadingMap((m) => ({ ...m, [id]: false }));
      }
    };
    input.click();
  };

  // ---------------------------------------
  // helper: readable status for UI (optional)
  const readableStatus = (s: string) => {
    if (!s) return "Sắp diễn ra";
    return s;
  };

  // close any modal when click on overlay


  // ---------------------------------------
  return (
    <div className="min-h-screen w-screen bg-slate-950 text-white font-sans overflow-x-hidden">

      {/* BACKGROUND EFFECT */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-[#071025] to-[#04030a] opacity-95"></div>
        <div className="absolute inset-0">
          <div className="animate-[float_8s_ease-in-out_infinite] opacity-30">
            <img
              src={LOCAL_FALLBACK_IMAGE}
              className="w-[220px] absolute left-6 top-56 mix-blend-screen opacity-40"
              alt="decor"
            />
          </div>
        </div>
      </div>

      <MainHeader />
      <div
        className="fixed top-20 left-0 right-0 h-[4px] rounded-full shadow-[0_0_12px_rgba(0,255,255,0.6)] z-30"
        style={{
          width: `${scrollWidth}%`,
          background: "linear-gradient(90deg, #00f2ff, #38bdf8, #3b82f6)",
        }}
      />
      {/* MAIN */}
      <main className="pt-32 max-w-7xl mx-auto px-6 pb-20">
        <h1 className="text-4xl font-bold">Hoạt động của bạn</h1>
        <p className="text-gray-300 mt-1">Xem hoạt động, đăng ký, điểm danh và nộp minh chứng.</p>

        {/* GRID HOẠT ĐỘNG */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mt-12">
          {loadingActivities && (
            <div className="col-span-full flex justify-center py-12">
              <Loader2 className="w-10 h-10 animate-spin text-cyan-400" />
            </div>
          )}
          {!loadingActivities && activityData.length === 0 && (
            <div className="col-span-full text-center text-slate-400 py-10">
              Chưa có hoạt động nào. Hãy quay lại sau nhé!
            </div>
          )}
          {!loadingActivities &&
            activityData.map((act, idx) => {
              const id = act._id ?? act.id ?? idx;
              const isLoading = !!loadingMap[id];

              const title = act.title || (act as any).name || "Hoạt động";
              return (
                <div
                  key={id}
                  className="bg-white/8 backdrop-blur-md text-white rounded-2xl shadow-lg hover:shadow-xl transition overflow-hidden border border-white/6"
                >
                  {/* IMAGE */}
                  <div className="h-44 w-full overflow-hidden">
                    <img
                      src={act.image || LOCAL_FALLBACK_IMAGE}
                      className="w-full h-full object-cover hover:scale-105 transition"
                      alt={act.title || "activity"}
                    />
                  </div>

                  <div className="p-5">
                    {/* Click to view detail */}
                    <Link
                      to={`/activities/${id}`}
                      className="block mb-3"
                    >
                      <h2 className="text-xl font-semibold hover:text-cyan-400 transition cursor-pointer">
                        {title}
                      </h2>
                    </Link>

                    {/* CATEGORY + STATUS */}
                    <div className="flex items-center justify-between mb-3">
                      {/* Category */}
                      {act.category && (
                        <span className="px-3 py-1 text-xs rounded-full bg-blue-500/20 text-blue-300 font-medium">
                          {act.category}
                        </span>
                      )}

                      {/* Status */}
                      <div className="text-right text-sm">
                        {act.status === "Chờ duyệt" && (
                          <span className="px-3 py-1 bg-yellow-200/20 text-yellow-300 rounded-full flex items-center gap-2">
                            <Clock size={14} /> Chờ duyệt
                          </span>
                        )}
                        {act.status === "Đã duyệt" && (
                          <span className="px-3 py-1 bg-green-200/20 text-green-300 rounded-full flex items-center gap-2">
                            <CheckCircle size={14} /> Đã duyệt
                          </span>
                        )}
                        {act.status === "Từ chối" && (
                          <span className="px-3 py-1 bg-red-200/20 text-red-300 rounded-full flex items-center gap-2">
                            <XCircle size={14} /> Từ chối
                          </span>
                        )}
                        {!act.status && (
                          <span className="px-3 py-1 bg-gray-600/40 text-gray-200 rounded-full">
                            Sắp diễn ra
                          </span>
                        )}
                      </div>
                    </div>

                    {/* TITLE + INFO */}
                    <h2 className="text-xl font-semibold">{title}</h2>

                    <p className="mt-2 flex items-center gap-2 text-gray-300">
                      <Calendar size={18} /> {formatDate(act.date)}
                    </p>

                    <p className="mt-1 flex items-center gap-2 text-gray-300">
                      <MapPin size={18} /> {act.location || "Đang cập nhật"}
                    </p>

                    {/* TAGS */}
                    {act.tags && act.tags.length > 0 && (
                      <div className="flex gap-2 flex-wrap mt-4">
                        {act.tags.map((tag: string) => (
                          <span
                            key={tag}
                            className={`px-3 py-1 text-xs font-medium rounded-full ${tagStyles[tag] || "bg-gray-500"}`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* DESCRIPTION */}
                    {act.description && (
                      <p className="text-slate-300 mt-4 text-sm">{act.description}</p>
                    )}

                    {/* FOOTER ACTIONS */}
                    <div className="mt-6 bg-white/6 rounded-xl px-4 py-4 flex flex-col gap-4">

                      {/* --- THÀNH VIÊN --- */}
                      <div className="flex items-center gap-2 text-sm text-slate-200 justify-start">
                        <span className="text-slate-300">👥</span>
                        <span>{act.participantsCount ?? (act.participants?.length ?? 0)} thành viên</span>
                      </div>

                      {/* --- CHECK-IN BUTTONS --- */}
                      {/* Chỉ hiển thị nút điểm danh nếu đã đăng ký và được Manager duyệt */}
                      {isLoggedIn && act.registered && act.registrationStatus === "approved" && (
                        <div className="flex items-center justify-between gap-2 sm:gap-4 flex-wrap sm:flex-nowrap">
                          {(() => {
                            const now = new Date();
                            const attendanceTime = act.AttendanceTime ? new Date(act.AttendanceTime) : null;
                            const startCheckIn = act.start_checkin_time ? new Date(act.start_checkin_time) : null;
                            const endCheckIn = act.end_checkin_time ? new Date(act.end_checkin_time) : null;
                            
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
                              // Nếu chỉ có AttendanceTime, kiểm tra xem có trong thời gian không
                              const activityStart = act.startTime ? new Date(act.startTime) : null;
                              if (activityStart && now < activityStart) {
                                canCheckIn = false;
                                checkInMessage = "Chưa tới thời gian điểm danh";
                              }
                            }
                            
                            return (
                              <>
                                <button
                                  onClick={() => canCheckIn && handleCheckInQR(act)}
                                  disabled={!canCheckIn || isLoading}
                                  className={`flex-1 min-w-[120px] px-3 py-2.5 sm:py-3 rounded-lg text-xs sm:text-sm transition ${
                                    canCheckIn && !isLoading
                                      ? "bg-slate-800/40 hover:bg-slate-800/60 text-white"
                                      : "bg-slate-800/20 text-slate-500 cursor-not-allowed"
                                  }`}
                                >
                                  {isLoading ? (
                                    <span className="flex items-center justify-center gap-1">
                                      <Loader2 className="w-3 h-3 animate-spin" />
                                      <span className="hidden sm:inline">Đang xử lý...</span>
                                    </span>
                                  ) : checkInMessage ? (
                                    checkInMessage
                                  ) : (
                                    "Check-in QR"
                                  )}
                                </button>

                                <button
                                  onClick={() => canCheckIn && handleCheckInGPS(act)}
                                  disabled={!canCheckIn || isLoading || geoLoadingId === id}
                                  className={`flex-1 min-w-[120px] px-3 py-2.5 sm:py-3 rounded-lg text-xs sm:text-sm transition ${
                                    canCheckIn && !isLoading && geoLoadingId !== id
                                      ? "bg-slate-800/40 hover:bg-slate-800/60 text-white"
                                      : "bg-slate-800/20 text-slate-500 cursor-not-allowed"
                                  }`}
                                >
                                  {geoLoadingId === id ? (
                                    <span className="flex items-center justify-center gap-1">
                                      <Loader2 className="w-3 h-3 animate-spin" />
                                      <span className="hidden sm:inline">Đang lấy vị trí...</span>
                                    </span>
                                  ) : checkInMessage ? (
                                    checkInMessage
                                  ) : (
                                    "Check-in GPS"
                                  )}
                                </button>
                              </>
                            );
                          })()}
                        </div>
                      )}

                      {/* --- BUTTON ĐĂNG KÝ / MINH CHỨNG --- */}
                      <div className="w-full">
                        {!isLoggedIn ? (
                          <Link
                            to="/LoginPage"
                            className="w-full inline-flex justify-center items-center py-3 border border-cyan-400 text-cyan-400 hover:bg-cyan-400/10 rounded-lg font-semibold transition"
                          >
                            Đăng nhập để đăng ký
                          </Link>
                        ) : act.isClosed || act.status === "Completed" ? (
                          <button className="w-full py-3 bg-gray-600 rounded-lg cursor-not-allowed" disabled>
                            Hoạt động đã đóng
                          </button>
                        ) : !act.registered ? (
                          <button
                            onClick={() => handleRegister(act)}
                            className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center justify-center gap-2 text-white font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isLoading}
                          >
                            {isLoading ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Đang xử lý...
                              </>
                            ) : (
                              "Đăng ký tham gia"
                            )}
                          </button>
                        ) : act.registrationStatus === "pending" ? (
                          <div className="w-full py-3 bg-amber-500/20 border border-amber-400/40 text-amber-300 rounded-lg flex items-center justify-center gap-2 font-semibold">
                            <Clock size={16} />
                            Chờ Manager duyệt
                          </div>
                        ) : act.registrationStatus === "rejected" ? (
                          <div className="w-full py-3 bg-red-500/20 border border-red-400/40 text-red-300 rounded-lg flex items-center justify-center gap-2 font-semibold">
                            <XCircle size={16} />
                            Đăng ký bị từ chối
                          </div>
                        ) : act.registrationStatus === "approved" && (!act.evidence && !act.evidenceUrl && !act.evidenceNote) ? (
                          (() => {
                            const now = new Date();
                            const evidenceDeadline = act.EvidenceDeadline ? new Date(act.EvidenceDeadline) : null;
                            const canUpload = !evidenceDeadline || now <= evidenceDeadline;
                            
                            return canUpload ? (
                              <button
                                onClick={() => handleUpload(act)}
                                className="w-full py-3 bg-yellow-500 hover:bg-yellow-600 rounded-lg flex items-center justify-center gap-2 text-white font-semibold transition"
                                disabled={isLoading}
                              >
                                {isLoading ? (
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
                          })()
                        ) : (
                          <div className="flex flex-col gap-2">
                            <div className="px-4 py-3 border border-cyan-400 text-cyan-400 hover:bg-cyan-400/10 rounded-xl transition flex items-center gap-2">
                              <FileCheck size={16} />
                              <span className="text-sm">
                                Minh chứng: <span className="font-medium">{act.evidence || act.evidenceNote || "Đã nộp"}</span>
                              </span>
                            </div>
                            <button
                              onClick={() => alert("Bạn đã nộp minh chứng")}
                              className="w-full px-4 py-3 border border-cyan-400 text-cyan-400 hover:bg-cyan-400/10 rounded-xl transition text-sm"
                            >
                              Xem / Tải minh chứng
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-[#02030a] border-t border-slate-800 mt-20 py-10 text-center text-gray-500">
        © {new Date().getFullYear()} STUTECH — Hệ thống quản lý hoạt động sinh viên.
      </footer>
    </div>
  );
}
