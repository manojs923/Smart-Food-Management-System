import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
<<<<<<< HEAD
=======
import {
  FaUser,
  FaSeedling,
  FaLeaf,
  FaClipboardList,
  FaGlobeAsia,
  FaEdit,
  FaMapMarkerAlt,
} from "react-icons/fa";

import "./FarmerSetup.css";
>>>>>>> 156b6162bb2f37c9290d2a66e6e53785e18771b7

function FarmerSetup() {
  const [formData, setFormData] = useState({
    fullName: "",
    farmingType: "",
    crops: "",
    farmSize: "",
    country: "India",
    state: "",
    district: "",
  });

  const navigate = useNavigate();
  const location = useLocation();

  const isEditMode = location.search.includes("edit=true");

<<<<<<< HEAD
  // ✅ Fetch saved data if editing profile
=======
>>>>>>> 156b6162bb2f37c9290d2a66e6e53785e18771b7
  useEffect(() => {
    const fetchProfile = async () => {
      if (!isEditMode) return;

      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await axios.get("http://localhost:5000/api/farmer/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setFormData(res.data);
      } catch (err) {
<<<<<<< HEAD
        console.error("❌ Failed to load existing profile:", err);
=======
        console.error("❌ Failed to load profile:", err);
>>>>>>> 156b6162bb2f37c9290d2a66e6e53785e18771b7
      }
    };

    fetchProfile();
  }, [isEditMode]);

<<<<<<< HEAD
  // Handle form fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Save or update profile
=======
  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

>>>>>>> 156b6162bb2f37c9290d2a66e6e53785e18771b7
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      if (!token) return alert("Please log in first.");

      await axios.post("http://localhost:5000/api/farmer/setup", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

<<<<<<< HEAD
      alert("✅ Profile saved successfully!");
=======
      alert("Profile saved successfully!");
>>>>>>> 156b6162bb2f37c9290d2a66e6e53785e18771b7
      navigate("/farmer-profile");
    } catch (err) {
      console.error("❌ Error saving profile:", err);
      alert("Failed to save. Try again.");
    }
  };

  return (
<<<<<<< HEAD
    <div className="min-h-screen flex items-center justify-center bg-green-50 p-6">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-lg"
      >
        <h2 className="text-2xl font-bold text-green-700 mb-6 text-center">
          {isEditMode ? "✏️ Edit Farmer Profile" : "👨‍🌾 Farmer Profile Setup"}
        </h2>

        {/* Full Name */}
        <label className="block mb-3">
          <span className="text-gray-700">Full Name</span>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded mt-1"
            placeholder="Enter your full name"
          />
        </label>

        {/* Farming Type */}
        <label className="block mb-3">
          <span className="text-gray-700">Farming Type</span>
          <select
            name="farmingType"
            value={formData.farmingType}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded mt-1"
          >
            <option value="">Select type</option>
            <option value="Vegetable Farming">Vegetable Farming</option>
            <option value="Fruit Farming">Fruit Farming</option>
            <option value="Mixed Farming">Mixed Farming</option>
            <option value="Dairy Farming">Dairy Farming</option>
            <option value="Organic Farming">Organic Farming</option>
          </select>
        </label>

        {/* Crops */}
        <label className="block mb-3">
          <span className="text-gray-700">Crops You Grow</span>
          <input
            type="text"
            name="crops"
            value={formData.crops}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded mt-1"
            placeholder="e.g., Tomato, Onion, Rice"
          />
        </label>

        {/* Farm Size */}
        <label className="block mb-3">
          <span className="text-gray-700">Farm Size (acres)</span>
          <input
            type="number"
            name="farmSize"
            value={formData.farmSize}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded mt-1"
          />
        </label>

        {/* Location */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <label>
            <span className="text-gray-700">State</span>
=======
    <div className="setup-wrapper">
      <form className="setup-card" onSubmit={handleSubmit}>
        
        <div className="setup-header">
          <FaLeaf className="setup-header-icon" />
          <h2>
            {isEditMode ? "Edit Farmer Profile" : "Farmer Profile Setup"}
          </h2>
        </div>

        <div className="setup-grid">

          {/* Full Name */}
          <div className="setup-field">
            <label><FaUser className="field-icon" /> Full Name</label>
            <input
              type="text"
              name="fullName"
              placeholder="Enter your full name"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
          </div>

          {/* Farming Type */}
          <div className="setup-field">
            <label><FaSeedling className="field-icon" /> Farming Type</label>
            <select
              name="farmingType"
              value={formData.farmingType}
              onChange={handleChange}
              required
            >
              <option value="">Select Type</option>
              <option value="Vegetable Farming">Vegetable Farming</option>
              <option value="Fruit Farming">Fruit Farming</option>
              <option value="Mixed Farming">Mixed Farming</option>
              <option value="Dairy Farming">Dairy Farming</option>
              <option value="Organic Farming">Organic Farming</option>
            </select>
          </div>

          {/* Crops */}
          <div className="setup-field">
            <label><FaClipboardList className="field-icon" /> Crops</label>
            <input
              type="text"
              name="crops"
              placeholder="e.g. Tomato, Onion, Rice"
              value={formData.crops}
              onChange={handleChange}
              required
            />
          </div>

          {/* Farm Size */}
          <div className="setup-field">
            <label><FaLeaf className="field-icon" /> Farm Size (acres)</label>
            <input
              type="number"
              name="farmSize"
              value={formData.farmSize}
              onChange={handleChange}
              required
            />
          </div>

          {/* State */}
          <div className="setup-field">
            <label><FaMapMarkerAlt className="field-icon" /> State</label>
>>>>>>> 156b6162bb2f37c9290d2a66e6e53785e18771b7
            <select
              name="state"
              value={formData.state}
              onChange={handleChange}
              required
<<<<<<< HEAD
              className="w-full border p-2 rounded mt-1"
=======
>>>>>>> 156b6162bb2f37c9290d2a66e6e53785e18771b7
            >
              <option value="">Select State</option>
              <option value="Karnataka">Karnataka</option>
              <option value="Maharashtra">Maharashtra</option>
              <option value="Kerala">Kerala</option>
              <option value="Tamil Nadu">Tamil Nadu</option>
            </select>
<<<<<<< HEAD
          </label>

          <label>
            <span className="text-gray-700">District</span>
            <input
              type="text"
              name="district"
              value={formData.district}
              onChange={handleChange}
              required
              className="w-full border p-2 rounded mt-1"
            />
          </label>
        </div>

        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
        >
          {isEditMode ? "Save Changes" : "Save Profile"}
        </button>
=======
          </div>

          {/* District */}
          <div className="setup-field">
            <label><FaMapMarkerAlt className="field-icon" /> District</label>
            <input
              type="text"
              name="district"
              placeholder="Enter district"
              value={formData.district}
              onChange={handleChange}
              required
            />
          </div>

        </div>

        <button type="submit" className="setup-submit-button">
          {isEditMode ? <FaEdit /> : "Save Profile"}  
          {isEditMode ? " Save Changes" : ""}
        </button>

>>>>>>> 156b6162bb2f37c9290d2a66e6e53785e18771b7
      </form>
    </div>
  );
}

export default FarmerSetup;