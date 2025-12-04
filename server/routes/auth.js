const express = require('express');
const router = express.Router();
const passport = require('passport');
const mediawikiAuthService = require('../services/mediawikiAuthService');

// POST /api/auth/login - Local login with MediaWiki
router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Authenticate with MediaWiki
    const authResult = await mediawikiAuthService.authenticateUser(username, password);

    if (!authResult.success) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if user is blocked
    if (mediawikiAuthService.isBlocked(authResult.userInfo)) {
      return res.status(403).json({ error: 'User account is blocked' });
    }

    // Store MediaWiki session info in Express session
    req.session.mediawikiCookies = authResult.cookies;
    req.session.mediawikiUserInfo = authResult.userInfo;

    // Create Express user object
    const user = {
      id: authResult.userInfo.id,
      username: authResult.username,
      groups: authResult.groups,
      rights: authResult.rights,
      userInfo: authResult.userInfo,
      isAdmin: mediawikiAuthService.isAdmin(authResult.groups),
    };

    // Set user in session (for Passport compatibility)
    req.login(user, (err) => {
      if (err) {
        return res.status(500).json({ error: 'Session creation failed' });
      }
      res.json({
        user,
        isAuthenticated: true,
        message: 'Login successful',
      });
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message || 'Login failed' });
  }
});

// POST /api/auth/register - User registration
// Note: MediaWiki doesn't support user creation via API by default
// Users must be created through MediaWiki web interface
router.post('/register', async (req, res) => {
  try {
    // MediaWiki API doesn't support user registration
    // Users need to be created through MediaWiki's web interface
    res.status(501).json({
      error: 'User registration via API is not supported',
      message: 'Please create an account through the MediaWiki web interface',
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: error.message || 'Registration failed' });
  }
});

// GET /api/auth/google - Initiate Google OAuth flow
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// GET /api/auth/google/callback - Google OAuth callback
router.get('/google/callback', (req, res) => {
  // Placeholder: Will be implemented when OAuth service is added
  res.status(501).json({ error: 'Google OAuth not yet implemented' });
});

// GET /api/auth/apple - Initiate Apple Sign In flow
router.get('/apple', passport.authenticate('apple'));

// POST /api/auth/apple/callback - Apple Sign In callback
router.post('/apple/callback', (req, res) => {
  // Placeholder: Will be implemented when OAuth service is added
  res.status(501).json({ error: 'Apple Sign In not yet implemented' });
});

// POST /api/auth/logout - Logout and destroy session
router.post('/logout', async (req, res) => {
  try {
    // Logout from MediaWiki if cookies exist
    if (req.session.mediawikiCookies) {
      await mediawikiAuthService.logout(req.session.mediawikiCookies);
    }

    req.logout((err) => {
      if (err) {
        return res.status(500).json({ error: 'Logout failed' });
      }
      req.session.destroy((err) => {
        if (err) {
          return res.status(500).json({ error: 'Session destruction failed' });
        }
        res.clearCookie('connect.sid');
        res.json({ message: 'Logged out successfully' });
      });
    });
  } catch (error) {
    console.error('Logout error:', error);
    // Still destroy Express session even if MediaWiki logout fails
    req.logout((err) => {
      req.session.destroy((err) => {
        res.clearCookie('connect.sid');
        res.json({ message: 'Logged out successfully' });
      });
    });
  }
});

// GET /api/auth/me - Get current authenticated user
router.get('/me', async (req, res) => {
  if (req.user && req.session.mediawikiCookies) {
    try {
      // Validate MediaWiki session
      const validation = await mediawikiAuthService.validateSession(req.session.mediawikiCookies);
      
      if (validation.valid) {
        // Update user info from MediaWiki
        const mediawikiService = require('../services/mediawikiService');
        const userRights = await mediawikiService.getUserRights(
          req.user.username,
          req.session.mediawikiCookies
        );
        
        const user = {
          ...req.user,
          groups: userRights?.groups || req.user.groups || [],
          rights: userRights?.rights || req.user.rights || [],
          isAdmin: mediawikiAuthService.isAdmin(userRights?.groups || []),
        };
        
        res.json({ user, isAuthenticated: true });
      } else {
        // MediaWiki session invalid, clear Express session
        req.logout();
        res.status(401).json({ error: 'Session expired', isAuthenticated: false });
      }
    } catch (error) {
      console.error('Session validation error:', error);
      res.json({ user: req.user, isAuthenticated: true });
    }
  } else {
    res.status(401).json({ error: 'Not authenticated', isAuthenticated: false });
  }
});

module.exports = router;

