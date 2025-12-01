import mongoose from "mongoose";

const activityQRCodeSchema = new mongoose.Schema(
  {
    activity: { type: mongoose.Schema.Types.ObjectId, ref: "Activity", required: true, unique: true },
    qrCode: { type: String, required: true, unique: true },
    expiresAt: { type: Date },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

activityQRCodeSchema.index({ activity: 1 });
activityQRCodeSchema.index({ qrCode: 1 });

const ActivityQRCode = mongoose.model("ActivityQRCode", activityQRCodeSchema);
export default ActivityQRCode;

