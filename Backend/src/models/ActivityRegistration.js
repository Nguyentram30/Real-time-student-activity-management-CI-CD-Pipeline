import mongoose from "mongoose";

const activityRegistrationSchema = new mongoose.Schema(
  {
    activity: { type: mongoose.Schema.Types.ObjectId, ref: "Activity", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "checked_in", "completed"],
      default: "pending",
    },
    registeredAt: { type: Date, default: Date.now },
    note: { type: String },
    evidenceUrl: { type: String },
    evidenceNote: { type: String },
  },
  { timestamps: true }
);

activityRegistrationSchema.index({ activity: 1, user: 1 }, { unique: true });

const ActivityRegistration = mongoose.model("ActivityRegistration", activityRegistrationSchema);
export default ActivityRegistration;


