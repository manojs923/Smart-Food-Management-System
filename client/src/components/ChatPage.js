import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import socket from "./socket";
import { FaArrowLeft, FaPaperPlane, FaTrashAlt } from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";
import { getCurrentUserId } from "../utils/authUtils";
import { mergeUniqueMessages } from "../utils/chatUtils";
import "./ChatPage.css";

const ChatPage = () => {
  const { recipientId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [farmer, setFarmer] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [chatError, setChatError] = useState("");
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef(null);

  const customerId = getCurrentUserId(user);

  // 🚨 Validate ObjectId (24 hex chars)
  const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(recipientId);

  // 👉 Hooks must run ALWAYS — no return before them!
  useEffect(() => {
    if (!isValidObjectId || !customerId) return;

    setMessages([]);
    setChatError("");
    const load = async () => {
      try {
        const f = await axios.get(`/farmers/${recipientId}`);
        setFarmer(f.data);

        const m = await axios.get(`/messages/${customerId}/${recipientId}`);
        setMessages((current) => mergeUniqueMessages(m.data || [], current));
      } catch (err) {
        console.error("❌ Chat load error:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
    socket.emit("joinRoom", customerId);

    const handleReceiveMessage = (msg) => {
      const senderId = String(msg.senderId?._id || msg.senderId);
      const messageRecipientId = String(msg.recipientId?._id || msg.recipientId);
      if (
        (senderId === String(customerId) && messageRecipientId === String(recipientId)) ||
        (senderId === String(recipientId) && messageRecipientId === String(customerId))
      ) {
        setMessages((current) => mergeUniqueMessages(current, [msg]));
      }
    };
    socket.on("receiveMessage", handleReceiveMessage);

    return () => socket.off("receiveMessage", handleReceiveMessage);
  }, [customerId, recipientId, isValidObjectId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // SEND
  const sendMessage = () => {
    const text = newMessage.trim();
    if (!text || !isValidObjectId || !customerId || sending) return;
    if (text.length > 2000 || !socket.connected) {
      setChatError("Message failed to send, try again");
      return;
    }

    const payload = {
      text,
      senderId: customerId,
      recipientId,
    };

    setChatError("");
    setSending(true);
    setNewMessage("");
    socket.timeout(5000).emit("sendMessage", payload, (timeoutError, response) => {
      setSending(false);
      if (timeoutError || !response?.ok) {
        setChatError("Message failed to send, try again");
        setNewMessage((current) => current || text);
        return;
      }
      setChatError("");
    });
  };

  // CLEAR CHAT
  const clearChat = async () => {
    if (!window.confirm("Clear entire chat?")) return;
    if (!isValidObjectId || !customerId) return;

    await axios.delete(`/messages/clear/${customerId}/${recipientId}`);
    setMessages([]);
  };

  // 👉 Safely validate AFTER hooks
  if (!isValidObjectId) {
    return (
      <div style={{ padding: "20px", fontSize: "18px", color: "red" }}>
        Invalid chat selected.
        <br />
        <button onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  return (
    <div className="chat-page-wrapper">
      <div className="chat-container">
        <div className="chat-header">
          <div className="header-left-content">
            <button onClick={() => navigate(-1)} className="header-button back-button">
              <FaArrowLeft />
            </button>

            <div className="header-user-info">
              <div className="header-avatar">{farmer?.name?.[0] || "F"}</div>
              <div>
                <h3>{farmer?.name}</h3>
                <p>{farmer?.email}</p>
              </div>
            </div>
          </div>

          <button onClick={clearChat} className="header-button clear-chat-button">
            <FaTrashAlt />
          </button>
        </div>

        <div className="message-list-container">
          {loading ? (
            <p>Loading chat...</p>
          ) : (
            messages.map((msg, i) => (
              <div
                key={i}
                className={`message-row ${
                  msg.senderId === customerId ? "customer-message" : "farmer-message"
                }`}
              >
                <div className="message-bubble">
                  <span>{msg.text}</span>
                </div>
              </div>
            ))
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="chat-input-area-wrapper">
          {chatError && <p role="alert">{chatError}</p>}
          <div className="chat-input-controls">
            <input
              value={newMessage}
              maxLength={2000}
              onChange={(e) => {
                setNewMessage(e.target.value);
                setChatError("");
              }}
              placeholder="Type message..."
              className="chat-input-field"
            />
            <button
              onClick={sendMessage}
              className="control-button send-button"
              disabled={!newMessage.trim() || sending}
            >
              <FaPaperPlane />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
