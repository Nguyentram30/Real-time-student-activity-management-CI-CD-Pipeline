// @ts-nocheck
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const getTokenFromHeader = (req) => {
  const authHeader = req.headers["authorization"] || req.headers.authorization;
  if (!authHeader) {
    return null;
  }

  const [bearer, token] = authHeader.split(" ");
  if (bearer?.toLowerCase() !== "bearer" || !token) {
    return null;
  }

  return token;
};

const attachUserToRequest = async (decoded) => {
  if (!decoded?.id) {
    return null;
  }

  const user = await User.findById(decoded.id).select("-hashedPassword");
  return user;
};

export const verifyToken = async (req, res, next) => {
  try {
    const token = getTokenFromHeader(req);

    if (!token) {
      return res.status(401).json({ message: "Không tìm thấy access token" });
    }

    let decoded;

    try {
      decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    } catch (error) {
      console.error("verifyToken error", error);
      return res.status(403).json({ message: "Access token hết hạn hoặc không đúng" });
      }

    const user = await attachUserToRequest(decoded);

      if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại." });
      }

      req.user = user;
    req.auth = decoded;
      next();
  } catch (error) {
    console.error("Lỗi khi xác minh JWT trong authMiddleware", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

const buildRoleGuard =
  (allowedRoles) =>
  (req, res, next) => {
    verifyToken(req, res, () => {
      if (!req.user || !allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ message: "Bạn không có quyền truy cập tài nguyên này" });
      }
      next();
    });
  };

export const verifyAdmin = buildRoleGuard(["admin"]);
export const verifyManager = buildRoleGuard(["admin", "manager"]);
export const verifyStudent = buildRoleGuard(["admin", "manager", "student"]);

export const optionalAuth = async (req, _res, next) => {
  const token = getTokenFromHeader(req);

  if (!token) {
      return next();
    }

    try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await attachUserToRequest(decoded);

      if (user) {
        req.user = user;
      }
    } catch (error) {
      console.error("optionalAuth error", error);
    } finally {
      next();
    }
};