import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FaUser,
  FaSeedling,
  FaTractor,
  FaRulerCombined,
  FaGlobeAsia,
  FaMapMarkedAlt,
  FaCity,
  FaEdit,
} from "react-icons/fa";
import "./FarmerProfile.css";

function FarmerProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setError("Please log in to view your profile.");
          setLoading(false);
          return;
        }

        const res = await axios.get("/api/farmer/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setProfile(res.data);
      } catch (err) {
        console.error("Error fetching farmer profile:", err);
        setError("Failed to load profile. Please complete your farm profile setup.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const getInitials = (name) => {
    if (!name) return "👨‍🌾";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <div className="farmer-page-container">
        <div className="farmer-page-card text-center py-12">
          <p className="farmer-muted-text">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="farmer-page-container">
        <div className="farmer-page-card text-center py-12">
          <p className="farmer-inline-alert mb-6">{error || "No profile found."}</p>
          <button
            type="button"
            onClick={() => navigate("/farmer/my-farm")}
            className="farmer-btn farmer-btn-primary"
          >
            🌱 Set Up Farm Profile
          </button>
        </div>
      </div>
    );
  }

  const profileFields = [
    { label: "Farming Type", value: profile.farmingType, icon: FaTractor },
    { label: "Primary Crops", value: profile.crops, icon: FaSeedling },
    { label: "Farm Size", value: profile.farmSize ? `${profile.farmSize} acres` : null, icon: FaRulerCombined },
    { label: "Country", value: profile.country, icon: FaGlobeAsia },
    { label: "State", value: profile.state, icon: FaMapMarkedAlt },
    { label: "District", value: profile.district, icon: FaCity },
  ];

  return (
    <div className="farmer-page-container">
      <div className="farmer-page-card">
        {/* Centered Page Title with Short Accent Underline */}
        <h2 className="page-title">Farmer Profile</h2>

        {/* Profile Header Card */}
        <div className="farmer-profile-header-card">
          <div className="farmer-profile-avatar-circle" aria-hidden="true">
            {getInitials(profile.fullName)}
          </div>
          <div className="farmer-profile-header-info">
            <h3 className="farmer-profile-name">{profile.fullName || "Farmer"}</h3>
            <span className="farmer-profile-badge">{profile.farmingType || "Agricultural Farmer"}</span>
          </div>
        </div>

        {/* Details in a Labelled Grid */}
        <div className="farmer-profile-grid">
          {profileFields.map(({ label, value, icon: Icon }) => (
            <div key={label} className="farmer-profile-item">
              <div className="farmer-profile-item-icon">
                <Icon />
              </div>
              <div className="farmer-profile-item-content">
                <span className="farmer-profile-label">{label}</span>
                <span className="farmer-profile-value">{value || "Not provided"}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Aligned Edit/Save Button Row */}
        <div className="farmer-profile-actions">
          <button
            type="button"
            onClick={() => navigate("/farmer/my-farm?edit=true")}
            className="farmer-btn farmer-btn-primary farmer-profile-edit-btn"
            aria-label="Edit Profile"
          >
            <FaEdit className="farmer-btn-icon" />
            <span>Edit Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default FarmerProfile;
