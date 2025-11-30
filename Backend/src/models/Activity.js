import mongoose from "mongoose";

const activitySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    location: { type: String, default: "" },
    type: { type: String, default: "general" },
    status: {
      type: String,
      enum: ["Chờ phê duyệt", "Đang mở", "Đã kết thúc", "Đã hủy"],
      default: "Chờ phê duyệt",
    },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    maxParticipants: { type: Number, default: 0 },
    coverImage: { type: String },
    participantCount: { type: Number, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    meta: {
      visibility: { type: String, enum: ["public", "private"], default: "public" },
      tags: [{ type: String }],
    },
  },
  { timestamps: true }
);

activitySchema.index({ title: "text", description: "text" });

const Activity = mongoose.model("Activity", activitySchema);
export default Activity;

