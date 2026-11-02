import React, { useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
<<<<<<< HEAD
=======
import "./AddFood.css";
>>>>>>> 156b6162bb2f37c9290d2a66e6e53785e18771b7

function AddFood() {
  const [image, setImage] = useState(null);
  const [foodData, setFoodData] = useState(null);
<<<<<<< HEAD
  const [storageMode, setStorageMode] = useState("refrigerated");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null); // 👈 Reference to file input
=======
  const [loading, setLoading] = useState(false);
  const [customShelfLife, setCustomShelfLife] = useState("");   // ⭐ NEW
  const fileInputRef = useRef(null);
>>>>>>> 156b6162bb2f37c9290d2a66e6e53785e18771b7
  const navigate = useNavigate();

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

<<<<<<< HEAD
    // Preview image
    setImage(URL.createObjectURL(file));

    // Prepare FormData for backend
=======
    setImage(URL.createObjectURL(file));

>>>>>>> 156b6162bb2f37c9290d2a66e6e53785e18771b7
    const formData = new FormData();
    formData.append("image", file);

    try {
      setLoading(true);
<<<<<<< HEAD
      const res = await axios.post("http://localhost:5000/ai/analyze", formData);

      setFoodData(res.data.data);
    } catch (err) {
      console.error("❌ Error scanning image:", err);
      alert(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Failed to analyze image. Please try again."
      );
=======
      setFoodData(null);

      const res = await axios.post("http://localhost:5000/ai/analyze", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setFoodData(res.data.data);

      // ⭐ Auto-fill detected shelf life into input
      setCustomShelfLife(res.data.data.shelfLife || "");
    } catch (err) {
      console.error("❌ Error scanning image:", err);
      alert("Failed to analyze image. Try again.");
>>>>>>> 156b6162bb2f37c9290d2a66e6e53785e18771b7
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return alert("Please log in first.");

<<<<<<< HEAD
      if (!foodData) {
        return alert("No food data to save. Please scan an image first.");
      }

      const payload = {
        name: foodData.food_item || "Unknown Food",
        category: foodData.category || "Other",
        shelfLife: storageMode === "refrigerated"
          ? foodData.shelf_life_refrigerated_days
          : foodData.shelf_life_room_temp_days,
        mDate: new Date().toISOString().slice(0, 10),
      };

      console.log("📦 Sending payload to backend:", payload);

=======
      const today = new Date();

      const payload = {
        name: foodData.name || "Unknown Food",
        category: foodData.category || "Misc",
        shelfLife: Number(customShelfLife) || foodData.shelfLife || 3,  // ⭐ Use custom input
        mDate: today.toISOString(),
      };

>>>>>>> 156b6162bb2f37c9290d2a66e6e53785e18771b7
      await axios.post("http://localhost:5000/food/add", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

<<<<<<< HEAD
      alert("✅ Food added successfully!");
      navigate("/inventory");
    } catch (err) {
      console.error("❌ Error saving food:", err);
      alert("Error saving food: " + (err.response?.data?.message || err.message));
    }
  };

  // 🧹 Cancel / Reset function
  const handleCancel = () => {
    if (window.confirm("Are you sure you want to remove this item?")) {
      setImage(null);
      setFoodData(null);
      setStorageMode("refrigerated");
      setLoading(false);

      // 👇 Reset file input value so the same file can be reselected
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
=======
      alert("✅ Food added to inventory!");
      navigate("/inventory");
    } catch (err) {
      console.error("❌ Error saving food:", err);
      alert("Error saving food.");
    }
  };

  const handleCancel = () => {
    if (window.confirm("Remove this item?")) {
      setImage(null);
      setFoodData(null);
      setCustomShelfLife("");  // reset
      fileInputRef.current.value = "";
>>>>>>> 156b6162bb2f37c9290d2a66e6e53785e18771b7
    }
  };

  return (
<<<<<<< HEAD
    <div className="add-food-container">
      <h2>Smart Food Scanner 🤖</h2>

      {/* Image upload box */}
      <label className="upload-area">
        <input
          ref={fileInputRef} // 👈 attach the ref
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
          onChange={handleImageUpload}
          hidden
        />
        <div className="upload-box">
          {image ? (
            <img
              src={image}
              alt="preview"
              style={{
                width: "200px",
                borderRadius: "10px",
                marginTop: "10px",
              }}
            />
          ) : (
            <p>📸 Click or upload an image of your food item</p>
=======
    <div className="addfood-wrapper">
      <h2 className="addfood-title">Smart Food Scanner 🤖</h2>

      {/* Upload Box */}
      <label className="upload-area">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          hidden
        />

        <div className="upload-box">
          {image ? (
            <img src={image} alt="preview" className="preview-img" />
          ) : (
            <p className="upload-text">📸 Tap here to upload a food image</p>
>>>>>>> 156b6162bb2f37c9290d2a66e6e53785e18771b7
          )}
        </div>
      </label>

<<<<<<< HEAD
      {loading && <p>Analyzing image... please wait ⏳</p>}

      {/* Display results */}
      {foodData && (
        <div className="food-info-card">
          <h3>{foodData.food_item || "Unknown Food"}</h3>
          <div className="storage-toggle">
            <button
              className={storageMode === "refrigerated" ? "active" : ""}
              onClick={() => setStorageMode("refrigerated")}
            >
              🧊 Refrigerator
            </button>
            <button
              className={storageMode === "roomTemp" ? "active" : ""}
              onClick={() => setStorageMode("roomTemp")}
            >
              🌡️ Room Temp
            </button>
          </div>
          <p>📦 Category: {foodData.category}</p>
          <p>🌡️ Best Stored: {foodData.recommended_storage_temp_celsius}</p>
          <p>
            ⏳ Days Remaining ({storageMode === "refrigerated" ? "Fridge" : "Room Temp"}): {storageMode === "refrigerated"
              ? foodData.shelf_life_refrigerated_days
              : foodData.shelf_life_room_temp_days} days
          </p>
          <p>📅 Best Before: {storageMode === "refrigerated" ? foodData.best_before_refrigerated : foodData.best_before_room_temp}</p>
          <p>🌿 Freshness: {foodData.freshness_score}% ({foodData.freshness_status})</p>
          <p>🔢 Quantity: {foodData.estimated_quantity}</p>
          <p>🎯 Confidence: {foodData.confidence}%</p>
          <p>🔍 {foodData.visible_spoilage_signs.join(", ") || "No visible spoilage signs"}</p>
          {foodData.freshness_status === "Donate Now" && (
            <button className="btn donate-btn" onClick={() => navigate("/donate", { state: { foodData } })}>
              Send to Donate
            </button>
          )}

          <div style={{ display: "flex", gap: "10px" }}>
            <button className="btn add-btn" onClick={handleSave}>
              Save to Inventory
            </button>
            <button
              className="btn cancel-btn"
              style={{
                backgroundColor: "#f44336",
                color: "white",
                border: "none",
              }}
              onClick={handleCancel}
            >
=======
      {/* SCANNING ANIMATION */}
      {loading && (
        <div className="scan-loading">
          <div className="scanner-bar"></div>
          <p>Analyzing your food... 🍽️</p>
        </div>
      )}

      {/* Results Card */}
      {foodData && (
        <div className="result-card fade-in">
          <h3 className="result-title">{foodData.name}</h3>

          <div className="result-info">
            <p>🥫 Category: {foodData.category}</p>
            <p>🧊 Storage: {foodData.storage}</p>

            {/* ⭐ Editable Shelf Life Input */}
            <p>
              ⌛ Shelf Life:{" "}
              <input
                type="number"
                value={customShelfLife}
                onChange={(e) => setCustomShelfLife(e.target.value)}
                style={{
                  width: "80px",
                  padding: "6px",
                  borderRadius: "6px",
                  border: "1px solid #2196f3",
                  marginLeft: "8px",
                }}
              />{" "}
              days
            </p>
          </div>

          <div className="result-buttons">
            <button className="btn save-btn" onClick={handleSave}>
              Save to Inventory
            </button>

            <button className="btn cancel-btn" onClick={handleCancel}>
>>>>>>> 156b6162bb2f37c9290d2a66e6e53785e18771b7
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AddFood;