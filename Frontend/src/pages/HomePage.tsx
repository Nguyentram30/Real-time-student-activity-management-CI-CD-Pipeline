import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Timer from "../components/Timer";
import MainHeader from "@/components/layout/MainHeader";


  
const HomePage = () => {
  const [scrollWidth, setScrollWidth] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.body.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      setScrollWidth(progress);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen w-screen bg-slate-950 font-sans overflow-x-hidden">
      {/* BACKGROUND EFFECTS */}
      <div className="flex absolute inset-0 pointer-events-none -z-10">
        {/* subtle gradient */}
        <div className=" flex absolute inset-0 bg-gradient-to-b from-[#071025] to-[#04030a] opacity-95"></div>

        {/* network dots (SVG) */}
        <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="g1" x1="0%" x2="100%">
              <stop offset="0%" stopColor="#00d1ff" stopOpacity="0.07" />
              <stop offset="100%" stopColor="#6ee7b7" stopOpacity="0.03" />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#g1)" />
          {/* decorative moving sphere - left */}
          <circle cx="8%" cy="30%" r="140" fill="#06314a" opacity="0.12" />
          <circle cx="85%" cy="20%" r="80" fill="#1b2b3b" opacity="0.08" />
        </svg>

        {/* floating small dots */}
        <div className="absolute inset-0">
          <div className="animate-[float_8s_ease-in-out_infinite] opacity-30" style={{ transform: "translate3d(0,0,0)" }}>
            <img src="/mnt/data/b16809a1-7a24-41c7-9379-ab3044da213f.png" alt="decor" className="w-[220px] h-[220px] object-contain absolute left-6 top-56 opacity-40 mix-blend-screen" />
          </div>
          <div className="animate-[float_10s_ease-in-out_infinite] opacity-25">
            <img src="/mnt/data/57a5dd1f-b88c-4369-8fbf-8d6b2fa9b4b6.png" alt="decor2" className="w-[160px] h-[160px] object-contain absolute right-10 top-36 opacity-35 mix-blend-screen" />
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
    <main className="pt-8 ">
     {/* HERO: font sizes + spacing responsive để áp dụng cho các trang khác */}
    <section
  className="min-h-screen flex flex-col items-center justify-center text-center px-4 sm:px-6 pt-24 md:pt-32
  text-white bg-center bg-no-repeat bg-cover"
  style={{
    backgroundImage: "url('./Image/bg1.jpg'), linear-gradient(to bottom, #060260ff, #010469ff)",
    backgroundBlendMode: "overlay"
  }}
>
  <div className="max-w-5xl space-y-6 animate-fadeIn">
    {/* Title */}
    <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight">
      Nền tảng Hỗ Trợ Hoạt Động Sinh Viên<br />
      <span className="text-cyan-400">STU TECH</span>
    </h1>

    {/* Subtitle */}
    <p className="text-base sm:text-lg md:text-xl text-slate-300 max-w-3xl mx-auto">
      Hệ thống giúp sinh viên đăng ký, quản lý thời gian tham gia sự kiện và ghi nhận thành tích một cách dễ dàng, minh bạch.
    </p>
        {/* Countdown */}
    <h2 className="text-white text-2xl sm:text-3xl font-bold">THỜI GIAN HIỆN TẠI</h2>
     <Timer />
       
</div>

 
</section>
{/* WHY CHOOSE / TWO-COLUMN: giữ cùng grid template cho mobile lẫn desktop */}
<section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">           
    <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-10 px-0 sm:px-6">
    {/* Hình minh họa */}
    <img 
        src="./Image/bg.jpg"
        alt="Tech Illustration"
        className="w-64 sm:w-80 md:w-[400px] drop-shadow-lg"
      />
      </div>
      
    <div>
              <h2 className="text-sm uppercase text-cyan-300 font-semibold">CHỨC NĂNG CHÍNH CỦA HỆ THỐNG</h2>
              <p className="mt-4 text-slate-300">
                Hệ thống hỗ trợ nhà trường và giảng viên theo dõi tiến độ học tập, hoạt động, báo cáo và đánh giá sinh viên một cách tập trung.
              </p>

              <div className="mt-6 grid grid-cols-1 gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-cyan-800/30 flex items-center justify-center">1</div>
                  <div>
                    <div className="font-semibold">Ghi nhận hoạt động dễ dàng</div>
                    <div className="text-sm text-slate-400">Sinh viên nộp chứng nhận và minh chứng trực tiếp trên hệ thống.</div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-cyan-800/30 flex items-center justify-center">2</div>
                  <div>
                    <div className="font-semibold">Quản lý dữ liệu an toàn</div>
                    <div className="text-sm text-slate-400">Bảo mật thông tin sinh viên và hồ sơ học tập với chuẩn bảo vệ dữ liệu cao.</div>
                  </div>
                </div>
              </div>

              {/* CTA buttons: text-blue-900 + bg-white để bạn reuse cho trang khác */}
              <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4 sm:gap-6">
              <button className="px-8 py-3 border border-cyan-400 text-blue-900 bg-white hover:bg-cyan-50 rounded-xl transition run-cyan text-sm">
                 <Link to="/SignUp" className="text-sm text-blue-900">
              <span className="text-blue-900">Đăng ký ngay</span>
              </Link>
                </button>
                <button className="px-8 py-3 border border-cyan-400 text-blue-900 bg-white hover:bg-cyan-50 rounded-xl transition run-cyan text-sm">
              <Link to="/ActivityPage" className="text-sm text-blue-900">
                  <span className="text-blue-900">Xem hoạt động</span>
              </Link>
                </button>
              </div>
            </div>
          </div>
        </section>
        {/* FEATURE CARDS */}
<section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-10">
            <h3 className="text-sm text-cyan-300 font-semibold">✨ VÌ SAO CHỌN HỆ THỐNG CỦA CHÚNG TÔI ✨</h3>
            <p className="text-slate-400 max-w-2xl mx-auto mt-3">
              Một nền tảng quản lý hướng dẫn sinh viên tập trung, bảo mật và dễ sử dụng dành cho nhà trường, giảng viên và sinh viên.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Quản lý thông tin sinh viên tập trung", desc: "Lưu trữ hồ sơ, hoạt động và tiến độ học tập của sinh viên tại một nơi duy nhất, dễ theo dõi.", icon: "shield" },
              { title: "Bảo mật dữ liệu & quyền truy cập an toàn", desc: "Áp dụng mã hóa và phân quyền đảm bảo an toàn thông tin và quyền riêng tư.", icon: "lock" },
              { title: "Nộp báo cáo & minh chứng nhanh chóng", desc: "Sinh viên nộp báo cáo, đề tài, minh chứng online, giảm giấy tờ và thời gian xử lý.", icon: "card" },
              { title: "Phản hồi & đánh giá theo thời gian thực", desc: "Người quản lý xem xét, nhận xét và phê duyệt trực tiếp trên hệ thống, giúp theo dõi tiến độ hiệu quả.", icon: "support" },
            ].map((c, i) => (
              <div key={i} className="bg-slate-900/60 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/5">
                <div className="w-16 h-16 rounded-full bg-white/5 mx-auto flex items-center justify-center mb-4 text-2xl">
                  {/* simple placeholder icons */}
                  <span className="text-cyan-300">⚡</span>
                </div>
                <h3 className="font-semibold text-white">{c.title}</h3>
                <p className="mt-2 text-sm text-slate-400">{c.desc}</p>
              </div>
            ))}
          </div>
        </section>
 </main>

      {/* FOOTER (KEEP TDMU CONTENT) */}
      <footer className="bg-[#02030a] border-t border-slate-800 mt-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row md:justify-between gap-8">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl font-bold text-white">STU<span className="text-cyan-400">TECH</span></span>
              </div>
              <p className="text-sm text-slate-400 max-w-md">
                Hệ thống hỗ trợ quản lý, theo dõi và tổ chức các hoạt động sinh viên một cách thuận tiện và hiệu quả.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              <div>
                <h4 className="text-sm font-semibold text-white">Tính năng</h4>
                <ul className="mt-3 text-sm text-slate-400 space-y-2">
                  <li><a href="#" className="hover:text-cyan-300">Quản lý hoạt động</a></li>
                  <li><a href="#" className="hover:text-cyan-300">Đăng ký tham gia</a></li>
                  <li><a href="#" className="hover:text-cyan-300">Điểm danh</a></li>
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-white">Hệ thống</h4>
                <ul className="mt-3 text-sm text-slate-400 space-y-2">
                  <li><a href="#" className="hover:text-cyan-300">Giới thiệu</a></li>
                  <li><a href="#" className="hover:text-cyan-300">Hỗ trợ người dùng</a></li>
                  <li><a href="#" className="hover:text-cyan-300">Tin tức</a></li>
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-white">Hỗ trợ</h4>
                <ul className="mt-3 text-sm text-slate-400 space-y-2">
                  <li><a href="#" className="hover:text-cyan-300">Tài liệu</a></li>
                  <li><a href="#" className="hover:text-cyan-300">Cộng đồng</a></li>
                  <li><a href="#" className="hover:text-cyan-300">Liên hệ</a></li>
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-white">Chính sách</h4>
                <ul className="mt-3 text-sm text-slate-400 space-y-2">
                  <li><a href="#" className="hover:text-cyan-300">Điều khoản</a></li>
                  <li><a href="#" className="hover:text-cyan-300">Bảo mật</a></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-8 text-sm text-slate-500">
            © {new Date().getFullYear()} TDMU. Hệ thống quản lý hoạt động sinh viên.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;