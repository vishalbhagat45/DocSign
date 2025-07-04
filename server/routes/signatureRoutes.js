import express from 'express';
import { verifyToken } from "../middleware/authMiddleware.js";
import {
  createSignature,
  getSignaturesByFileId,
  uploadSignatureImage,
  generateSignedPDF,
  getAuditTrail,
  updateSignatureStatus,
  getAllSignatures,
 
} from '../controllers/signatureController.js';
import multer from 'multer';

const router = express.Router();

//  Signature image upload setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/signatures/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ storage });

//  Signature routes
router.post('/', verifyToken, createSignature);
router.get('/file/:fileId', verifyToken, getSignaturesByFileId);
router.post('/upload', verifyToken, upload.single('image'), uploadSignatureImage);
router.get('/generate/:fileId', verifyToken, generateSignedPDF);
router.get('/audit/:fileId', verifyToken, getAuditTrail);
router.patch("/status/:id", verifyToken, updateSignatureStatus);
router.get('/all', verifyToken, getAllSignatures); 



export default router;
