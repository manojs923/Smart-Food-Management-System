import React, { useEffect, useState } from "react";
import axios from "axios";
<<<<<<< HEAD
import ChatBox from "./ChatBox";
import UserCard from "../common/UserCard"; // ✅ Import the reusable card
=======
import { useNavigate } from "react-router-dom";
import "./FarmerHome.css";
>>>>>>> 156b6162bb2f37c9290d2a66e6e53785e18771b7

function FarmerHome() {
  const [interestedUsers, setInterestedUsers] = useState([]);
  const [notInterestedUsers, setNotInterestedUsers] = useState([]);
<<<<<<< HEAD
  const [chatUser, setChatUser] = useState(null);

  // ✅ Fetch all users
=======
  const navigate = useNavigate();

  // Fetch Users
>>>>>>> 156b6162bb2f37c9290d2a66e6e53785e18771b7
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/users");
<<<<<<< HEAD
        const storedPrefs = JSON.parse(localStorage.getItem("interestPrefs") || "{}");
=======

        const storedPrefs = JSON.parse(
          localStorage.getItem("interestPrefs") || "{}"
        );
>>>>>>> 156b6162bb2f37c9290d2a66e6e53785e18771b7

        const interested = [];
        const notInterested = [];

        res.data.forEach((user) => {
          const pref = storedPrefs[user._id];
          if (pref === "interested") interested.push(user);
          else notInterested.push(user);
        });

        setInterestedUsers(interested);
        setNotInterestedUsers(notInterested);
      } catch (err) {
        console.error("❌ Failed to fetch users:", err);
      }
    };
    fetchUsers();
  }, []);

<<<<<<< HEAD
  // ✅ Handle interest toggle
  const handleInterest = (user, status) => {
    const prefs = JSON.parse(localStorage.getItem("interestPrefs") || "{}");
=======
  // Toggle Interest
  const handleInterest = (user, status) => {
    const prefs = JSON.parse(localStorage.getItem("interestPrefs") || "{}");

>>>>>>> 156b6162bb2f37c9290d2a66e6e53785e18771b7
    prefs[user._id] = status;
    localStorage.setItem("interestPrefs", JSON.stringify(prefs));

    if (status === "interested") {
<<<<<<< HEAD
      setInterestedUsers((prev) => [user, ...prev.filter((u) => u._id !== user._id)]);
=======
      setInterestedUsers((prev) => [
        user,
        ...prev.filter((u) => u._id !== user._id),
      ]);
>>>>>>> 156b6162bb2f37c9290d2a66e6e53785e18771b7
      setNotInterestedUsers((prev) => prev.filter((u) => u._id !== user._id));
    } else {
      setNotInterestedUsers((prev) => [...prev, user]);
      setInterestedUsers((prev) => prev.filter((u) => u._id !== user._id));
    }
  };

<<<<<<< HEAD
  // ✅ Start chat
  const handleMessage = (user) => {
    setChatUser(user);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h2 className="text-3xl font-bold text-green-700 mb-6 text-center">
        Farmer Dashboard 🌾
      </h2>

      {/* ✅ Interested Users Section */}
      <section className="mb-8">
        <h3 className="text-xl font-semibold mb-3 text-green-600">Interested Users</h3>
        {interestedUsers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
          <p className="text-gray-500">No interested users yet.</p>
        )}
      </section>

      {/* ✅ Not Interested / Other Users Section */}
      <section>
        <h3 className="text-xl font-semibold mb-3 text-gray-700">Other Users</h3>
        {notInterestedUsers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
          <p className="text-gray-500">No users available.</p>
        )}
      </section>

      {/* ✅ Chat Box Popup */}
      {chatUser && <ChatBox user={chatUser} onClose={() => setChatUser(null)} />}
=======
  // ✅ FIXED: Start real chat page
  const handleMessage = (user) => {
    navigate(`/chat/${user._id}`);
  };

  return (
    <div className="farmer-home-container">
      <h2 className="header-title">Farmer Dashboard 🌾</h2>

      {/* Interested Users */}
      <div className="section-card">
        <h3 className="section-title">Interested Users</h3>

        {interestedUsers.length > 0 ? (
          <div className="user-card-grid">
            {interestedUsers.map((user) => (
              <div key={user._id} className="user-card">
                <h3 className="user-name">
                  {user.firstName || user.lastName
                    ? `${user.firstName || ""} ${user.lastName || ""}`
                    : user.email.split("@")[0]}
                </h3>

                <p>
                  <strong>Location:</strong> Not provided
                </p>
                <p>
                  <strong>Contact:</strong> {user.email}
                </p>

                <div className="user-card-buttons">
                  <button
                    className="user-btn not-interested-btn"
                    onClick={() => handleInterest(user, "not-interested")}
                  >
                    Remove Interest
                  </button>

                  <button
                    className="user-btn message-btn"
                    onClick={() => handleMessage(user)}
                  >
                    Message
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-box">No interested users yet.</div>
        )}
      </div>

      {/* Other Users */}
      <div className="section-card">
        <h3 className="section-title">Other Users</h3>

        {notInterestedUsers.length > 0 ? (
          <div className="user-card-grid">
            {notInterestedUsers.map((user) => (
              <div key={user._id} className="user-card">
                <h3 className="user-name">
                  {user.firstName || user.lastName
                    ? `${user.firstName || ""} ${user.lastName || ""}`
                    : user.email.split("@")[0]}
                </h3>

                <p>
                  <strong>Location:</strong> Not provided
                </p>
                <p>
                  <strong>Contact:</strong> {user.email}
                </p>

                <div className="user-card-buttons">
                  <button
                    className="user-btn interest-btn"
                    onClick={() => handleInterest(user, "interested")}
                  >
                    Interested
                  </button>

                  <button
                    className="user-btn message-btn"
                    onClick={() => handleMessage(user)}
                  >
                    Message
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-box">No users available.</div>
        )}
      </div>
>>>>>>> 156b6162bb2f37c9290d2a66e6e53785e18771b7
    </div>
  );
}

export default FarmerHome;