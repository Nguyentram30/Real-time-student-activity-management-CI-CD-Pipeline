import Activity from "../models/Activity.js";
import ActivityRegistration from "../models/ActivityRegistration.js";
import Attendance from "../models/Attendance.js";

// Lấy chi tiết hoạt động kèm danh sách sinh viên đăng ký
export const getActivityDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const activity = await Activity.findById(id).lean();
    if (!activity) {
      return res.status(404).json({ message: "Hoạt động không tồn tại" });
    }
    // Lấy danh sách đăng ký
    const registrations = await ActivityRegistration.find({ activity: id }).populate("user", "displayName email").lean();
    const participants = registrations.map((reg) => ({
      displayName: reg.user.displayName,
      email: reg.user.email,
      status: reg.status,
      registeredAt: reg.registeredAt,
    }));
    res.json({
      ...activity,
      participants,
    });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
};

export const listPublicActivities = async (req, res) => {
  // Chỉ hiển thị hoạt động đã được duyệt (status = "Đang mở")
  const activities = await Activity.find({ status: "Đang mở" }).sort({ startTime: -1 }).lean();
  const userId = req.user?._id?.toString();

  const activityIds = activities.map((activity) => activity._id);
  const userRegistrations = userId
    ? await ActivityRegistration.find({ activity: { $in: activityIds }, user: userId })
    : [];

  const registrationMap = new Map();
  userRegistrations.forEach((registration) => {
    registrationMap.set(registration.activity.toString(), registration);
  });

  const mapped = activities.map((activity) => {
    const registration = registrationMap.get(activity._id.toString());

    return {
      id: activity._id,
      _id: activity._id,
      title: activity.title,
      date: activity.startTime,
      startTime: activity.startTime,
      endTime: activity.endTime,
      location: activity.location,
      status: activity.status,
      image: activity.coverImage,
      coverImage: activity.coverImage,
      type: activity.type,
      description: activity.description,
      participantsCount: activity.participantCount,
      participantCount: activity.participantCount,
      maxParticipants: activity.maxParticipants,
      tags: activity.meta?.tags || [],
      registered: Boolean(registration),
      registrationStatus: registration?.status || null,
      isClosed: activity.status === "Đã kết thúc",
      evidenceUrl: registration?.evidenceUrl || null,
      evidenceNote: registration?.evidenceNote || null,
      evidence: registration?.evidenceUrl || registration?.evidenceNote || null,
      createdBy: activity.createdBy,
      meta: activity.meta,
    };
  });

  res.json(mapped);
};

export const registerForActivity = async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const activity = await Activity.findById(id);
  if (!activity) {
    return res.status(404).json({ message: "Hoạt động không tồn tại" });
  }

  const exists = await ActivityRegistration.findOne({ activity: id, user: userId });
  if (exists) {
    return res.status(400).json({ message: "Bạn đã đăng ký hoạt động này" });
  }

  await ActivityRegistration.create({ activity: id, user: userId });
  await Activity.findByIdAndUpdate(id, { $inc: { participantCount: 1 } });

  res.json({ message: "Đăng ký thành công" });
};

export const checkInGps = async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;
  const { lat, lng } = req.body;

  const registration = await ActivityRegistration.findOne({ activity: id, user: userId });
  if (!registration) {
    return res.status(400).json({ message: "Bạn chưa đăng ký hoạt động này" });
  }

  await Attendance.findOneAndUpdate(
    { activity: id, user: userId },
    {
      checkInMethod: "gps",
      checkInTime: new Date(),
      status: "present",
      location: { lat, lng },
    },
    { upsert: true, new: true }
  );

  registration.status = "checked_in";
  await registration.save();

  res.json({ message: "Điểm danh GPS thành công" });
};

export const checkInQr = async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;
  const { code } = req.body;

  const registration = await ActivityRegistration.findOne({ activity: id, user: userId });
  if (!registration) {
    return res.status(400).json({ message: "Bạn chưa đăng ký hoạt động này" });
  }

  await Attendance.findOneAndUpdate(
    { activity: id, user: userId },
    {
      checkInMethod: "qr",
      checkInTime: new Date(),
      status: "present",
      note: `QR:${code}`,
    },
    { upsert: true, new: true }
  );

  registration.status = "checked_in";
  await registration.save();

  res.json({ message: "Điểm danh QR thành công" });
};

export const uploadEvidence = async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;
  const { evidenceUrl, evidenceNote } = req.body;

  if (!evidenceUrl && !evidenceNote) {
    return res.status(400).json({ message: "Vui lòng cung cấp minh chứng" });
  }

  const registration = await ActivityRegistration.findOne({ activity: id, user: userId });
  if (!registration) {
    return res.status(400).json({ message: "Bạn chưa đăng ký hoạt động này" });
  }

  registration.evidenceUrl = evidenceUrl;
  registration.evidenceNote = evidenceNote;
  registration.status = "completed";
  await registration.save();

  res.json({ message: "Nộp minh chứng thành công" });
};

