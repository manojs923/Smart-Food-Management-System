import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { FaPaperPlane, FaTimes } from "react-icons/fa";
import socket from "../socket";
import { useAuth } from "../../contexts/AuthContext";
import { getCurrentUserId } from "../../utils/authUtils";
import { mergeUniqueMessages } from "../../utils/chatUtils";
import "./ChatBox.css";

function ChatBox({ user: recipientUser, onClose }) {
  const { user: authUser } = useAuth();
  const farmerId = getCurrentUserId(authUser);
  const recipientId = recipientUser?._id;

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [chatError, setChatError] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  // 🚨 Validate sender and recipient IDs before making API calls
  const isSenderValid = Boolean(farmerId && /^[0-9a-fA-F]{24}$/.test(farmerId));
  const isRecipientValid = Boolean(recipientId && /^[0-9a-fA-F]{24}$/.test(recipientId));

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // ✅ Fetch existing chat when opened - only if both IDs are valid!
  useEffect(() => {
    if (!isSenderValid || !isRecipientValid) {
      const reason = !isSenderValid
        ? `Invalid or missing sender ID (farmerId=${farmerId})`
        : `Invalid or missing recipient ID (recipientId=${recipientId})`;
      console.error("❌ Chat initialization aborted:", reason);
      setChatError("Couldn't open chat, please log in again.");
      return;
    }

    setChatError("");
    setMessages([]);
    const fetchMessages = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`/messages/${farmerId}/${recipientId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        setMessages((current) => mergeUniqueMessages(res.data || [], current));
      } catch (err) {
        console.error("❌ Error fetching chat history:", err);
        setChatError("Could not load previous messages.");
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [farmerId, recipientId, isSenderValid, isRecipientValid]);

  // ✅ Socket room join & real-time incoming message listener
  useEffect(() => {
    if (!isSenderValid) return;

    socket.emit("joinRoom", farmerId);

    const handleReceiveMessage = (msg) => {
      const senderId = String(msg.senderId?._id || msg.senderId);
      const messageRecipientId = String(msg.recipientId?._id || msg.recipientId);
      if (
        (senderId === String(recipientId) && messageRecipientId === String(farmerId)) ||
        (senderId === String(farmerId) && messageRecipientId === String(recipientId))
      ) {
        setMessages((current) => mergeUniqueMessages(current, [msg]));
      }
    };

    socket.on("receiveMessage", handleReceiveMessage);
    return () => socket.off("receiveMessage", handleReceiveMessage);
  }, [isSenderValid, farmerId, recipientId]);

  // ✅ Send new message
  const handleSend = async (e) => {
    if (e) e.preventDefault();
    const text = message.trim();
    if (!text || !isSenderValid || !isRecipientValid || sending) return;
    if (text.length > 2000 || !socket.connected) {
      setChatError("Message failed to send, try again");
      return;
    }

    const payload = {
      senderId: farmerId,
      recipientId: recipientId,
      text,
    };

    setChatError("");
    setSending(true);
    setMessage("");
    socket.timeout(5000).emit("sendMessage", payload, (timeoutError, response) => {
      setSending(false);
      if (timeoutError || !response?.ok) {
        setChatError("Message failed to send, try again");
        setMessage((current) => current || text);
        return;
      }
      setChatError("");
    });
  };

  const recipientDisplayName = recipientUser
    ? `${recipientUser.firstName || ""} ${recipientUser.lastName || ""}`.trim() ||
      recipientUser.name ||
      recipientUser.email ||
      "User"
    : "Chat";

  return (
    <aside
      className="farmer-chatbox-panel"
      role="dialog"
      aria-labelledby="chatbox-recipient-name"
    >
      {/* Header */}
      <div className="farmer-chatbox-header">
        <div className="farmer-chatbox-title-wrap">
          <h3 id="chatbox-recipient-name" className="farmer-chatbox-title">
            {recipientDisplayName}
          </h3>
          <p className="farmer-chatbox-subtitle">
            {recipientUser?.email || "Donor on GreenNest"}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="farmer-chatbox-close-btn"
          aria-label="Close chat window"
        >
          <FaTimes />
        </button>
      </div>

      {/* Inline Warning for Missing Auth or Fetch Error */}
      {chatError && (
        <div className="farmer-chatbox-alert" role="alert">
          <span>⚠️ {chatError}</span>
        </div>
      )}

      {/* Messages List */}
      <div className="farmer-chatbox-messages">
        {loading ? (
          <div className="farmer-chatbox-empty">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="farmer-chatbox-empty">
            <span>💬</span>
            <p>No messages yet. Send a message to start the conversation!</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isSentByMe = String(msg.senderId) === String(farmerId);
            return (
              <div
                key={msg._id || index}
                className={`farmer-chatbox-bubble-wrap ${
                  isSentByMe ? "sent" : "received"
                }`}
              >
                <div
                  className={`farmer-chatbox-bubble ${
                    isSentByMe ? "sent" : "received"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Bottom Input Row */}
      <form className="farmer-chatbox-input-row" onSubmit={handleSend}>
        <input
          type="text"
          value={message}
          maxLength={2000}
          onChange={(e) => {
            setMessage(e.target.value);
            setChatError("");
          }}
          placeholder={isSenderValid ? "Type a message..." : "Log in to send messages..."}
          disabled={!isSenderValid || !isRecipientValid}
          className="farmer-chatbox-input"
        />
        <button
          type="submit"
          disabled={!message.trim() || !isSenderValid || !isRecipientValid || sending}
          className="farmer-chatbox-send-btn"
          aria-label="Send message"
        >
          <FaPaperPlane />
        </button>
      </form>
    </aside>
  );
}

export default ChatBox;
