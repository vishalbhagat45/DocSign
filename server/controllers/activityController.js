// controllers/activityController.js
import ActivityLog from "../models/ActivityLog.js";

export const getAllActivities = async (req, res) => {
  try {
    const logs = await ActivityLog.find()
      .populate("user", "name email")
      .populate("fileId", "originalName")
      .sort({ createdAt: -1 });

    res.json(logs);
  } catch (err) {
    console.error(" Error fetching logs:", err);
    res.status(500).json({ message: "Server error" });
  }
};
