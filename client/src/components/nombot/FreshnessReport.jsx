// client/src/components/nombot/FreshnessReport.jsx
import React, { useState, useEffect } from "react";
import {
  FaHeartbeat,
  FaCalendarAlt,
  FaSnowflake,
  FaFire,
  FaShieldAlt,
  FaBoxOpen,
  FaHandHoldingHeart,
  FaThermometerHalf,
} from "react-icons/fa";

export default function FreshnessReport({
  foodData,
  storageMode,
  setStorageMode,
  onSave,
  onCancel,
  onDonate,
  saving,
}) {
  const [animatedScore, setAnimatedScore] = useState(0);

  const targetScore = foodData?.freshness_score || 0;

  useEffect(() => {
    let start = 0;
    const duration = 800;
    const stepTime = 20;
    const steps = duration / stepTime;
    const increment = targetScore / steps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= targetScore) {
        setAnimatedScore(targetScore);
        clearInterval(timer);
      } else {
        setAnimatedScore(Math.round(start));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [targetScore]);

  if (!foodData) return null;

  const isFridge = storageMode === "refrigerated";
  const shelfLifeDays = isFridge
    ? foodData.shelf_life_refrigerated_days
    : foodData.shelf_life_room_temp_days;
  const bestBefore = isFridge
    ? foodData.best_before_refrigerated
    : foodData.best_before_room_temp;

  // Status badge config: green for fresh, amber for use soon, red for expired
  const getBadgeConfig = (status, score) => {
    const s = (status || "").toLowerCase();
    if (s.includes("fresh") || score >= 80) {
      return {
        text: status || "Fresh",
        className: "nombot-status-badge nombot-status-fresh",
        progressColor: "#16a34a",
      };
    }
    if (s.includes("soon") || s.includes("moderate") || (score >= 40 && score < 80)) {
      return {
        text: status || "Use Soon",
        className: "nombot-status-badge nombot-status-warning",
        progressColor: "#f59e0b",
      };
    }
    return {
      text: status || "Expired",
      className: "nombot-status-badge nombot-status-danger",
      progressColor: "#ef4444",
    };
  };

  const badgeConfig = getBadgeConfig(foodData.freshness_status, targetScore);

  return (
    <div className="nombot-result-card">
      {/* 1. Header row: item name on the left, status badge on the right */}
      <div className="nombot-result-header">
        <div>
          <h3 className="nombot-result-title">
            {foodData.food_item || "Identified Item"}
          </h3>
          <p className="nombot-result-meta">
            {foodData.category || "Produce"} • {foodData.estimated_quantity || "1 unit"}
          </p>
        </div>

        <span className={badgeConfig.className}>
          {badgeConfig.text}
        </span>
      </div>

      {/* 2. 2x2 Grid of equal stat tiles on desktop (1 column on mobile) */}
      <div className="nombot-stats-grid">
        {/* Tile 1: Freshness Score (with progress bar + number) */}
        <div className="nombot-stat-tile">
          <div className="nombot-stat-top">
            <FaHeartbeat style={{ color: badgeConfig.progressColor }} />
            <span>Freshness Score</span>
          </div>
          <div className="nombot-stat-value" style={{ color: badgeConfig.progressColor }}>
            {animatedScore}%
          </div>
          <div className="nombot-progress-track">
            <div
              className="nombot-progress-fill"
              style={{
                width: `${animatedScore}%`,
                backgroundColor: badgeConfig.progressColor,
              }}
            />
          </div>
          <span className="nombot-stat-helper">Bio-scan rating</span>
        </div>

        {/* Tile 2: Days Remaining (with Best before inside) */}
        <div className="nombot-stat-tile">
          <div className="nombot-stat-top">
            <FaCalendarAlt className="text-emerald-500" />
            <span>Days Remaining</span>
          </div>
          <div className="nombot-stat-value">
            {shelfLifeDays} <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>days</span>
          </div>
          <span className="nombot-stat-helper">
            Best before: {bestBefore || "N/A"}
          </span>
        </div>

        {/* Tile 3: AI Confidence */}
        <div className="nombot-stat-tile">
          <div className="nombot-stat-top">
            <FaShieldAlt className="text-emerald-500" />
            <span>AI Confidence</span>
          </div>
          <div className="nombot-stat-value">
            {foodData.confidence || 95}%
          </div>
          <span className="nombot-stat-helper">
            Computer vision accuracy
          </span>
        </div>

        {/* Tile 4: Recommended Temp */}
        <div className="nombot-stat-tile">
          <div className="nombot-stat-top">
            <FaThermometerHalf className="text-emerald-500" />
            <span>Recommended Temp</span>
          </div>
          <div className="nombot-stat-value">
            {foodData.recommended_storage_temp_celsius || (isFridge ? "4°C" : "18°C - 22°C")}
          </div>
          <span className="nombot-stat-helper">
            Ideal preservation temperature
          </span>
        </div>
      </div>

      {/* 3. Storage Environment: Label above toggle group of two equal-width buttons */}
      <div className="nombot-storage-section">
        <span className="nombot-section-label">
          <FaBoxOpen className="text-emerald-500" /> Storage Environment
        </span>
        <div className="nombot-storage-group">
          <button
            type="button"
            onClick={() => setStorageMode("refrigerated")}
            className={`nombot-storage-btn ${isFridge ? "active" : ""}`}
          >
            <FaSnowflake className={isFridge ? "text-cyan-100" : "text-cyan-500"} />
            <span>Refrigerator (Cold)</span>
          </button>

          <button
            type="button"
            onClick={() => setStorageMode("roomTemp")}
            className={`nombot-storage-btn ${!isFridge ? "active" : ""}`}
          >
            <FaFire className={!isFridge ? "text-amber-100" : "text-amber-500"} />
            <span>Room Temperature</span>
          </button>
        </div>
      </div>

      {/* 4. Inspector Observations: Full-width callout with left accent border */}
      <div className="nombot-callout">
        <div className="nombot-callout-title">
          🔍 Inspector Observations
        </div>
        <div className="nombot-callout-content">
          {foodData.visible_spoilage_signs && foodData.visible_spoilage_signs.length > 0 ? (
            <ul style={{ paddingLeft: "18px", margin: 0 }}>
              {foodData.visible_spoilage_signs.map((sign, idx) => (
                <li key={idx} style={{ color: "#f59e0b" }}>{sign}</li>
              ))}
            </ul>
          ) : (
            <span>✓ No visible spoilage or mold signs detected. Fresh condition.</span>
          )}
        </div>
      </div>

      {/* 5. Bottom actions: Equal height (44px), gap 12px, right-aligned on desktop, stacked on mobile */}
      <div className="nombot-actions-row">
        <button
          type="button"
          onClick={onCancel}
          className="nombot-btn nombot-btn-secondary"
        >
          Cancel & Scan Another
        </button>

        {foodData.freshness_status === "Donate Now" && onDonate && (
          <button
            type="button"
            onClick={onDonate}
            style={{
              background: "#d97706",
              color: "#ffffff",
              borderColor: "#d97706",
            }}
            className="nombot-btn"
          >
            <FaHandHoldingHeart /> Send to Donate
          </button>
        )}

        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="nombot-btn nombot-btn-primary"
        >
          {saving ? "Saving..." : "Save to Inventory"}
        </button>
      </div>
    </div>
  );
}
