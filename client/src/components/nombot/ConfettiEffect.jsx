// client/src/components/nombot/ConfettiEffect.jsx
import React, { useEffect, useState } from "react";

export default function ConfettiEffect({ active }) {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (!active) {
      setParticles([]);
      return;
    }

    const emojis = ["🍎", "🥦", "🥑", "🍌", "✨", "🎉", "⭐", "🍓", "🍉"];
    const generated = Array.from({ length: 28 }).map((_, i) => ({
      id: i,
      emoji: emojis[i % emojis.length],
      left: Math.random() * 95 + "%",
      delay: Math.random() * 0.4 + "s",
      duration: Math.random() * 1.5 + 1.2 + "s",
      size: Math.random() * 1.2 + 1 + "rem",
    }));

    setParticles(generated);

    const timer = setTimeout(() => {
      setParticles([]);
    }, 3200);

    return () => clearTimeout(timer);
  }, [active]);

  if (!active || particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute animate-bounce"
          style={{
            left: p.left,
            top: "-40px",
            fontSize: p.size,
            animation: `confettiFall ${p.duration} ease-in ${p.delay} forwards`,
          }}
        >
          {p.emoji}
        </span>
      ))}
      <style>{`
        @keyframes confettiFall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(105vh) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
