// client/src/components/AddFood.js
// Upgraded Nom-Bot Interactive Food Experience

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import NomBot from "./nombot/NomBot";
import FoodUpload from "./nombot/FoodUpload";
import FreshnessReport from "./nombot/FreshnessReport";
import AudioControls from "./nombot/AudioControls";
import ConfettiEffect from "./nombot/ConfettiEffect";
import { useAudioManager } from "./nombot/useAudioManager";
import "./AddFood.css";

function AddFood() {
  const [image, setImage] = useState(null);
  const [fileName, setFileName] = useState("");
  const [foodData, setFoodData] = useState(null);
  const [storageMode, setStorageMode] = useState("refrigerated");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [botState, setBotState] = useState("idle");
  const [customBotMessage, setCustomBotMessage] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);

  const navigate = useNavigate();
  const { playSfx } = useAudioManager();
  const hasWelcomedRef = useRef(false);

  // Play welcome sound when user opens food upload page
  useEffect(() => {
    if (!hasWelcomedRef.current) {
      hasWelcomedRef.current = true;
      // Small timeout to allow user interaction context
      const timer = setTimeout(() => {
        playSfx("welcome");
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [playSfx]);

  // Handle Image Selection & Upload
  const handleImageSelected = async (file) => {
    if (!file) return;

    setFileName(file.name);
    setImage(URL.createObjectURL(file));
    setFoodData(null);
    setShowConfetti(false);
    setCustomBotMessage("");

    // State 2: Mascot excitement
    setBotState("upload");
    playSfx("upload-pop");

    // Prepare FormData for backend
    const formData = new FormData();
    formData.append("image", file);

    try {
      // Transition to State 3: Analyzing
      setTimeout(() => {
        setBotState("analyzing");
        playSfx("scanning");
      }, 500);

      setLoading(true);

      const processingTimer = setTimeout(() => {
        playSfx("processing");
      }, 1500);

      const res = await axios.post("/ai/analyze", formData);
      clearTimeout(processingTimer);

      const result = res.data.data;
      setFoodData(result);

      // Map backend freshness_score / freshness_status to Nom-Bot States
      const score = result.freshness_score || 0;
      if (score >= 80) {
        setBotState("fresh");
        setShowConfetti(true);
        playSfx("success");
      } else if (score >= 50) {
        setBotState("moderate");
        playSfx("warning");
      } else if (score >= 20) {
        setBotState("nearly_expired");
        playSfx("warning");
      } else {
        setBotState("spoiled");
        playSfx("spoiled");
      }
    } catch (err) {
      console.error("❌ Error scanning image:", err);
      playSfx("error");
      setBotState("idle");
      setCustomBotMessage("The AI assistant is busy right now. Please try again in a moment.");
    } finally {
      setLoading(false);
    }
  };

  // Quick Feed Sample Button Handler
  const handleQuickSample = (fruitName) => {
    playSfx("upload-pop");
    setBotState("upload");

    const sampleImages = {
      Mango: "https://images.unsplash.com/photo-1553279768-865429fa0078?w=500",
      Banana: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=500",
      Apple: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500",
      Broccoli: "https://images.unsplash.com/photo-1584270354949-c26b0d5b4a0c?w=500",
    };

    const sampleImg = sampleImages[fruitName] || sampleImages.Apple;
    setImage(sampleImg);
    setFileName(`${fruitName}_Sample.jpg`);
    setLoading(true);

    setTimeout(() => {
      setBotState("analyzing");
      playSfx("scanning");
    }, 600);

    // Realistic food inspection sample for instant preview
    setTimeout(() => {
      setLoading(false);
      const sampleData = {
        food_item: fruitName,
        category: fruitName === "Broccoli" ? "Vegetable" : "Fruit",
        freshness_score: fruitName === "Banana" ? 65 : 94,
        freshness_status: fruitName === "Banana" ? "Use Soon" : "Fresh",
        shelf_life_refrigerated_days: fruitName === "Broccoli" ? 6 : fruitName === "Banana" ? 3 : 7,
        shelf_life_room_temp_days: fruitName === "Banana" ? 2 : 4,
        recommended_storage_temp_celsius: fruitName === "Banana" ? "13°C - 15°C" : "4°C",
        visible_spoilage_signs: fruitName === "Banana" ? ["Minor brown spotting on peel"] : [],
        estimated_quantity: "1 unit",
        confidence: 96,
        best_before_refrigerated: new Date(Date.now() + 6 * 86400000).toISOString().slice(0, 10),
        best_before_room_temp: new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10),
      };

      setFoodData(sampleData);

      if (sampleData.freshness_score >= 80) {
        setBotState("fresh");
        setShowConfetti(true);
        playSfx("success");
      } else {
        setBotState("moderate");
        playSfx("warning");
      }
    }, 2000);
  };

  // Save to Inventory
  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return alert("Please log in first.");

      if (!foodData) {
        return alert("No food data to save. Please scan an image first.");
      }

      setSaving(true);
      const payload = {
        name: foodData.food_item || "Unknown Food",
        category: foodData.category || "Other",
        shelfLife:
          storageMode === "refrigerated"
            ? foodData.shelf_life_refrigerated_days
            : foodData.shelf_life_room_temp_days,
        mDate: new Date().toISOString().slice(0, 10),
      };

      await axios.post("/food/add", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      // State 8: Inventory Success
      setBotState("inventory_success");
      setShowConfetti(true);
      playSfx("inventory-added");

      setTimeout(() => {
        navigate("/inventory");
      }, 1500);
    } catch (err) {
      console.error("❌ Error saving food:", err);
      playSfx("error");
      setCustomBotMessage("Unable to save food right now. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Reset / Cancel
  const handleCancel = () => {
    setImage(null);
    setFileName("");
    setFoodData(null);
    setStorageMode("refrigerated");
    setLoading(false);
    setShowConfetti(false);
    setBotState("idle");
    setCustomBotMessage("");
    playSfx("upload-pop");
  };

  return (
    <div className="nombot-page-wrapper min-h-screen py-8 px-4 sm:px-6 relative overflow-hidden text-slate-100 flex flex-col items-center">
      
      {/* Celebration Confetti */}
      <ConfettiEffect active={showConfetti} />

      {/* Top Header Bar with Audio Controls */}
      <div className="w-full max-w-4xl flex items-center justify-between mb-2 px-2">
        <div className="flex items-center gap-3">
          <span className="text-3xl animate-bounce">🥗</span>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
              Nom-Bot <span className="text-xs uppercase px-2.5 py-0.5 rounded-full bg-lime-400 text-slate-950 font-black">Food Guardian</span>
            </h1>
            <p className="text-xs text-emerald-300/80 font-medium hidden sm:block">
              Interactive Bio-Scan & Food Waste Prevention Companion
            </p>
          </div>
        </div>

        {/* Audio Settings Panel */}
        <AudioControls />
      </div>

      {/* Mascot Section */}
      <div className="w-full max-w-4xl">
        <NomBot state={botState} customMessage={customBotMessage} foodImage={image} />
      </div>

      {/* Upload Zone (Visible if no food analyzed yet) */}
      {!foodData && (
        <FoodUpload
          image={image}
          fileName={fileName}
          onImageSelected={handleImageSelected}
          onRemoveImage={handleCancel}
          onQuickSampleSelect={handleQuickSample}
          loading={loading}
          onDragStateChange={(isDragging) => {
            if (isDragging && botState === "idle") {
              setBotState("upload");
              playSfx("upload-pop");
            } else if (!isDragging && botState === "upload" && !image) {
              setBotState("idle");
            }
          }}
        />
      )}

      {/* Freshness Analysis Report */}
      {foodData && (
        <FreshnessReport
          foodData={foodData}
          storageMode={storageMode}
          setStorageMode={setStorageMode}
          onSave={handleSave}
          onCancel={handleCancel}
          onDonate={() => navigate("/donate", { state: { foodData } })}
          saving={saving}
        />
      )}
    </div>
  );
}

export default AddFood;
