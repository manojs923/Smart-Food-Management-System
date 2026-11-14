import { io } from "socket.io-client";

// Determine Socket.IO backend URL
const getSocketUrl = () => {
  if (process.env.REACT_APP_SOCKET_URL) {
    return process.env.REACT_APP_SOCKET_URL;
  }
  if (process.env.NODE_ENV === "development") {
    return "http://localhost:5000";
  }
  return typeof window !== "undefined" && window.location?.origin
    ? window.location.origin
    : "http://localhost:5000";
};

const SOCKET_URL = getSocketUrl();

// Initialize socket client with autoConnect disabled
const socket = io(SOCKET_URL, {
  autoConnect: false,
  withCredentials: true,
  transports: ["polling", "websocket"],
});

// Helper to connect the socket with the current auth credentials
export const connectSocket = () => {
  const token = typeof window !== "undefined" ? window.localStorage.getItem("token") : null;
  if (!token) {
    return socket;
  }

  socket.auth = { token };

  if (!socket.connected) {
    socket.connect();
  }
  return socket;
};

// Helper to cleanly disconnect on logout
export const disconnectSocket = () => {
  if (socket.connected || socket.active) {
    socket.disconnect();
  }
  return socket;
};

socket.on("connect", () => {
  console.log("⚡ Socket.IO connected to:", SOCKET_URL, "Socket ID:", socket.id);
  const currentUserId = localStorage.getItem("userId");
  if (currentUserId && currentUserId !== "null" && currentUserId !== "undefined") {
    socket.emit("joinRoom", currentUserId);
  }
});

socket.on("connect_error", (err) => {
  console.warn("⚠️ Socket connection notice:", err.message);
  // Do not retry in a loop if the server rejected handshake with "unauthorized"
  if (err.message === "unauthorized") {
    socket.disconnect();
  }
});

export default socket;
