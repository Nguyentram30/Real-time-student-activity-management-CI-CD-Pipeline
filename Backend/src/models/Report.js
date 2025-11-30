import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    activity: { type: mongoose.Schema.Types.ObjectId, ref: "Activity" },
    fileUrl: { type: String },
    status: {
      type: String,
      enum: ["draft", "review", "published"],
      default: "draft",
    },
    metadata: {
      type: Map,
      of: String,
    },
  },
  { timestamps: true }
);

const Report = mongoose.model("Report", reportSchema);
export default Report;


