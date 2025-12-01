import express from "express";
import {
  refreshToken,
  signIn,
  signOut,
  signUp,
  changePassword,
  verifyEmail,
  requestPasswordReset,
  resetPassword,
} from "../controllers/authControllers.js";
import { verifyToken } from "../Middlewares/authMiddleware.js";

const router = express.Router();

router.post("/signup", signUp);

router.post("/signin", signIn);

router.post("/signout", signOut);

router.post("/refresh", refreshToken);

router.post("/change-password", verifyToken, changePassword);

router.get("/verify-email", verifyEmail);

router.post("/forgot-password", requestPasswordReset);
router.post("/reset-password", resetPassword);

export default router;