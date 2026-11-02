// utils/foodAI.js
import fs from "fs";
import fetch from "node-fetch";

/**
 * analyzeFoodImage(imagePath)
<<<<<<< HEAD
 * Uses Gemini vision to identify the food and estimate its shelf life.
=======
 * Uses Clarifai’s public "Food Item Recognition" model (no setup needed).
>>>>>>> 156b6162bb2f37c9290d2a66e6e53785e18771b7
 */
export async function analyzeFoodImage(imagePath) {
  try {
    if (!fs.existsSync(imagePath)) {
      throw new Error(`Image not found: ${imagePath}`);
    }

    const imageData = fs.readFileSync(imagePath, { encoding: "base64" });
<<<<<<< HEAD
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    const mimeType = getMimeType(imagePath);
    const prompt = `You are a food freshness inspector. Look at this food image and return ONLY valid JSON (no markdown, no extra text) with these exact keys:
{
  "food_item": "specific food name",
  "category": "food category",
  "freshness_score": 0,
  "freshness_status": "Fresh",
  "shelf_life_refrigerated_days": 0,
  "shelf_life_room_temp_days": 0,
  "recommended_storage_temp_celsius": "recommended temperature",
  "visible_spoilage_signs": [],
  "estimated_quantity": "estimated quantity",
  "confidence": 0
}

Base freshness_status on freshness_score: 80-100=Fresh, 50-79=Use Soon, 20-49=Donate Now, below 20=Discard.
- freshness_score, confidence, and shelf-life values must be numbers.
- visible_spoilage_signs must be an array of strings.
- Use conservative values when the image is ambiguous.
- Do not include markdown fences or extra text.`;

    fs.appendFileSync("debug_gemini.txt", `\\n[${new Date().toISOString()}] Sending request to Gemini...\\n`);
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        method: "POST",
        headers: {
          "x-goog-api-key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt },
                { inline_data: { mime_type: mimeType, data: imageData } },
              ],
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.2,
          },
=======
    console.log("🍽️ Sending image to Clarifai for food analysis...");

    // ✅ Clarifai credentials
    const PAT = process.env.CLARIFAI_PAT;
    const USER_ID = "clarifai"; // Public Clarifai user
    const APP_ID = "main"; // Global public model app
    const MODEL_ID = "food-item-recognition"; // ✅ The correct model name

    // ✅ API call
    const response = await fetch(
      `https://api.clarifai.com/v2/users/${USER_ID}/apps/${APP_ID}/models/${MODEL_ID}/outputs`,
      {
        method: "POST",
        headers: {
          Authorization: `Key ${PAT}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: [
            {
              data: {
                image: { base64: imageData },
              },
            },
          ],
>>>>>>> 156b6162bb2f37c9290d2a66e6e53785e18771b7
        }),
      }
    );

    if (!response.ok) {
      const text = await response.text();
<<<<<<< HEAD
      let availableModels = "";
      if (response.status === 404) {
        try {
          const modelsRes = await fetch("https://generativelanguage.googleapis.com/v1beta/models?key=" + apiKey);
          const modelsData = await modelsRes.json();
          if (modelsData.models) {
             availableModels = "\\n\\nAvailable models for your key: " + modelsData.models.map(m => m.name.replace("models/", "")).join(", ");
          }
        } catch(e) {}
      }
      throw new Error(`Gemini API Error: ${response.status} - ${text}${availableModels}`);
    }

    const data = await response.json();
    let responseText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    
    fs.appendFileSync("debug_gemini.txt", `\\n[${new Date().toISOString()}] Response text: ${responseText}\\n`);

    if (!responseText) {
      throw new Error("Gemini returned no analysis");
    }

    // Strip markdown formatting if Gemini included it
    responseText = responseText.replace(/```json\\n?|\\n?```/g, "").trim();

    const result = normalizeAnalysis(JSON.parse(responseText));
    console.log("✅ [Gemini] Food identified:", result);
    fs.appendFileSync("debug_gemini.txt", `✅ Success!\\n`);
    return result;

  } catch (err) {
    fs.appendFileSync("debug_gemini.txt", `\\n[${new Date().toISOString()}] ❌ Error: ${err.message}\\n`);
    console.error("❌ foodAI error:", err.message);
    throw err;
  }
}

function getMimeType(imagePath) {
  const extension = imagePath.toLowerCase().split(".").pop();
  const mimeTypes = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    heic: "image/heic",
    heif: "image/heif",
  };

  return mimeTypes[extension] || "application/octet-stream";
}

function normalizeAnalysis(analysis) {
  const name = typeof analysis.food_item === "string" ? analysis.food_item.trim() : "";
  if (!name) {
    throw new Error("Gemini returned an unnamed food");
  }

  const freshnessScore = clampNumber(analysis.freshness_score, 0, 100);
  const refrigeratedDays = requiredDays(analysis.shelf_life_refrigerated_days, "refrigerated");
  const roomTempDays = requiredDays(analysis.shelf_life_room_temp_days, "room temperature");
  const result = {
    food_item: name,
    category: typeof analysis.category === "string" ? analysis.category.trim() || "Other" : "Other",
    freshness_score: freshnessScore,
    freshness_status: normalizeFreshnessStatus(freshnessScore),
    shelf_life_refrigerated_days: refrigeratedDays,
    shelf_life_room_temp_days: roomTempDays,
    recommended_storage_temp_celsius:
      typeof analysis.recommended_storage_temp_celsius === "string"
        ? analysis.recommended_storage_temp_celsius.trim() || "Unknown"
        : "Unknown",
    visible_spoilage_signs: normalizeSigns(analysis.visible_spoilage_signs),
    estimated_quantity:
      typeof analysis.estimated_quantity === "string" ? analysis.estimated_quantity.trim() || "Unknown" : "Unknown",
    confidence: clampNumber(analysis.confidence, 0, 100),
  };

  const today = new Date();
  result.best_before_refrigerated = addDays(today, refrigeratedDays);
  result.best_before_room_temp = addDays(today, roomTempDays);
  return result;
}

function clampNumber(value, minimum, maximum) {
  const number = Number(value);
  if (!Number.isFinite(number)) return minimum;
  return Math.round(Math.min(maximum, Math.max(minimum, number)));
}

function normalizeFreshnessStatus(score) {
  if (score >= 80) return "Fresh";
  if (score >= 50) return "Use Soon";
  if (score >= 20) return "Donate Now";
  return "Discard";
}

function normalizeSigns(signs) {
  return Array.isArray(signs)
    ? signs.filter((sign) => typeof sign === "string").map((sign) => sign.trim()).filter(Boolean)
    : [];
}

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result.toISOString().slice(0, 10);
}

function requiredDays(value, storageType) {
  const days = Number(value);
  if (!Number.isFinite(days) || days < 0) {
    throw new Error(`Gemini returned an invalid ${storageType} shelf life`);
  }
  return Math.round(Math.min(365, days));
=======
      throw new Error(`Clarifai API Error: ${response.status} - ${text}`);
    }

    const data = await response.json();
    const topPrediction = data?.outputs?.[0]?.data?.concepts?.[0];

    if (!topPrediction) {
      console.warn("⚠️ Clarifai returned no predictions.");
      return {
        name: "Unknown",
        category: "Unknown",
        shelfLife: 0,
        storage: "Unknown",
      };
    }

    const name = topPrediction.name || "Unknown";

    // --- Categorization Logic ---
    const lower = name.toLowerCase();
    let category = "Unknown";
    let shelfLife = 0;
    let storage = "Unknown";

    if (["apple", "banana", "orange", "mango", "tomato", "grape", "strawberry"].some(f => lower.includes(f))) {
      category = "Fruits";
      shelfLife = 5;
      storage = "Cool Dry Place";
    } else if (["carrot", "onion", "potato", "cabbage", "spinach", "broccoli"].some(f => lower.includes(f))) {
      category = "Vegetables";
      shelfLife = 7;
      storage = "Refrigerated";
    } else if (["milk", "cheese", "yogurt", "butter", "cream"].some(f => lower.includes(f))) {
      category = "Dairy";
      shelfLife = 6;
      storage = "Refrigerated";
    } else if (["bread", "rice", "pasta", "noodle", "cereal"].some(f => lower.includes(f))) {
      category = "Grains";
      shelfLife = 3;
      storage = "Cool Dry Place";
    } else if (["chicken", "fish", "meat", "beef", "pork", "egg"].some(f => lower.includes(f))) {
      category = "Meat";
      shelfLife = 2;
      storage = "Frozen";
    } else if (["water", "juice", "soda", "tea", "coffee"].some(f => lower.includes(f))) {
      category = "Beverages";
      shelfLife = 10;
      storage = "Room Temperature";
    }

    const result = { name, category, shelfLife, storage };
    console.log("✅ [Clarifai] Food identified:", result);
    return result;

  } catch (err) {
    console.error("❌ foodAI error:", err.message);
    return {
      name: "Unknown",
      category: "Unknown",
      shelfLife: 0,
      storage: "Unknown",
    };
  }
>>>>>>> 156b6162bb2f37c9290d2a66e6e53785e18771b7
}