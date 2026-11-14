import React from "react";
import { FaComments, FaHeart, FaRegHeart } from "react-icons/fa";
import "../farmer/FarmerCommon.css";
import "./UserCard.css";

function UserCard({ user, isInterested, onInterestChange, onMessage }) {
  const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.username || "Anonymous User";

  // Avatar initials from name, username, or email
  const getInitials = () => {
    const f = user.firstName ? user.firstName.trim()[0] : "";
    const l = user.lastName ? user.lastName.trim()[0] : "";
    if (f || l) return `${f}${l}`.toUpperCase();
    if (user.username) return user.username.slice(0, 2).toUpperCase();
    if (user.email) return user.email.slice(0, 2).toUpperCase();
    return "U";
  };

  return (
    <div className="farmer-user-card">
      <div className="farmer-user-info">
        <div className="farmer-user-avatar" aria-hidden="true">
          {getInitials()}
        </div>
        <div className="farmer-user-details">
          <h4 className="farmer-user-name">{fullName}</h4>
          <span className="farmer-user-email">{user.email || "No email provided"}</span>
        </div>
      </div>

      <div className="farmer-user-actions">
        {/* Toggle Interested / Not Interested Button (44px) */}
        {isInterested ? (
          <button
            type="button"
            className="farmer-btn farmer-btn-secondary farmer-btn-interested"
            onClick={() => onInterestChange(user, "not_interested")}
            title="Click to remove"
            aria-label="Click to remove"
          >
            <FaHeart className="farmer-btn-icon" />
            <span>Interested ✓</span>
          </button>
        ) : (
          <button
            type="button"
            className="farmer-btn farmer-btn-secondary"
            onClick={() => onInterestChange(user, "interested")}
            title="Mark Interested"
            aria-label="Mark Interested"
          >
            <FaRegHeart className="farmer-btn-icon" />
            <span>Mark Interested</span>
          </button>
        )}

        {/* Message Button (44px, Primary Variant) */}
        <button
          type="button"
          className="farmer-btn farmer-btn-primary"
          onClick={() => onMessage(user)}
          title={`Message ${fullName}`}
          aria-label={`Message ${fullName}`}
        >
          <FaComments className="farmer-btn-icon" />
          <span>Message</span>
        </button>
      </div>
    </div>
  );
}

export default UserCard;
