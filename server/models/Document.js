// models/Document.js
import mongoose from "mongoose";

const documentSchema = new mongoose.Schema({
  filename: String,
  path: String,
  originalname: String,
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("Document", documentSchema);
