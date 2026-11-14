// client/src/components/auth/RoleRoute.js
// Route guard that validates user role from AuthContext / JWT / localStorage

import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { jwtDecode } from "jwt-decode";

export const normalizeRole = (role) => {
  if (!role) return "donor";
  const r = String(role).toLowerCase().trim();
  if (r === "farmer") return "farmer";
  return "donor"; // "user" and "donor" normalize to "donor"
};

export const getStoredUserRole = () => {
  try {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = jwtDecode(token);
      if (decoded && decoded.role) {
        return normalizeRole(decoded.role);
      }
    }
  } catch (_) {}

  const directRole = localStorage.getItem("userRole");
  if (directRole) {
    return normalizeRole(directRole);
  }

  return "donor";
};

export default function RoleRoute({ allowedRoles = [], children }) {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  const currentRole = normalizeRole(user?.role || getStoredUserRole());
  const normalizedAllowed = allowedRoles.map(normalizeRole);

  const isAllowed = normalizedAllowed.includes(currentRole);

  if (!isAllowed) {
    // Redirect to the appropriate home dashboard based on role
    const fallbackPath = currentRole === "farmer" ? "/farmer/dashboard" : "/home";
    return <Navigate to={fallbackPath} replace />;
  }

  return children;
}
