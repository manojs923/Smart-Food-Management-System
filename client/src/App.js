import React, { useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import axios from "axios";

import AddFood from "./components/AddFood";
import ChatPage from "./components/ChatPage";
import DonatePage from "./components/DonatePage";
import FarmerHome from "./components/farmer/FarmerHome";
import FarmerNavBar from "./components/farmer/FarmerNavBar";
import FarmerSetup from "./components/farmer/FarmerSetup";
import FoodList from "./components/FoodList";
import IdeaPage from "./components/farmer/IdeaPage";
import LoginPage from "./components/auth/LoginPage";
import NavBar from "./components/NavBar";
import OAuthHandler from "./components/auth/OAuthHandler";
import ProfilePage from "./components/ProfilePage";
import RegisterPage from "./components/auth/RegisterPage";
import TipBanner from "./components/TipBanner";
import WastageGraph from "./components/WastageGraph";
import { useAuth } from "./contexts/AuthContext";
import "./App.css";

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();

  useEffect(() => {
    setIsDarkMode(localStorage.getItem("theme") === "dark");
  }, []);

  useEffect(() => {
    const backgroundColor = isDarkMode ? "hsl(0, 0%, 10%)" : "hsl(0, 0%, 98%)";
    const textColor = isDarkMode ? "#f0f0f0" : "#111";

    document.body.style.setProperty("--bg-color", backgroundColor);
    document.body.style.setProperty("--text-color", textColor);
    document.body.style.backgroundColor = backgroundColor;
    document.body.style.color = textColor;
    document.body.classList.toggle("dark", isDarkMode);
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    if (!isAuthenticated || !token || !userId || sessionStorage.getItem("locationUpdated") === "true") {
      return;
    }

    sessionStorage.setItem("locationUpdated", "true");
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          await axios.post("http://localhost:5000/api/save-location", {
            userId,
            coords: { lat: coords.latitude, lng: coords.longitude },
          });
        } catch (error) {
          console.error("Failed to auto-save location:", error);
        }
      },
      (error) => console.warn("Location unavailable:", error.message),
      { enableHighAccuracy: false, timeout: 5000, maximumAge: 10000 }
    );
  }, [isAuthenticated]);

  const userRole = user?.role || localStorage.getItem("userRole") || "user";
  const hideLayout = location.pathname.startsWith("/chat");

  return (
    <div className="App">
      {!hideLayout && isAuthenticated && (
        <>
          {userRole === "farmer" ? <FarmerNavBar logout={logout} /> : <NavBar />}
          <div className="theme-toggle-container">
            <label className="switch">
              <input
                type="checkbox"
                checked={isDarkMode}
                onChange={() => setIsDarkMode((current) => !current)}
              />
              <span className="slider round" />
            </label>
            <span>{isDarkMode ? "🌙 Dark Mode" : "🌞 Light Mode"}</span>
          </div>
          <div className="main-bg" />
        </>
      )}

      <div className={`content-wrapper ${hideLayout ? "chat-content-wrapper" : "relative z-10"}`}>
        <Routes>
          <Route path="/" element={isAuthenticated ? <Navigate to="/home" replace /> : <LoginPage />} />
          <Route path="/register" element={isAuthenticated ? <Navigate to="/home" replace /> : <RegisterPage />} />
          <Route path="/auth/google/callback" element={<OAuthHandler />} />
          <Route path="/home" element={isAuthenticated ? <AddFood /> : <Navigate to="/" replace />} />
          <Route path="/inventory" element={isAuthenticated ? <FoodList /> : <Navigate to="/" replace />} />
          <Route path="/wastage" element={isAuthenticated ? <WastageGraph /> : <Navigate to="/" replace />} />
          <Route path="/donate" element={isAuthenticated ? <DonatePage /> : <Navigate to="/" replace />} />
          <Route path="/profile" element={isAuthenticated ? <ProfilePage /> : <Navigate to="/" replace />} />
          <Route path="/farmer/dashboard" element={isAuthenticated ? <FarmerHome /> : <Navigate to="/" replace />} />
          <Route path="/farmer/farm-info" element={isAuthenticated ? <FarmerSetup /> : <Navigate to="/" replace />} />
          <Route path="/farmer/ideas" element={isAuthenticated ? <IdeaPage /> : <Navigate to="/" replace />} />
          <Route path="/chat/:recipientId" element={<ChatPage />} />
          <Route path="*" element={isAuthenticated ? <Navigate to="/home" replace /> : <Navigate to="/" replace />} />
        </Routes>
      </div>

      {!hideLayout && isAuthenticated && userRole === "user" && <TipBanner />}
    </div>
  );
}

export default App;
