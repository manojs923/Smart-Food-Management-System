import React, { useState } from "react";
import axios from "axios";
<<<<<<< HEAD
=======
import { FaLightbulb, FaSeedling, FaSync } from "react-icons/fa";
import "./IdeaPage.css";
>>>>>>> 156b6162bb2f37c9290d2a66e6e53785e18771b7

function IdeaPage() {
  const [foodItems, setFoodItems] = useState("");
  const [ideas, setIdeas] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerateIdeas = async () => {
<<<<<<< HEAD
    if (!foodItems.trim()) return alert("Please enter the donated food items.");
=======
    if (!foodItems.trim())
      return alert("Please enter the donated food items.");
>>>>>>> 156b6162bb2f37c9290d2a66e6e53785e18771b7

    try {
      setLoading(true);
      setIdeas("");

<<<<<<< HEAD
      const res = await axios.post("http://localhost:5000/ai/farming-ideas", {
        items: foodItems,
      });
=======
      const res = await axios.post(
        "http://localhost:5000/ai/farming-ideas",
        { items: foodItems }
      );
>>>>>>> 156b6162bb2f37c9290d2a66e6e53785e18771b7

      setIdeas(res.data.ideas);
    } catch (err) {
      console.error("❌ Error generating ideas:", err);
<<<<<<< HEAD
      alert("Failed to generate ideas. Please try again later.");
=======
      alert("Failed to generate ideas. Try again later.");
>>>>>>> 156b6162bb2f37c9290d2a66e6e53785e18771b7
    } finally {
      setLoading(false);
    }
  };

  return (
<<<<<<< HEAD
    <div className="min-h-screen flex flex-col items-center bg-green-50 p-6">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-2xl">
        <h2 className="text-3xl font-bold text-green-700 text-center mb-6">
          💡 Smart Farming Ideas
        </h2>

        <p className="text-gray-600 mb-4 text-center">
          Enter the donated food items you’ve received — we’ll suggest creative
          ways to use them in your farm 🌾
=======
    <div className="idea-wrapper">
      <div className="idea-card">
        <div className="idea-header">
          <FaLightbulb className="idea-icon" />
          <h2>Smart Farming Ideas</h2>
        </div>

        <p className="idea-description">
          Enter the donated food items you received — and get creative, sustainable
          farm ideas powered by AI 🌾
>>>>>>> 156b6162bb2f37c9290d2a66e6e53785e18771b7
        </p>

        <textarea
          value={foodItems}
          onChange={(e) => setFoodItems(e.target.value)}
<<<<<<< HEAD
          placeholder="e.g., rice, banana peels, milk, tomatoes"
          rows="4"
          className="w-full border border-gray-300 rounded-lg p-3 mb-4"
        />

        <button
          onClick={handleGenerateIdeas}
          disabled={loading}
          className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
        >
          {loading ? "Generating ideas..." : "Get Smart Farming Ideas"}
        </button>

        {ideas && (
          <div className="mt-6 bg-green-50 p-4 rounded-lg border border-green-200">
            <h3 className="font-semibold text-green-700 mb-2">✨ Suggestions:</h3>
            <p className="text-gray-700 whitespace-pre-line">{ideas}</p>
=======
          placeholder="e.g., rice, banana peels, tomatoes, milk…"
          rows="4"
          className="idea-textarea"
        />

        <button
          className="idea-button"
          onClick={handleGenerateIdeas}
          disabled={loading}
        >
          {loading ? (
            <>
              <FaSync className="spin" /> Generating...
            </>
          ) : (
            <>
              <FaSeedling /> Generate Ideas
            </>
          )}
        </button>

        {ideas && (
          <div className="idea-output fade-in">
            <h3>✨ Suggestions</h3>
            <p className="idea-text">{ideas}</p>
>>>>>>> 156b6162bb2f37c9290d2a66e6e53785e18771b7
          </div>
        )}
      </div>
    </div>
  );
}

export default IdeaPage;