import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    activity: { type: mongoose.Schema.Types.ObjectId, ref: "Activity" },
    title: { type: String, required: true, trim: true },
    fileUrl: { type: String, required: true },
    mimeType: { type: String },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    accessScope: {
      type: String,
      enum: ["admin", "manager", "student", "public"],
      default: "admin",
    },
    description: { type: String },
  },
  { timestamps: true }
);

const Document = mongoose.model("Document", documentSchema);
export default Document;


