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
      {/* Trigger Buttons */}
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={toggleBgm}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition shadow-sm border cursor-pointer ${
            bgmEnabled && !isMuted
              ? "bg-emerald-600 text-white border-emerald-400 shadow-emerald-500/25"
              : "bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700"
          }`}
          title="Toggle Background Music"
        >
          <FaMusic className={bgmEnabled && !isMuted ? "text-lime-300" : "text-slate-400"} />
          <span>BGM: {bgmEnabled && !isMuted ? "ON" : "OFF"}</span>
        </button>

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700 transition shadow-sm cursor-pointer"
          title="Audio Settings"
        >
          {isMuted ? <FaVolumeMute className="text-rose-400" /> : <FaVolumeUp className="text-emerald-400" />}
          <FaSlidersH className="text-slate-400 text-[10px]" />
        </button>
      </div>

      {/* Popover Settings Panel */}
      {isOpen && (
        <div className="absolute left-1/2 -translate-x-1/2 top-11 w-72 bg-slate-900 border border-slate-700 rounded-2xl p-4 shadow-2xl z-50 text-slate-200 text-xs animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
            <span className="font-extrabold text-white text-sm flex items-center gap-1.5">
              <span>🎧</span> Audio Settings
            </span>
            <button
              type="button"
              onClick={toggleMute}
              className={`px-2 py-0.5 rounded-md font-bold text-[11px] transition cursor-pointer ${
                isMuted
                  ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                  : "bg-slate-800 text-slate-200 hover:text-white"
              }`}
            >
              {isMuted ? "Unmute All" : "Mute All"}
            </button>
          </div>

          {/* Music Toggle & Volume */}
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <FaMusic className="text-emerald-400" /> Background Music
                </span>
                <button
                  type="button"
                  onClick={toggleBgm}
                  className={`w-10 h-5 flex items-center rounded-full p-1 cursor-pointer transition ${
                    bgmEnabled ? "bg-emerald-500 justify-end" : "bg-slate-700 justify-start"
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
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-400 disabled:opacity-40"
                />
                <span className="w-7 text-right text-[10px] text-slate-400">
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
