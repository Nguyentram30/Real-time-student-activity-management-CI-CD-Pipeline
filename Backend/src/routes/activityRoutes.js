import express from "express";
import {
  checkInGps,
  checkInQr,
  listPublicActivities,
  registerForActivity,
  uploadEvidence,
  getActivityDetail,
} from "../controllers/activityPublicControllers.js";
import { optionalAuth, verifyToken } from "../Middlewares/authMiddleware.js";
import { upload } from "../utils/uploadMiddleware.js";

const router = express.Router();

router.get("/", optionalAuth, listPublicActivities);
router.get("/:id", optionalAuth, getActivityDetail);
router.post("/:id/register", verifyToken, registerForActivity);
router.post("/:id/checkin/gps", verifyToken, checkInGps);
router.post("/:id/checkin/qr", verifyToken, checkInQr);
router.post("/:id/upload", verifyToken, upload.single("file"), uploadEvidence);

export default router;

