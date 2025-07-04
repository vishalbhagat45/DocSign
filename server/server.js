// server/server.js

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import authRoutes from './routes/authRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import signatureRoutes from './routes/signatureRoutes.js';
import activityRoutes from './routes/activityRoutes.js';
import docsRoutes from "./routes/docs.js";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// Load environment variables
dotenv.config();

// Init Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Ensure upload directories exist
const uploadPaths = ['./uploads', './uploads/signatures'];
uploadPaths.forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});


// API Routes
app.use('/api/auth', authRoutes);         // /register, /login, /firebase-login
app.use('/api/documents', docsRoutes);
app.use('/api/signatures', signatureRoutes); // /, /file/:fileId, /upload
app.use('/api/activities', activityRoutes);
app.use('/api/uploads', express.static(path.join(__dirname, 'uploads')));


// Connect MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  }
};

// Start Server
const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
  });
});
