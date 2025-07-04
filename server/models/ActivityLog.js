// models/ActivityLog.js
import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema(
  {
    action: { type: String, required: true }, // e.g., "signed_document"
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    fileId: { type: mongoose.Schema.Types.ObjectId, ref: "Document", required: true },
    message: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("ActivityLog", activityLogSchema);
