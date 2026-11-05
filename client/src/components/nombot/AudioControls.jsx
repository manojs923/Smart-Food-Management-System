// client/src/components/nombot/AudioControls.jsx
import React, { useState } from "react";
import { useAudioManager } from "./useAudioManager";
import { FaMusic, FaVolumeUp, FaVolumeMute, FaSlidersH } from "react-icons/fa";

export default function AudioControls() {
  const {
    bgmEnabled,
    bgmVolume,
    isMuted,
    toggleBgm,
    setBgmVolume,
    toggleMute,
  } = useAudioManager();

  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-flex items-center justify-center">
      {/* Trigger Buttons: Equal 44px height, 12px gap, centered */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={toggleBgm}
          className={`nombot-btn-audio ${bgmEnabled && !isMuted ? "active" : ""}`}
          title="Toggle Background Music"
        >
          <FaMusic className={bgmEnabled && !isMuted ? "animate-pulse" : "opacity-60"} />
          <span>BGM: {bgmEnabled && !isMuted ? "ON" : "OFF"}</span>
        </button>

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="nombot-btn-audio"
          title="Audio Settings"
        >
          {isMuted ? <FaVolumeMute className="text-red-400" /> : <FaVolumeUp className="opacity-80" />}
          <FaSlidersH className="opacity-60 text-xs" />
        </button>
      </div>

      {/* Popover Settings Panel */}
      {isOpen && (
        <div
          style={{
            background: "var(--nombot-card-bg)",
            borderColor: "var(--nombot-card-border)",
            boxShadow: "var(--nombot-shadow)",
            color: "var(--nombot-text)",
          }}
          className="absolute left-1/2 -translate-x-1/2 top-13 w-72 border rounded-2xl p-4 shadow-2xl z-50 text-xs animate-in fade-in zoom-in-95"
        >
          <div
            style={{ borderColor: "var(--nombot-card-border)" }}
            className="flex items-center justify-between pb-2 mb-3 border-b"
          >
            <span className="font-extrabold text-sm flex items-center gap-1.5">
              <span>🎧</span> Audio Studio
            </span>
            <button
              type="button"
              onClick={toggleMute}
              style={{
                borderColor: "var(--nombot-btn-border)",
                background: isMuted ? "rgba(239, 68, 68, 0.15)" : "transparent",
                color: isMuted ? "#ef4444" : "var(--nombot-text)",
              }}
              className="px-2.5 py-1 rounded-md font-bold text-[11px] border cursor-pointer hover:opacity-80 transition"
            >
              {isMuted ? "Unmute All" : "Mute All"}
            </button>
          </div>

          {/* Music Toggle & Volume */}
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span
                  style={{ color: "var(--nombot-text)" }}
                  className="font-semibold flex items-center gap-1.5"
                >
                  <FaMusic className="text-emerald-500" /> Background Music
                </span>
                <button
                  type="button"
                  onClick={toggleBgm}
                  className={`w-10 h-5 flex items-center rounded-full p-1 cursor-pointer transition ${
                    bgmEnabled ? "bg-emerald-500 justify-end" : "bg-slate-400 dark:bg-slate-700 justify-start"
                  }`}
                >
                  <div className="w-3.5 h-3.5 rounded-full bg-white shadow-md"></div>
                </button>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={bgmVolume}
                  onChange={(e) => setBgmVolume(parseFloat(e.target.value))}
                  disabled={!bgmEnabled || isMuted}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500 disabled:opacity-40"
                />
                <span
                  style={{ color: "var(--nombot-text-muted)" }}
                  className="w-8 text-right text-[11px] font-mono"
                >
                  {Math.round(bgmVolume * 100)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
