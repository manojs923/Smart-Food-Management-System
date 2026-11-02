import React, { useState, useEffect } from "react";
import axios from "axios";
<<<<<<< HEAD
import { io } from "socket.io-client";

const socket = io("http://localhost:5000", { transports: ["websocket"] });

function ChatBox({ user, onClose }) {
  const farmerId = localStorage.getItem("userId"); // ✅ current logged-in farmer
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  // ✅ Fetch existing chat when opened
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/messages/${farmerId}/${user._id}`);
        setMessages(res.data);
      } catch (err) {
        console.error("❌ Error fetching chat:", err);
      }
    };
    fetchMessages();
  }, [farmerId, user]);

  // ✅ Listen for new incoming messages
  useEffect(() => {
    socket.on("receiveMessage", (msg) => {
      if (
        (msg.senderId === user._id && msg.receiverId === farmerId) ||
        (msg.senderId === farmerId && msg.receiverId === user._id)
      ) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    return () => socket.off("receiveMessage");
  }, [user, farmerId]);

  // ✅ Send new message
  const handleSend = async () => {
    if (!message.trim()) return;
    try {
      const msg = {
        senderId: farmerId,
        receiverId: user._id,
        text: message,
      };

      await axios.post("http://localhost:5000/api/messages", msg);
      setMessages((prev) => [...prev, msg]);
      setMessage("");
    } catch (err) {
      console.error("❌ Error sending message:", err);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-white shadow-lg rounded-xl border">
      <div className="flex justify-between items-center bg-green-600 text-white p-3 rounded-t-xl">
        <h3 className="font-semibold">{user.firstName} {user.lastName}</h3>
        <button onClick={onClose} className="text-white">✖</button>
      </div>

      <div className="p-3 h-64 overflow-y-auto bg-gray-50">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`my-1 p-2 rounded-md ${
              msg.senderId === farmerId
                ? "bg-green-100 text-right"
                : "bg-gray-200 text-left"
            }`}
          >
            {msg.text}
          </div>
        ))}
      </div>

      <div className="flex p-2 border-t">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type message..."
          className="flex-1 border rounded-md px-2 py-1"
        />
        <button
          onClick={handleSend}
          className="bg-green-600 text-white px-3 ml-2 rounded-md hover:bg-green-700 transition"
        >
          ➤
        </button>
      </div>
    </div>
  );
}

export default ChatBox;
=======
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "./ConversationList.css";

const FarmerChatList = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [autoOpened, setAutoOpened] = useState(false); // ⭐ prevents redirect loop
  const navigate = useNavigate();

  // Load all conversations
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");

    const { userId } = jwtDecode(token);

    const load = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/messages/conversations/${userId}`
        );
        setConversations(res.data);
      } catch (err) {
        console.error("Error fetching:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [navigate]);

  // ⭐ FIXED AUTO-OPEN LOGIC
  // Only run ONE TIME — not when user presses Back
  useEffect(() => {
    if (!loading && conversations.length > 0 && !autoOpened) {
      const latest = conversations.reduce((a, b) =>
        new Date(a.timestamp) > new Date(b.timestamp) ? a : b
      );

      setAutoOpened(true); // 🚀 prevents it from running again
      navigate(`/chat/${latest.partnerId}`);
    }
  }, [loading, conversations, autoOpened, navigate]);

  const openChat = (partnerId) => {
    navigate(`/chat/${partnerId}`);
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen text-xl">
        Loading...
      </div>
    );

  return (
    <div className="chat-page-wrapper">
      <div className="chat-container">
        {/* HEADER */}
        <div className="chat-header">
          <div className="header-left-content">
            <div className="header-user-info">
              <div className="header-avatar">💬</div>
              <div>
                <h3>Your Conversations</h3>
                <p>Tap to open a chat</p>
              </div>
            </div>
          </div>
        </div>

        {/* BODY */}
        <div className="message-list-container" style={{ paddingTop: "1rem" }}>
          {conversations.length === 0 ? (
            <p className="text-center text-gray-500">No conversations yet</p>
          ) : (
            conversations.map((c) => (
              <div
                key={c.partnerId}
                onClick={() => openChat(c.partnerId)}
                className="flex items-center gap-4 p-3 rounded-xl bg-white border shadow-sm hover:bg-gray-100 cursor-pointer transition mb-3"
              >
                <div className="header-avatar">
                  {c.partnerName[0]?.toUpperCase()}
                </div>

                <div className="flex-1">
                  <p className="text-lg font-semibold">{c.partnerName}</p>
                  <p className="text-sm text-gray-600 truncate">
                    {c.lastMessage}
                  </p>
                </div>

                {!c.read && (
                  <div className="w-3 h-3 rounded-full bg-blue-600 animate-pulse"></div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default FarmerChatList;
>>>>>>> 156b6162bb2f37c9290d2a66e6e53785e18771b7
