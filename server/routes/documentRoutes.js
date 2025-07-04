import express from "express";
import { Router } from "express";
import multer from "multer";
import {
  uploadPDF,
  getUserDocuments,
  deleteDocument,
} from "../controllers/documentController.js";

import { verifyToken } from "../middleware/authMiddleware.js"; // ✅ Correct import

const router = Router();

//  Setup Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

router.post("/upload", verifyToken, upload.single("file"), uploadPDF);
router.get("/mine", verifyToken, getUserDocuments);
router.delete("/:id", verifyToken, deleteDocument);

export default router;
