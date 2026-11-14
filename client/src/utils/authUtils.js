import { jwtDecode } from "jwt-decode";

/**
 * Helper to reliably resolve the current logged-in user's ObjectId.
 * Priority:
 * 1. User object from AuthContext (_id, id, or userId)
 * 2. Decoded JWT token from localStorage (token -> payload.userId)
 * 3. localStorage "userId" key (validated against null/undefined)
 *
 * Automatically synchronizes valid ID back to localStorage for legacy consumers.
 */
export const getCurrentUserId = (authUser = null) => {
  // 1. AuthContext user object
  if (authUser?._id && authUser._id !== "null" && authUser._id !== "undefined") {
    const id = String(authUser._id);
    localStorage.setItem("userId", id);
    return id;
  }
  if (authUser?.id && authUser.id !== "null" && authUser.id !== "undefined") {
    const id = String(authUser.id);
    localStorage.setItem("userId", id);
    return id;
  }
  if (authUser?.userId && authUser.userId !== "null" && authUser.userId !== "undefined") {
    const id = String(authUser.userId);
    localStorage.setItem("userId", id);
    return id;
  }

  // 2. Decode from stored JWT token
  const token = localStorage.getItem("token");
  if (token) {
    try {
      const decoded = jwtDecode(token);
      const tokenUserId = decoded?.userId || decoded?._id || decoded?.id;
      if (tokenUserId && tokenUserId !== "null" && tokenUserId !== "undefined") {
        const id = String(tokenUserId);
        localStorage.setItem("userId", id);
        return id;
      }
    } catch {
      // Invalid or expired token
    }
  }

  // 3. Fallback to localStorage.getItem("userId")
  const storedId = localStorage.getItem("userId");
  if (storedId && storedId !== "null" && storedId !== "undefined") {
    return String(storedId);
  }

  return null;
};
