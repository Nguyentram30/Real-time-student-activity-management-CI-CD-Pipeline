import { Link } from "react-router-dom";

interface LoginPromptProps {
  message?: string;
  description?: string;
}

const LoginPrompt = ({
  message = "Bạn cần đăng nhập để sử dụng tính năng này",
  description = "Vui lòng đăng nhập để tiếp tục trải nghiệm hệ thống.",
}: LoginPromptProps) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4">
    <div className="max-w-md w-full rounded-2xl border border-white/10 bg-slate-900/90 p-8 text-center shadow-2xl">
      <h2 className="text-2xl font-semibold text-white">{message}</h2>
      <p className="mt-3 text-sm text-slate-300">{description}</p>
      <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          to="/LoginPage"
          className="flex-1 px-4 py-2 rounded-xl bg-cyan-400 text-blue-900 font-semibold hover:bg-cyan-300 transition"
        >
          Đăng nhập
        </Link>
        <Link
          to="/SignUp"
          className="flex-1 px-4 py-2 rounded-xl border border-white/20 text-white hover:bg-white/10 transition"
        >
          Đăng ký
        </Link>
      </div>
    </div>
  </div>
);

export default LoginPrompt;

