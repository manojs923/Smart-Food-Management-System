import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useAuth } from "../../contexts/AuthContext";

const OAuthHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { completeLogin } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");

    // ⚠️ If no token in URL, redirect to login
    if (!token) {
      console.error("❌ No token found in OAuth callback URL");
      navigate("/");
      return;
    }

    const fetchUserData = async () => {
      try {
        let decodedUserId = "";
        try {
          const decoded = jwtDecode(token);
          decodedUserId = decoded?.userId || decoded?._id || "";
        } catch {
          // Token decode failed
        }

        // ✅ Verify token & fetch user info from backend
        const res = await axios.get("/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const user = res.data;
        const resolvedUserId = user._id || user.userId || decodedUserId || "";

        console.log("✅ Google login successful");

        completeLogin(token, { ...user, userId: resolvedUserId });

        // 🚀 Redirect to appropriate dashboard based on role
        navigate(user.role === "farmer" ? "/farmer/dashboard" : "/home");

      } catch (err) {
        console.error("❌ Failed to complete Google login:", err);
        navigate("/");
      }
    };

    fetchUserData();
  }, [location, completeLogin, navigate]);

  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-gray-600 text-lg animate-pulse">
        Authenticating with Google... please wait ⏳
      </p>
    </div>
  );
};

export default OAuthHandler;
