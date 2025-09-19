// middleware/authMiddleware.js
const jwt = require("jsonwebtoken");

/**
 * Role-based authentication middleware
 * @param {Array} roles - Allowed roles, e.g. ['admin', 'employee', 'customer']
 */
const authMiddleware = (roles = []) => {
  return (req, res, next) => {
    try {
      // ---------------------------
      // 1. Get token from headers
      // ---------------------------
      const authHeader = req.headers["authorization"];
      if (!authHeader) {
        return res.status(401).json({ message: "No token provided" });
      }

      // Expected format: "Bearer <token>"
      const token = authHeader.split(" ")[1];
      if (!token) {
        return res.status(401).json({ message: "No token provided" });
      }

      // ---------------------------
      // 2. Verify token
      // ---------------------------
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Normalize id field (support both `id` and `_id`)
      req.user = {
        id: decoded.id || decoded._id,
        role: decoded.role,
        email: decoded.email,
      };

      // ---------------------------
      // 3. Role check
      // ---------------------------
      console.log(`[Auth Check] User role: ${req.user.role}, Required roles: ${roles.join(', ')}`); // Added log

      if (roles.length > 0 && !roles.includes(req.user.role)) {
        return res
          .status(403)
          .json({ message: "Forbidden: Insufficient permissions" });
      }

      // ---------------------------
      // 4. Continue
      // ---------------------------
      next();
    } catch (err) {
      console.error("❌ Auth error:", err.message);
      return res
        .status(401)
        .json({ message: "Invalid or expired token", error: err.message });
    }
  };
};

module.exports = authMiddleware;