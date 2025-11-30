import React, { useState, useEffect } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  Building2,
  Headphones,
} from "lucide-react";
import MainHeader from "@/components/layout/MainHeader";

export default function LienHePage() {
  const [formData, setFormData] = useState({
    name: "",
    studentId: "",
    email: "",
    message: "",
  });
  const [scrollWidth, setScrollWidth] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.body.scrollHeight - window.innerHeight;
      const progress = totalHeight > 0 ? (window.scrollY / totalHeight) * 100 : 0;
      setScrollWidth(progress);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen w-screen bg-slate-950 font-sans overflow-x-hidden">
      <MainHeader />
      <div
        className="fixed top-20 left-0 right-0 h-[4px] rounded-full shadow-[0_0_12px_rgba(0,255,255,0.6)] z-30"
        style={{
          width: `${scrollWidth}%`,
          background: "linear-gradient(90deg, #00f2ff, #38bdf8, #3b82f6)",
        }}
      />

      <div className="max-w-7xl mx-auto px-6 pt-28 pb-16">
        <h1 className="text-4xl font-bold">Liên hệ & Hỗ trợ</h1>
        <p className="text-gray-400 mt-2 max-w-2xl">
          Nếu bạn gặp vấn đề trong quá trình sử dụng hệ thống hoặc cần hỗ trợ, vui lòng xem thông tin dưới đây hoặc gửi yêu cầu hỗ trợ.
        </p>

        {/* ===== SECTIONS ===== */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">

          {/* CTSV */}
          <div className="bg-[#141a33] rounded-2xl p-6 shadow-xl border border-white/10 hover:bg-[#1c2244] transition">
            <div className="flex items-center gap-3">
              <Building2 className="text-cyan-400" size={30} />
              <h2 className="text-xl font-semibold text-white">Phòng CTSV</h2>
            </div>

            <p className="mt-3 text-gray-400">
              Hỗ trợ sinh viên về rèn luyện, công tác sinh viên và các hoạt động trường.
            </p>

            <div className="mt-4 space-y-2 text-gray-300">
              <p className="flex items-center gap-2"><Phone size={18} /> 028 1234 5678</p>
              <p className="flex items-center gap-2"><Mail size={18} /> ctsv@stu.edu.vn</p>
              <p className="flex items-center gap-2"><MapPin size={18} /> Tòa B, Phòng B203</p>
            </div>
          </div>

          {/* Ban tổ chức */}
          <div className="bg-[#141a33] rounded-2xl p-6 shadow-xl border border-white/10 hover:bg-[#1c2244] transition">
            <div className="flex items-center gap-3">
              <Building2 className="text-green-400" size={30} />
              <h2 className="text-xl font-semibold text-white">Khoa / Ban tổ chức</h2>
            </div>

            <p className="mt-3 text-gray-400">
              Liên hệ để biết thông tin chi tiết về sự kiện học thuật và chuyên môn.
            </p>

            <div className="mt-4 space-y-2 text-gray-300">
              <p className="flex items-center gap-2"><Phone size={18} /> 028 9876 5432</p>
              <p className="flex items-center gap-2"><Mail size={18} /> khoacntt@stu.edu.vn</p>
              <p className="flex items-center gap-2"><MapPin size={18} /> Tòa C, Phòng C105</p>
            </div>
          </div>

          {/* Hỗ trợ hệ thống */}
          <div className="bg-[#141a33] rounded-2xl p-6 shadow-xl border border-white/10 hover:bg-[#1c2244] transition">
            <div className="flex items-center gap-3">
              <Headphones className="text-purple-400" size={30} />
              <h2 className="text-xl font-semibold text-white">Hỗ trợ hệ thống</h2>
            </div>

            <p className="mt-3 text-gray-400">
              Báo lỗi, yêu cầu sửa chữa và hỗ trợ kỹ thuật khi dùng STU-TECH.
            </p>

            <div className="mt-4 space-y-2 text-gray-300">
              <p className="flex items-center gap-2"><Phone size={18} /> 1900 6600</p>
              <p className="flex items-center gap-2"><Mail size={18} /> support@stutech.com</p>
              <p className="flex items-center gap-2"><MapPin size={18} /> Trung tâm CNTT – Tòa D</p>
            </div>
          </div>
        </div>

        {/* FORM */}
        <div className="bg-[#0A3D91] p-8 rounded-2xl shadow-xl border border-white/10 mt-14 max-w-3xl">
          <h2 className="text-2xl font-bold">Gửi yêu cầu hỗ trợ</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input name="name" placeholder="Họ và tên" className="bg-[#0f152b] border border-white/10 p-3 rounded-lg text-white" onChange={handleChange} />
            <input name="studentId" placeholder="Mã số sinh viên" className="bg-[#0f152b] border border-white/10 p-3 rounded-lg text-white" onChange={handleChange} />
            <input name="email" placeholder="Email liên hệ" className="bg-[#0f152b] border border-white/10 p-3 rounded-lg text-white md:col-span-2" onChange={handleChange} />
          </div>

          <textarea name="message" placeholder="Nội dung yêu cầu hỗ trợ..." className="bg-[#0f152b] border border-white/10 p-3 rounded-lg w-full mt-4 h-32 text-white" onChange={handleChange} />

          <button className="mt-5 w-full bg-cyan-500 hover:bg-cyan-600 text-blue-900 py-3 rounded-lg flex items-center justify-center gap-2 text-lg font-medium">
            <Send size={20} /> Gửi yêu cầu
          </button>
        </div>
      </div>
    </div>
  );
}
