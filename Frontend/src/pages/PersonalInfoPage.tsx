import { useState, useEffect } from "react";
import MainHeader from "@/components/layout/MainHeader";
import { useAuth } from "@/UseAuth/AuthContext";
import { User, Mail, GraduationCap, Phone, Building, Users, Edit, Save, X, Plus, Trash2, Calendar, MapPin, Upload } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";
import { Loader2 } from "lucide-react";

export default function PersonalInfoPage() {
  const { userData } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    displayName: "",
    studentCode: "",
    dateOfBirth: "",
    class: "",
    department: "",
    email: "",
    phoneNumber: "",
    address: "",
    avatar: "",
  });

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        setLoading(true);
        const res = await api.get("/user/me");
        setUserInfo(res.data);
        setFormData({
          displayName: res.data?.displayName || res.data?.fullName || "",
          studentCode: res.data?.studentCode || res.data?.username || "",
          dateOfBirth: res.data?.dateOfBirth ? new Date(res.data.dateOfBirth).toISOString().split("T")[0] : "",
          class: res.data?.class || "",
          department: res.data?.department || "",
          email: res.data?.email || "",
          phoneNumber: res.data?.phoneNumber || "",
          address: res.data?.address || "",
          avatar: res.data?.avatar || "",
        });
      } catch (error) {
        console.error("Không thể tải thông tin cá nhân", error);
        toast.error("Không thể tải thông tin cá nhân");
      } finally {
        setLoading(false);
      }
    };

    if (userData) {
      fetchUserInfo();
    }
  }, [userData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.displayName.trim()) {
      toast.error("Họ tên không được để trống");
      return false;
    }
    if (!formData.studentCode.trim()) {
      toast.error("MSSV không được để trống");
      return false;
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error("Email không đúng định dạng");
      return false;
    }
    if (formData.phoneNumber && !/^\d{10}$/.test(formData.phoneNumber)) {
      toast.error("Số điện thoại phải có 10 số");
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);
      await api.put("/user/me", formData);
      toast.success("Cập nhật thông tin thành công");
      setIsEditing(false);
      // Refresh user info
      const res = await api.get("/user/me");
      setUserInfo(res.data);
    } catch (error: any) {
      console.error("Không thể cập nhật thông tin", error);
      toast.error(error?.response?.data?.message || "Không thể cập nhật thông tin");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form data
    if (userInfo) {
      setFormData({
        displayName: userInfo?.displayName || userInfo?.fullName || "",
        studentCode: userInfo?.studentCode || userInfo?.username || "",
        dateOfBirth: userInfo?.dateOfBirth ? new Date(userInfo.dateOfBirth).toISOString().split("T")[0] : "",
        class: userInfo?.class || "",
        department: userInfo?.department || "",
        email: userInfo?.email || "",
        phoneNumber: userInfo?.phoneNumber || "",
        address: userInfo?.address || "",
        avatar: userInfo?.avatar || "",
      });
    }
  };

  if (!userData) {
    return (
      <div className="min-h-screen w-screen bg-slate-950 text-white font-sans">
        <MainHeader />
        <div className="pt-32 px-6 flex flex-col items-center gap-4 text-center max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold">Bạn cần đăng nhập</h1>
          <p className="text-slate-300">Vui lòng đăng nhập để xem thông tin cá nhân.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-screen bg-slate-950 text-white font-sans">
      <MainHeader />
      <div className="pt-28 max-w-4xl mx-auto px-6 pb-20">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Thông tin cá nhân</h1>
            <p className="text-gray-400">Xem và quản lý thông tin tài khoản của bạn</p>
          </div>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl transition flex items-center gap-2"
            >
              <Edit size={18} />
              Chỉnh sửa
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl transition flex items-center gap-2 disabled:opacity-50"
              >
                <Save size={18} />
                {saving ? "Đang lưu..." : "Lưu"}
              </button>
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-xl transition flex items-center gap-2"
              >
                <X size={18} />
                Hủy
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="bg-[#141a33] rounded-2xl p-12 text-center border border-white/10">
            <Loader2 className="w-8 h-8 animate-spin text-cyan-400 mx-auto mb-4" />
            <p className="text-slate-400">Đang tải thông tin...</p>
          </div>
        ) : (
          <div className="bg-[#141a33] rounded-2xl p-8 border border-white/10 space-y-6">
            <div className="flex items-center gap-4 pb-6 border-b border-white/10">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white text-2xl font-bold">
                {(userInfo?.displayName || userData?.fullName || "U").slice(0, 1).toUpperCase()}
              </div>
              <div>
                <h2 className="text-2xl font-semibold">{userInfo?.displayName || userData?.fullName || "Người dùng"}</h2>
                <p className="text-slate-400">{userInfo?.email || userData?.email || ""}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
                <User className="w-5 h-5 text-cyan-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-slate-400 mb-1">Họ tên <span className="text-red-400">*</span></p>
                  {isEditing ? (
                    <input
                      type="text"
                      name="displayName"
                      value={formData.displayName}
                      onChange={handleChange}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                      required
                    />
                  ) : (
                    <p className="text-white">{userInfo?.displayName || userData?.fullName || "Chưa cập nhật"}</p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
                <GraduationCap className="w-5 h-5 text-cyan-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-slate-400 mb-1">MSSV <span className="text-red-400">*</span></p>
                  {isEditing ? (
                    <input
                      type="text"
                      name="studentCode"
                      value={formData.studentCode}
                      onChange={handleChange}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                      required
                    />
                  ) : (
                    <p className="text-white">{userInfo?.studentCode || userInfo?.username || userData?.username || "Chưa cập nhật"}</p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
                <Calendar className="w-5 h-5 text-cyan-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-slate-400 mb-1">Ngày sinh</p>
                  {isEditing ? (
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    />
                  ) : (
                    <p className="text-white">{formData.dateOfBirth ? new Date(formData.dateOfBirth).toLocaleDateString("vi-VN") : "Chưa cập nhật"}</p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
                <Building className="w-5 h-5 text-cyan-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-slate-400 mb-1">Khoa / Ngành</p>
                  {isEditing ? (
                    <input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    />
                  ) : (
                    <p className="text-white">{userInfo?.department || "Chưa cập nhật"}</p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
                <Users className="w-5 h-5 text-cyan-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-slate-400 mb-1">Lớp</p>
                  {isEditing ? (
                    <input
                      type="text"
                      name="class"
                      value={formData.class}
                      onChange={handleChange}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    />
                  ) : (
                    <p className="text-white">{userInfo?.class || "Chưa cập nhật"}</p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
                <Mail className="w-5 h-5 text-cyan-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-slate-400 mb-1">Email</p>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    />
                  ) : (
                    <p className="text-white">{userInfo?.email || userData?.email || "Chưa cập nhật"}</p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
                <Phone className="w-5 h-5 text-cyan-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-slate-400 mb-1">Số điện thoại</p>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      maxLength={10}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    />
                  ) : (
                    <p className="text-white">{userInfo?.phoneNumber || "Chưa cập nhật"}</p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
                <MapPin className="w-5 h-5 text-cyan-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-slate-400 mb-1">Địa chỉ</p>
                  {isEditing ? (
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    />
                  ) : (
                    <p className="text-white">{userInfo?.address || "Chưa cập nhật"}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

