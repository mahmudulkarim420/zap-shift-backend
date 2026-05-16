/**
 * Role-Based Authorization Middleware
 * Usage: router.get('/route', protect, isAdmin, controller)
 */

const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: 'Access denied. Admin only.',
  });
};

const isRider = (req, res, next) => {
  if (req.user && req.user.role === 'rider') {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: 'Access denied. Riders only.',
  });
};

const isAdminOrRider = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'rider')) {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: 'Access denied. Insufficient permissions.',
  });
};

/**
 * Generic role authorization factory.
 * Usage: protect, authorize('admin', 'rider')
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Role '${req.user?.role || 'guest'}' is not authorized.`,
      });
    }
    next();
  };
};

module.exports = { isAdmin, isRider, isAdminOrRider, authorize };
