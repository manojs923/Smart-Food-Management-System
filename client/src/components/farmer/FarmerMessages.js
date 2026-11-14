import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import socket from "../socket";
import { FaUserCircle, FaPaperPlane, FaComments, FaArrowLeft } from "react-icons/fa";
import "./FarmerMessages.css";

const FarmerMessages = () => {
  const farmerId = localStorage.getItem("userId");
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const chatEndRef = useRef(null);

  // Fetch all users / potential contacts
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get("/api/users");
        // Filter out self if included
        const contactList = (res.data || []).filter((u) => u._id !== farmerId);
        setUsers(contactList);
        if (contactList.length > 0) {
          setSelectedUser(contactList[0]);
        }
      } catch (err) {
        console.error("Failed to fetch users:", err);
      } finally {
        setLoadingUsers(false);
      }
    };
    fetchUsers();
  }, [farmerId]);

  // Load chat history when selectedUser changes
  useEffect(() => {
    if (!selectedUser || !farmerId) return;

    const fetchMessages = async () => {
      setLoadingMessages(true);
      try {
        const res = await axios.get(`/messages/${farmerId}/${selectedUser._id}`);
        setMessages(res.data || []);
      } catch (err) {
        console.error("Failed to fetch messages:", err);
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchMessages();
  }, [selectedUser, farmerId]);

  // Real-time socket listener
  useEffect(() => {
    if (!farmerId) return;

    const handleReceiveMessage = (msg) => {
      if (!selectedUser) return;
      if (
        (msg.senderId === selectedUser._id && msg.recipientId === farmerId) ||
        (msg.senderId === farmerId && msg.recipientId === selectedUser._id)
      ) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    socket.on("receiveMessage", handleReceiveMessage);
    return () => socket.off("receiveMessage", handleReceiveMessage);
  }, [farmerId, selectedUser]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() || !selectedUser || !farmerId) return;

    const payload = {
      senderId: farmerId,
      recipientId: selectedUser._id,
      text: text.trim(),
    };

    try {
      await axios.post("/messages", payload);
      setMessages((prev) => [...prev, payload]);
      setText("");
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  return (
    <div className="farmer-page-container">
      <div className="farmer-page-card farmer-messages-card">
        {/* Centered Page Title with Short Accent Underline */}
        <h2 className="page-title">Farmer Messages</h2>

        <div className="farmer-messages-container">
          {/* Contacts Sidebar Panel (Card on left) */}
          <aside className={`farmer-contacts-panel ${selectedUser ? "hide-mobile" : ""}`}>
            <h3 className="farmer-panel-heading">Conversations</h3>
            {loadingUsers ? (
              <p className="farmer-muted-text p-4">Loading conversations...</p>
            ) : users.length === 0 ? (
              <p className="farmer-muted-text p-4">No conversations found.</p>
            ) : (
              <div className="farmer-contacts-list">
                {users.map((u) => {
                  const isSelected = selectedUser?._id === u._id;
                  const name = `${u.firstName || ""} ${u.lastName || ""}`.trim() || u.email || "User";
                  return (
                    <button
                      key={u._id}
                      type="button"
                      className={`farmer-contact-item ${isSelected ? "selected" : ""}`}
                      onClick={() => setSelectedUser(u)}
                    >
                      <FaUserCircle className="farmer-contact-avatar" />
                      <div className="farmer-contact-info">
                        <span className="farmer-contact-name">{name}</span>
                        <span className="farmer-contact-email">{u.email}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </aside>

          {/* Active Chat Panel (Card on right) */}
          <main className={`farmer-chat-panel ${!selectedUser ? "hide-mobile" : ""}`}>
            {selectedUser ? (
              <>
                <div className="farmer-chat-header">
                  <button
                    type="button"
                    className="farmer-back-button"
                    onClick={() => setSelectedUser(null)}
                    aria-label="Back to conversations"
                  >
                    <FaArrowLeft />
                  </button>
                  <FaUserCircle className="farmer-header-avatar" />
                  <div className="farmer-header-text">
                    <h4 className="farmer-chat-user-name">
                      {`${selectedUser.firstName || ""} ${selectedUser.lastName || ""}`.trim() || selectedUser.email}
                    </h4>
                    <span className="farmer-chat-user-status">Active conversation</span>
                  </div>
                </div>

                <div className="farmer-chat-messages">
                  {loadingMessages ? (
                    <div className="farmer-messages-placeholder">Loading messages...</div>
                  ) : messages.length === 0 ? (
                    <div className="farmer-messages-placeholder">
                      <FaComments className="farmer-placeholder-icon" />
                      <p>No messages yet. Send a message to start the conversation!</p>
                    </div>
                  ) : (
                    messages.map((m, idx) => {
                      const isMe = m.senderId === farmerId;
                      return (
                        <div
                          key={m._id || idx}
                          className={`farmer-message-row ${isMe ? "sent" : "received"}`}
                        >
                          <div className={`farmer-message-bubble ${isMe ? "sent" : "received"}`}>
                            {m.text}
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={chatEndRef} />
                </div>

                <form className="farmer-chat-form" onSubmit={handleSendMessage}>
                  <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Type your message..."
                    className="farmer-chat-input"
                    aria-label="Type message"
                  />
                  <button
                    type="submit"
                    className="farmer-btn farmer-btn-primary farmer-chat-send-btn"
                    disabled={!text.trim()}
                    aria-label="Send message"
                  >
                    <FaPaperPlane />
                  </button>
                </form>
              </>
            ) : (
              <div className="farmer-messages-placeholder">
                <FaComments className="farmer-placeholder-icon" />
                <p>Select a contact to view or start a conversation.</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default FarmerMessages;
