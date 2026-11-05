// client/src/components/nombot/FreshnessReport.jsx
import React, { useState, useEffect } from "react";
import { FaHeartbeat, FaCalendarAlt, FaSnowflake, FaFire, FaShieldAlt, FaBoxOpen, FaHandHoldingHeart } from "react-icons/fa";

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
    const duration = 1000;
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

  // Status badge coloring
  const statusStyles = {
    Fresh: "bg-emerald-500/20 text-lime-300 border-lime-400/40",
    "Use Soon": "bg-yellow-500/20 text-yellow-300 border-yellow-400/40",
    "Donate Now": "bg-amber-500/20 text-amber-300 border-amber-400/40",
    Discard: "bg-rose-500/20 text-rose-300 border-rose-400/40",
  };
  const badgeStyle = statusStyles[foodData.freshness_status] || "bg-slate-800 text-slate-300";

  return (
    <div className="w-full max-w-xl mx-auto mt-6 bg-gradient-to-b from-slate-900/95 via-slate-900/85 to-slate-950 border-2 border-emerald-500/40 rounded-3xl p-6 sm:p-7 shadow-2xl backdrop-blur-2xl text-slate-100 animate-in fade-in slide-in-from-bottom-4">
      {/* Title & Freshness Score Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-2xl font-black text-white tracking-wide">
              {foodData.food_item || "Identified Food"}
            </h3>
            <span className={`text-xs px-2.5 py-0.5 rounded-full font-extrabold border ${badgeStyle}`}>
              {foodData.freshness_status}
            </span>
          </div>
          <p className="text-xs text-emerald-300/80 font-medium mt-0.5">
            Category: <span className="text-slate-200 font-bold">{foodData.category || "Produce"}</span> • Quantity: {foodData.estimated_quantity || "1 unit"}
          </p>
        </div>

        {/* Circular / Score Display */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold block">
              Freshness Score
            </span>
            <span className="text-3xl font-black text-lime-300">
              {animatedScore} <span className="text-lg text-slate-400 font-bold">/ 100</span>
            </span>
          </div>
        </div>
      </div>

      {/* Storage Mode Toggle */}
      <div className="my-5">
        <label className="text-xs font-bold text-slate-300 mb-2 block flex items-center gap-1.5">
          <FaBoxOpen className="text-lime-400" /> Select Storage Environment:
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setStorageMode("refrigerated")}
            className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl font-bold text-xs transition border ${
              isFridge
                ? "bg-emerald-600/90 text-white border-lime-400 shadow-lg shadow-emerald-500/25 scale-[1.02]"
                : "bg-slate-800/80 text-slate-300 border-slate-700 hover:text-white"
            }`}
          >
            <FaSnowflake className={isFridge ? "text-cyan-200" : "text-cyan-400"} />
            <span>Refrigerator (Cold)</span>
          </button>

          <button
            type="button"
            onClick={() => setStorageMode("roomTemp")}
            className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl font-bold text-xs transition border ${
              !isFridge
                ? "bg-amber-600/90 text-white border-amber-400 shadow-lg shadow-amber-500/25 scale-[1.02]"
                : "bg-slate-800/80 text-slate-300 border-slate-700 hover:text-white"
            }`}
          >
            <FaFire className={!isFridge ? "text-amber-200" : "text-amber-400"} />
            <span>Room Temperature</span>
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-4 text-xs">
        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3.5">
          <div className="flex items-center gap-1.5 text-slate-400 font-bold">
            <FaCalendarAlt className="text-lime-400" />
            <span>Days Remaining</span>
          </div>
          <p className="text-xl font-black text-white mt-1">
            {shelfLifeDays} <span className="text-xs font-semibold text-slate-400">days</span>
          </p>
          <span className="text-[11px] text-emerald-300/80">Best before: {bestBefore || "N/A"}</span>
        </div>

        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3.5">
          <div className="flex items-center gap-1.5 text-slate-400 font-bold">
            <FaShieldAlt className="text-emerald-400" />
            <span>AI Confidence</span>
          </div>
          <p className="text-xl font-black text-lime-300 mt-1">{foodData.confidence}%</p>
          <span className="text-[11px] text-slate-400">
            Recommended temp: {foodData.recommended_storage_temp_celsius}
          </span>
        </div>
      </div>

      {/* Spoilage Observations or Warnings */}
      <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3.5 my-3 text-xs">
        <span className="text-slate-400 font-bold block mb-1">🔍 Inspector Observations:</span>
        {foodData.visible_spoilage_signs && foodData.visible_spoilage_signs.length > 0 ? (
          <ul className="list-disc list-inside text-amber-300 font-medium space-y-0.5">
            {foodData.visible_spoilage_signs.map((sign, idx) => (
              <li key={idx}>{sign}</li>
            ))}
          </ul>
        ) : (
          <p className="text-emerald-400 font-semibold">
            ✓ No visible spoilage or mold signs detected.
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 mt-3 border-t border-slate-800">
        <button
          onClick={onCancel}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold border border-slate-700 transition"
        >
          Cancel & Scan Another
        </button>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {foodData.freshness_status === "Donate Now" && onDonate && (
            <button
              onClick={onDonate}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 text-xs font-black shadow-lg shadow-amber-500/25 transition"
            >
              <FaHandHoldingHeart /> Send to Donate
            </button>
          )}

          <button
            onClick={onSave}
            disabled={saving}
            className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-gradient-to-r from-lime-400 to-emerald-400 hover:from-lime-300 hover:to-emerald-300 text-slate-950 text-xs font-black shadow-lg shadow-lime-400/30 transition flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save to Inventory"}
          </button>
        </div>
      </div>
    </div>
  );
}
