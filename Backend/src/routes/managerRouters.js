import express from "express";
import {
  getManagerDashboard,
  listManagerActivities,
  createManagerActivity,
  updateManagerActivity,
  deleteManagerActivity,
  listActivityRegistrations,
  approveRegistration,
  rejectRegistration,
  listManagerStudents,
  listManagerNotifications,
  createManagerNotification,
  updateManagerNotification,
  deleteManagerNotification,
  listManagerFeedbacks,
  replyFeedback,
  getManagerReports,
  exportManagerReports,
} from "../controllers/managerControllers.js";
import { upload, uploadMultiple } from "../utils/uploadMiddleware.js";
import { uploadFile, uploadMultipleFiles } from "../controllers/uploadControllers.js";

const router = express.Router();

router.get("/dashboard", getManagerDashboard);

router
  .route("/activities")
  .get(listManagerActivities)
  .post(createManagerActivity);
router
  .route("/activities/:id")
  .put(updateManagerActivity)
  .delete(deleteManagerActivity);

router.get("/activities/:id/registrations", listActivityRegistrations);
router.post("/activities/:id/registrations/:registrationId/approve", approveRegistration);
router.post("/activities/:id/registrations/:registrationId/reject", rejectRegistration);

router.get("/students", listManagerStudents);

router
  .route("/notifications")
  .get(listManagerNotifications)
  .post(createManagerNotification);
router
  .route("/notifications/:id")
  .put(updateManagerNotification)
  .delete(deleteManagerNotification);

router.get("/reports", getManagerReports);
router.get("/reports/export", exportManagerReports);

// Feedback routes
router.get("/feedbacks", listManagerFeedbacks);
router.post("/feedbacks/:id/reply", upload.single("file"), replyFeedback);

// Upload routes
router.post("/upload", upload.single("file"), uploadFile);
router.post("/upload/multiple", uploadMultiple.array("files", 10), uploadMultipleFiles);

export default router;

