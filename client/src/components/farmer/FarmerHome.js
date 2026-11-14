import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { FaUserFriends, FaUsers, FaRedo } from "react-icons/fa";
import { useAuth } from "../../contexts/AuthContext";
import { getCurrentUserId } from "../../utils/authUtils";
import ChatBox from "./ChatBox";
import UserCard from "../common/UserCard";
import "./FarmerHome.css";

function FarmerHome() {
  const { user } = useAuth();
  const [interestedUsers, setInterestedUsers] = useState([]);
  const [notInterestedUsers, setNotInterestedUsers] = useState([]);
  const [chatUser, setChatUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  // Fetch all registered users (donors)
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setFetchError("");
    try {
      const res = await axios.get("/api/users");
      const currentUserId = getCurrentUserId(user);
      const storedPrefs = JSON.parse(localStorage.getItem("interestPrefs") || "{}");

      const interested = [];
      const notInterested = [];

      (res.data || [])
        .filter((u) => String(u._id) !== String(currentUserId))
        .forEach((u) => {
          const pref = storedPrefs[u._id];
          if (pref === "interested") {
            interested.push(u);
          } else {
            notInterested.push(u);
          }
        });

      setInterestedUsers(interested);
      setNotInterestedUsers(notInterested);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setFetchError(err.response?.data?.message || "Could not load registered users. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Refetch when the dashboard mounts
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Handle interest toggle
  const handleInterest = (u, status) => {
    const prefs = JSON.parse(localStorage.getItem("interestPrefs") || "{}");
    prefs[u._id] = status;
    localStorage.setItem("interestPrefs", JSON.stringify(prefs));

    if (status === "interested") {
      setInterestedUsers((prev) => [u, ...prev.filter((item) => item._id !== u._id)]);
      setNotInterestedUsers((prev) => prev.filter((item) => item._id !== u._id));
    } else {
      setNotInterestedUsers((prev) => [...prev, u]);
      setInterestedUsers((prev) => prev.filter((item) => item._id !== u._id));
    }
  };

  // Open Chat
  const handleMessage = (u) => {
    setChatUser(u);
  };

  return (
    <div className="farmer-page-container">
      <div className="farmer-page-card">
        <h2 className="page-title">Farmer Dashboard 🌾</h2>

        {/* Visible Error Banner with Retry button */}
        {fetchError && (
          <div
            className="farmer-form-message farmer-error-banner"
            role="alert"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
              padding: "14px 18px",
              marginBottom: "20px",
              borderRadius: "12px",
              backgroundColor: "rgba(239, 68, 68, 0.12)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              color: "#dc2626",
              fontWeight: 500,
            }}
          >
            <span>⚠️ {fetchError}</span>
            <button
              type="button"
              className="farmer-btn farmer-btn-secondary"
              onClick={fetchUsers}
              style={{
                height: "36px",
                minHeight: "36px",
                padding: "0 14px",
                fontSize: "0.85rem",
              }}
            >
              <FaRedo style={{ marginRight: "6px" }} /> Retry
            </button>
          </div>
        )}

        {loading ? (
          /* Loading Skeleton */
          <div className="farmer-skeleton-container" aria-label="Loading dashboard users">
            {[1, 2, 3].map((i) => (
              <div key={i} className="farmer-user-card farmer-skeleton-card">
                <div className="farmer-user-info">
                  <div className="farmer-user-avatar farmer-skeleton-shimmer" />
                  <div className="farmer-user-details" style={{ width: "60%" }}>
                    <div className="farmer-skeleton-line title farmer-skeleton-shimmer" />
                    <div className="farmer-skeleton-line subtitle farmer-skeleton-shimmer" />
                  </div>
                </div>
                <div className="farmer-user-actions">
                  <div className="farmer-skeleton-btn farmer-skeleton-shimmer" />
                  <div className="farmer-skeleton-btn farmer-skeleton-shimmer" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="farmer-dashboard-sections">
            {/* 1. Interested Users Section */}
            <section className="farmer-dashboard-section">
              <div className="farmer-section-header">
                <FaUserFriends className="farmer-section-icon" />
                <h3 className="farmer-section-title">
                  Interested Users
                  <span className="farmer-section-badge">{interestedUsers.length}</span>
                </h3>
              </div>

              {interestedUsers.length > 0 ? (
                <div className="farmer-users-grid">
                  {interestedUsers.map((u) => (
                    <UserCard
                      key={u._id}
                      user={u}
                      isInterested={true}
                      onInterestChange={handleInterest}
                      onMessage={handleMessage}
                    />
                  ))}
                </div>
              ) : (
                /* Empty state for "No interested users yet" inside a dashed-border box */
                <div className="farmer-empty-state">
                  <FaUserFriends className="farmer-empty-icon" />
                  <p className="farmer-empty-title">No interested users yet</p>
                  <p className="farmer-empty-desc">
                    When donors express mutual interest in donating to your farm, they will appear here.
                  </p>
                </div>
              )}
            </section>

            {/* 2. Other Users Section */}
            <section className="farmer-dashboard-section">
              <div className="farmer-section-header">
                <FaUsers className="farmer-section-icon" />
                <h3 className="farmer-section-title">
                  Other Users
                  <span className="farmer-section-badge">{notInterestedUsers.length}</span>
                </h3>
              </div>

              {notInterestedUsers.length > 0 ? (
                <div className="farmer-users-grid">
                  {notInterestedUsers.map((u) => (
                    <UserCard
                      key={u._id}
                      user={u}
                      isInterested={false}
                      onInterestChange={handleInterest}
                      onMessage={handleMessage}
                    />
                  ))}
                </div>
              ) : (
                <div className="farmer-empty-state">
                  <FaUsers className="farmer-empty-icon" />
                  <p className="farmer-empty-title">No other users available</p>
                  <p className="farmer-empty-desc">
                    Registered donors on GreenNest will be listed here.
                  </p>
                </div>
              )}
            </section>
          </div>
        )}

        {/* Chat Box Popup */}
        {chatUser && <ChatBox user={chatUser} onClose={() => setChatUser(null)} />}
      </div>
    </div>
  );
}

export default FarmerHome;
