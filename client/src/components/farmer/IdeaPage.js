import React, { useState } from "react";
import axios from "axios";
import { FaLightbulb, FaSeedling, FaSpinner } from "react-icons/fa";
import "./IdeaPage.css";

function IdeaPage() {
  const [foodItems, setFoodItems] = useState("");
  const [ideas, setIdeas] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleGenerateIdeas = async (e) => {
    e.preventDefault();
    if (!foodItems.trim()) {
      setErrorMessage("Please enter the donated food items.");
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");
      setIdeas("");

      const res = await axios.post("/ai/farming-ideas", {
        items: foodItems,
      });

      setIdeas(res.data.ideas || "");
    } catch (err) {
      console.error("Error generating ideas:", err);
      setErrorMessage("Failed to generate ideas. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Split and format ideas into title + description cards
  const parseIdeas = (text) => {
    if (!text) return [];
    const lines = text
      .split(/(?:\r?\n\s*(?:[0-9]+[.)]|[-*•])\s+)|(?:\r?\n\r?\n)|(?:\r?\n)/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    return lines.map((item, index) => {
      const clean = item.replace(/^[-*•0-9.)\s]+/, "").trim();
      if (clean.includes(":")) {
        const [titlePart, ...descParts] = clean.split(":");
        return {
          title: titlePart.trim(),
          desc: descParts.join(":").trim(),
        };
      }
      return {
        title: `Farming Practice #${index + 1}`,
        desc: clean,
      };
    });
  };

  const ideaCards = parseIdeas(ideas);

  return (
    <div className="farmer-page-container">
      <div className="farmer-page-card">
        {/* Centered Page Title with Short Accent Underline */}
        <h2 className="page-title">Smart Farming Ideas 💡</h2>

        {/* Form Card */}
        <div className="farmer-idea-form-card">
          <p className="farmer-idea-intro">
            Enter the donated food items you’ve received — we’ll suggest creative and sustainable ways to use them in your farm 🌾
          </p>

          <form onSubmit={handleGenerateIdeas} className="farmer-idea-form">
            <label htmlFor="foodItems" className="farmer-idea-label">
              Donated Food Items
            </label>
            <textarea
              id="foodItems"
              value={foodItems}
              onChange={(e) => {
                setFoodItems(e.target.value);
                if (errorMessage) setErrorMessage("");
              }}
              placeholder="e.g., rice, banana peels, milk, overripe tomatoes, coffee grounds..."
              className="farmer-idea-textarea"
              rows="4"
              required
            />

            {/* Inline Error Message (Role Alert) */}
            {errorMessage && (
              <div className="farmer-inline-alert" role="alert">
                <span>⚠️ {errorMessage}</span>
              </div>
            )}

            <div className="farmer-idea-action-row">
              <button
                type="submit"
                disabled={loading || !foodItems.trim()}
                className="farmer-btn farmer-btn-primary farmer-idea-btn"
                aria-label="Get Smart Farming Ideas"
              >
                {loading ? (
                  <>
                    <FaSpinner className="farmer-btn-spinner" />
                    <span>Generating Ideas...</span>
                  </>
                ) : (
                  <>
                    <FaLightbulb className="farmer-btn-icon" />
                    <span>Get Smart Farming Ideas</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Generated Ideas Grid: 3 cols desktop, 2 cols tablet, 1 col mobile */}
        {ideaCards.length > 0 && (
          <section className="farmer-ideas-results-section" aria-label="Generated smart farming ideas">
            <div className="farmer-section-header">
              <FaSeedling className="farmer-section-icon" />
              <h3 className="farmer-section-title">Recommended Ideas ({ideaCards.length})</h3>
            </div>

            <div className="farmer-ideas-responsive-grid">
              {ideaCards.map((card, index) => (
                <article key={index} className="farmer-idea-item-card">
                  <h4 className="farmer-idea-card-title">{card.title}</h4>
                  <p className="farmer-idea-card-desc">{card.desc}</p>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export default IdeaPage;
