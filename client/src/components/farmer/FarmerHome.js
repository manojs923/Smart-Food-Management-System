import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaUserFriends, FaUsers } from "react-icons/fa";
import ChatBox from "./ChatBox";
import UserCard from "../common/UserCard";
import "./FarmerHome.css";

function FarmerHome() {
  const [interestedUsers, setInterestedUsers] = useState([]);
  const [notInterestedUsers, setNotInterestedUsers] = useState([]);
  const [chatUser, setChatUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch all users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get("/api/users");
        const currentUserId = localStorage.getItem("userId");
        const storedPrefs = JSON.parse(localStorage.getItem("interestPrefs") || "{}");

        const interested = [];
        const notInterested = [];

        (res.data || [])
          .filter((user) => user._id !== currentUserId)
          .forEach((user) => {
            const pref = storedPrefs[user._id];
            if (pref === "interested") {
              interested.push(user);
            } else {
              notInterested.push(user);
            }
          });

        setInterestedUsers(interested);
        setNotInterestedUsers(notInterested);
      } catch (err) {
        console.error("Failed to fetch users:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Handle interest toggle
  const handleInterest = (user, status) => {
    const prefs = JSON.parse(localStorage.getItem("interestPrefs") || "{}");
    prefs[user._id] = status;
    localStorage.setItem("interestPrefs", JSON.stringify(prefs));

    if (status === "interested") {
      setInterestedUsers((prev) => [user, ...prev.filter((u) => u._id !== user._id)]);
      setNotInterestedUsers((prev) => prev.filter((u) => u._id !== user._id));
    } else {
      setNotInterestedUsers((prev) => [...prev, user]);
      setInterestedUsers((prev) => prev.filter((u) => u._id !== user._id));
    }
  };

  // Open Chat
  const handleMessage = (user) => {
    setChatUser(user);
  };

  return (
    <div className="farmer-page-container">
      <div className="farmer-page-card">
        <h2 className="page-title">Farmer Dashboard 🌾</h2>

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
                  {interestedUsers.map((user) => (
                    <UserCard
                      key={user._id}
                      user={user}
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
                  {notInterestedUsers.map((user) => (
                    <UserCard
                      key={user._id}
                      user={user}
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
