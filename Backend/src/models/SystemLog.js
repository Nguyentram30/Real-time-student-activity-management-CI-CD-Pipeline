import mongoose from "mongoose";

const systemLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, required: true },
    target: { type: String },
    metadata: {
      type: Map,
      of: String,
    },
    ipAddress: { type: String },
  },
  { timestamps: true }
);

const SystemLog = mongoose.model("SystemLog", systemLogSchema);
export default SystemLog;


