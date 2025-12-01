import express from "express";
import { authMe, getUserNotifications, updateUserProfile } from "../controllers/userControllers.js";

const router = express.Router();

router.get("/me", authMe);
router.put("/me", updateUserProfile);
router.get("/notifications", getUserNotifications);

export default router;