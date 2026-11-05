// client/src/components/nombot/NomBot.jsx
import React, { useState } from "react";
import "./NomBot.css";

export default function NomBot({ state, customMessage, foodImage }) {
  const [imgError, setImgError] = useState(false);

  // Messages per state as specified in requirements
  const stateConfigs = {
    idle: {
      emoji: "👋",
      defaultText: "Hey chef! Ready to feed me something delicious?",
      moodClass: "nombot-idle",
      borderGlow: "border-lime-400/80 shadow-lime-500/20",
    },
    upload: {
      emoji: "🤩",
      defaultText: "Yumm! What did you bring me?",
      moodClass: "nombot-excited",
      borderGlow: "border-emerald-400 shadow-emerald-500/30",
    },
    analyzing: {
      emoji: "🔬",
      defaultText: "Nom nom... Let me check how fresh this is!",
      moodClass: "nombot-chewing",
      borderGlow: "border-cyan-400 shadow-cyan-500/40",
    },
    fresh: {
      emoji: "🥳",
      defaultText: "BUUUURP! Super fresh! Add it to your inventory!",
      moodClass: "nombot-celebrating",
      borderGlow: "border-lime-400 shadow-lime-500/40",
    },
    moderate: {
      emoji: "🤔",
      defaultText: "Hmm... Still good, but keep an eye on me!",
      moodClass: "nombot-thoughtful",
      borderGlow: "border-yellow-400 shadow-yellow-500/30",
    },
    nearly_expired: {
      emoji: "⚠️",
      defaultText: "Chef! Eat me soon. My freshness is going down!",
      moodClass: "nombot-worried",
      borderGlow: "border-amber-500 shadow-amber-500/30",
    },
    spoiled: {
      emoji: "🤢",
      defaultText: "Oh no! I don't think this food is safe anymore!",
      moodClass: "nombot-disgusted",
      borderGlow: "border-rose-500 shadow-rose-500/30",
    },
    inventory_success: {
      emoji: "🎉",
      defaultText: "YAY! I've saved this delicious item!",
      moodClass: "nombot-jumping",
      borderGlow: "border-emerald-300 shadow-emerald-400/40",
    },
  };

  const config = stateConfigs[state] || stateConfigs.idle;
  const activeMessage = customMessage || config.defaultText;

  return (
    <div className="flex flex-col items-center select-none relative my-3">
      {/* Speech Bubble */}
      <div className="relative mb-4 z-20 transition-all duration-300">
        <div
          className={`bg-slate-900/95 border-2 ${config.borderGlow} text-lime-200 px-6 py-3 rounded-2xl text-sm sm:text-base font-extrabold shadow-xl flex items-center gap-3 backdrop-blur-md`}
        >
          <span className="text-2xl animate-bounce">{config.emoji}</span>
          <span className="tracking-wide">"{activeMessage}"</span>
        </div>
        {/* Triangle pointer */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[9px] border-l-transparent border-r-[9px] border-r-transparent border-t-[9px] border-t-slate-900"></div>
      </div>

      {/* Mascot Stage */}
      <div className={`relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center ${config.moodClass}`}>
        
        {/* Floor Shadow Glow */}
        <div className="absolute -bottom-2 w-48 h-6 bg-emerald-500/30 rounded-full blur-md" />

        {/* Floating food swallowed effect */}
        {state === "analyzing" && foodImage && (
          <div className="absolute z-30 pointer-events-none nombot-flying-food">
            <img
              src={foodImage}
              alt="Food"
              className="w-14 h-14 object-cover rounded-full border-3 border-yellow-400 shadow-xl"
            />
          </div>
        )}

        {/* Particles / Stars for states */}
        {state === "analyzing" && (
          <div className="absolute inset-0 pointer-events-none z-20 flex items-center justify-center">
            <div className="nombot-scan-beam" />
            <span className="absolute text-xl animate-ping top-10 left-12">✨</span>
            <span className="absolute text-xl animate-ping bottom-12 right-12">⭐</span>
          </div>
        )}

        {/* Primary GIF attempt, or rich 3D vector fallback */}
        {!imgError ? (
          <img
            src="/images/nom-bot.gif"
            alt="Nom-Bot"
            onError={() => setImgError(true)}
            className="w-full h-full object-contain filter drop-shadow-[0_15px_30px_rgba(16,185,129,0.35)]"
          />
        ) : (
          /* High quality embedded 3D Vector Nom-Bot Mascot */
          <svg
            viewBox="0 0 340 340"
            className="w-full h-full filter drop-shadow-[0_15px_30px_rgba(16,185,129,0.35)]"
          >
            <defs>
              <radialGradient id="nbBodyGrad" cx="40%" cy="35%" r="65%">
                <stop offset="0%" stopColor="#bbf7d0" />
                <stop offset="45%" stopColor="#86efac" />
                <stop offset="85%" stopColor="#34d399" />
                <stop offset="100%" stopColor="#059669" />
              </radialGradient>
              <radialGradient id="nbAppleGrad" cx="35%" cy="35%" r="65%">
                <stop offset="0%" stopColor="#fca5a5" />
                <stop offset="40%" stopColor="#ef4444" />
                <stop offset="90%" stopColor="#b91c1c" />
              </radialGradient>
            </defs>

            {/* Veggie Backpack */}
            <ellipse cx="78" cy="195" rx="36" ry="46" fill="#15803d" stroke="#14532d" strokeWidth="4" />
            <path d="M 68 185 C 55 155 80 135 90 125 C 88 135 85 165 96 185 Z" fill="#facc15" />
            <path d="M 52 195 L 68 155 Q 78 152 82 160 L 72 205 Z" fill="#f97316" />

            {/* Headband & Leaf Sprout */}
            <path d="M 90 120 C 90 55 250 55 250 120" stroke="#16a34a" strokeWidth="16" strokeLinecap="round" fill="none" />
            <path d="M 170 58 Q 170 42 170 30" stroke="#16a34a" strokeWidth="6" strokeLinecap="round" fill="none" />
            <path d="M 170 32 C 150 10 135 25 170 42 Z" fill="#84cc16" />
            <path d="M 170 32 C 190 10 205 25 170 42 Z" fill="#84cc16" />

            {/* Main Lunchbox Body */}
            <rect x="80" y="80" width="180" height="175" rx="55" fill="url(#nbBodyGrad)" stroke="#16a34a" strokeWidth="6" />

            {/* Chest Plate with Green Leaf Logo */}
            <rect x="100" y="200" width="140" height="48" rx="20" fill="#a7f3d0" stroke="#16a34a" strokeWidth="3" />
            <path d="M 170 226 C 155 210 140 220 162 236 Z" fill="#15803d" />
            <path d="M 170 226 C 185 210 200 220 178 236 Z" fill="#15803d" />

            {/* Headphone Ear Cups */}
            <rect x="68" y="125" width="22" height="52" rx="11" fill="#16a34a" />
            <rect x="250" y="125" width="22" height="52" rx="11" fill="#16a34a" />

            {/* Rosy Blushing Cheeks */}
            <ellipse cx="112" cy="155" rx="14" ry="10" fill={state === "spoiled" ? "#84cc16" : "#f43f5e"} opacity="0.7" />
            <ellipse cx="228" cy="155" rx="14" ry="10" fill={state === "spoiled" ? "#84cc16" : "#f43f5e"} opacity="0.7" />

            {/* Expressive Eyes */}
            {state === "spoiled" ? (
              // Disgusted cross eyes
              <g>
                <line x1="120" y1="116" x2="144" y2="136" stroke="#0f172a" strokeWidth="5" strokeLinecap="round" />
                <line x1="144" y1="116" x2="120" y2="136" stroke="#0f172a" strokeWidth="5" strokeLinecap="round" />
                <line x1="196" y1="116" x2="220" y2="136" stroke="#0f172a" strokeWidth="5" strokeLinecap="round" />
                <line x1="220" y1="116" x2="196" y2="136" stroke="#0f172a" strokeWidth="5" strokeLinecap="round" />
              </g>
            ) : state === "nearly_expired" ? (
              // Worried droopy eyes
              <g>
                <ellipse cx="132" cy="128" rx="16" ry="18" fill="#0f172a" />
                <circle cx="136" cy="120" r="5" fill="#ffffff" />
                <ellipse cx="208" cy="128" rx="16" ry="18" fill="#0f172a" />
                <circle cx="212" cy="120" r="5" fill="#ffffff" />
                <path d="M 120 108 Q 132 116 144 112" stroke="#0f172a" strokeWidth="3" fill="none" />
                <path d="M 196 112 Q 208 116 220 108" stroke="#0f172a" strokeWidth="3" fill="none" />
              </g>
            ) : (
              // Normal / Joyful big sparkling anime eyes
              <g>
                <ellipse cx="132" cy="126" rx="18" ry="24" fill="#0f172a" />
                <circle cx="138" cy="116" r="8" fill="#ffffff" />
                <ellipse cx="208" cy="126" rx="18" ry="24" fill="#0f172a" />
                <circle cx="214" cy="116" r="8" fill="#ffffff" />
              </g>
            )}

            {/* Mouth */}
            {state === "spoiled" ? (
              // Wavy disgusted mouth
              <path d="M 130 175 Q 150 165 170 178 Q 190 165 210 175" stroke="#0f172a" strokeWidth="4" fill="none" strokeLinecap="round" />
            ) : state === "nearly_expired" ? (
              // Wobbly small nervous mouth
              <path d="M 145 172 Q 170 164 195 172" stroke="#0f172a" strokeWidth="4" fill="none" strokeLinecap="round" />
            ) : (
              // Huge happy open mouth
              <g>
                <path d="M 125 152 Q 170 144 215 152 Q 220 196 170 196 Q 120 196 125 152 Z" fill="#7f1d1d" stroke="#0f172a" strokeWidth="4" />
                <path d="M 140 178 Q 170 162 200 178 Q 185 196 155 196 Z" fill="#fb7185" />
              </g>
            )}

            {/* Cute Apple / Snack in hand */}
            <circle cx="242" cy="152" r="20" fill="url(#nbAppleGrad)" stroke="#991b1b" strokeWidth="1.5" />
            <path d="M 242 133 Q 240 124 246 120" stroke="#78350f" strokeWidth="2.5" fill="none" />
            <path d="M 246 124 Q 256 120 252 130 Z" fill="#22c55e" />

            {/* White Gloves */}
            <ellipse cx="118" cy="204" rx="14" ry="12" fill="#ffffff" stroke="#16a34a" strokeWidth="3" />
            <ellipse cx="222" cy="204" rx="14" ry="12" fill="#ffffff" stroke="#16a34a" strokeWidth="3" />

            {/* Feet */}
            <rect x="110" y="254" width="40" height="18" rx="9" fill="#65a30d" stroke="#16a34a" strokeWidth="3" />
            <rect x="190" y="254" width="40" height="18" rx="9" fill="#65a30d" stroke="#16a34a" strokeWidth="3" />
          </svg>
        )}
      </div>
    </div>
  );
}
