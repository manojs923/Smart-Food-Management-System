// middleware/requireRole.js
// Role-based access control middleware for GreenNest

export const normalizeRole = (role) => {
  if (!role) return "donor";
  const r = String(role).toLowerCase().trim();
  // "user" in existing DB schema maps to "donor"
  if (r === "user" || r === "donor") return "donor";
  if (r === "farmer") return "farmer";
  return r;
};

export const requireRole = (allowedRoles) => {
  const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  const normalizedAllowed = rolesArray.map(normalizeRole);

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Cron jobs bypass role restrictions
    if (req.user.isCronJob) {
      return next();
    }

    const userRole = normalizeRole(req.user.role);

    if (!normalizedAllowed.includes(userRole)) {
      return res.status(403).json({
        message: `Access denied. Route requires one of: [${rolesArray.join(", ")}], but your role is '${req.user.role || "unknown"}'.`,
      });
    }

    next();
  };
};

export default requireRole;
