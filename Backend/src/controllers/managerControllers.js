import User from "../models/User.js";
import Activity from "../models/Activity.js";
import Notification from "../models/Notification.js";
import ActivityRegistration from "../models/ActivityRegistration.js";
import Feedback from "../models/Feedback.js";
import { getFileUrl } from "../utils/uploadMiddleware.js";

const formatSearchRegex = (value) => new RegExp(value, "i");

// Dashboard
export const getManagerDashboard = async (req, res) => {
  const managerId = req.user._id;
  
  const [totalActivities, pendingRegistrations, totalStudents, totalNotifications, activeActivities, completedActivities] = await Promise.all([
    Activity.countDocuments({ createdBy: managerId }),
    Activity.countDocuments({ createdBy: managerId, status: "Chờ phê duyệt" }),
    User.countDocuments({ role: "student" }), // Có thể filter theo đơn vị quản lý
    Notification.countDocuments({ createdBy: managerId }),
    Activity.countDocuments({ createdBy: managerId, status: "Đang mở" }),
    Activity.countDocuments({ createdBy: managerId, status: "Đã kết thúc" }),
  ]);

  return res.json({
    totalActivities,
    pendingRegistrations,
    totalStudents,
    totalNotifications,
    activeActivities,
    completedActivities,
  });
};

// Activities
export const listManagerActivities = async (req, res) => {
  const managerId = req.user._id;
  const { search, status, dateFilter } = req.query;
  
  const filter = { createdBy: managerId };
  if (search) filter.title = formatSearchRegex(search);
  if (status && status !== "all") filter.status = status;
  
  // Date filter logic
  if (dateFilter && dateFilter !== "all") {
    const now = new Date();
    if (dateFilter === "today") {
      filter.createdAt = { $gte: new Date(now.setHours(0, 0, 0, 0)) };
    } else if (dateFilter === "week") {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      filter.createdAt = { $gte: weekAgo };
    } else if (dateFilter === "month") {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      filter.createdAt = { $gte: monthAgo };
    }
  }

  const activities = await Activity.find(filter).sort({ startTime: -1 });
  res.json({ activities });
};

export const createManagerActivity = async (req, res) => {
  const managerId = req.user._id;
  const payload = {
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
    createdBy: managerId,
  };

  const activity = await Activity.create(payload);
  res.status(201).json(activity);
};

export const updateManagerActivity = async (req, res) => {
  const { id } = req.params;
  const managerId = req.user._id;
  
  const activity = await Activity.findOne({ _id: id, createdBy: managerId });
  if (!activity) {
    return res.status(404).json({ message: "Hoạt động không tồn tại hoặc không có quyền" });
  }

  Object.assign(activity, {
    title: req.body.title ?? activity.title,
    description: req.body.description ?? activity.description,
    location: req.body.location ?? activity.location,
    type: req.body.type ?? activity.type,
    status: req.body.status ?? activity.status,
    startTime: req.body.startTime ?? activity.startTime,
    endTime: req.body.endTime ?? activity.endTime,
    maxParticipants: req.body.maxParticipants ?? activity.maxParticipants,
    coverImage: req.body.coverImage ?? activity.coverImage,
    meta: req.body.meta ?? activity.meta,
  });
  await activity.save();
  res.json(activity);
};

export const deleteManagerActivity = async (req, res) => {
  const { id } = req.params;
  const managerId = req.user._id;
  
  const activity = await Activity.findOneAndDelete({ _id: id, createdBy: managerId });
  if (!activity) {
    return res.status(404).json({ message: "Hoạt động không tồn tại hoặc không có quyền" });
  }
  res.sendStatus(204);
};

// Students
export const listManagerStudents = async (req, res) => {
  const { search } = req.query;
  const filter = { role: "student" };
  
  if (search) {
    filter.$or = [
      { displayName: formatSearchRegex(search) },
      { email: formatSearchRegex(search) },
      { username: formatSearchRegex(search) },
    ];
  }

  const students = await User.find(filter).select("-hashedPassword");
  res.json({ students: students.map(s => ({
    id: s._id.toString(),
    studentId: s.studentCode || s.username,
    fullName: s.displayName,
    email: s.email,
    phone: s.phoneNumber,
    faculty: s.department || "Chưa cập nhật",
    class: s.class || "Chưa cập nhật",
    activitiesCount: 0, // TODO: Count from registrations
    points: 0, // TODO: Calculate from activities
    status: s.status || "active",
  })) });
};

// Notifications
export const listManagerNotifications = async (req, res) => {
  const managerId = req.user._id;
  const { search } = req.query;
  
  const filter = { createdBy: managerId };
  if (search) {
    filter.$or = [
      { title: formatSearchRegex(search) },
      { message: formatSearchRegex(search) },
    ];
  }

  const notifications = await Notification.find(filter).sort({ createdAt: -1 });
  res.json({ notifications });
};

export const createManagerNotification = async (req, res) => {
  const managerId = req.user._id;
  const payload = {
    title: req.body.title,
    message: req.body.message || req.body.content,
    targetRoles: req.body.targetRoles || (req.body.targetGroup ? [req.body.targetGroup] : ["student"]),
    scheduleAt: req.body.scheduleAt || req.body.schedule || new Date(),
    status: req.body.status ?? "draft",
    createdBy: managerId,
    relatedActivity: req.body.activityId,
    metadata: req.body.metadata,
  };

  if (!payload.message) {
    return res.status(400).json({ message: "Nội dung thông báo không được bỏ trống" });
  }

  const notification = await Notification.create(payload);
  res.status(201).json(notification);
};

export const updateManagerNotification = async (req, res) => {
  const { id } = req.params;
  const managerId = req.user._id;
  
  const notification = await Notification.findOne({ _id: id, createdBy: managerId });
  if (!notification) {
    return res.status(404).json({ message: "Thông báo không tồn tại hoặc không có quyền" });
  }

  Object.assign(notification, {
    title: req.body.title ?? notification.title,
    message: req.body.message || req.body.content || notification.message,
    targetRoles:
      req.body.targetRoles ||
      (req.body.targetGroup ? [req.body.targetGroup] : notification.targetRoles),
    scheduleAt: req.body.scheduleAt || req.body.schedule || notification.scheduleAt,
    status: req.body.status ?? notification.status,
    relatedActivity: req.body.activityId ?? notification.relatedActivity,
    metadata: req.body.metadata ?? notification.metadata,
  });
  await notification.save();
  res.json(notification);
};

export const deleteManagerNotification = async (req, res) => {
  const { id } = req.params;
  const managerId = req.user._id;
  
  const notification = await Notification.findOneAndDelete({ _id: id, createdBy: managerId });
  if (!notification) {
    return res.status(404).json({ message: "Thông báo không tồn tại hoặc không có quyền" });
  }
  res.sendStatus(204);
};

// Activity Registrations
export const listActivityRegistrations = async (req, res) => {
  const { id } = req.params;
  const managerId = req.user._id;

  // Verify activity belongs to manager
  const activity = await Activity.findOne({ _id: id, createdBy: managerId });
  if (!activity) {
    return res.status(404).json({ message: "Hoạt động không tồn tại hoặc không có quyền" });
  }

  const registrations = await ActivityRegistration.find({ activity: id })
    .populate("user", "displayName email studentCode department class")
    .sort({ registeredAt: -1 });

  res.json({ registrations });
};

export const approveRegistration = async (req, res) => {
  const { id, registrationId } = req.params;
  const managerId = req.user._id;

  // Verify activity belongs to manager
  const activity = await Activity.findOne({ _id: id, createdBy: managerId });
  if (!activity) {
    return res.status(404).json({ message: "Hoạt động không tồn tại hoặc không có quyền" });
  }

  const registration = await ActivityRegistration.findOne({
    _id: registrationId,
    activity: id,
  });

  if (!registration) {
    return res.status(404).json({ message: "Đăng ký không tồn tại" });
  }

  registration.status = "approved";
  registration.note = req.body.note || registration.note;
  await registration.save();

  res.json({ message: "Đã duyệt đăng ký", registration });
};

export const rejectRegistration = async (req, res) => {
  const { id, registrationId } = req.params;
  const managerId = req.user._id;

  // Verify activity belongs to manager
  const activity = await Activity.findOne({ _id: id, createdBy: managerId });
  if (!activity) {
    return res.status(404).json({ message: "Hoạt động không tồn tại hoặc không có quyền" });
  }

  const registration = await ActivityRegistration.findOne({
    _id: registrationId,
    activity: id,
  });

  if (!registration) {
    return res.status(404).json({ message: "Đăng ký không tồn tại" });
  }

  registration.status = "rejected";
  registration.note = req.body.reason || req.body.note || "Bị từ chối bởi Manager";
  await registration.save();

  res.json({ message: "Đã từ chối đăng ký", registration });
};

// Reports
export const getManagerReports = async (req, res) => {
  const managerId = req.user._id;
  
  const [totalActivities, totalStudents, completedActivities] = await Promise.all([
    Activity.countDocuments({ createdBy: managerId }),
    User.countDocuments({ role: "student" }),
    Activity.countDocuments({ createdBy: managerId, status: "Đã kết thúc" }),
  ]);

  const rate = totalActivities > 0 ? Math.round((completedActivities / totalActivities) * 100) : 0;

  res.json({
    totalActivities,
    totalStudents,
    completionRate: `${rate}%`,
    totalPoints: 0, // TODO: Calculate from activity points
  });
};

// Export aggregated reports (CSV / PDF)
export const exportManagerReports = async (req, res) => {
  try {
    const managerId = req.user._id;
    const format = (req.query.format || "csv").toLowerCase();

    // find activities owned by manager
    const activities = await Activity.find({ createdBy: managerId }).sort({ startTime: -1 });

    // build CSV rows
    const header = [
      "Activity ID",
      "Activity Title",
      "Participant Name",
      "Participant Email",
      "Student ID",
      "Registered At",
      "Attendance Times",
      "Result",
    ];

    const rows = [header];

    for (const act of activities) {
      const regs = await ActivityRegistration.find({ activity: act._id }).populate("user", "displayName email studentCode");
      if (!regs || regs.length === 0) {
        rows.push([act._id.toString(), act.title || "", "", "", "", "", "", ""]);
        continue;
      }
      for (const r of regs) {
        const name = r.user?.displayName || r.displayName || "";
        const email = r.user?.email || r.email || "";
        const studentId = r.user?.studentCode || r.studentId || "";
        const registeredAt = r.registeredAt ? new Date(r.registeredAt).toISOString() : "";
        const attendance = Array.isArray(r.attendanceTimes) ? r.attendanceTimes.join("; ") : (r.attendanceTimes || "");
        const result = r.result || r.status || "";
        rows.push([act._id.toString(), act.title || "", name, email, studentId, registeredAt, attendance, result]);
      }
    }

    if (format === "pdf") {
      // simple html table for printing
      const table = `
        <html><head><meta charset="utf-8"><title>Báo cáo hoạt động</title>
        <style>table{width:100%;border-collapse:collapse}td,th{border:1px solid #ccc;padding:6px}</style>
        </head><body>
        <h2>Báo cáo hoạt động</h2>
        <table><thead><tr>${header.map(h=>`<th>${h}</th>`).join("")}</tr></thead>
        <tbody>${rows.slice(1).map(r=>`<tr>${r.map(c=>`<td>${String(c||"")}</td>`).join("")}</tr>`).join("")}</tbody>
        </table></body></html>`;
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.setHeader("Content-Disposition", `attachment; filename="manager_reports.html"`);
      return res.send(table);
    }

    // default: csv/excel -> return CSV
    const csv = rows.map(r => r.map(c => `"${String(c||"").replace(/"/g, '""')}"`).join(",")).join("\n");
    const filename = `manager_reports_${new Date().toISOString().slice(0,19).replace(/[:T]/g,'-')}.${format === 'excel' ? 'csv' : format}`;
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    return res.send(csv);
  } catch (error) {
    console.error("Export reports error", error);
    return res.status(500).json({ message: "Không thể xuất báo cáo" });
  }
};

// Feedbacks for manager's activities
export const listManagerFeedbacks = async (req, res) => {
  const managerId = req.user._id;
  // find activities by manager
  const activities = await Activity.find({ createdBy: managerId }).select("_id");
  const activityIds = activities.map((a) => a._id);

  const feedbacks = await Feedback.find({ activity: { $in: activityIds } })
    .populate("user", "displayName studentCode email")
    .sort({ createdAt: -1 });

  res.json({ feedbacks });
};

export const replyFeedback = async (req, res) => {
  try {
    const managerId = req.user._id;
    const { id } = req.params;

    const feedback = await Feedback.findById(id).populate("activity");
    if (!feedback) return res.status(404).json({ message: "Feedback not found" });

    // verify manager owns the activity
    if (!feedback.activity || String(feedback.activity.createdBy) !== String(managerId)) {
      return res.status(403).json({ message: "Không có quyền" });
    }

    const { response } = req.body;
    if (response) feedback.response = response;

    if (req.file) {
      feedback.responseAttachmentUrl = getFileUrl(req.file.filename);
    } else if (req.body.fileUrl) {
      feedback.responseAttachmentUrl = req.body.fileUrl;
    }

    feedback.status = "published";
    await feedback.save();

    res.json({ feedback });
  } catch (error) {
    console.error("Reply feedback error", error);
    res.status(500).json({ message: "Không thể phản hồi feedback" });
  }
};

