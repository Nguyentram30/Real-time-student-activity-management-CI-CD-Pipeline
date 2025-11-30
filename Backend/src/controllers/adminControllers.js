import bcrypt from "bcrypt";
import User from "../models/User.js";
import Activity from "../models/Activity.js";
import Notification from "../models/Notification.js";
import Document from "../models/Document.js";
import AdvancedFeature from "../models/AdvancedFeature.js";
import SystemWidget from "../models/SystemWidget.js";
import Report from "../models/Report.js";
import ActivityRegistration from "../models/ActivityRegistration.js";

const formatSearchRegex = (value) => new RegExp(value, "i");

export const getDashboardOverview = async (_req, res) => {
  const [students, managers, activeActivities, documents] = await Promise.all([
    User.countDocuments({ role: "student" }),
    User.countDocuments({ role: { $in: ["manager", "admin"] } }),
    Activity.countDocuments({ status: "Đang mở" }),
    Document.countDocuments(),
  ]);

  return res.json({
    totals: {
      students,
      managers,
      activeActivities,
      documents,
    },
    trends: {
      months: [
        { label: "T1", activities: 6, interactions: 48, submissions: 32 },
        { label: "T2", activities: 9, interactions: 64, submissions: 41 },
        { label: "T3", activities: 12, interactions: 78, submissions: 55 },
        { label: "T4", activities: 10, interactions: 72, submissions: 60 },
        { label: "T5", activities: 15, interactions: 90, submissions: 74 },
        { label: "T6", activities: 18, interactions: 110, submissions: 88 },
      ],
      logs: [
        { message: "12 sinh viên nộp báo cáo mới", timestamp: "1h trước" },
        { message: "Hoạt động Robotics được phê duyệt", timestamp: "2h trước" },
        { message: "Admin cập nhật 4 tài liệu", timestamp: "3h trước" },
        { message: "Quản lý Khoa CNTT gửi thông báo", timestamp: "4h trước" },
      ],
    },
  });
};

// Users
export const listUsers = async (req, res) => {
  const { search, role, status } = req.query;
  const filter = {};
  if (search) {
    filter.$or = [
      { displayName: formatSearchRegex(search) },
      { email: formatSearchRegex(search) },
      { username: formatSearchRegex(search) },
    ];
  }
  if (role) filter.role = role;
  if (status) filter.status = status;

  const users = await User.find(filter).select("-hashedPassword");
  res.json({ users });
};

export const createUser = async (req, res) => {
  const { username, email, password, displayName, role = "student", status = "active" } = req.body;

  if (!username || !email || !password || !displayName) {
    return res.status(400).json({ message: "Thiếu thông tin tạo người dùng" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({ username, email, hashedPassword, displayName, role, status });
  res.status(201).json(user);
};

export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { displayName, email, role, status, password } = req.body;
  const user = await User.findById(id);

  if (!user) return res.status(404).json({ message: "User không tồn tại" });

  if (displayName) user.displayName = displayName;
  if (email) user.email = email;
  if (role) user.role = role;
  if (status) user.status = status;
  if (password) user.hashedPassword = await bcrypt.hash(password, 10);

  await user.save();
  res.json(user);
};

export const deleteUser = async (req, res) => {
  const { id } = req.params;
  await User.findByIdAndDelete(id);
  res.sendStatus(204);
};

// Activities
export const listActivities = async (req, res) => {
  const { search, status, type } = req.query;
  const filter = {};
  if (search) filter.title = formatSearchRegex(search);
  if (status) filter.status = status;
  if (type) filter.type = type;

  const activities = await Activity.find(filter)
    .populate("createdBy", "displayName email role")
    .sort({ startTime: -1 });
  res.json({ activities });
};

export const createActivity = async (req, res) => {
  // Admin tạo hoạt động → tự động approved (status = "Đang mở")
  const payload = {
    title: req.body.title,
    description: req.body.description,
    location: req.body.location,
    type: req.body.type,
    status: "Đang mở", // Admin không cần duyệt, tự động approved
    startTime: req.body.startTime,
    endTime: req.body.endTime,
    maxParticipants: req.body.maxParticipants,
    coverImage: req.body.coverImage,
    meta: req.body.meta,
    createdBy: req.user?._id || req.body.createdBy,
  };

  const activity = await Activity.create(payload);
  res.status(201).json(activity);
};

export const updateActivity = async (req, res) => {
  const { id } = req.params;
  const updates = {
    title: req.body.title,
    description: req.body.description,
    location: req.body.location,
    type: req.body.type,
    status: req.body.status,
    startTime: req.body.startTime,
    endTime: req.body.endTime,
    maxParticipants: req.body.maxParticipants,
    coverImage: req.body.coverImage,
    meta: req.body.meta,
  };

  const activity = await Activity.findByIdAndUpdate(id, updates, { new: true });
  if (!activity) return res.status(404).json({ message: "Hoạt động không tồn tại" });
  res.json(activity);
};

export const deleteActivity = async (req, res) => {
  const { id } = req.params;
  await Activity.findByIdAndDelete(id);
  res.sendStatus(204);
};

// Students
const fetchStudents = async (query) => {
  const { search, faculty } = query;
  const filter = { role: "student" };
  if (search) {
    filter.$or = [
      { displayName: formatSearchRegex(search) },
      { email: formatSearchRegex(search) },
    ];
  }
  if (faculty) {
    filter.faculty = faculty;
  }

  const students = await User.find(filter).select("displayName email department createdAt studentCode");
  return students.map((student) => ({
    studentId: student.studentCode || student._id.toString(),
    fullName: student.displayName,
    faculty: student.department || "Chưa cập nhật",
    activityStatus: "Đang cập nhật",
    progressPercent: 70,
  }));
};

export const listStudents = async (req, res) => {
  const students = await fetchStudents(req.query);
  res.json({ students });
};

export const exportStudents = async (req, res) => {
  const students = await fetchStudents(req.query);
  const csv = ["studentId,fullName,faculty"]
    .concat(students.map((s) => `${s.studentId},${s.fullName},${s.faculty}`))
    .join("\n");

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=students.csv");
  res.send(csv);
};

// Notifications
export const listNotifications = async (_req, res) => {
  const notifications = await Notification.find()
    .sort({ createdAt: -1 })
    .populate("createdBy", "displayName role");
  res.json({ notifications });
};

export const createNotification = async (req, res) => {
  const payload = {
    title: req.body.title,
    message: req.body.message || req.body.content,
    targetRoles: req.body.targetRoles || (req.body.targetGroup ? [req.body.targetGroup] : ["student"]),
    scheduleAt: req.body.scheduleAt || req.body.schedule || new Date(),
    status: req.body.status ?? "draft",
    createdBy: req.user?._id || req.body.createdBy,
    relatedActivity: req.body.activityId,
    metadata: req.body.metadata,
  };

  if (!payload.message) {
    return res.status(400).json({ message: "Nội dung thông báo không được bỏ trống" });
  }

  const notification = await Notification.create(payload);
  res.status(201).json(notification);
};

export const updateNotification = async (req, res) => {
  const { id } = req.params;
  const updates = {
    title: req.body.title,
    message: req.body.message || req.body.content,
    targetRoles: req.body.targetRoles || (req.body.targetGroup ? [req.body.targetGroup] : undefined),
    scheduleAt: req.body.scheduleAt || req.body.schedule,
    status: req.body.status,
    relatedActivity: req.body.activityId,
    metadata: req.body.metadata,
  };

  const notification = await Notification.findByIdAndUpdate(id, updates, { new: true });
  if (!notification) return res.status(404).json({ message: "Thông báo không tồn tại" });
  res.json(notification);
};

export const scheduleNotification = async (req, res) => {
  const { id } = req.params;
  const { scheduleAt } = req.body;
  const notification = await Notification.findByIdAndUpdate(
    id,
    { scheduleAt: scheduleAt || new Date(), status: "scheduled" },
    { new: true }
  );
  if (!notification) return res.status(404).json({ message: "Thông báo không tồn tại" });
  res.json(notification);
};

export const deleteNotification = async (req, res) => {
  const { id } = req.params;
  await Notification.findByIdAndDelete(id);
  res.sendStatus(204);
};

// Documents
export const listDocuments = async (_req, res) => {
  const documents = await Document.find()
    .populate("uploadedBy", "displayName email role")
    .populate("activity", "title startTime");
  res.json({ documents });
};

export const createDocument = async (req, res) => {
  // Nếu có file upload, sử dụng file đã upload
  let fileUrl = req.body.fileUrl;
  let mimeType = req.body.mimeType;

  if (req.file) {
    // File đã được upload qua multer
    const { getFileUrl } = await import("../utils/uploadMiddleware.js");
    fileUrl = getFileUrl(req.file.filename);
    mimeType = req.file.mimetype;
  }

  const payload = {
    title: req.body.title,
    fileUrl: fileUrl,
    activity: req.body.activity || undefined,
    mimeType: mimeType,
    accessScope: req.body.accessScope || "admin",
    description: req.body.description,
    uploadedBy: req.user?._id || req.body.uploadedBy,
    updatedBy: req.user?._id || req.body.uploadedBy,
  };

  if (!payload.title || !payload.fileUrl) {
    return res.status(400).json({ message: "Thiếu tiêu đề hoặc đường dẫn file" });
  }

  const document = await Document.create(payload);
  res.status(201).json(document);
};

export const deleteDocument = async (req, res) => {
  const { id } = req.params;
  await Document.findByIdAndDelete(id);
  res.sendStatus(204);
};

// Reports
export const getReportSummary = async (req, res) => {
  const { period = "month", year, month, quarter } = req.query;
  
  // Tính toán khoảng thời gian
  let startDate = new Date();
  let endDate = new Date();
  
  if (period === "month" && month && year) {
    startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);
  } else if (period === "quarter" && quarter && year) {
    const quarterStartMonth = (parseInt(quarter) - 1) * 3;
    startDate = new Date(parseInt(year), quarterStartMonth, 1);
    endDate = new Date(parseInt(year), quarterStartMonth + 3, 0, 23, 59, 59);
  } else if (period === "year" && year) {
    startDate = new Date(parseInt(year), 0, 1);
    endDate = new Date(parseInt(year), 11, 31, 23, 59, 59);
  } else {
    // Mặc định: tháng hiện tại
    startDate = new Date();
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);
    endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);
    endDate.setDate(0);
    endDate.setHours(23, 59, 59);
  }

  const [totalActivities, totalStudents, approvedActivities, pendingActivities, rejectedActivities, activitiesInPeriod] = await Promise.all([
    Activity.countDocuments(),
    User.countDocuments({ role: "student" }),
    Activity.countDocuments({ status: "Đang mở" }),
    Activity.countDocuments({ status: "Chờ phê duyệt" }),
    Activity.countDocuments({ status: "Đã hủy" }),
    Activity.countDocuments({ createdAt: { $gte: startDate, $lte: endDate } }),
  ]);

  // Đếm số sinh viên tham gia trong khoảng thời gian
  const studentRegistrations = await ActivityRegistration.distinct("user", {
    registeredAt: { $gte: startDate, $lte: endDate },
  });

  const summary = [
    { label: "Tổng số hoạt động", value: String(totalActivities) },
    { label: "Tổng số sinh viên", value: String(totalStudents) },
    { label: "Hoạt động đã duyệt", value: String(approvedActivities) },
    { label: "Hoạt động chờ duyệt", value: String(pendingActivities) },
    { label: "Hoạt động bị từ chối", value: String(rejectedActivities) },
    { label: `Hoạt động trong kỳ (${period})`, value: String(activitiesInPeriod) },
    { label: "Sinh viên tham gia trong kỳ", value: String(studentRegistrations.length) },
  ];
  res.json(summary);
};

export const exportReports = async (_req, res) => {
  const reports = await Report.find().populate("generatedBy", "displayName email");
  const header = "title,generatedBy,status,createdAt";
  const rows = reports.map(
    (report) =>
      `${report.title},${report.generatedBy?.displayName || "N/A"},${report.status},${report.createdAt.toISOString()}`
  );

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=reports.csv");
  res.send([header, ...rows].join("\n"));
};

// Advanced features
export const listAdvancedFeatures = async (_req, res) => {
  const features = await AdvancedFeature.find();
  if (!features.length) {
    const defaults = [
      { key: "permissions", title: "Quản lý phân quyền", description: "Tuỳ chỉnh vai trò" },
      { key: "audit", title: "Theo dõi log bảo mật", description: "Ghi nhận hành động" },
      { key: "security", title: "Cài đặt bảo mật", description: "2FA, IP whitelist" },
      { key: "backup", title: "Backup / Restore", description: "Sao lưu định kỳ" },
    ];
    await AdvancedFeature.insertMany(defaults);
    return res.json(defaults);
  }
  res.json(features);
};

export const updateAdvancedFeature = async (req, res) => {
  const { key } = req.params;
  const feature = await AdvancedFeature.findOneAndUpdate({ key }, req.body, {
    new: true,
    upsert: true,
  });
  res.json(feature);
};

// System widgets
export const listSystemWidgets = async (_req, res) => {
  const widgets = await SystemWidget.find();
  if (!widgets.length) {
    const defaults = [
      { key: "site", title: "Cấu hình trang web", description: "Logo, domain, SEO" },
      { key: "api", title: "Quản lý API Key", description: "Sinh / thu hồi khoá" },
      { key: "cluster", title: "Server / Cluster", description: "Theo dõi node backend" },
      { key: "logs", title: "Logs realtime", description: "Stream cảnh báo" },
    ];
    await SystemWidget.insertMany(defaults);
    return res.json(defaults);
  }
  res.json(widgets);
};

export const updateSystemWidget = async (req, res) => {
  const { key } = req.params;
  const widget = await SystemWidget.findOneAndUpdate({ key }, req.body, {
    new: true,
    upsert: true,
  });
  res.json(widget);
};

