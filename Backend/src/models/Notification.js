import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    targetRoles: {
      type: [String],
      enum: ["student", "manager", "admin"],
      default: ["student"],
    },
    scheduleAt: { type: Date, default: Date.now },
    status: { type: String, enum: ["draft", "scheduled", "sent"], default: "draft" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    relatedActivity: { type: mongoose.Schema.Types.ObjectId, ref: "Activity" },
    metadata: {
      type: Map,
      of: String,
    },
  },
  { timestamps: true }
);

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;

