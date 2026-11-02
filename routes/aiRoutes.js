import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import axios from "axios";
import { analyzeFoodImage } from "../utils/foodAI.js";

const router = express.Router();

// === File Upload Setup ===
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  },
});

<<<<<<< HEAD
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];
    callback(null, allowedTypes.includes(file.mimetype));
  },
});
=======
const upload = multer({ storage });
>>>>>>> 156b6162bb2f37c9290d2a66e6e53785e18771b7

/* ----------------------------------------------------------
 🧠 1️⃣ Food Image Analysis (AI vision)
---------------------------------------------------------- */
router.post("/analyze", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    const imagePath = req.file.path;
    const analysis = await analyzeFoodImage(imagePath);

    res.status(200).json({
      message: "Food analysis successful",
      data: analysis,
    });
  } catch (error) {
    console.error("❌ AI route error:", error);
    res.status(500).json({
      message: "AI analysis failed",
<<<<<<< HEAD
      error: error.message || "Food recognition is currently unavailable.",
=======
      error: error.message,
>>>>>>> 156b6162bb2f37c9290d2a66e6e53785e18771b7
    });
  }
});

/* ----------------------------------------------------------
 💡 2️⃣ Farming Ideas from Donated Food (Text AI)
---------------------------------------------------------- */
router.post("/farming-ideas", async (req, res) => {
  try {
    const { items } = req.body;

    if (!items || items.trim() === "") {
      return res.status(400).json({ message: "Please provide food items." });
    }

<<<<<<< HEAD
    // 🧠 AI Prompt
    const prompt = `
You are an expert sustainable farming advisor.
Given these donated food items: ${items},
suggest simple, creative, and eco-friendly ways a small farmer can reuse them
— for compost, animal feed, soil improvement, or irrigation.
Keep suggestions short, practical, and easy to understand.
`;

    // 🪶 Using Hugging Face Free Model (flan-t5-base)
    const hfResponse = await axios.post(
      "https://api-inference.huggingface.co/models/google/flan-t5-base",
      { inputs: prompt },
      {
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`, // put your key in .env
          "Content-Type": "application/json",
        },
      }
    );

    const ideas =
      hfResponse.data?.[0]?.generated_text ||
      "No farming ideas generated. Try different items.";

    res.status(200).json({ ideas });
  } catch (error) {
    console.error("❌ AI ideas error:", error.message);
=======
    const list = items.split(",").map(i => i.trim().toLowerCase());
    const suggestions = [];

    /* ---------------------------
       🍌 Banana-specific ideas
    ----------------------------*/
    if (list.some(i => i.includes("banana"))) {
      suggestions.push("• Banana peels can be soaked in water for 48 hours to make potassium-rich fertilizer.");
      suggestions.push("• Dried banana peels work as natural pest repellents.");
    }

    /* ---------------------------
       🍎 Generic Fruit ideas
       (apple, mango, orange, etc.)
       WITHOUT banana-only lines
    ----------------------------*/
    if (list.some(i =>
      ["apple", "orange", "mango", "pineapple", "grape", "fruit", "peel"]
      .some(f => i.includes(f))
    )) {
      suggestions.push("• Fruit waste can be composted to create nutrient-rich fertilizer.");
      suggestions.push("• Fermented fruit scraps can be used to make natural bio-enzyme for cleaning plants.");
    }

    /* ---------------------------
       🍅 Vegetables
    ----------------------------*/
    if (list.some(i => ["tomato", "onion", "potato", "cabbage", "veggie"].some(f => i.includes(f)))) {
      suggestions.push("• Vegetable scraps boost soil microbes when added to compost.");
      suggestions.push("• Tomato waste can be fermented to create a natural growth booster.");
    }

    /* ---------------------------
       🌾 Grains
    ----------------------------*/
    if (list.some(i => ["rice", "rice water", "pasta", "wheat"].some(f => i.includes(f)))) {
      suggestions.push("• Rice water works as a natural fertilizer for leafy plants.");
      suggestions.push("• Cooked rice can be mixed into compost to increase nitrogen levels.");
    }

    /* ---------------------------
       🥛 Dairy
    ----------------------------*/
    if (list.some(i => ["milk", "yogurt", "curd"].some(f => i.includes(f)))) {
      suggestions.push("• Diluted milk acts as an anti-fungal spray for crops.");
    }

    /* ---------------------------
       🥬 Generic fallback
    ----------------------------*/
    if (suggestions.length === 0) {
      suggestions.push("• Organic waste can be composted to improve soil health.");
      suggestions.push("• Fermented waste can be used as natural bio-enzymes.");
    }

    res.status(200).json({ ideas: suggestions.join("\n") });

  } catch (error) {
    console.error("❌ Farming Ideas Error:", error.message);
>>>>>>> 156b6162bb2f37c9290d2a66e6e53785e18771b7
    res.status(500).json({
      message: "Failed to generate farming ideas",
      error: error.message,
    });
  }
});

export default router;