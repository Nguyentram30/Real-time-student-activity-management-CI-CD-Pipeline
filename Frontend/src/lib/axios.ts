import { useAuthStore } from "@/stores/useAuthStore";
import axios from "axios";

const api = axios.create({
  baseURL:
    import.meta.env.MODE === "development" ? "http://localhost:5001/api" : "/api",
  withCredentials: true,
});

// gắn access token vào req header
api.interceptors.request.use((config) => {
  // Ưu tiên lấy từ Zustand store, fallback sang localStorage
  let token = useAuthStore.getState().accessToken;
  if (!token) {
    token = localStorage.getItem("token");
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// tự động gọi refresh api khi access token hết hạn
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    // những api không cần check
    if (
      originalRequest?.url?.includes("/auth/signin") ||
      originalRequest?.url?.includes("/auth/signup") ||
      originalRequest?.url?.includes("/auth/refresh")
    ) {
      return Promise.reject(error);
    }

    // Xử lý lỗi 401 (Unauthorized) - token không hợp lệ hoặc thiếu
    if (error.response?.status === 401) {
      // Nếu không có token, không thử refresh
      const token = useAuthStore.getState().accessToken || localStorage.getItem("token");
      if (!token) {
        console.warn("Không có token, yêu cầu đăng nhập");
        return Promise.reject(error);
      }
    }

    originalRequest._retryCount = originalRequest._retryCount || 0;

    // Xử lý lỗi 403 (Forbidden) - token hết hạn, thử refresh
    if (error.response?.status === 403 && originalRequest._retryCount < 3) {
      originalRequest._retryCount += 1;

      try {
        const res = await api.post("/auth/refresh", undefined, { withCredentials: true });
        const newAccessToken = res.data?.accessToken;

        if (newAccessToken) {
          useAuthStore.getState().setAccessToken(newAccessToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        } else {
          throw new Error("Không nhận được access token mới");
        }
      } catch (refreshError) {
        console.error("Lỗi refresh token:", refreshError);
        useAuthStore.getState().clearState();
        localStorage.removeItem("token");
        // Redirect to login nếu đang ở trang admin/manager
        if (window.location.pathname.startsWith("/admin") || window.location.pathname.startsWith("/manager")) {
          window.location.href = "/LoginPage";
        }
        return Promise.reject(refreshError);
      }
    }

    // Log lỗi để debug
    if (error.response) {
      console.error("API Error:", {
        url: originalRequest?.url,
        status: error.response.status,
        message: error.response.data?.message || error.message,
      });
    } else if (error.request) {
      console.error("Network Error:", error.message);
    }

    return Promise.reject(error);
  }
);

export default api;