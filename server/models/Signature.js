// models/Signature.js
import mongoose from "mongoose";

const signatureSchema = new mongoose.Schema(
  {
    fileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      required: true,
    },
    signer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    pageNumber: {
      type: Number,
      default: 1,
    },
    status: {
      type: String,
      enum: ["pending", "signed", "rejected"],
      default: "pending",
    },
    signatureImageUrl: {
      type: String, 
    },
    text: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Signature", signatureSchema);
