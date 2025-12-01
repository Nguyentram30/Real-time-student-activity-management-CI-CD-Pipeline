import api from "@/lib/axios";

export interface ManagerActivity {
  _id: string;
  title: string;
  description?: string;
  location?: string;
  type?: string;
  status: string;
  isDraft?: boolean;
  parentActivity?: string;
  startTime?: string;
  endTime?: string;
  start_checkin_time?: string;
  end_checkin_time?: string;
  participantCount?: number;
  maxParticipants?: number;
  createdAt?: string;
  meta?: Record<string, any>;
  approvalNotes?: string;
  conditionNote?: string;
  editRequestNote?: string;
}

export interface ManagerStudent {
  id: string;
  studentId: string;
  fullName: string;
  email: string;
  phone?: string;
  faculty: string;
  class: string;
  activitiesCount: number;
  points: number;
  status: "active" | "locked";
}

export interface ManagerNotification {
  _id: string;
  title: string;
  message: string;
  targetRoles: string[];
  scheduleAt: string;
  status: "draft" | "scheduled" | "sent";
  createdAt: string;
}

export interface ManagerDashboard {
  totalActivities: number;
  pendingRegistrations: number;
  totalStudents: number;
  totalNotifications: number;
  activeActivities: number;
  completedActivities: number;
}

export interface ManagerReports {
  totalActivities: number;
  totalStudents: number;
  completionRate: string;
  totalPoints: number;
}

export interface ActivityQuery {
  search?: string;
  status?: string;
  dateFilter?: string;
}

export const managerService = {
  async getDashboard() {
    const res = await api.get<ManagerDashboard>("/manager/dashboard");
    return res.data;
  },

  async getActivities(params?: ActivityQuery) {
    const res = await api.get<{ activities: ManagerActivity[] }>("/manager/activities", { params });
    return res.data.activities;
  },

  async createActivity(payload: Partial<ManagerActivity>) {
    const res = await api.post<ManagerActivity>("/manager/activities", payload);
    return res.data;
  },

  async updateActivity(id: string, payload: Partial<ManagerActivity>) {
    const res = await api.put<ManagerActivity>(`/manager/activities/${id}`, payload);
    return res.data;
  },

  async deleteActivity(id: string) {
    await api.delete(`/manager/activities/${id}`);
  },

  async previewActivity(payload: Partial<ManagerActivity>) {
    const res = await api.post<{ preview: ManagerActivity }>("/manager/activities/preview", payload);
    return res.data.preview;
  },

  async checkConflicts(payload: { location: string; startTime: string; endTime: string; activityId?: string }) {
    const res = await api.post("/manager/activities/check-conflicts", payload);
    return res.data;
  },

  async getCompletedActivities(limit = 20) {
    const res = await api.get<{ activities: ManagerActivity[] }>(`/manager/activities/completed`, {
      params: { limit },
    });
    return res.data.activities;
  },

  async cloneActivity(id: string) {
    const res = await api.post<ManagerActivity>(`/manager/activities/${id}/clone`);
    return res.data;
  },

  async getActivityRegistrations(activityId: string) {
    const res = await api.get<{ registrations: any[] }>(`/manager/activities/${activityId}/registrations`);
    return res.data.registrations;
  },

  async approveRegistration(activityId: string, registrationId: string, note?: string) {
    const res = await api.post(`/manager/activities/${activityId}/registrations/${registrationId}/approve`, { note });
    return res.data;
  },

  async rejectRegistration(activityId: string, registrationId: string, reason?: string) {
    const res = await api.post(`/manager/activities/${activityId}/registrations/${registrationId}/reject`, { reason });
    return res.data;
  },

  async getStudents(search?: string) {
    const res = await api.get<{ students: ManagerStudent[] }>("/manager/students", {
      params: { search },
    });
    return res.data.students;
  },

  async getNotifications(search?: string) {
    const res = await api.get<{ notifications: ManagerNotification[] }>("/manager/notifications", {
      params: { search },
    });
    return res.data.notifications;
  },

  async createNotification(payload: Partial<ManagerNotification>) {
    const res = await api.post<ManagerNotification>("/manager/notifications", payload);
    return res.data;
  },

  async updateNotification(id: string, payload: Partial<ManagerNotification>) {
    const res = await api.put<ManagerNotification>(`/manager/notifications/${id}`, payload);
    return res.data;
  },

  async deleteNotification(id: string) {
    await api.delete(`/manager/notifications/${id}`);
  },

  async getReports() {
    const res = await api.get<ManagerReports>("/manager/reports");
    return res.data;
  },

  async exportReports(format: "csv" | "excel" | "pdf") {
    const res = await api.get(`/manager/reports/export`, {
      params: { format },
      responseType: "blob",
    });
    return res.data;
  },

  async getFeedbacks() {
    const res = await api.get<{ feedbacks: any[] }>("/manager/feedbacks");
    return res.data.feedbacks;
  },

  async replyFeedback(id: string, payload: { response?: string; fileUrl?: string }) {
    const res = await api.post(`/manager/feedbacks/${id}/reply`, payload);
    return res.data;
  },

  async uploadFile(
    file: File,
    metadata?: { title?: string; activityId?: string; description?: string; accessScope?: string }
  ) {
    const formData = new FormData();
    formData.append("file", file);
    if (metadata) {
      if (metadata.title) formData.append("title", metadata.title);
      if (metadata.activityId) formData.append("activityId", metadata.activityId);
      if (metadata.description) formData.append("description", metadata.description);
      if (metadata.accessScope) formData.append("accessScope", metadata.accessScope);
    }
    const res = await api.post<{
      success: boolean;
      fileUrl: string;
      fileName: string;
      fileSize: number;
      mimeType: string;
      document?: any;
    }>("/manager/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  async createActivityQRCode(activityId: string, expiresAt?: string) {
    const res = await api.post<{ qrCode: string; qrCodeRecord: any }>(`/manager/activities/${activityId}/qr-code`, {
      expiresAt,
    });
    return res.data;
  },

  async getActivityQRCode(activityId: string) {
    const res = await api.get<{ qrCodeRecord: any }>(`/manager/activities/${activityId}/qr-code`);
    return res.data;
  },
};

