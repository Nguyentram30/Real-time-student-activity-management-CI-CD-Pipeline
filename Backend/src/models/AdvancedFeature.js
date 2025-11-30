import mongoose from "mongoose";

const advancedFeatureSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
  },
  { timestamps: true }
);

const AdvancedFeature = mongoose.model("AdvancedFeature", advancedFeatureSchema);
export default AdvancedFeature;

