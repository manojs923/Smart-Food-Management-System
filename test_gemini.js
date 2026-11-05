import dotenv from "dotenv";
import { generateGeminiContent } from "./utils/geminiClient.js";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.log("❌ GEMINI_API_KEY is not found in .env");
  process.exit(1);
} else {
  console.log("✅ GEMINI_API_KEY is loaded (length: " + apiKey.length + ")");
}

async function testGemini() {
  try {
    const data = await generateGeminiContent({
      contents: [{ parts: [{ text: "Hello" }] }],
    });
    console.log("✅ API Success:", data?.candidates?.[0]?.content?.parts?.[0]?.text);
  } catch (err) {
    console.error("❌ Gemini test failed:", err.message);
  }
}

testGemini();
