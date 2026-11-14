import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { FaSave, FaSpinner } from "react-icons/fa";
import "./FarmerSetup.css";

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
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  const navigate = useNavigate();
  const location = useLocation();
  const isEditMode = location.search.includes("edit=true");

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await axios.get("/api/farmer/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data) {
          setFormData((prev) => ({
            ...prev,
            ...res.data,
            country: res.data.country || "India",
          }));
        }
      } catch (err) {
        console.warn("No existing profile found or error fetching profile:", err);
      }
    };

    fetchProfile();
  }, [isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (feedback.message) setFeedback({ type: "", message: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFeedback({ type: "", message: "" });

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setFeedback({ type: "error", message: "Please log in first to save your profile." });
        setLoading(false);
        return;
      }

      await axios.post("/api/farmer/setup", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setFeedback({ type: "success", message: "Profile saved successfully! Redirecting..." });
      setTimeout(() => {
        navigate("/farmer/profile");
      }, 700);
    } catch (err) {
      console.error("Error saving farmer profile:", err);
      setFeedback({ type: "error", message: "Failed to save profile. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="farmer-page-container">
      <div className="farmer-page-card farmer-setup-card">
        {/* Centered Page Title with Short Accent Underline */}
        <h2 className="page-title">
          {isEditMode ? "Edit Farm Profile" : "My Farm Setup"}
        </h2>

        {/* Inline Feedback Banner */}
        {feedback.message && (
          <div
            className={`farmer-inline-alert ${feedback.type === "success" ? "success" : ""}`}
            role="alert"
          >
            <span>{feedback.type === "success" ? "✓" : "⚠️"} {feedback.message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="farmer-setup-form">
          {/* Two-Column Grid on Desktop, Single-Column on Mobile */}
          <div className="farmer-setup-grid">
            {/* Full Name */}
            <div className="farmer-form-group">
              <label htmlFor="fullName" className="farmer-form-label">
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                className="farmer-form-input"
                placeholder="Enter your full name"
              />
            </div>

            {/* Farming Type */}
            <div className="farmer-form-group">
              <label htmlFor="farmingType" className="farmer-form-label">
                Farming Type
              </label>
              <select
                id="farmingType"
                name="farmingType"
                value={formData.farmingType}
                onChange={handleChange}
                required
                className="farmer-form-select"
              >
                <option value="">Select farming type</option>
                <option value="Vegetable Farming">Vegetable Farming</option>
                <option value="Fruit Farming">Fruit Farming</option>
                <option value="Mixed Farming">Mixed Farming</option>
                <option value="Dairy Farming">Dairy Farming</option>
                <option value="Organic Farming">Organic Farming</option>
              </select>
            </div>

            {/* Crops */}
            <div className="farmer-form-group">
              <label htmlFor="crops" className="farmer-form-label">
                Crops You Grow
              </label>
              <input
                id="crops"
                type="text"
                name="crops"
                value={formData.crops}
                onChange={handleChange}
                required
                className="farmer-form-input"
                placeholder="e.g., Tomato, Onion, Rice"
              />
            </div>

            {/* Farm Size */}
            <div className="farmer-form-group">
              <label htmlFor="farmSize" className="farmer-form-label">
                Farm Size (acres)
              </label>
              <input
                id="farmSize"
                type="number"
                step="0.1"
                name="farmSize"
                value={formData.farmSize}
                onChange={handleChange}
                required
                className="farmer-form-input"
                placeholder="e.g., 5"
              />
            </div>

            {/* State */}
            <div className="farmer-form-group">
              <label htmlFor="state" className="farmer-form-label">
                State
              </label>
              <select
                id="state"
                name="state"
                value={formData.state}
                onChange={handleChange}
                required
                className="farmer-form-select"
              >
                <option value="">Select State</option>
                <option value="Karnataka">Karnataka</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Kerala">Kerala</option>
                <option value="Tamil Nadu">Tamil Nadu</option>
                <option value="Andhra Pradesh">Andhra Pradesh</option>
                <option value="Telangana">Telangana</option>
                <option value="Punjab">Punjab</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* District */}
            <div className="farmer-form-group">
              <label htmlFor="district" className="farmer-form-label">
                District
              </label>
              <input
                id="district"
                type="text"
                name="district"
                value={formData.district}
                onChange={handleChange}
                required
                className="farmer-form-input"
                placeholder="Enter district"
              />
            </div>
          </div>

          {/* Right-Aligned Save Button on Desktop, Full Width on Mobile */}
          <div className="farmer-setup-action-row">
            <button
              type="submit"
              disabled={loading}
              className="farmer-btn farmer-btn-primary farmer-setup-save-btn"
            >
              {loading ? (
                <>
                  <FaSpinner className="farmer-btn-spinner" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <FaSave className="farmer-btn-icon" />
                  <span>{isEditMode ? "Save Changes" : "Save Profile"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default FarmerSetup;
