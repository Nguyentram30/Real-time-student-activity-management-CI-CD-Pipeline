import React, { useState } from "react";
import { Calendar, MapPin, Plus, Edit, Users, FileSpreadsheet, QrCode, Search } from "lucide-react";

// DEMO DATA
const eventList = [
  {
    id: 1,
    title: "Hội thảo Công nghệ AI 2025",
    date: "15/12/2025",
    location: "Hội trường A",
    type: "Hội thảo",
    registered: 120,
    image: "https://i.imgur.com/GMh0ZkV.jpeg",
  },
  {
    id: 2,
    title: "Ngày hội Việc làm CNTT",
    date: "20/12/2025",
    location: "Sảnh C",
    type: "Tuyển dụng",
    registered: 85,
    image: "https://i.imgur.com/GGv4t2J.jpeg",
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
              <a href="/Sukien" className="hover:text-blue-600">Sự kiện</a>
              <a href="/Hoatdong" className="hover:text-blue-600">Hoạt động</a>
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

export default function AdminSuKienPage() {
  const [events] = useState(eventList);

  return (
    <div className="min-h-screen bg-gray-50">
      <CustomHeader />

      <div className="pt-28 max-w-7xl mx-auto px-6">

        {/* PAGE TITLE */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Quản lý Sự kiện</h1>
            <p className="text-gray-600 mt-1">Quản trị - Theo dõi - Tạo mới sự kiện</p>
          </div>

          <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow">
            <Plus size={20} /> Tạo sự kiện mới
          </button>
        </div>

        {/* DASHBOARD MINI */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
          <div className="bg-white p-5 rounded-xl shadow flex flex-col gap-1">
            <span className="text-gray-600 text-sm">Tổng sự kiện</span>
            <span className="text-2xl font-bold text-blue-600">{events.length}</span>
          </div>
          <div className="bg-white p-5 rounded-xl shadow flex flex-col gap-1">
            <span className="text-gray-600 text-sm">Tổng lượt đăng ký</span>
            <span className="text-2xl font-bold text-green-600">
              {events.reduce((sum, e) => sum + e.registered, 0)}
            </span>
          </div>
          <div className="bg-white p-5 rounded-xl shadow flex flex-col gap-1">
            <span className="text-gray-600 text-sm">Đang diễn ra</span>
            <span className="text-2xl font-bold text-orange-500">3</span>
          </div>
          <div className="bg-white p-5 rounded-xl shadow flex flex-col gap-1">
            <span className="text-gray-600 text-sm">Đã hoàn thành</span>
            <span className="text-2xl font-bold text-gray-700">12</span>
          </div>
        </div>

        {/* FILTER */}
        <div className="bg-white p-5 rounded-xl shadow mt-8">
          <h2 className="font-semibold text-lg mb-4 text-gray-700">Bộ lọc nâng cao</h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input type="date" className="border p-2 rounded-lg" />
            <select className="border p-2 rounded-lg">
              <option>Tất cả loại</option>
              <option>Hội thảo</option>
              <option>Tuyển dụng</option>
              <option>Thể thao</option>
            </select>
            <select className="border p-2 rounded-lg">
              <option>Tất cả trạng thái</option>
              <option>Sắp diễn ra</option>
              <option>Đang diễn ra</option>
              <option>Đã kết thúc</option>
            </select>
            <select className="border p-2 rounded-lg">
              <option>Tất cả địa điểm</option>
              <option>Hội trường A</option>
              <option>Sảnh C</option>
            </select>
          </div>
        </div>

        {/* EVENT LIST */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {events.map((ev) => (
            <div key={ev.id} className="bg-white p-4 rounded-xl shadow hover:shadow-xl transition">
              <img src={ev.image} className="w-full h-40 object-cover rounded-lg" />

              <h2 className="mt-3 text-xl font-bold">{ev.title}</h2>

              <p className="mt-2 flex items-center gap-2 text-gray-600">
                <Calendar size={18} /> {ev.date}
              </p>

              <p className="flex items-center gap-2 mt-1 text-gray-600">
                <MapPin size={18} /> {ev.location}
              </p>

              <p className="text-sm text-gray-500 mt-1">
                Đã đăng ký: <span className="font-semibold text-blue-600">{ev.registered} sinh viên</span>
              </p>

              {/* ACTION BUTTONS */}
              <div className="flex flex-col gap-2 mt-4">
                <button className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-white py-2 rounded-lg">
                  <Edit size={18} /> Chỉnh sửa sự kiện
                </button>

                <button className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg">
                  <Users size={18} /> Xem danh sách sinh viên
                </button>

                <button className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg">
                  <FileSpreadsheet size={18} /> Xuất file Excel
                </button>

                <button className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white py-2 rounded-lg">
                  <QrCode size={18} /> Tạo mã QR check-in
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
