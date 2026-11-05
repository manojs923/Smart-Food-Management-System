// client/src/components/nombot/FoodUpload.jsx
import React, { useRef, useState } from "react";
import { FaCloudUploadAlt, FaTimes, FaRedo } from "react-icons/fa";

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
    <div className="w-full flex flex-col items-center">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
        onChange={handleFileInput}
        style={{ display: "none" }}
      />

      {/* 1. UPLOAD AREA (When no image is selected) */}
      {!image ? (
        <>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
            className={`nombot-dropzone-card ${isDragOver ? "drag-over" : ""}`}
          >
            {/* Upload Icon (40px) */}
            <FaCloudUploadAlt className="nombot-dropzone-icon" />

            {/* Title */}
            <h3 className="nombot-dropzone-title">
              Feed Nom-Bot Something Delicious!
            </h3>

            {/* Helper Text */}
            <p className="nombot-dropzone-helper">
              Drop your fruits, vegetables or food items into my tummy. I'll check their freshness!
            </p>

            {/* Styled Primary Choose File Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current && fileInputRef.current.click();
              }}
              className="nombot-btn nombot-btn-primary"
            >
              Choose File
            </button>

            {/* Small text below button */}
            <span className="nombot-dropzone-subtext">or drag & drop</span>
          </div>

          {/* Quick Feed Samples: Centered label and chips with 12px gap */}
          <div className="nombot-samples-container">
            <span className="nombot-samples-label">Quick Feed Samples</span>
            <div className="nombot-samples-row">
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
                  className="nombot-chip-btn"
                >
                  <span>{item.icon}</span>
                  <span>{item.name}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      ) : (
        /* 2. COMPACT IMAGE PREVIEW (Max-width 320px, max-height 240px) */
        <div className="nombot-preview-card">
          <div className="relative w-full flex items-center justify-center overflow-hidden rounded-xl">
            <img
              src={image}
              alt="Food preview"
              className="nombot-preview-thumb"
            />
            {loading && (
              <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-xs flex flex-col items-center justify-center gap-2 text-emerald-400 font-bold text-xs">
                <div className="w-8 h-8 border-3 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                <span>Analyzing freshness...</span>
              </div>
            )}
          </div>

          {/* File Name (single line with ellipsis) */}
          <p className="nombot-preview-filename" title={fileName}>
            {fileName || "Selected food item"}
          </p>

          {/* Replace and Remove buttons: equal 44px height, 12px gap */}
          <div className="nombot-preview-actions">
            <button
              type="button"
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
              className="nombot-btn nombot-btn-secondary"
            >
              <FaRedo className="text-xs" /> Replace
            </button>
            <button
              type="button"
              onClick={onRemoveImage}
              className="nombot-btn nombot-btn-danger"
            >
              <FaTimes className="text-xs" /> Remove
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
