const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Role '${req.user?.role || "guest"}' does not have access to this resource`,
      });
    }
    next();
  };
};

module.exports = { authorize };
