// client/src/components/nombot/AudioControls.jsx
import React, { useState } from "react";
import { useAudioManager } from "./useAudioManager";
import { FaMusic, FaVolumeUp, FaVolumeMute, FaSlidersH, FaCheck } from "react-icons/fa";

export default function AudioControls() {
  const {
    bgmEnabled,
    sfxEnabled,
    bgmVolume,
    sfxVolume,
    isMuted,
    toggleBgm,
    setBgmVolume,
    toggleSfx,
    setSfxVolume,
    toggleMute,
  } = useAudioManager();

  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative z-30">
      {/* Trigger Button */}
      <div className="flex items-center gap-2">
        <button
          onClick={toggleBgm}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition shadow-md border ${
            bgmEnabled && !isMuted
              ? "bg-emerald-600/90 text-white border-lime-400 shadow-emerald-500/30 animate-pulse"
              : "bg-slate-800/90 text-slate-300 border-slate-700 hover:text-white"
          }`}
          title="Toggle Background Music"
        >
          <FaMusic className={bgmEnabled && !isMuted ? "text-lime-300 animate-spin" : "text-slate-400"} />
          <span>BGM: {bgmEnabled && !isMuted ? "ON" : "OFF"}</span>
        </button>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-slate-800/90 text-slate-300 border border-slate-700 hover:text-white hover:border-emerald-500/50 transition shadow-md"
          title="Audio Settings"
        >
          {isMuted ? <FaVolumeMute className="text-red-400" /> : <FaVolumeUp className="text-emerald-400" />}
          <FaSlidersH className="text-slate-400 text-[10px]" />
        </button>
      </div>

      {/* Popover Settings Panel */}
      {isOpen && (
        <div className="absolute right-0 top-10 w-72 bg-slate-900/95 border-2 border-emerald-500/40 rounded-2xl p-4 shadow-2xl backdrop-blur-xl text-slate-200 text-xs animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
            <span className="font-extrabold text-white text-sm flex items-center gap-1.5">
              <span>🎧</span> Audio Studio
            </span>
            <button
              onClick={toggleMute}
              className={`px-2 py-0.5 rounded-md font-bold text-[11px] transition ${
                isMuted
                  ? "bg-red-500/20 text-red-400 border border-red-500/40"
                  : "bg-slate-800 text-slate-300 hover:text-white"
              }`}
            >
              {isMuted ? "Unmute All" : "Mute All"}
            </button>
          </div>

          {/* Music Toggle & Volume */}
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <FaMusic className="text-lime-400" /> Game Music
                </span>
                <button
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
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-lime-400 disabled:opacity-40"
                />
                <span className="w-7 text-right text-[10px] text-slate-400">
                  {Math.round(bgmVolume * 100)}%
                </span>
              </div>
            </div>

            {/* SFX Toggle & Volume */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <FaVolumeUp className="text-emerald-400" /> Mascot SFX
                </span>
                <button
                  onClick={toggleSfx}
                  className={`w-10 h-5 flex items-center rounded-full p-1 cursor-pointer transition ${
                    sfxEnabled ? "bg-emerald-500 justify-end" : "bg-slate-700 justify-start"
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
                  value={sfxVolume}
                  onChange={(e) => setSfxVolume(parseFloat(e.target.value))}
                  disabled={!sfxEnabled || isMuted}
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-400 disabled:opacity-40"
                />
                <span className="w-7 text-right text-[10px] text-slate-400">
                  {Math.round(sfxVolume * 100)}%
                </span>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] text-slate-400 text-center">
            Settings automatically saved to browser
          </div>
        </div>
      )}
    </div>
  );
}
