export const authMe = async (req, res) => {
  try {
    const user = req.user; // lấy từ authMiddleware

    return res.status(200).json({
      user,
    });
  } catch (error) {
    console.error("Lỗi khi gọi authMe", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// Lấy thông báo cho user (student, manager, admin)
export const getUserNotifications = async (req, res) => {
  try {
    const user = req.user;
    const { role } = user;

    // Lấy thông báo dựa trên role của user
    const Notification = (await import("../models/Notification.js")).default;
    
    let filter = {};
    if (role === "student") {
      // Sinh viên xem thông báo gửi đến student hoặc public
      filter = {
        $or: [
          { targetRoles: { $in: ["student"] } },
          { targetRoles: { $size: 0 } }, // Public notifications
        ],
        status: { $in: ["sent", "scheduled"] },
      };
    } else if (role === "manager") {
      // Manager xem thông báo gửi đến manager hoặc từ admin
      filter = {
        $or: [
          { targetRoles: { $in: ["manager"] } },
          { "createdBy.role": "admin" },
        ],
        status: { $in: ["sent", "scheduled"] },
      };
    } else if (role === "admin") {
      // Admin xem tất cả thông báo
      filter = {};
    }

    const notifications = await Notification.find(filter)
      .populate("createdBy", "displayName email role")
      .sort({ scheduleAt: -1, createdAt: -1 })
      .limit(100);

    return res.status(200).json({ notifications });
  } catch (error) {
    console.error("Lỗi khi lấy thông báo", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};