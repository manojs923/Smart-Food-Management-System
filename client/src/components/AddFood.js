// client/src/components/AddFood.js
// Nom-Bot Food Guardian Interactive Page with Central Sound Manager

import React, { useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import NomBot from "./nombot/NomBot";
import FoodUpload from "./nombot/FoodUpload";
import FreshnessReport from "./nombot/FreshnessReport";
import ConfettiEffect from "./nombot/ConfettiEffect";
import { useSound } from "./nombot/useSound";
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
  const { play, startLoop, stopLoop } = useSound();
  const scanLoopActiveRef = useRef(false);

  // Soft tick on button clicks across the Nom-Bot page
  const handleContainerClick = (e) => {
    const btn = e.target.closest("button");
    if (btn) {
      play("click");
    }
  };

  // Handle Image Selection & Upload
  const handleImageSelected = async (file) => {
    if (!file) return;

    setFileName(file.name);
    setImage(URL.createObjectURL(file));
    setFoodData(null);
    setShowConfetti(false);
    setCustomBotMessage("");

    // State 2: Mascot excitement + Upload sound effect (pop)
    setBotState("upload");
    play("upload");

    // Prepare FormData for backend
    const formData = new FormData();
    formData.append("image", file);

    try {
      // Transition to State 3: Analyzing + Scanning hum loop
      setBotState("analyzing");
      startLoop("scanStart");
      scanLoopActiveRef.current = true;
      setLoading(true);

      const res = await axios.post("/ai/analyze", formData);

      // Stop scanning hum loop once analysis finishes
      stopLoop("scanStart");
      scanLoopActiveRef.current = false;

      const result = res.data.data;
      setFoodData(result);

      // Map backend freshness status & score to Nom-Bot states and sounds
      const score = result.freshness_score || 0;
      const status = (result.freshness_status || "").toLowerCase();

      if (status.includes("fresh") || score >= 80) {
        setBotState("fresh");
        setShowConfetti(true);
        play("resultFresh");
      } else if (status.includes("soon") || status.includes("moderate") || score >= 40) {
        setBotState("moderate");
        play("resultUseSoon");
      } else {
        setBotState(score >= 20 ? "nearly_expired" : "spoiled");
        play("resultExpired");
      }
    } catch (err) {
      console.error("❌ Error scanning image:", err);
      stopLoop("scanStart");
      scanLoopActiveRef.current = false;
      play("error");
      setBotState("idle");
      setCustomBotMessage("The AI assistant is busy right now. Please try again in a moment.");
    } finally {
      stopLoop("scanStart");
      scanLoopActiveRef.current = false;
      setLoading(false);
    }
  };

  // Quick Feed Sample Button Handler
  const handleQuickSample = (fruitName) => {
    // Feed event: short chomp when a sample is fed
    play("feed");
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
      startLoop("scanStart");
      scanLoopActiveRef.current = true;
    }, 400);

    // Realistic food inspection sample for instant preview
    setTimeout(() => {
      stopLoop("scanStart");
      scanLoopActiveRef.current = false;
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
        play("resultFresh");
      } else {
        setBotState("moderate");
        play("resultUseSoon");
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

      // State 8: Inventory Success + Save sound effect (sparkle)
      setBotState("inventory_success");
      setShowConfetti(true);
      play("save");

      setTimeout(() => {
        navigate("/inventory");
      }, 1500);
    } catch (err) {
      console.error("❌ Error saving food:", err);
      play("error");
      setCustomBotMessage("Unable to save food right now. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Reset / Cancel
  const handleCancel = () => {
    stopLoop("scanStart");
    scanLoopActiveRef.current = false;
    setImage(null);
    setFileName("");
    setFoodData(null);
    setStorageMode("refrigerated");
    setLoading(false);
    setShowConfetti(false);
    setBotState("idle");
    setCustomBotMessage("");
    play("click");
  };

  return (
    <div className="nombot-page-wrapper" onClickCapture={handleContainerClick}>
      {/* Celebration Confetti */}
      <ConfettiEffect active={showConfetti} />

      {/* Centered Header: Title and Subtitle (BGM button & sound settings moved to top-right) */}
      <div className="nombot-header">
        <h1 className="nombot-title">Nom-Bot Food Guardian</h1>
        <p className="nombot-subtitle">
          Interactive Bio-Scan & Food Waste Prevention Companion
        </p>
      </div>

      {/* Mascot Section */}
      <div className="w-full flex justify-center">
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
              play("upload");
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
