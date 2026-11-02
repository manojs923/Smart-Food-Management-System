import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaHome,
  FaSeedling,
  FaLightbulb,
  FaEnvelope,
  FaUser,
  FaSignOutAlt,
  FaLeaf,
} from "react-icons/fa";

const FarmerNavBar = ({ logout }) => {
  const location = useLocation();

<<<<<<< HEAD
  const isActive = (path) => location.pathname === path;
=======
  const isActive = (path) => {
    try {
      const current = location?.pathname || "";

      // Special case: Chat should highlight for ANY /chat/:id route
      if (path === "/farmer/messages") {
        return current.startsWith("/farmer/messages") ||
          current.startsWith("/chat/");
      }

      return current.startsWith(path);
    } catch {
      return false;
    }
  };

>>>>>>> 156b6162bb2f37c9290d2a66e6e53785e18771b7
  const getActiveClass = (path) =>
    isActive(path) ? "navbar-item active" : "navbar-item";

  return (
    <nav className="navbar bg-white shadow-md sticky top-0 z-50">
      <div className="navbar-container flex items-center justify-between px-6 py-3">
<<<<<<< HEAD
        {/* ✅ Logo Section */}
        <div className="flex items-center gap-2">
          <FaLeaf className="text-green-600 text-2xl" />
          <Link
            to="/farmer/dashboard"
            className="text-xl font-bold text-green-700 hover:text-green-800 transition"
          >
            GreenNest Farmer
          </Link>
        </div>

        {/* ✅ Menu Section */}
        <div className="navbar-menu flex items-center gap-5">
          <Link to="/farmer/dashboard" className={getActiveClass("/farmer/dashboard")}>
=======

        {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
  <FaLeaf
    style={{
      color: "#16a34a",
      fontSize: "1.875rem",
    }}
  />

  <Link
    to="/"
    style={{
      fontSize: "1.75rem",
      fontWeight: "bold",
      color: "#15803d",
      textDecoration: "none",
      transition: "color 0.2s ease-in-out",
    }}
    onMouseEnter={(e) => (e.target.style.color = "#166534")}
    onMouseLeave={(e) => (e.target.style.color = "#15803d")}
  >
    GreenNest
  </Link>
</div>


        {/* Menu */}
        <div className="navbar-menu flex items-center gap-5">

          <Link
            to="/farmer/dashboard"
            className={getActiveClass("/farmer/dashboard")}
          >
>>>>>>> 156b6162bb2f37c9290d2a66e6e53785e18771b7
            <FaHome className="navbar-icon" />
            <span className="navbar-text">Dashboard</span>
          </Link>

<<<<<<< HEAD
          <Link to="/farmer/farm-info" className={getActiveClass("/farmer/farm-info")}>
=======
          <Link
            to="/farmer-setup"
            className={getActiveClass("/farmer-setup")}
          >
>>>>>>> 156b6162bb2f37c9290d2a66e6e53785e18771b7
            <FaSeedling className="navbar-icon" />
            <span className="navbar-text">My Farm</span>
          </Link>

<<<<<<< HEAD
          <Link to="/farmer/ideas" className={getActiveClass("/farmer/ideas")}>
=======
          <Link
            to="/farmer/ideas"
            className={getActiveClass("/farmer/ideas")}
          >
>>>>>>> 156b6162bb2f37c9290d2a66e6e53785e18771b7
            <FaLightbulb className="navbar-icon" />
            <span className="navbar-text">Ideas</span>
          </Link>

<<<<<<< HEAD
          <Link to="/farmer/messages" className={getActiveClass("/farmer/messages")}>
            <FaEnvelope className="navbar-icon" />
            <span className="navbar-text">Messages</span>
          </Link>

          <Link to="/farmer/profile" className={getActiveClass("/farmer/profile")}>
=======
          {/* FIXED → Correct route for Messages */}
          {/* Auto-open latest chat */}
          <button
            onClick={async () => {
              try {
                const userId = localStorage.getItem("userId");
                if (!userId) return;

                const res = await fetch(`http://localhost:5000/messages/conversations/${userId}`);
                const conversations = await res.json();

                if (conversations.length > 0) {
                  const latest = conversations[0]; // newest chat
                  window.location.href = `/chat/${latest.partnerId}`;
                } else {
                  window.location.href = "/farmer/messages"; // fallback
                }
              } catch (err) {
                window.location.href = "/farmer/messages";
              }
            }}
            className={getActiveClass("/farmer/messages")}
          >
            <FaEnvelope className="navbar-icon" />
            <span className="navbar-text">Messages</span>
          </button>


          <Link
            to="/farmer-profile"
            className={getActiveClass("/farmer-profile")}
          >
>>>>>>> 156b6162bb2f37c9290d2a66e6e53785e18771b7
            <FaUser className="navbar-icon" />
            <span className="navbar-text">Profile</span>
          </Link>
        </div>

<<<<<<< HEAD
        {/* ✅ Logout Section */}
=======
        {/* Logout */}
>>>>>>> 156b6162bb2f37c9290d2a66e6e53785e18771b7
        <div className="flex items-center">
          <button
            onClick={logout}
            className="flex items-center gap-2 text-red-600 hover:text-red-700 transition font-medium"
          >
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </div>
<<<<<<< HEAD
=======

>>>>>>> 156b6162bb2f37c9290d2a66e6e53785e18771b7
      </div>
    </nav>
  );
};

export default FarmerNavBar;