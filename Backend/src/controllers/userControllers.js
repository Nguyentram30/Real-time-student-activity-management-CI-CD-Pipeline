import User from "../models/User.js";

export const authMe = async (req, res) => {
  try {
    const user = req.user; // lấy từ authMiddleware
    // Populate thêm thông tin nếu cần
    const fullUser = await User.findById(user._id).select("-hashedPassword");

    return res.status(200).json(fullUser || user);
  } catch (error) {
    console.error("Lỗi khi gọi authMe", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { displayName, studentCode, dateOfBirth, class: userClass, department, email, phoneNumber, address, avatar } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }

    // Validate email format
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: "Email không đúng định dạng" });
    }

    // Validate phone number (10 digits)
    if (phoneNumber && !/^\d{10}$/.test(phoneNumber)) {
      return res.status(400).json({ message: "Số điện thoại phải có 10 số" });
    }

    // Update fields
    if (displayName !== undefined) user.displayName = displayName;
    if (studentCode !== undefined) user.studentCode = studentCode;
    if (dateOfBirth !== undefined) user.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : null;
    if (userClass !== undefined) user.class = userClass;
    if (department !== undefined) user.department = department;
    if (email !== undefined) user.email = email;
    if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;
    if (address !== undefined) user.address = address;
    if (avatar !== undefined) user.avatar = avatar;

    await user.save();

    return res.status(200).json({ message: "Cập nhật thông tin thành công", user });
  } catch (error) {
    console.error("Lỗi khi cập nhật thông tin", error);
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