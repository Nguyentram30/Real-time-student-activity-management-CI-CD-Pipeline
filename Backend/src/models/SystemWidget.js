import mongoose from "mongoose";

const systemWidgetSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
  },
  { timestamps: true }
);

const SystemWidget = mongoose.model("SystemWidget", systemWidgetSchema);
export default SystemWidget;

