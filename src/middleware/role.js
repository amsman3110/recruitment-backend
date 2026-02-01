/*
========================================
Role-Based Authorization Middleware
========================================
*/
function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    // req.user is set by JWT middleware
    if (!req.user || !req.user.role) {
      return res.status(403).json({
        error: "User role not found",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: "Access denied: insufficient permissions",
      });
    }

    next();
  };
}

module.exports = authorizeRoles;
