// client/src/components/nombot/FoodUpload.jsx
import React, { useRef, useState } from "react";
import { FaCloudUploadAlt, FaTimes, FaRedo, FaCheckCircle } from "react-icons/fa";

export default function FoodUpload({
  image,
  fileName,
  onImageSelected,
  onRemoveImage,
  onQuickSampleSelect,
  loading,
  onDragStateChange,
}) {
  const fileInputRef = useRef(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
    if (onDragStateChange) onDragStateChange(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (onDragStateChange) onDragStateChange(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (onDragStateChange) onDragStateChange(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      onImageSelected(file);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      onImageSelected(file);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto mt-2">
      {/* Upload Zone */}
      {!image ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current && fileInputRef.current.click()}
          style={{
            background: "var(--nombot-card-bg)",
            borderColor: isDragOver ? "var(--nombot-primary)" : "var(--nombot-card-border)",
            boxShadow: "var(--nombot-shadow)",
          }}
          className={`border-2 border-dashed rounded-2xl p-6 sm:p-7 text-center cursor-pointer transition-all duration-300 relative group overflow-hidden ${
            isDragOver ? "scale-[1.01]" : "hover:border-emerald-500"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
            onChange={handleFileInput}
            style={{ display: "none" }}
          />

          <div className="flex flex-col items-center gap-3 pointer-events-none">
            <div
              style={{
                background: "var(--nombot-stat-bg)",
                borderColor: "var(--nombot-card-border)",
              }}
              className="w-14 h-14 rounded-2xl border flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-300"
            >
              <FaCloudUploadAlt style={{ color: "var(--nombot-primary)" }} />
            </div>

            <div>
              <h3
                style={{ color: "var(--nombot-text)" }}
                className="text-lg font-bold tracking-tight"
              >
                Feed Nom-Bot Something Delicious!
              </h3>
              <p
                style={{ color: "var(--nombot-text-muted)" }}
                className="text-xs sm:text-sm font-medium mt-1 max-w-sm mx-auto leading-relaxed"
              >
                Drop your food items here or click to browse. Nom-Bot will analyze their freshness!
              </p>
            </div>

            <div className="flex items-center gap-2 mt-2">
              <span
                style={{
                  background: "var(--nombot-stat-bg)",
                  borderColor: "var(--nombot-stat-border)",
                  color: "var(--nombot-text)",
                }}
                className="px-3 py-1 rounded-full text-xs font-semibold border"
              >
                Choose File
              </span>
              <span style={{ color: "var(--nombot-text-muted)" }} className="text-xs">
                or drag & drop
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* Image Preview Box */
        <div
          style={{
            background: "var(--nombot-card-bg)",
            borderColor: "var(--nombot-card-border)",
            boxShadow: "var(--nombot-shadow)",
          }}
          className="border rounded-2xl p-4 sm:p-5"
        >
          <div
            style={{ borderColor: "var(--nombot-card-border)" }}
            className="flex items-center justify-between pb-3 border-b"
          >
            <div className="flex items-center gap-2 text-xs font-bold" style={{ color: "var(--nombot-text)" }}>
              <FaCheckCircle className="text-emerald-500 text-sm" />
              <span className="truncate max-w-[200px]">{fileName || "Selected Food Item"}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
                style={{
                  background: "var(--nombot-stat-bg)",
                  borderColor: "var(--nombot-stat-border)",
                  color: "var(--nombot-text)",
                }}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border hover:opacity-80 transition cursor-pointer"
              >
                <FaRedo className="text-[10px]" /> Replace
              </button>
              <button
                type="button"
                onClick={onRemoveImage}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 text-xs font-semibold border border-rose-500/20 transition cursor-pointer"
              >
                <FaTimes className="text-[10px]" /> Remove
              </button>
            </div>
          </div>

          <div className="mt-4 flex flex-col items-center">
            <div className="relative rounded-xl overflow-hidden border border-slate-700 max-h-52 max-w-xs shadow-md">
              <img src={image} alt="Uploaded food" className="w-full h-full object-cover" />
              {loading && (
                <div className="absolute inset-0 bg-slate-950/80 flex flex-col items-center justify-center gap-2 text-emerald-400 font-bold text-xs">
                  <div className="w-7 h-7 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                  <span>Scanning freshness...</span>
                </div>
              )}
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
            onChange={handleFileInput}
            style={{ display: "none" }}
          />
        </div>
      )}

      {/* Quick Feed Samples: Properly arranged in a centered flex row */}
      {!image && (
        <div className="flex flex-col items-center gap-2.5 mt-5">
          <span
            style={{ color: "var(--nombot-text-muted)" }}
            className="text-xs font-semibold tracking-wide uppercase"
          >
            Quick Feed Samples
          </span>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {[
              { name: "Mango", icon: "🥭" },
              { name: "Banana", icon: "🍌" },
              { name: "Apple", icon: "🍎" },
              { name: "Broccoli", icon: "🥦" },
            ].map((item) => (
              <button
                key={item.name}
                type="button"
                onClick={() => onQuickSampleSelect(item.name)}
                style={{
                  background: "var(--nombot-stat-bg)",
                  borderColor: "var(--nombot-stat-border)",
                  color: "var(--nombot-text)",
                }}
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold border hover:border-emerald-500 hover:scale-105 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <span>{item.icon}</span>
                <span>{item.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
