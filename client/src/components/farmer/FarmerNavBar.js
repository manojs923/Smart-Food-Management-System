import React, { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import {
  FaHome,
  FaSeedling,
  FaLightbulb,
  FaEnvelope,
  FaUser,
  FaSignOutAlt,
  FaLeaf,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import "./FarmerNavBar.css";

const FarmerNavBar = ({ logout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { to: "/farmer/dashboard", label: "Dashboard", icon: FaHome },
    { to: "/farmer/my-farm", label: "My Farm", icon: FaSeedling },
    { to: "/farmer/ideas", label: "Ideas", icon: FaLightbulb },
    { to: "/farmer/messages", label: "Messages", icon: FaEnvelope },
    { to: "/farmer/profile", label: "Profile", icon: FaUser },
  ];

  const handleLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="farmer-navbar">
      <div className="farmer-navbar-container">
        {/* Logo Section */}
        <div className="farmer-navbar-brand">
          <FaLeaf className="farmer-logo-icon" />
          <Link to="/farmer/dashboard" className="farmer-logo-text">
            GreenNest Farmer
          </Link>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          type="button"
          className="farmer-hamburger-btn"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>

        {/* Menu Links */}
        <div className={`farmer-navbar-menu ${isMobileMenuOpen ? "mobile-open" : ""}`}>
          <div className="farmer-nav-links">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={handleLinkClick}
                className={({ isActive }) =>
                  `farmer-nav-item ${isActive ? "active" : ""}`
                }
              >
                <Icon className="farmer-nav-icon" />
                <span>{label}</span>
              </NavLink>
            ))}
          </div>

          {/* Logout Button */}
          <div className="farmer-navbar-actions">
            <button
              type="button"
              onClick={() => {
                handleLinkClick();
                logout();
              }}
              className="farmer-logout-btn"
            >
              <FaSignOutAlt />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default FarmerNavBar;
