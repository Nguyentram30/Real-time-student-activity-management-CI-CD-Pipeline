// db.ts — Frontend data layer

import axios from "axios";

/* ================================
   🔌 1. AXIOS API CLIENT
=================================*/
export const api = axios.create({
  baseURL: "http://localhost:5000/api",  // đổi thành domain backend
  withCredentials: true,
});

/* ================================
   🔹 2. ENUMS (dùng chung FE/BE)
=================================*/
export type Role = "student" | "organizer" | "admin";

export type ActivityStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "ongoing"
  | "completed"
  | "cancelled";

export type RegistrationStatus = "pending" | "approved" | "rejected";

export type AttendanceStatus = "absent" | "present";

export type CompletionStatus = "incomplete" | "completed";

/* ================================
   🌍 3. DISPLAY NAMES — UI
=================================*/
export const ROLE_NAMES: Record<Role, string> = {
  student: "Sinh viên",
  organizer: "Đơn vị tổ chức",
  admin: "Quản trị viên",
};

export const ACTIVITY_STATUS_NAMES: Record<ActivityStatus, string> = {
  pending: "Chờ duyệt",
  approved: "Đã duyệt",
  rejected: "Từ chối",
  ongoing: "Đang diễn ra",
  completed: "Đã kết thúc",
  cancelled: "Đã hủy",
};

export const REGISTRATION_STATUS_NAMES: Record<RegistrationStatus, string> = {
  pending: "Chờ duyệt",
  approved: "Đã duyệt",
  rejected: "Từ chối",
};

export const ATTENDANCE_STATUS_NAMES: Record<AttendanceStatus, string> = {
  absent: "Vắng",
  present: "Có mặt",
};

export const COMPLETION_STATUS_NAMES: Record<CompletionStatus, string> = {
  incomplete: "Chưa hoàn thành",
  completed: "Đã hoàn thành",
};

/* ================================
   🔥 4. API FUNCTIONS (Frontend)
=================================*/

// Activities
export const fetchActivities = async () => {
  const res = await api.get("/activities");
  return res.data;
};

export const createActivity = async (data: any) => {
  const res = await api.post("/activities", data);
  return res.data;
};

// Users
export const fetchUsers = async () => {
  const res = await api.get("/users");
  return res.data;
};

// Auth
export const login = async (email: string, password: string) => {
  const res = await api.post("/auth/login", { email, password });
  return res.data;
};

// Example: Register for an activity
export const registerActivity = async (activityId: string, userId: string) => {
  const res = await api.post("/registrations", { activityId, userId });
  return res.data;
};
