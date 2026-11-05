// utils/foodAI.js
import fs from "fs";
import fetch from "node-fetch";

const GEMINI_MAX_ATTEMPTS = 3;
const GEMINI_RETRY_DELAY_MS = 2000;

/**
 * analyzeFoodImage(imagePath)
 * Uses Gemini vision to identify the food and estimate its shelf life.
 */
export async function analyzeFoodImage(imagePath) {
  try {
    if (!fs.existsSync(imagePath)) {
      throw new Error(`Image not found: ${imagePath}`);
    }

    const imageData = fs.readFileSync(imagePath, { encoding: "base64" });
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
    const requestOptions = {
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
      }),
    };

    let response;
    for (let attempt = 1; attempt <= GEMINI_MAX_ATTEMPTS; attempt += 1) {
      response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent",
        requestOptions
      );

      if (response.status !== 503 || attempt === GEMINI_MAX_ATTEMPTS) {
        break;
      }

      console.warn(
        `[Gemini] Service unavailable (503). Retrying in ${GEMINI_RETRY_DELAY_MS / 1000}s ` +
          `(attempt ${attempt + 1}/${GEMINI_MAX_ATTEMPTS}).`
      );
      await new Promise((resolve) => setTimeout(resolve, GEMINI_RETRY_DELAY_MS));
    }

    if (!response.ok) {
      const text = await response.text();
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
}