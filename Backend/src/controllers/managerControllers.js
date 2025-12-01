import User from "../models/User.js";
import Activity, { ACTIVITY_STATUSES } from "../models/Activity.js";
import Notification from "../models/Notification.js";
import ActivityRegistration from "../models/ActivityRegistration.js";
import Feedback from "../models/Feedback.js";
import ActivityQRCode from "../models/ActivityQRCode.js";
import { getFileUrl } from "../utils/uploadMiddleware.js";
import { sendEmail } from "../services/emailService.js";

const formatSearchRegex = (value) => new RegExp(value, "i");

const MANAGER_ALLOWED_CREATE_STATUSES = new Set(["Draft", "Pending"]);
const ACTIVE_STATUSES = ["Approved", "ApprovedWithCondition", "Open"];
const COMPLETED_STATUSES = ["Completed"];
const NON_BLOCKING_STATUSES = ["Cancelled", "Rejected"];
const STATUS_FILTER_MAP = {
  draft: ["Draft"],
  pending: ["Pending"],
  approved: ["Approved"],
  approvedwithcondition: ["ApprovedWithCondition"],
  neededit: ["NeedEdit"],
  rejected: ["Rejected"],
  active: ACTIVE_STATUSES,
  open: ["Open"],
  completed: COMPLETED_STATUSES,
  cancelled: ["Cancelled"],
};

const resolveStatusFilter = (value) => {
  if (!value || value === "all") return null;
  const normalized = value.toLowerCase();
  if (STATUS_FILTER_MAP[normalized]) {
    return STATUS_FILTER_MAP[normalized];
  }
  if (ACTIVITY_STATUSES.includes(value)) {
    return [value];
  }
  return null;
};

const toBoolean = (value, fallback = false) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    return value.toLowerCase() === "true";
  }
  return fallback;
};

const sanitizeStatus = (requestedStatus = "Pending") => {
  if (!requestedStatus || !ACTIVITY_STATUSES.includes(requestedStatus)) {
    return "Pending";
  }
  return requestedStatus;
};

const getStatusForCreation = (status) => {
  const normalized = sanitizeStatus(status);
  if (MANAGER_ALLOWED_CREATE_STATUSES.has(normalized)) {
    return normalized;
  }
  return "Pending";
};

const buildConflictQuery = ({ location, startTime, endTime, excludeId }) => {
  if (!location || !startTime || !endTime) return null;
  return {
    location,
    _id: excludeId ? { $ne: excludeId } : undefined,
    status: { $nin: NON_BLOCKING_STATUSES },
    startTime: { $lt: endTime },
    endTime: { $gt: startTime },
  };
};

const suggestAlternativeSlots = (startTime, endTime) => {
  const suggestions = [];
  if (!startTime || !endTime) return suggestions;
  const durationMs = endTime.getTime() - startTime.getTime();
  let cursor = new Date(endTime.getTime());
  for (let i = 0; i < 2; i++) {
    const suggestedStart = new Date(cursor.getTime() + i * durationMs);
    const suggestedEnd = new Date(suggestedStart.getTime() + durationMs);
    suggestions.push({
      startTime: suggestedStart.toISOString(),
      endTime: suggestedEnd.toISOString(),
      label: `${suggestedStart.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })} - ${suggestedEnd.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}`,
    });
  }
  return suggestions;
};

const detectConflicts = async ({ location, startTime, endTime, excludeId }) => {
  const query = buildConflictQuery({ location, startTime, endTime, excludeId });
  if (!query) return [];
  return Activity.find(query).select("title startTime endTime location status");
};

const notifyAdminsOfNewActivity = async (activity) => {
  const admins = await User.find({ role: "admin", status: "active" }).select("email displayName");
  if (admins.length === 0) return;

  await Notification.create({
    title: "Hoạt động mới chờ phê duyệt",
    message: `Hoạt động "${activity.title}" cần được phê duyệt.`,
    targetRoles: ["admin"],
    relatedActivity: activity._id,
    createdBy: activity.createdBy,
    metadata: {
      activityId: activity._id.toString(),
      managerId: activity.createdBy.toString(),
    },
  });

  const emailRecipients = admins.filter((admin) => admin.email);
  await Promise.all(
    emailRecipients.map((admin) =>
      sendEmail({
        to: admin.email,
        subject: "[STU Leader] Hoạt động mới cần phê duyệt",
        html: `<p>Xin chào ${admin.displayName || "Admin"},</p>
        <p>Hoạt động <strong>${activity.title}</strong> vừa được gửi chờ phê duyệt.</p>
        <p>Vui lòng truy cập hệ thống để xử lý.</p>`,
      })
    )
  );
};

const validateCheckInWindow = (start, end) => {
  if (start && end && end <= start) {
    return "Thời gian kết thúc điểm danh phải lớn hơn thời gian bắt đầu điểm danh";
  }
  return null;
};

const parseMeta = (body = {}) => {
  const tags = Array.isArray(body.tags)
    ? body.tags
    : typeof body.tags === "string"
    ? body.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)
    : [];

  const meta = {
    visibility: body.meta?.visibility || body.visibility || "public",
    tags,
    responsiblePerson: body.meta?.responsiblePerson || body.responsiblePerson,
    points: body.meta?.points ?? (body.points ? Number(body.points) : 0),
    documentUrl: body.meta?.documentUrl || body.documentUrl,
  };

  if (body.meta?.attachments || body.attachments) {
    const attachments = Array.isArray(body.meta?.attachments || body.attachments)
      ? body.meta?.attachments || body.attachments
      : String(body.meta?.attachments || body.attachments)
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);
    meta.attachments = attachments;
  }

  return meta;
};

const buildActivityPayload = (body, managerId, status) => {
  const startTime = body.startTime ? new Date(body.startTime) : undefined;
  const endTime = body.endTime ? new Date(body.endTime) : undefined;
  const startCheckIn = body.start_checkin_time ? new Date(body.start_checkin_time) : undefined;
  const endCheckIn = body.end_checkin_time ? new Date(body.end_checkin_time) : undefined;
  const evidenceDeadline = body.EvidenceDeadline ? new Date(body.EvidenceDeadline) : undefined;
  const attendanceTime = body.AttendanceTime ? new Date(body.AttendanceTime) : undefined;

  return {
    title: body.title,
    description: body.description,
    location: body.location,
    type: body.type || "general",
    status,
    isDraft: status === "Draft",
    parentActivity: body.parentActivity || body.parentActivityId || undefined,
    startTime,
    endTime,
    start_checkin_time: startCheckIn,
    end_checkin_time: endCheckIn,
    EvidenceDeadline: evidenceDeadline,
    AttendanceTime: attendanceTime,
    maxParticipants: body.maxParticipants ? Number(body.maxParticipants) : 0,
    coverImage: body.coverImage,
    participantCount: body.participantCount || 0,
    createdBy: managerId,
    meta: parseMeta(body),
  };
};

const mergeMeta = (currentMeta = {}, body = {}) => {
  const base = { ...(currentMeta?.toObject ? currentMeta.toObject() : currentMeta) };
  const parsed = parseMeta(body);
  return { ...base, ...parsed };
};

// Dashboard
export const getManagerDashboard = async (req, res) => {
  const managerId = req.user._id;
  
  const [totalActivities, pendingRegistrations, totalStudents, totalNotifications, activeActivities, completedActivities] = await Promise.all([
    Activity.countDocuments({ createdBy: managerId }),
    Activity.countDocuments({ createdBy: managerId, status: { $in: ["Pending", "NeedEdit"] } }),
    User.countDocuments({ role: "student" }), // Có thể filter theo đơn vị quản lý
    Notification.countDocuments({ createdBy: managerId }),
    Activity.countDocuments({ createdBy: managerId, status: { $in: ACTIVE_STATUSES } }),
    Activity.countDocuments({ createdBy: managerId, status: { $in: COMPLETED_STATUSES } }),
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
  const statusFilter = resolveStatusFilter(status);
  if (statusFilter) {
    filter.status = statusFilter.length === 1 ? statusFilter[0] : { $in: statusFilter };
  }
  
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
  try {
    const requestedStatus = getStatusForCreation(req.body.status || req.body.action);
    const payload = buildActivityPayload(req.body, managerId, requestedStatus);

    const validationMessage = validateCheckInWindow(payload.start_checkin_time, payload.end_checkin_time);
    if (validationMessage) {
      return res.status(400).json({ message: validationMessage });
    }

    const ignoreConflicts = toBoolean(req.body.ignoreConflicts, false);
    if (!ignoreConflicts) {
      const conflicts = await detectConflicts({
        location: payload.location,
        startTime: payload.startTime,
        endTime: payload.endTime,
      });
      if (conflicts.length > 0) {
        return res.status(409).json({
          message: `Địa điểm ${payload.location} đã có hoạt động trong cùng thời gian.`,
          conflicts,
          suggestions: suggestAlternativeSlots(payload.startTime, payload.endTime),
        });
      }
    }

    const activity = await Activity.create(payload);

    if (requestedStatus !== "Draft") {
      await notifyAdminsOfNewActivity(activity);
    }

    res.status(201).json(activity);
  } catch (error) {
    console.error("createManagerActivity error", error);
    res.status(500).json({ message: "Không thể tạo hoạt động" });
  }
};

export const previewManagerActivity = async (req, res) => {
  const managerId = req.user._id;
  try {
    const status = getStatusForCreation(req.body.status || req.body.action);
    const payload = buildActivityPayload(req.body, managerId, status);

    if (!payload.startTime || !payload.endTime) {
      return res.status(400).json({ message: "Vui lòng nhập đầy đủ thời gian bắt đầu và kết thúc" });
    }

    const validationMessage = validateCheckInWindow(payload.start_checkin_time, payload.end_checkin_time);
    if (validationMessage) {
      return res.status(400).json({ message: validationMessage });
    }

    const durationMinutes = Math.round((payload.endTime - payload.startTime) / (1000 * 60));
    res.json({
      preview: {
        ...payload,
        durationMinutes,
      },
    });
  } catch (error) {
    console.error("previewManagerActivity error", error);
    res.status(500).json({ message: "Không thể tạo bản xem trước" });
  }
};

export const checkActivityConflicts = async (req, res) => {
  try {
    const { location, startTime, endTime, activityId } = req.body;
    if (!location || !startTime || !endTime) {
      return res.status(400).json({ message: "Thiếu thông tin địa điểm hoặc thời gian" });
    }

    const conflicts = await detectConflicts({
      location,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      excludeId: activityId,
    });

    res.json({
      hasConflict: conflicts.length > 0,
      conflicts,
      suggestions: conflicts.length > 0 ? suggestAlternativeSlots(new Date(startTime), new Date(endTime)) : [],
    });
  } catch (error) {
    console.error("checkActivityConflicts error", error);
    res.status(500).json({ message: "Không thể kiểm tra xung đột" });
  }
};

export const updateManagerActivity = async (req, res) => {
  const { id } = req.params;
  const managerId = req.user._id;
  
  try {
    const activity = await Activity.findOne({ _id: id, createdBy: managerId });
    if (!activity) {
      return res.status(404).json({ message: "Hoạt động không tồn tại hoặc không có quyền" });
    }

    const updatedStartTime = req.body.startTime ? new Date(req.body.startTime) : activity.startTime;
    const updatedEndTime = req.body.endTime ? new Date(req.body.endTime) : activity.endTime;
    const updatedLocation = req.body.location ?? activity.location;

    const newStartCheckIn =
      req.body.start_checkin_time !== undefined
        ? req.body.start_checkin_time
          ? new Date(req.body.start_checkin_time)
          : undefined
        : activity.start_checkin_time;
    const newEndCheckIn =
      req.body.end_checkin_time !== undefined
        ? req.body.end_checkin_time
          ? new Date(req.body.end_checkin_time)
          : undefined
        : activity.end_checkin_time;

    const validationMessage = validateCheckInWindow(newStartCheckIn, newEndCheckIn);
    if (validationMessage) {
      return res.status(400).json({ message: validationMessage });
    }

    const ignoreConflicts = toBoolean(req.body.ignoreConflicts, false);
    if (!ignoreConflicts && updatedLocation && updatedStartTime && updatedEndTime) {
      const conflicts = await detectConflicts({
        location: updatedLocation,
        startTime: updatedStartTime,
        endTime: updatedEndTime,
        excludeId: id,
      });
      if (conflicts.length > 0) {
        return res.status(409).json({
          message: `Địa điểm ${updatedLocation} đã có hoạt động trong cùng thời gian.`,
          conflicts,
          suggestions: suggestAlternativeSlots(updatedStartTime, updatedEndTime),
        });
      }
    }

    const metaKeys = ["meta", "tags", "responsiblePerson", "points", "documentUrl", "visibility", "attachments"];
    const shouldUpdateMeta = metaKeys.some((key) => req.body[key] !== undefined);

    if (req.body.title !== undefined) activity.title = req.body.title;
    if (req.body.description !== undefined) activity.description = req.body.description;
    if (req.body.location !== undefined) activity.location = req.body.location;
    if (req.body.type !== undefined) activity.type = req.body.type;
    if (req.body.startTime !== undefined) activity.startTime = updatedStartTime;
    if (req.body.endTime !== undefined) activity.endTime = updatedEndTime;
    if (req.body.start_checkin_time !== undefined) activity.start_checkin_time = newStartCheckIn;
    if (req.body.end_checkin_time !== undefined) activity.end_checkin_time = newEndCheckIn;
    if (req.body.EvidenceDeadline !== undefined) {
      activity.EvidenceDeadline = req.body.EvidenceDeadline ? new Date(req.body.EvidenceDeadline) : undefined;
    }
    if (req.body.AttendanceTime !== undefined) {
      activity.AttendanceTime = req.body.AttendanceTime ? new Date(req.body.AttendanceTime) : undefined;
    }
    if (req.body.maxParticipants !== undefined) {
      activity.maxParticipants = Number(req.body.maxParticipants) || 0;
    }
    if (req.body.coverImage !== undefined) activity.coverImage = req.body.coverImage || undefined;
    if (shouldUpdateMeta) {
      activity.meta = mergeMeta(activity.meta, req.body);
    }

    let nextStatus = activity.status;
    let notifyAdmin = false;
    if (req.body.status) {
      const requestedStatus = sanitizeStatus(req.body.status);
      if (activity.status === "Draft" || activity.status === "NeedEdit") {
        if (requestedStatus === "Draft" || requestedStatus === "Pending") {
          nextStatus = requestedStatus;
          notifyAdmin = requestedStatus === "Pending";
        }
      }
    }

    const statusChanged = nextStatus !== activity.status;
    if (statusChanged) {
      activity.status = nextStatus;
      activity.isDraft = nextStatus === "Draft";
      if (nextStatus !== "NeedEdit") {
        activity.editRequestNote = undefined;
      }
    }

    await activity.save();

    if (notifyAdmin) {
      await notifyAdminsOfNewActivity(activity);
    }

    res.json(activity);
  } catch (error) {
    console.error("updateManagerActivity error", error);
    res.status(500).json({ message: "Không thể cập nhật hoạt động" });
  }
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

export const listCompletedActivities = async (req, res) => {
  const managerId = req.user._id;
  const { limit = 20 } = req.query;
  const parsedLimit = Math.max(1, Math.min(Number(limit) || 20, 100));

  const activities = await Activity.find({
    createdBy: managerId,
    status: { $in: COMPLETED_STATUSES },
  })
    .sort({ endTime: -1 })
    .limit(parsedLimit)
    .select("title startTime endTime location meta points status");

  res.json({ activities });
};

export const cloneManagerActivity = async (req, res) => {
  const { id } = req.params;
  const managerId = req.user._id;
  try {
    const source = await Activity.findOne({ _id: id, createdBy: managerId });
    if (!source) {
      return res.status(404).json({ message: "Hoạt động nguồn không tồn tại hoặc không có quyền" });
    }

    const cloned = await Activity.create({
      title: `${source.title} (Bản sao)`,
      description: source.description,
      location: source.location,
      type: source.type,
      status: "Draft",
      isDraft: true,
      parentActivity: source._id,
      startTime: source.startTime,
      endTime: source.endTime,
      start_checkin_time: source.start_checkin_time,
      end_checkin_time: source.end_checkin_time,
      EvidenceDeadline: source.EvidenceDeadline,
      AttendanceTime: source.AttendanceTime,
      maxParticipants: source.maxParticipants,
      coverImage: source.coverImage,
      participantCount: 0,
      createdBy: managerId,
      meta: source.meta?.toObject ? source.meta.toObject() : source.meta,
    });

    res.status(201).json(cloned);
  } catch (error) {
    console.error("cloneManagerActivity error", error);
    res.status(500).json({ message: "Không thể sao chép hoạt động" });
  }
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

// Evidence Approval
export const approveEvidence = async (req, res) => {
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

  if (!registration.evidenceUrl && !registration.evidenceNote) {
    return res.status(400).json({ message: "Sinh viên chưa nộp minh chứng" });
  }

  registration.status = "completed";
  await registration.save();

  res.json({ message: "Đã duyệt minh chứng hoàn thành", registration });
};

export const rejectEvidence = async (req, res) => {
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

  // Reset evidence and status to checked_in (require re-upload)
  registration.evidenceUrl = undefined;
  registration.evidenceNote = undefined;
  registration.status = "checked_in";
  registration.note = req.body.reason || "Minh chứng không đạt yêu cầu, vui lòng upload lại";
  await registration.save();

  res.json({ message: "Đã từ chối minh chứng, yêu cầu upload lại", registration });
};

// Reports
export const getManagerReports = async (req, res) => {
  const managerId = req.user._id;
  
  const [totalActivities, totalStudents, completedActivities] = await Promise.all([
    Activity.countDocuments({ createdBy: managerId }),
    User.countDocuments({ role: "student" }),
    Activity.countDocuments({ createdBy: managerId, status: { $in: COMPLETED_STATUSES } }),
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

// QR Code Management
export const createActivityQRCode = async (req, res) => {
  try {
    const { id } = req.params;
    const managerId = req.user._id;
    const { expiresAt } = req.body;

    // Verify activity belongs to manager
    const activity = await Activity.findOne({ _id: id, createdBy: managerId });
    if (!activity) {
      return res.status(404).json({ message: "Hoạt động không tồn tại hoặc không có quyền" });
    }

    // Generate QR code (simple format: ACTIVITY_ID_TIMESTAMP)
    const qrCode = `ACT-${id}-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;

    // Delete existing QR code if any
    await ActivityQRCode.findOneAndDelete({ activity: id });

    // Create new QR code
    const qrCodeRecord = await ActivityQRCode.create({
      activity: id,
      qrCode,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      isActive: true,
      createdBy: managerId,
    });

    res.json({ 
      message: "Tạo mã QR thành công",
      qrCode: qrCodeRecord.qrCode,
      qrCodeRecord 
    });
  } catch (error) {
    console.error("Create QR code error", error);
    res.status(500).json({ message: "Không thể tạo mã QR" });
  }
};

export const getActivityQRCode = async (req, res) => {
  try {
    const { id } = req.params;
    const managerId = req.user._id;

    // Verify activity belongs to manager
    const activity = await Activity.findOne({ _id: id, createdBy: managerId });
    if (!activity) {
      return res.status(404).json({ message: "Hoạt động không tồn tại hoặc không có quyền" });
    }

    const qrCodeRecord = await ActivityQRCode.findOne({ activity: id, isActive: true });

    if (!qrCodeRecord) {
      return res.status(404).json({ message: "Chưa có mã QR cho hoạt động này" });
    }

    res.json({ qrCodeRecord });
  } catch (error) {
    console.error("Get QR code error", error);
    res.status(500).json({ message: "Không thể lấy mã QR" });
  }
};

