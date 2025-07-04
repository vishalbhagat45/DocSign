import path from "path";         
import fs from "fs";
import Document from "../models/Document.js";
import DocumentModel from "../models/Document.js";
import Signature from "../models/Signature.js";

export const uploadPDF = async (req, res) => {
  try {
    const doc = new Document({
      originalname: req.file.originalname,
      filename: req.file.filename,
      path: req.file.path,
      uploadedBy: req.user.id,
    });
    await doc.save();
    res.status(201).json({ message: "File uploaded", doc });
  } catch (err) {
    res.status(500).json({ message: "Upload failed", error: err.message });
  }
};
// DELETE /api/documents/:id
export const deleteDocument = async (req, res) => {
  try {
    const doc = await DocumentModel.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Document not found" });

    const filePath = path.join("uploads", path.basename(doc.path || doc.filePath));
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await doc.deleteOne();
    await Signature.deleteMany({ fileId: req.params.id });

    res.status(200).json({ message: "Document deleted successfully" });
  } catch (err) {
    console.error(" Document delete failed:", err);
    res.status(500).json({ message: "Failed to delete document" });
  }
};
export const getUserDocuments = async (req, res) => {
  try {
    const docs = await Document.find({ uploadedBy: req.user.id }).sort({
      createdAt: -1,
    });
    res.status(200).json(docs);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch documents", error: err.message });
  }
};
