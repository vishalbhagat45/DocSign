// controllers/signatureController.js
import Signature from "../models/Signature.js";
import fs from "fs";
import path from "path";
import { PDFDocument, rgb } from "pdf-lib";
import DocumentModel from "../models/Document.js";
import User from "../models/User.js";
import { sendSignedPdfEmail } from "../utils/emailSender.js";
import ActivityLog from "../models/ActivityLog.js";

// ==============================
// @desc   Create signature (x/y based)
// @route  POST /api/signatures
// @access Private
// ==============================

export const createSignature = async (req, res) => {
  const { fileId, pageNumber, x, y, signatureImageUrl, text } = req.body;

  console.log("Received payload on server:", req.body);

  if (!fileId || !pageNumber || x == null || y == null) {
    return res.status(400).json({ message: "Missing fields" });
  }

  try {
    const signature = await Signature.create({
      fileId,
      signer: req.user.id,
      pageNumber,
      x,
      y,
      signatureImageUrl,
      text,
    });

    // Log activity only if user is authenticated
    if (req.user?.id) {
      await ActivityLog.create({
        action: "signed_document",
        user: req.user.id,
        fileId,
        message: `User signed page ${pageNumber} of document.`,
      });
    }

    res.status(201).json(signature);
  } catch (err) {
    console.error("❌ Signature create failed:", err);
    res.status(500).json({ message: "Signature save failed", error: err.message });
  }
};

// ==============================
// @desc   Get full audit trail for a document
// @route  GET /api/signatures/audit/:fileId
// @access Private
// ==============================
export const getAuditTrail = async (req, res) => {
  try {
    const signatures = await Signature.find({ fileId: req.params.fileId })
      .populate("signer", "name email")
      .sort({ createdAt: -1 });

    res.json(signatures);
  } catch (err) {
    console.error(" Error fetching audit trail:", err);
    res.status(500).json({ message: "Audit trail fetch failed" });
  }
};

// ==============================
// @desc   Get all signatures by file ID
// @route  GET /api/signatures/file/:fileId
// @access Private
// ==============================
export const getSignaturesByFileId = async (req, res) => {
  try {
    const signatures = await Signature.find({ fileId: req.params.fileId });
    res.json(signatures);
  } catch (err) {
    console.error(" Failed to fetch signatures:", err);
    res.status(500).json({ message: "Fetching signatures failed" });
  }
};

// ==============================
// @desc   Upload optional signature image
// @route  POST /api/signatures/upload
// @access Private
// ==============================
export const uploadSignatureImage = async (req, res) => {
  if (!req.file)
    return res.status(400).json({ message: "No file uploaded" });

  const imagePath = req.file.path.replace(/\\/g, "/");
  res.status(201).json({ imageUrl: `/${imagePath}` });
};



// ==============================
// @desc   Update signature status
// @route  PATCH /api/signatures/status/:id
// @access Private
// ==============================
export const updateSignatureStatus = async (req, res) => {
  const { status } = req.body;

  if (!["signed", "rejected"].includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  try {
    const signature = await Signature.findById(req.params.id);
    if (!signature)
      return res.status(404).json({ message: "Signature not found" });

    signature.status = status;
    await signature.save();

    res.status(200).json({ message: "Status updated", signature });
  } catch (err) {
    console.error(" Signature status update failed:", err);
    res.status(500).json({ message: "Failed to update status" });
  }
};

// ==============================
// @desc   Get all signatures (admin only)
// @route  GET /api/signatures
// @access Admin
// ==============================
export const getAllSignatures = async (req, res) => {
  try {
    const isAdmin = req.user && req.user.role === "admin";
    if (!isAdmin) return res.status(403).json({ message: "Access denied" });

    const signatures = await Signature.find()
      .populate("signer", "email name")
      .sort({ createdAt: -1 });

    res.json(signatures);
  } catch (err) {
    console.error(" Error fetching all signatures:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ==============================
// @desc   Generate signed PDF with embedded images or ✔ text
// @route  GET /api/signatures/generate/:fileId
// @access Private
// ==============================
export const generateSignedPDF = async (req, res) => {
  const { fileId } = req.params;
  console.log(" Generating signed PDF for:", fileId);

  try {
    // 1. Load Document from DB
    const document = await DocumentModel.findById(fileId);
    if (!document) {
      console.log(" Document not found");
      return res.status(404).json({ message: "Document not found" });
    }

    const relativePath = document.path || document.filePath || document.filename;
    if (!relativePath) {
      console.log(" No path found in document");
      return res.status(400).json({ message: "Document file path missing" });
    }

    const filePath = path.join("uploads", path.basename(relativePath));
    console.log(" Full file path:", filePath);

    if (!fs.existsSync(filePath)) {
      console.log(" PDF file does not exist at:", filePath);
      return res.status(404).json({ message: "PDF file not found" });
    }

    // 2. Load PDF and Signatures
    const existingPdfBytes = fs.readFileSync(filePath);
    const pdfDoc = await PDFDocument.load(existingPdfBytes, {
    ignoreEncryption: true,
    });
    const pages = pdfDoc.getPages();
    const signatures = await Signature.find({ fileId });
    console.log(" Found", signatures.length, "signatures");

    // 3. Apply Signatures or Text
for (const sig of signatures) {
  const page = pages[sig.pageNumber - 1];
  if (!page) continue;

  const { x, y } = sig;
  const pageWidth = page.getWidth();
  const pageHeight = page.getHeight();
  const finalX = x * pageWidth;

  if (sig.signatureImageUrl) {
    const imagePath = path.join("uploads", sig.signatureImageUrl.replace(/^\/?uploads\/?/, ""));

    if (fs.existsSync(imagePath)) {
      const imgBytes = fs.readFileSync(imagePath);
      const ext = path.extname(imagePath).toLowerCase();
      let image;

      if (ext === ".png") image = await pdfDoc.embedPng(imgBytes);
      else image = await pdfDoc.embedJpg(imgBytes);

      const dims = image.scale(0.2);
      const finalY = pageHeight - (y * pageHeight) - dims.height; // ✅ Corrected

      page.drawImage(image, {
        x: finalX,
        y: finalY,
        width: dims.width,
        height: dims.height,
      });
    } else {
      console.log(" Signature image not found:", imagePath);
    }

  } else if (sig.text) {
    const fontSize = 14;
    const finalY = pageHeight - (y * pageHeight) - fontSize; // ✅ Corrected

    page.drawText(sig.text, {
      x: finalX,
      y: finalY,
      size: fontSize,
      color: rgb(0, 0.5, 0),
    });

  } else {
    const fontSize = 14;
    const finalY = pageHeight - (y * pageHeight) - fontSize; // ✅ Corrected

    page.drawText("Signed", {
      x: finalX,
      y: finalY,
      size: fontSize,
      color: rgb(0, 0.6, 0),
    });
  }
}

    //  4. Save & Send the signed PDF back to client
    const signedPdfBytes = await pdfDoc.save();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
    "Content-Disposition",
    `attachment; filename="${document.originalName?.replace('.pdf', '') || 'signed'}.pdf"`
    );

    res.end(Buffer.from(signedPdfBytes)); // 👈 not res.send()

  } catch (err) {
    console.error("Failed to generate signed PDF:", err);
    res.status(500).json({ message: "Failed to generate signed PDF", error: err.message });
  }
};

