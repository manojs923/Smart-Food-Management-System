import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { connectSocket, disconnectSocket } from "../components/socket";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const completeLogin = useCallback((token, userData = {}) => {
    localStorage.setItem("token", token);
    if (userData.role) localStorage.setItem("userRole", userData.role);

    let userId = userData.userId || userData._id || userData.id;
    if (!userId && token) {
      try {
        const decoded = jwtDecode(token);
        userId = decoded?.userId || decoded?._id || decoded?.id;
      } catch (error) {
        console.warn("Token decode error:", error);
      }
    }

    if (userId) localStorage.setItem("userId", String(userId));
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    const loggedInUser = {
      ...userData,
      _id: userId,
      id: userId,
      userId,
      token,
    };
    setUser(loggedInUser);
    setIsAuthenticated(true);
    connectSocket();
    return loggedInUser;
  }, []);

  const logout = useCallback(() => {
    disconnectSocket();
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userId");
    delete axios.defaults.headers.common["Authorization"];
    setUser(null);
    setIsAuthenticated(false);
    console.log("👋 Logged out successfully");
  }, []);

  // ✅ Automatically check token on load
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        try {
          const response = await axios.get("/auth/me");
          completeLogin(token, response.data);
        } catch (error) {
          console.error(
            "❌ Auth token invalid or expired:",
            error.response?.data || error.message
          );
          logout();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [completeLogin, logout]);

  // ✅ Manual login (email/password)
  const login = async (email, password) => {
    try {
      const response = await axios.post(
        "/auth/login",
        { email, password },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      const { token } = response.data;

      return completeLogin(token, response.data);
    } catch (error) {
      console.error("❌ Login failed:", error.response?.data || error.message);
      throw error;
    }
  };

  // ✅ Google login (after redirect with token)
  const loginWithGoogle = async (googleToken) => {
    try {
      const response = await axios.post("/auth/google", {
        token: googleToken,
      });

      const newUser = completeLogin(response.data.token, response.data);

      console.log("✅ Google login successful");
      return newUser;
    } catch (err) {
      console.error("❌ Google login failed:", err.response?.data || err.message);
      throw err;
    }
  };

  // ✅ OTP utilities
  const requestPasswordReset = async (email) => {
    try {
      const response = await axios.post(
        "/auth/request-otp",
        { email }
      );
      return { success: true, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to send OTP",
      };
    }
  };

  const verifyOtp = async (email, otp) => {
    try {
      const response = await axios.post(
        "/auth/verify-otp",
        { email, otp }
      );
      return { success: true, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "OTP verification failed",
      };
    }
  };

  const resetPassword = async (email, otp, newPassword) => {
    try {
      const response = await axios.post(
        "/auth/reset-password",
        {
          email,
          otp,
          newPassword,
        }
      );
      return { success: true, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Password reset failed",
      };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        loading,
        login,
        loginWithGoogle,
        completeLogin,
        logout,
        setUser,
        requestPasswordReset,
        verifyOtp,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ✅ Custom hook for consuming AuthContext
export const useAuth = () => useContext(AuthContext);
