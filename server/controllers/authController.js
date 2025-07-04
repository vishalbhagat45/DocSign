import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { admin } from "../utils/firebaseAdmin.js";

const JWT_SECRET = process.env.JWT_SECRET || "your_default_secret_key";

// ========================
// @desc    Register a new user
// @route   POST /api/auth/register
// ========================
export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password)
    return res.status(400).json({ message: "All fields are required" });

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email already in use" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error(" Register error:", err);
    res
      .status(500)
      .json({ message: "Registration failed", error: err.message });
  }
};

// ========================
// @desc    Login user and return JWT
// @route   POST /api/auth/login
// ========================
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res
      .status(400)
      .json({ message: "Email and password are required" });

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid email or password" });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "7d" });

    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error(" Login error:", err);
    res.status(500).json({ message: "Login failed", error: err.message });
  }
};

// ========================
// @desc    Login via Firebase
// @route   POST /api/auth/firebase-login
// ========================
export const firebaseLogin = async (req, res) => {
  const { idToken } = req.body;

  if (!idToken) {
    return res.status(400).json({ message: "Missing Firebase ID token" });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { email, name, uid } = decodedToken;

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name: name || "Unnamed User",
        email,
        firebaseUid: uid,
      });
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "7d" });

    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Firebase login error:", error.message);
    return res.status(401).json({ message: "Invalid Firebase token" });
  }
};

