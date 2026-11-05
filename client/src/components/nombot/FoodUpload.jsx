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
    <div className="w-full max-w-xl mx-auto mt-4">
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
          className={`border-3 border-dashed rounded-3xl p-6 sm:p-8 text-center cursor-pointer transition-all duration-300 relative group overflow-hidden ${
            isDragOver
              ? "border-lime-400 bg-lime-950/40 scale-[1.02] shadow-[0_0_30px_rgba(163,230,53,0.35)]"
              : "border-emerald-500/40 hover:border-lime-400/80 bg-slate-900/70 hover:bg-emerald-950/30 shadow-lg"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
            onChange={handleFileInput}
            className="hidden"
          />

          <div className="flex flex-col items-center gap-3 pointer-events-none">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-lime-400/20 border border-emerald-400/30 flex items-center justify-center text-4xl group-hover:scale-110 transition-transform duration-300 shadow-md">
              <FaCloudUploadAlt className="text-lime-300" />
            </div>

            <div>
              <h3 className="text-xl font-black text-white tracking-wide">
                Feed Nom-Bot Something Delicious!
              </h3>
              <p className="text-xs sm:text-sm text-emerald-300/85 font-medium mt-1 max-w-md mx-auto">
                Drop your fruits, vegetables or food items into my tummy. I'll check their freshness!
              </p>
            </div>

            <div className="flex items-center gap-2 mt-1">
              <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-700">
                Click to browse files
              </span>
              <span className="text-slate-400 text-xs">or drag and drop</span>
            </div>
          </div>
        </div>
      ) : (
        /* Image Preview Box */
        <div className="bg-slate-900/90 border-2 border-emerald-500/40 rounded-3xl p-5 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
              <FaCheckCircle className="text-lime-400 text-sm" />
              <span className="truncate max-w-[220px]">{fileName || "Selected Food Item"}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
                className="flex items-center gap-1 px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition"
              >
                <FaRedo className="text-[10px]" /> Replace
              </button>
              <button
                onClick={onRemoveImage}
                className="flex items-center gap-1 px-3 py-1 rounded-xl bg-rose-950/60 hover:bg-rose-900 text-rose-300 text-xs font-bold border border-rose-800/60 transition"
              >
                <FaTimes className="text-[10px]" /> Remove
              </button>
            </div>
          </div>

          <div className="mt-4 flex flex-col items-center">
            <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-500/40 shadow-xl max-h-56 max-w-xs">
              <img src={image} alt="Uploaded food" className="w-full h-full object-cover" />
              {loading && (
                <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex flex-col items-center justify-center gap-2 text-lime-300 font-extrabold text-xs">
                  <div className="w-8 h-8 border-3 border-lime-400 border-t-transparent rounded-full animate-spin" />
                  <span>Scanning with Gemini AI...</span>
                </div>
              )}
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
            onChange={handleFileInput}
            className="hidden"
          />
        </div>
      )}

      {/* Quick sample snack buttons */}
      {!image && (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 mt-4 text-xs">
          <span className="text-slate-400 font-semibold">Quick Feed Samples:</span>
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => onQuickSampleSelect("Mango")}
              className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-yellow-300 border border-slate-700 transition font-bold flex items-center gap-1 shadow"
            >
              <span>🥭</span> Mango
            </button>
            <button
              onClick={() => onQuickSampleSelect("Banana")}
              className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-yellow-200 border border-slate-700 transition font-bold flex items-center gap-1 shadow"
            >
              <span>🍌</span> Banana
            </button>
            <button
              onClick={() => onQuickSampleSelect("Apple")}
              className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-red-300 border border-slate-700 transition font-bold flex items-center gap-1 shadow"
            >
              <span>🍎</span> Apple
            </button>
            <button
              onClick={() => onQuickSampleSelect("Broccoli")}
              className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-emerald-300 border border-slate-700 transition font-bold flex items-center gap-1 shadow"
            >
              <span>🥦</span> Broccoli
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
