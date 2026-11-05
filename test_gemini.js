import dotenv from "dotenv";
import fetch from "node-fetch";

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
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=" + apiKey,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: "Hello" }] }],
        }),
      }
    );

    if (!response.ok) {
      const text = await response.text();
      console.log("❌ API Error:", response.status, text);
    } else {
      const data = await response.json();
      console.log("✅ API Success:", data?.candidates?.[0]?.content?.parts?.[0]?.text);
    }
  } catch (err) {
    console.log("❌ Fetch Error:", err);
  }
}

testGemini();
