// Authentication and Authorization Middleware

// Require authentication
const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
};

// Require specific role
const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Check MediaWiki groups
    const userGroups = req.user.groups || [];
    
    if (role === 'admin' && !userGroups.includes('sysop')) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    if (role === 'user' && userGroups.length === 0) {
      return res.status(403).json({ error: 'User access required' });
    }

    next();
  };
};

// Require admin (sysop group in MediaWiki)
const requireAdmin = requireRole('admin');

module.exports = {
  requireAuth,
  requireRole,
  requireAdmin,
};

