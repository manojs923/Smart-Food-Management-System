import React, { useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import axios from "axios";

import AddFood from "./components/AddFood";
import ChatPage from "./components/ChatPage";
import DonatePage from "./components/DonatePage";
import FarmerHome from "./components/farmer/FarmerHome";
import FarmerNavBar from "./components/farmer/FarmerNavBar";
import FarmerSetup from "./components/farmer/FarmerSetup";
import FarmerMessages from "./components/farmer/FarmerMessages";
import FarmerProfile from "./components/farmer/FarmerProfile";
import FoodList from "./components/FoodList";
import IdeaPage from "./components/farmer/IdeaPage";
import LoginPage from "./components/auth/LoginPage";
import NavBar from "./components/NavBar";
import OAuthHandler from "./components/auth/OAuthHandler";
import ProfilePage from "./components/ProfilePage";
import RegisterPage from "./components/auth/RegisterPage";
import TipBanner from "./components/TipBanner";
import WastageGraph from "./components/WastageGraph";
import AudioControls from "./components/nombot/AudioControls";
import RoleRoute, { normalizeRole, getStoredUserRole } from "./components/auth/RoleRoute";
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
    const backgroundColor = isDarkMode ? "#0b1120" : "#f4f6f8";
    const textColor = isDarkMode ? "#f8fafc" : "#0f172a";

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
          await axios.post("/api/save-location", {
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

  // Determine normalized role reliably
  const currentRole = normalizeRole(user?.role || getStoredUserRole());
  const isFarmer = currentRole === "farmer";
  const defaultDashboard = isFarmer ? "/farmer/dashboard" : "/home";
  const hideLayout = location.pathname.startsWith("/chat");

  return (
    <div className="App">
      {!hideLayout && isAuthenticated && (
        <>
          {isFarmer ? <FarmerNavBar logout={logout} /> : <NavBar />}
          <div className="theme-toggle-container">
            {/* Audio Controls strictly donor-only (Nom-Bot Food Guardian) */}
            {!isFarmer && <AudioControls />}
            <label className="switch" aria-label="Toggle dark/light mode">
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
          {/* Public / Auth Routes */}
          <Route
            path="/"
            element={isAuthenticated ? <Navigate to={defaultDashboard} replace /> : <LoginPage />}
          />
          <Route
            path="/register"
            element={isAuthenticated ? <Navigate to={defaultDashboard} replace /> : <RegisterPage />}
          />
          <Route path="/auth/google/callback" element={<OAuthHandler />} />

          {/* Donor-Only Routes (Protected with RoleRoute) */}
          <Route
            path="/home"
            element={
              <RoleRoute allowedRoles={["donor"]}>
                <AddFood />
              </RoleRoute>
            }
          />
          <Route
            path="/inventory"
            element={
              <RoleRoute allowedRoles={["donor"]}>
                <FoodList />
              </RoleRoute>
            }
          />
          <Route
            path="/wastage"
            element={
              <RoleRoute allowedRoles={["donor"]}>
                <WastageGraph />
              </RoleRoute>
            }
          />
          <Route
            path="/donate"
            element={
              <RoleRoute allowedRoles={["donor"]}>
                <DonatePage />
              </RoleRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <RoleRoute allowedRoles={["donor"]}>
                <ProfilePage />
              </RoleRoute>
            }
          />

          {/* Farmer-Only Routes (Protected with RoleRoute) */}
          <Route
            path="/farmer/dashboard"
            element={
              <RoleRoute allowedRoles={["farmer"]}>
                <FarmerHome />
              </RoleRoute>
            }
          />
          <Route
            path="/farmer/my-farm"
            element={
              <RoleRoute allowedRoles={["farmer"]}>
                <FarmerSetup />
              </RoleRoute>
            }
          />
          <Route
            path="/farmer/farm-info"
            element={<Navigate to="/farmer/my-farm" replace />}
          />
          <Route
            path="/farmer-setup"
            element={<Navigate to="/farmer/my-farm" replace />}
          />
          <Route
            path="/farmer/ideas"
            element={
              <RoleRoute allowedRoles={["farmer"]}>
                <IdeaPage />
              </RoleRoute>
            }
          />
          <Route
            path="/farmer/messages"
            element={
              <RoleRoute allowedRoles={["farmer"]}>
                <FarmerMessages />
              </RoleRoute>
            }
          />
          <Route
            path="/farmer/profile"
            element={
              <RoleRoute allowedRoles={["farmer"]}>
                <FarmerProfile />
              </RoleRoute>
            }
          />
          <Route
            path="/farmer-profile"
            element={<Navigate to="/farmer/profile" replace />}
          />

          {/* Chat Route */}
          <Route
            path="/chat/:recipientId"
            element={isAuthenticated ? <ChatPage /> : <Navigate to="/" replace />}
          />

          {/* Catch-all route: NEVER render Nom-Bot. Redirect to role dashboard or login */}
          <Route
            path="*"
            element={isAuthenticated ? <Navigate to={defaultDashboard} replace /> : <Navigate to="/" replace />}
          />
        </Routes>
      </div>

      {!hideLayout && isAuthenticated && !isFarmer && <TipBanner />}
    </div>
  );
}

export default App;
