// client/src/components/nombot/FreshnessReport.jsx
import React, { useState, useEffect } from "react";
import {
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

  // Status badge colors: green for fresh, amber for use soon, red for expired
  const getBadgeConfig = (status, score) => {
    const s = (status || "").toLowerCase();
    if (s.includes("fresh") || score >= 80) {
      return {
        text: status || "Fresh",
        style: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
        progressColor: "#22c55e",
      };
    }
    if (s.includes("soon") || s.includes("moderate") || (score >= 40 && score < 80)) {
      return {
        text: status || "Use Soon",
        style: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
        progressColor: "#f59e0b",
      };
    }
    return {
      text: status || "Expired",
      style: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30",
      progressColor: "#ef4444",
    };
  };

  const badgeConfig = getBadgeConfig(foodData.freshness_status, targetScore);

  return (
    <div
      style={{
        background: "var(--nombot-card-bg)",
        borderColor: "var(--nombot-card-border)",
        boxShadow: "var(--nombot-shadow)",
      }}
      className="w-full max-w-2xl mx-auto mt-4 rounded-2xl p-6 sm:p-7 border transition-all"
    >
      {/* Header: Title, Category & Status Badge */}
      <div
        style={{ borderColor: "var(--nombot-card-border)" }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b"
      >
        <div>
          <div className="flex items-center gap-2.5">
            <h3
              style={{ color: "var(--nombot-text)" }}
              className="text-xl sm:text-2xl font-bold tracking-tight"
            >
              {foodData.food_item || "Identified Item"}
            </h3>
            <span
              className={`text-xs px-3 py-0.5 rounded-full font-bold border ${badgeConfig.style}`}
            >
              {badgeConfig.text}
            </span>
          </div>
          <p
            style={{ color: "var(--nombot-text-muted)" }}
            className="text-xs font-medium mt-1"
          >
            Category: <strong style={{ color: "var(--nombot-text)" }}>{foodData.category || "Produce"}</strong>
            {" • "}
            Quantity: <strong style={{ color: "var(--nombot-text)" }}>{foodData.estimated_quantity || "1 unit"}</strong>
          </p>
        </div>

        {/* Numeric Score Top Indicator */}
        <div className="text-left sm:text-right">
          <span
            style={{ color: "var(--nombot-text-muted)" }}
            className="text-[11px] uppercase font-bold tracking-wider block"
          >
            Freshness Score
          </span>
          <span
            style={{ color: badgeConfig.progressColor }}
            className="text-2xl font-extrabold"
          >
            {animatedScore}
            <span style={{ color: "var(--nombot-text-muted)" }} className="text-xs font-normal">
              {" "}/ 100
            </span>
          </span>
        </div>
      </div>

      {/* Freshness Progress Bar */}
      <div className="my-4">
        <div className="w-full h-2.5 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-800">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${animatedScore}%`,
              backgroundColor: badgeConfig.progressColor,
            }}
          />
        </div>
      </div>

      {/* Storage Mode Toggle Group */}
      <div className="my-5">
        <label
          style={{ color: "var(--nombot-text)" }}
          className="text-xs font-bold mb-2 flex items-center gap-1.5"
        >
          <FaBoxOpen className="text-emerald-500" /> Storage Environment:
        </label>
        <div className="grid grid-cols-2 gap-2.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setStorageMode("refrigerated")}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg font-bold text-xs transition cursor-pointer ${
              isFridge
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <FaSnowflake className={isFridge ? "text-cyan-200" : "text-cyan-500"} />
            <span>Refrigerator (Cold)</span>
          </button>

          <button
            type="button"
            onClick={() => setStorageMode("roomTemp")}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg font-bold text-xs transition cursor-pointer ${
              !isFridge
                ? "bg-amber-600 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <FaFire className={!isFridge ? "text-amber-200" : "text-amber-500"} />
            <span>Room Temperature</span>
          </button>
        </div>
      </div>

      {/* 2-Column Grid on Desktop, 1-Column on Mobile: 4 Stat Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-4">
        {/* Stat Tile 1: Freshness Score */}
        <div
          style={{
            background: "var(--nombot-stat-bg)",
            borderColor: "var(--nombot-stat-border)",
          }}
          className="p-3.5 rounded-xl border flex flex-col justify-between"
        >
          <span
            style={{ color: "var(--nombot-text-muted)" }}
            className="text-[11px] font-bold uppercase tracking-wider block"
          >
            Freshness Score
          </span>
          <p
            style={{ color: badgeConfig.progressColor }}
            className="text-xl font-extrabold mt-1"
          >
            {targetScore}%
          </p>
          <span
            style={{ color: "var(--nombot-text-muted)" }}
            className="text-[11px] mt-0.5"
          >
            Bio-scan rating
          </span>
        </div>

        {/* Stat Tile 2: Days Remaining */}
        <div
          style={{
            background: "var(--nombot-stat-bg)",
            borderColor: "var(--nombot-stat-border)",
          }}
          className="p-3.5 rounded-xl border flex flex-col justify-between"
        >
          <span
            style={{ color: "var(--nombot-text-muted)" }}
            className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5"
          >
            <FaCalendarAlt className="text-emerald-500" /> Days Remaining
          </span>
          <p
            style={{ color: "var(--nombot-text)" }}
            className="text-xl font-extrabold mt-1"
          >
            {shelfLifeDays} <span className="text-xs font-semibold">days</span>
          </p>
          <span
            style={{ color: "var(--nombot-text-muted)" }}
            className="text-[11px] mt-0.5"
          >
            Best before: {bestBefore || "N/A"}
          </span>
        </div>

        {/* Stat Tile 3: AI Confidence */}
        <div
          style={{
            background: "var(--nombot-stat-bg)",
            borderColor: "var(--nombot-stat-border)",
          }}
          className="p-3.5 rounded-xl border flex flex-col justify-between"
        >
          <span
            style={{ color: "var(--nombot-text-muted)" }}
            className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5"
          >
            <FaShieldAlt className="text-emerald-500" /> AI Confidence
          </span>
          <p
            style={{ color: "var(--nombot-text)" }}
            className="text-xl font-extrabold mt-1"
          >
            {foodData.confidence || 95}%
          </p>
          <span
            style={{ color: "var(--nombot-text-muted)" }}
            className="text-[11px] mt-0.5"
          >
            Computer vision accuracy
          </span>
        </div>

        {/* Stat Tile 4: Recommended Temp */}
        <div
          style={{
            background: "var(--nombot-stat-bg)",
            borderColor: "var(--nombot-stat-border)",
          }}
          className="p-3.5 rounded-xl border flex flex-col justify-between"
        >
          <span
            style={{ color: "var(--nombot-text-muted)" }}
            className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5"
          >
            <FaThermometerHalf className="text-emerald-500" /> Recommended Temp
          </span>
          <p
            style={{ color: "var(--nombot-text)" }}
            className="text-xl font-extrabold mt-1"
          >
            {foodData.recommended_storage_temp_celsius || (isFridge ? "4°C" : "20°C")}
          </p>
          <span
            style={{ color: "var(--nombot-text-muted)" }}
            className="text-[11px] mt-0.5"
          >
            Ideal preservation temperature
          </span>
        </div>
      </div>

      {/* Inspector Observations Callout Box (Left accent border) */}
      <div
        style={{
          background: "var(--nombot-callout-bg)",
          borderLeft: "4px solid var(--nombot-callout-border)",
        }}
        className="rounded-lg p-3.5 my-4 text-xs"
      >
        <span
          style={{ color: "var(--nombot-text)" }}
          className="font-bold block mb-1"
        >
          🔍 Inspector Observations
        </span>
        {foodData.visible_spoilage_signs && foodData.visible_spoilage_signs.length > 0 ? (
          <ul className="list-disc list-inside space-y-1 font-medium text-amber-600 dark:text-amber-300">
            {foodData.visible_spoilage_signs.map((sign, idx) => (
              <li key={idx}>{sign}</li>
            ))}
          </ul>
        ) : (
          <p style={{ color: "var(--nombot-callout-text)" }} className="font-semibold">
            ✓ No visible spoilage or mold signs detected. Fresh condition.
          </p>
        )}
      </div>

      {/* Bottom Action Buttons: Row on desktop (right-aligned), stacked full-width on mobile */}
      <div
        style={{ borderColor: "var(--nombot-card-border)" }}
        className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 mt-2 border-t"
      >
        <button
          type="button"
          onClick={onCancel}
          style={{
            borderColor: "var(--nombot-card-border)",
            color: "var(--nombot-text)",
          }}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl border bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition cursor-pointer"
        >
          Cancel & Scan Another
        </button>

        <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto justify-end">
          {foodData.freshness_status === "Donate Now" && onDonate && (
            <button
              type="button"
              onClick={onDonate}
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-md transition cursor-pointer"
            >
              <FaHandHoldingHeart /> Send to Donate
            </button>
          )}

          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md hover:shadow-lg transition flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
          >
            {saving ? "Saving..." : "Save to Inventory"}
          </button>
        </div>
      </div>
    </div>
  );
}
