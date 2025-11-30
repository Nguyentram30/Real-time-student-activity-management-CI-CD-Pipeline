import React, { useState } from "react";
import { Calendar, MapPin, QrCode, Search } from "lucide-react";

// DEMO DATA (CÓ THÊM HÌNH ẢNH)
const events = [
  {
    id: 1,
    title: "Hội thảo Công nghệ AI 2025",
    date: "15/12/2025",
    location: "Hội trường A",
    status: "Chưa đăng ký",
    image: "https://images.unsplash.com/photo-1581092334669-1fd3d6e28db7?auto=format&fit=crop&w=900&q=60",
    description:
      "Sự kiện chia sẻ xu hướng AI, Machine Learning và ứng dụng trong đời sống. Có chứng nhận tham gia.",
  },
  {
    id: 2,
    title: "Ngày hội Việc làm CNTT",
    date: "20/12/2025",
    location: "Sảnh C",
    status: "Đã đăng ký",
    image: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=900&q=60",
    description:
      "Giao lưu với doanh nghiệp, phỏng vấn thử, định hướng nghề nghiệp cho sinh viên ngành CNTT.",
  },
  {
    id: 3,
    title: "Giải chạy tiếp sức STU Marathon",
    date: "05/01/2026",
    location: "Sân vận động STU",
    status: "Đã check-in",
    image: "https://images.unsplash.com/photo-1520975922071-a9382a76e0d4?auto=format&fit=crop&w=900&q=60",
    description:
      "Sự kiện thể thao lớn nhất năm dành cho sinh viên yêu thích vận động.",
  },
];

// HEADER ĐỘC QUYỀN
function CustomHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-40 bg-white/70 backdrop-blur-md border-b border-gray-100 shadow-2xl">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">

          <div className="flex items-center gap-6">
            <span className="text-4xl font-bold text-cyan-600">STUHUB</span>

            <nav className="flex items-center gap-14 text-blue-600 font-medium ml-10">
              <a href="/" className="hover:text-blue-600">Trang chủ</a>
              <a href="/Sukien" className="font-semibold text-blue-700 underline">Sự kiện</a>
              <a href="/ActivityPage" className="hover:text-blue-600">Hoạt động</a>
              <a href="/DashboardPage" className="hover:text-blue-600">Kết quả</a>
              <a href="/ContactPage" className="hover:text-blue-600">Liên hệ</a>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <Search size={20} className="text-blue-600" />
            </button>

            <a href="/LoginPage" className="text-sm text-blue-600">
              Đăng ký / Đăng nhập
            </a>

            <button className="ml-2 px-4 py-2 rounded-full text-white text-sm shadow run-cyan">
              Đăng ký ngay
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default function SuKienPage() {
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  return (
    <div className="min-h-screen bg-gray-50">
      <CustomHeader />

      <div className="pt-28 max-w-7xl mx-auto px-6">
        <h1 className="text-3xl font-bold text-gray-800">Sự kiện</h1>
        <p className="text-gray-600 mt-1">Danh sách các sự kiện dành cho sinh viên.</p>

        {/* EVENT LIST */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {events.map((ev) => (
            <div
              key={ev.id}
              className="bg-white p-5 rounded-xl shadow hover:shadow-xl transition cursor-pointer"
              onClick={() => setSelectedEvent(ev)}
            >
              {/* IMAGE */}
              <img
                src={ev.image}
                alt="event-banner"
                className="w-full h-44 object-cover rounded-lg mb-4 shadow"
              />

              <h2 className="text-xl font-bold text-gray-800">{ev.title}</h2>

              <p className="mt-2 flex items-center text-gray-600 gap-2">
                <Calendar size={18} /> {ev.date}
              </p>

              <p className="mt-1 flex items-center text-gray-600 gap-2">
                <MapPin size={18} /> {ev.location}
              </p>

              {/* STATUS */}
              <div className="mt-3">
                {ev.status === "Chưa đăng ký" && (
                  <span className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm">
                    Chưa đăng ký
                  </span>
                )}
                {ev.status === "Đã đăng ký" && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                    Đã đăng ký
                  </span>
                )}
                {ev.status === "Đã check-in" && (
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                    Đã check-in
                  </span>
                )}
              </div>

              {/* QR */}
              <div className="mt-4 flex justify-end">
                <div className="p-3 bg-gray-100 rounded-lg">
                  <QrCode size={28} className="text-cyan-700" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* EVENT DETAIL MODAL */}
      {selectedEvent && (
  <div
    className="fixed inset-0 bg-black/40 flex justify-center items-center p-4 z-50"
    onClick={() => setSelectedEvent(null)}
  >
    <div
      className="relative bg-white w-full max-w-md p-5 rounded-xl shadow-xl animate-[fadeIn_.2s_ease-out]"
      onClick={(e) => e.stopPropagation()}
    >
      
      {/* Close button */}
      <button
        onClick={() => setSelectedEvent(null)}
        className="absolute top-3 right-3 p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition"
      >
        ✕
      </button>

      {/* Image */}
      <img
        src={selectedEvent.image}
        alt="event"
        className="w-full h-40 object-cover rounded-lg shadow mb-4"
      />

      {/* Title */}
      <h2 className="text-xl font-bold text-gray-900">
        {selectedEvent.title}
      </h2>

      {/* Description */}
      <p className="mt-2 text-gray-700 text-sm leading-relaxed">
        {selectedEvent.description}
      </p>

      {/* Info */}
      <div className="mt-3 text-gray-600 text-sm space-y-1">
        <p className="flex items-center gap-2">
          <Calendar size={16} /> {selectedEvent.date}
        </p>
        <p className="flex items-center gap-2">
          <MapPin size={16} /> {selectedEvent.location}
        </p>
      </div>

      {/* Status */}
      <div className="mt-4">
        {selectedEvent.status === "Chưa đăng ký" && (
          <button className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium">
            Đăng ký tham gia
          </button>
        )}

        {selectedEvent.status === "Đã đăng ký" && (
          <div className="w-full py-2 rounded-lg bg-gray-200 text-gray-800 text-center text-sm">
            Bạn đã đăng ký
          </div>
        )}

        {selectedEvent.status === "Đã check-in" && (
          <div className="text-center text-green-700 font-semibold mt-1 text-sm">
            ✓ Bạn đã check-in sự kiện
          </div>
        )}
      </div>

      {/* QR */}
      <div className="mt-4 flex justify-center">
        <div className="bg-gray-200 p-3 rounded-xl shadow">
          <QrCode size={85} className="text-cyan-700" />
        </div>
      </div>

      {/* Close */}
      <button
        onClick={() => setSelectedEvent(null)}
        className="mt-5 w-full py-2 bg-red-500 hover:bg-red-600 text-white text-sm rounded-lg"
      >
        Đóng
      </button>

    </div>
  </div>
)}
    </div>
  );
}
