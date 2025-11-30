import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
  {
    activity: { type: mongoose.Schema.Types.ObjectId, ref: "Activity", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, min: 1, max: 5 },
    content: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "published", "archived"],
      default: "pending",
    },
      attachmentUrl: { type: String },
      // Manager/Admin response to the feedback
      response: { type: String },
      responseAttachmentUrl: { type: String },
  },
  { timestamps: true }
);

feedbackSchema.index({ activity: 1, user: 1 });

const Feedback = mongoose.model("Feedback", feedbackSchema);
export default Feedback;


