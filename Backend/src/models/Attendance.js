import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    activity: { type: mongoose.Schema.Types.ObjectId, ref: "Activity", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["present", "absent", "excused"],
      default: "present",
    },
    checkInMethod: {
      type: String,
      enum: ["qr", "gps", "manual"],
      default: "manual",
    },
    checkInTime: { type: Date, default: Date.now },
    note: { type: String },
    mediaEvidence: { type: String },
    location: {
      lat: Number,
      lng: Number,
    },
  },
  { timestamps: true }
);

attendanceSchema.index({ activity: 1, user: 1 }, { unique: true });

const Attendance = mongoose.model("Attendance", attendanceSchema);
export default Attendance;


