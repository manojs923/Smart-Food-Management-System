// client/src/components/nombot/AudioControls.jsx
import React, { useState, useRef, useEffect } from "react";
import { useSound } from "./useSound";
import { FaVolumeUp, FaVolumeMute, FaVolumeDown, FaMusic, FaBell } from "react-icons/fa";

export default function AudioControls() {
  const {
    musicEnabled,
    effectsEnabled,
    musicVolume,
    effectsVolume,
    isMuted,
    setMusicVolume,
    setEffectsVolume,
    setMusicEnabled,
    setEffectsEnabled,
    toggleMute,
    play,
  } = useSound();

  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef(null);
  const popoverRef = useRef(null);
  const firstFocusableRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (e) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
    };
  }, [isOpen]);

  // Keyboard navigation & accessibility (Escape closes and restores focus)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    // Move focus into the popover upon opening
    const timer = setTimeout(() => {
      firstFocusableRef.current?.focus();
    }, 50);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      clearTimeout(timer);
    };
  }, [isOpen]);

  const togglePopover = () => {
    play("click");
    setIsOpen((prev) => !prev);
  };

  // Determine speaker icon based on audio state
  const isAudioOff = isMuted || (!musicEnabled && !effectsEnabled);
  const currentVolume = Math.max(musicVolume, effectsVolume);

  return (
    <div className="nombot-audio-controls-container" style={{ position: "relative", display: "inline-block" }}>
      {/* Single 44px Speaker Icon Button */}
      <button
        ref={buttonRef}
        type="button"
        onClick={togglePopover}
        className={`nombot-speaker-btn ${isOpen ? "active" : ""}`}
        aria-label="Sound settings"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-controls="audio-settings-popover"
        title="Audio controls"
      >
        {isAudioOff ? (
          <FaVolumeMute className="nombot-speaker-icon muted" />
        ) : currentVolume < 35 ? (
          <FaVolumeDown className="nombot-speaker-icon" />
        ) : (
          <FaVolumeUp className="nombot-speaker-icon" />
        )}
      </button>

      {/* Accessible Popover (width 260px, rounded 12px, soft shadow) */}
      {isOpen && (
        <div
          ref={popoverRef}
          id="audio-settings-popover"
          role="dialog"
          aria-label="Audio controls"
          className="nombot-audio-popover"
        >
          {/* Popover Header */}
          <div className="nombot-popover-header">
            <span className="nombot-popover-title">
              <span>🔊</span> Audio Controls
            </span>
            <button
              type="button"
              onClick={() => {
                play("click");
                toggleMute();
              }}
              className={`nombot-mute-toggle-btn ${isMuted ? "muted" : ""}`}
              aria-pressed={isMuted}
            >
              {isMuted ? "Unmute" : "Mute"}
            </button>
          </div>

          <div className="nombot-popover-body">
            {/* Control 1: Background Music Toggle & Slider */}
            <div className="nombot-popover-section">
              <div className="nombot-control-row">
                <label htmlFor="bgm-toggle-switch" className="nombot-control-label">
                  <FaMusic className="nombot-inline-icon music" />
                  <span>Background music</span>
                </label>
                <button
                  ref={firstFocusableRef}
                  id="bgm-toggle-switch"
                  role="switch"
                  type="button"
                  aria-checked={musicEnabled}
                  onClick={() => {
                    play("click");
                    setMusicEnabled(!musicEnabled);
                  }}
                  className={`nombot-switch ${musicEnabled ? "checked" : ""}`}
                >
                  <span className="nombot-switch-thumb" />
                </button>
              </div>

              {/* Music Volume Slider (0-100) */}
              <div className="nombot-slider-row">
                <label htmlFor="music-volume-slider" className="sr-only">
                  Music volume
                </label>
                <input
                  id="music-volume-slider"
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={musicVolume}
                  onChange={(e) => setMusicVolume(parseInt(e.target.value, 10))}
                  disabled={!musicEnabled || isMuted}
                  className="nombot-volume-slider"
                  aria-valuemin="0"
                  aria-valuemax="100"
                  aria-valuenow={musicVolume}
                />
                <span className="nombot-volume-value">{musicVolume}%</span>
              </div>
            </div>

            {/* Control 2: Sound Effects Toggle & Slider */}
            <div className="nombot-popover-section">
              <div className="nombot-control-row">
                <label htmlFor="sfx-toggle-switch" className="nombot-control-label">
                  <FaBell className="nombot-inline-icon sfx" />
                  <span>Sound effects</span>
                </label>
                <button
                  id="sfx-toggle-switch"
                  role="switch"
                  type="button"
                  aria-checked={effectsEnabled}
                  onClick={() => {
                    play("click");
                    setEffectsEnabled(!effectsEnabled);
                  }}
                  className={`nombot-switch ${effectsEnabled ? "checked" : ""}`}
                >
                  <span className="nombot-switch-thumb" />
                </button>
              </div>

              {/* Effects Volume Slider (0-100) */}
              <div className="nombot-slider-row">
                <label htmlFor="effects-volume-slider" className="sr-only">
                  Effects volume
                </label>
                <input
                  id="effects-volume-slider"
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={effectsVolume}
                  onChange={(e) => setEffectsVolume(parseInt(e.target.value, 10))}
                  disabled={!effectsEnabled || isMuted}
                  className="nombot-volume-slider"
                  aria-valuemin="0"
                  aria-valuemax="100"
                  aria-valuenow={effectsVolume}
                />
                <span className="nombot-volume-value">{effectsVolume}%</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
