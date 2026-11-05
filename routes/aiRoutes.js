import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { analyzeFoodImage } from "../utils/foodAI.js";
import { GeminiApiError } from "../utils/geminiClient.js";

const router = express.Router();
const AI_BUSY_MESSAGE = "The AI assistant is busy right now. Please try again in a moment.";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];
    callback(null, allowedTypes.includes(file.mimetype));
  },
});

router.post("/analyze", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    const analysis = await analyzeFoodImage(req.file.path);
    res.status(200).json({ message: "Food analysis successful", data: analysis });
  } catch (error) {
    console.error("AI route error:", error);
    const status = error instanceof GeminiApiError
      ? ([429, 500, 503].includes(error.status) ? 503 : 502)
      : 500;
    res.status(status).json({ message: AI_BUSY_MESSAGE });
  }
});

router.post("/farming-ideas", async (req, res) => {
  const { items } = req.body;
  if (typeof items !== "string" || !items.trim()) {
    return res.status(400).json({ message: "Please provide food items." });
  }

  const list = items.split(",").map((item) => item.trim().toLowerCase());
  const suggestions = [];

  if (list.some((item) => item.includes("banana"))) {
    suggestions.push("Banana peels can be composted or soaked to make potassium-rich fertilizer.");
  }
  if (list.some((item) => ["apple", "orange", "mango", "pineapple", "grape", "fruit", "peel"].some((word) => item.includes(word)))) {
    suggestions.push("Fruit scraps can be composted to create nutrient-rich fertilizer.");
  }
  if (list.some((item) => ["tomato", "onion", "potato", "cabbage", "vegetable"].some((word) => item.includes(word)))) {
    suggestions.push("Vegetable scraps can be added to compost to improve soil health.");
  }
  if (list.some((item) => ["rice", "pasta", "wheat", "grain"].some((word) => item.includes(word)))) {
    suggestions.push("Grain scraps can be composted; avoid adding cooked foods that attract pests.");
  }
  if (list.some((item) => ["milk", "yogurt", "curd"].some((word) => item.includes(word)))) {
    suggestions.push("Use dairy waste only in a managed compost system to avoid odor and pests.");
  }
  if (suggestions.length === 0) {
    suggestions.push("Organic food scraps can be composted to improve soil health.");
  }

  res.status(200).json({ ideas: suggestions.join("\n") });
});

export default router;
