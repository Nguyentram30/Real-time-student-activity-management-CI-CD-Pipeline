import mongoose from "mongoose";

export const ACTIVITY_STATUSES = [
  "Draft",
  "Pending",
  "Approved",
  "ApprovedWithCondition",
  "NeedEdit",
  "Rejected",
  "Open",
  "Completed",
  "Cancelled",
];

const activitySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    location: { type: String, default: "" },
    type: { type: String, default: "general" },
    status: {
      type: String,
      enum: ACTIVITY_STATUSES,
      default: "Pending",
    },
    isDraft: { type: Boolean, default: false },
    parentActivity: { type: mongoose.Schema.Types.ObjectId, ref: "Activity" },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    start_checkin_time: { type: Date },
    end_checkin_time: { type: Date },
    EvidenceDeadline: { type: Date },
    AttendanceTime: { type: Date },
    maxParticipants: { type: Number, default: 0 },
    coverImage: { type: String },
    participantCount: { type: Number, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    lastReviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    approvalNotes: { type: String },
    conditionNote: { type: String },
    editRequestNote: { type: String },
    meta: {
      visibility: { type: String, enum: ["public", "private"], default: "public" },
      tags: [{ type: String }],
      responsiblePerson: { type: String },
      points: { type: Number, default: 0 },
      documentUrl: { type: String },
      attachments: [{ type: String }],
    },
  },
  { timestamps: true }
);

activitySchema.index({ title: "text", description: "text" });
activitySchema.index({ location: 1, startTime: 1, endTime: 1 });
activitySchema.index({ status: 1, createdBy: 1 });

const Activity = mongoose.model("Activity", activitySchema);
export default Activity;

