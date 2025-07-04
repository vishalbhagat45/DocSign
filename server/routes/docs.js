import express from "express";
import multer from "multer";
import { uploadPDF, getUserDocuments,deleteDocument } from "../controllers/documentController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Multer config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + file.originalname;
    cb(null, uniqueSuffix);
  },
});
const upload = multer({ storage });

//  Upload route
router.post("/upload", verifyToken, upload.single("pdf"), uploadPDF);

//  Get documents route


router.get("/mine", verifyToken, getUserDocuments);
router.delete("/:id", verifyToken, deleteDocument);
export default router;
