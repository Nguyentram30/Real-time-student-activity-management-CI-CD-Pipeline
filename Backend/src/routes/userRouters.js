import express from "express";
import { authMe, getUserNotifications } from "../controllers/userControllers.js";

const router = express.Router();

router.get("/me", authMe);
router.get("/notifications", getUserNotifications);

export default router;