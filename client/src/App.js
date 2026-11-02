<<<<<<< HEAD
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
=======
import React, { useState, useEffect } from "react";
import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

import FarmerChatList from "./components/farmer/FarmerChatList";
import AddFood from "./components/AddFood";
import FoodList from "./components/FoodList";
import LoginPage from "./components/auth/LoginPage";
import RegisterPage from "./components/auth/RegisterPage";
import OAuthHandler from "./components/auth/OAuthHandler";
import WastageGraph from "./components/WastageGraph";
import ProfilePage from "./components/ProfilePage";
import NavBar from "./components/NavBar";
import FarmerNavBar from "./components/farmer/FarmerNavBar";
import TipBanner from "./components/TipBanner";
import { useAuth } from "./contexts/AuthContext";
import DonatePage from "./components/DonatePage";
import ChatPage from "./components/ChatPage";
import FarmerHome from "./components/farmer/FarmerHome";
import FarmerSetup from "./components/farmer/FarmerSetup";
import IdeaPage from "./components/farmer/IdeaPage";
import FarmerProfile from "./components/farmer/FarmerProfile";
import SelectFoodToDonate from "./components/SelectFoodToDonate";

>>>>>>> 156b6162bb2f37c9290d2a66e6e53785e18771b7
import "./App.css";

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
<<<<<<< HEAD
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
=======
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();

  // === THEME SETUP ===
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") setIsDarkMode(true);
  }, []);

  useEffect(() => {
    const bg = isDarkMode ? "hsl(0, 0%, 10%)" : "hsl(0, 0%, 98%)";
    const text = isDarkMode ? "#f0f0f0" : "#111";

    document.body.style.setProperty("--bg-color", bg);
    document.body.style.setProperty("--text-color", text);
    document.body.style.backgroundColor = bg;
    document.body.style.color = text;

    localStorage.setItem("theme", isDarkMode ? "dark" : "light");

    if (isDarkMode) document.body.classList.add("dark");
    else document.body.classList.remove("dark");
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode((prev) => !prev);

  // === HIDE NAVBAR FOR CHAT SCREEN ===
  const hideLayout = location.pathname.startsWith("/chat");

  // === AUTO SAVE LOCATION AFTER LOGIN ===
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (isAuthenticated && token) {
      if (sessionStorage.getItem("locationUpdated") === "true") return;

      let userId;
      try {
        userId = jwtDecode(token).userId;
      } catch {
        return;
      }

      if (!userId) return;

      sessionStorage.setItem("locationUpdated", "true");

      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const coords = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };

          try {
            await axios.post("http://localhost:5000/api/save-location", {
              userId,
              coords,
            });
            console.log("Location saved:", coords);
          } catch (err) {
            console.error("Location save failed:", err);
          }
        },
        () => { },
        { enableHighAccuracy: false, timeout: 5000, maximumAge: 10000 }
      );
    }
  }, [isAuthenticated]);

  // === USER ROLE ===
  const userRole = user?.role || localStorage.getItem("userRole") || "user";

  return (
    <div className="App">
      {/* NAVBAR (HIDDEN ON CHAT PAGE) */}
      {!hideLayout && (
        <>
          {userRole === "farmer" ? (
            <FarmerNavBar logout={logout} />
          ) : (
            <NavBar />
          )}

          {/* Theme Toggle */}
>>>>>>> 156b6162bb2f37c9290d2a66e6e53785e18771b7
          <div className="theme-toggle-container">
            <label className="switch">
              <input
                type="checkbox"
                checked={isDarkMode}
<<<<<<< HEAD
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
          <Route path="/chat/:farmerId" element={<ChatPage />} />
          <Route path="*" element={isAuthenticated ? <Navigate to="/home" replace /> : <Navigate to="/" replace />} />
        </Routes>
      </div>

      {!hideLayout && isAuthenticated && userRole === "user" && <TipBanner />}
=======
                onChange={toggleTheme}
              />
              <span className="slider round"></span>
            </label>
            <span>{isDarkMode ? "🌙 Dark Mode" : "🌞 Light Mode"}</span>
          </div>
        </>
      )}

      {/* BG IMAGE */}
      {!hideLayout && (
        <div className="main-bg" style={{ position: "absolute", inset: 0 }} />
      )}

      <div
        className={`content-wrapper ${hideLayout ? "h-screen w-full p-0" : "relative z-10"
          }`}
      >
        <Routes>
          {/* LOGIN & REGISTER */}
          <Route
            path="/"
            element={
              isAuthenticated
                ? userRole === "farmer"
                  ? <Navigate to="/farmer/dashboard" />
                  : <Navigate to="/home" />
                : <LoginPage />
            }
          />

          <Route path="/donate/select-food" element={<SelectFoodToDonate />} />

          <Route
            path="/register"
            element={
              isAuthenticated ? <Navigate to="/home" /> : <RegisterPage />
            }
          />
          <Route path="/auth/google/callback" element={<OAuthHandler />} />

          {/* NORMAL USER ROUTES */}
          <Route
            path="/home"
            element={isAuthenticated ? <AddFood /> : <Navigate to="/" />}
          />
          <Route
            path="/inventory"
            element={isAuthenticated ? <FoodList /> : <Navigate to="/" />}
          />
          <Route
            path="/wastage"
            element={isAuthenticated ? <WastageGraph /> : <Navigate to="/" />}
          />
          <Route
            path="/donate"
            element={isAuthenticated ? <DonatePage /> : <Navigate to="/" />}
          />
          <Route
            path="/profile"
            element={isAuthenticated ? <ProfilePage /> : <Navigate to="/" />}
          />

          {/* FARMER ROUTES */}
          <Route
            path="/farmer/dashboard"
            element={
              isAuthenticated ? <FarmerHome /> : <Navigate to="/" />
            }
          />

          <Route
            path="/farmer-profile"
            element={
              isAuthenticated ? <FarmerProfile /> : <Navigate to="/" />
            }
          />

          <Route
            path="/farmer/ideas"
            element={isAuthenticated ? <IdeaPage /> : <Navigate to="/" />}
          />

          <Route
            path="/farmer-setup"
            element={
              isAuthenticated ? <FarmerSetup /> : <Navigate to="/" />
            }
          />

          {/* CHAT ROUTES */}
          <Route path="/farmer/messages" element={<FarmerChatList />} />

          {/* Chat window MUST have a recipientId */}
          <Route path="/chat/:recipientId" element={<ChatPage />} />

          {/* DEFAULT REDIRECT */}
          <Route
            path="*"
            element={
              isAuthenticated
                ? userRole === "farmer"
                  ? <Navigate to="/farmer/dashboard" />
                  : <Navigate to="/home" />
                : <Navigate to="/" />
            }
          />

        </Routes>
      </div>

      {/* TIP BANNER FOR NORMAL USERS */}
      {!hideLayout && isAuthenticated && userRole === "user" && (
        <TipBanner />
      )}
>>>>>>> 156b6162bb2f37c9290d2a66e6e53785e18771b7
    </div>
  );
}

<<<<<<< HEAD
export default App;
=======
export default App;
>>>>>>> 156b6162bb2f37c9290d2a66e6e53785e18771b7
