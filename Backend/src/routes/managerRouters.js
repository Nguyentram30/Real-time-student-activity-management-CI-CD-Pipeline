import express from "express";
import {
  getManagerDashboard,
  listManagerActivities,
  createManagerActivity,
  previewManagerActivity,
  updateManagerActivity,
  deleteManagerActivity,
  listActivityRegistrations,
  approveRegistration,
  rejectRegistration,
  approveEvidence,
  rejectEvidence,
  listManagerStudents,
  listManagerNotifications,
  createManagerNotification,
  updateManagerNotification,
  deleteManagerNotification,
  listManagerFeedbacks,
  replyFeedback,
  getManagerReports,
  exportManagerReports,
  createActivityQRCode,
  getActivityQRCode,
  checkActivityConflicts,
  listCompletedActivities,
  cloneManagerActivity,
} from "../controllers/managerControllers.js";
import { upload, uploadMultiple } from "../utils/uploadMiddleware.js";
import { uploadFile, uploadMultipleFiles } from "../controllers/uploadControllers.js";

const router = express.Router();

router.get("/dashboard", getManagerDashboard);

router.post("/activities/preview", previewManagerActivity);
router.post("/activities/check-conflicts", checkActivityConflicts);
router.get("/activities/completed", listCompletedActivities);

router
  .route("/activities")
  .get(listManagerActivities)
  .post(createManagerActivity);
router
  .route("/activities/:id")
  .put(updateManagerActivity)
  .delete(deleteManagerActivity);
router.post("/activities/:id/clone", cloneManagerActivity);

router.get("/activities/:id/registrations", listActivityRegistrations);
router.post("/activities/:id/registrations/:registrationId/approve", approveRegistration);
router.post("/activities/:id/registrations/:registrationId/reject", rejectRegistration);
router.post("/activities/:id/registrations/:registrationId/approve-evidence", approveEvidence);
router.post("/activities/:id/registrations/:registrationId/reject-evidence", rejectEvidence);
router.post("/activities/:id/qr-code", createActivityQRCode);
router.get("/activities/:id/qr-code", getActivityQRCode);

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

